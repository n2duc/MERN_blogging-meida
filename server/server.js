import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import serviceAccount from "./blog-mern-app-70a2c-firebase-adminsdk-k5xho-eb548b795f.json" assert { type: "json" };

// Schema
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

const server = express();
let PORT = 5000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors()); // Accept data any port

mongoose.connect(process.env.ATLAS_URL, {
    autoIndex: true
})

// setting up s3 bucket
const s3 = new S3Client({
    region: "ap-southeast-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
})

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    const command = new PutObjectCommand({
        Bucket: "blogging-website-react",
        Key: imageName,
        ContentType: "image/jpeg",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 1000 });

    return url;
}

// Verify
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (token === null) {
        return res.status(401).json({ error: "No access token" })
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invalid" });
        }
        req.user = user.id;
        next();
    })
}

// Reformat the returned data
const formatDataToSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    }
}

// Change username if it already exists
const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({ "personal_info.username": username }).then((result) => result);

    // If username exists, add random string of characters to it with nanoid
    isUsernameExists ? username += nanoid().substring(0, 5) : "";

    return username;
}

// Upload Image URL Route
server.get("/get-upload-url", (req, res) => {
    generateUploadURL()
        .then(url => res.status(200).json({ uploadURL: url }))
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
})

// Sign Up
server.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;
    // validating the data from frontend
    if (fullname.length < 3) {
        return res.status(403).json({ error: "Fullname must be at least 3 letters long" })
    }

    if (!email.length) return res.status(403).json({ error: "Enter Email" })
    if (!emailRegex.test(email)) return res.status(403).json({ error: "Email is invalid" })

    if (!passwordRegex.test(password)) return res.status(403).json({ error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" })

    // Hash password
    bcrypt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        });

        user.save().then((u) => {
            return res.status(200).json(formatDataToSend(u))
        })
        .catch(err => {
            if(err.code == 11000) return res.status(500).json({ error: "Email already exists" })
            return res.status(500).json({ error: err.message })
        })
    })
})

// Sign In
server.post("/signin", (req, res) => {
    let { email, password } = req.body;

    // Find and check whether the email exists or not, if so, check the password
    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) return res.status(403).json({ error: "Email not found" })
            
            if (!user.google_auth) {
                // Compare hashed password in database
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) return res.status(403).json({ error: "Error occured while login please try again" });
    
                    if (!result) {
                        return res.status(403).json({ error: "Incorect password" });
                    } else {
                        return res.status(200).json(formatDataToSend(user));
                    }
                })
            } else {
                return res.status(500).json({ error: "Account was created using google. Try loggin in with google" })
            }

        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })
        })
})

server.post("/google-auth", async (req, res) => {
    let { access_token } = req.body;

    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodedUser) => {
            let { email, name, picture } = decodedUser;

            picture = picture.replace("s96-c", "s384-c");

            let user = await User.findOne({ "personal_info.email": email })
                .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
                .then((u) => u || null)
                .catch(err => res.status(500).json({ error: err.message }))

            if (user) {
                if (!user.google_auth) {
                    return res.status(403).json({ error: "This email was signed up with google. Please log in with password to access the account" })
                }
            } else {
                let username = await generateUsername(email);

                user = new User({
                    personal_info: { fullname: name, email, username },
                    google_auth: true
                })

                await user.save().then((u) => {
                    user = u;
                })
                .catch(err => res.status(500).json({ error: err.message }))
            }

            return res.status(200).json(formatDataToSend(user))
        })
        .catch(err => res.status(500).json({ error: "Failed to authenticate you with google. Try with some other google account" }))
})

// get latest blogs
server.post("/latest-blogs", async (req, res) => {
    try {
        const { page } = req.body;
        const maxLimit = 5;
        const blogs = await Blog.find({ draft: false })
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "publishedAt": -1 })
            .select("blog_id title banner des tags activity publishedAt -_id")
            .skip((page - 1) * maxLimit)
            .limit(maxLimit)
        return res.status(200).json({ blogs })
    } catch (error) {
        return res.status(500).json({ error: err.message })
    }
})

server.post("/all-latest-blogs-count", async (req, res) => {
    try {
        const countBlog = await Blog.countDocuments({ draft: false })
        return res.status(200).json({ totalDocs: countBlog });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message })
    }
})

// get trending blogs
server.get("/trending-blogs", async (req, res) => {
    try {
        const blogs = await Blog.find({ draft: false })
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
            .select("blog_id title publishedAt -_id")
            .limit(5)
        return res.status(200).json({ blogs });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// Search blogs by category
server.post("/search-blogs", async (req, res) => {
    try {
        let { tag, query, author, page, limit, eliminate_blog } = req.body;
        const findQuery = {
            draft: false,
            // eliminate_blog: returns results that do not contain the current result eg: results: 1,2,3,4,5; current: 3 => data response: 1,2,4,5
            ...(tag && { tags: tag, blog_id: { $ne: eliminate_blog } }),
            ...(query && { title: new RegExp(query, 'i') }),
            ...(author && { author: author }),
        };
        let maxLimit = limit ? limit : 3;
        
        const blogs = await Blog.find(findQuery)
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "publishedAt": -1 })
            .select("blog_id title banner des tags activity publishedAt -_id")
            .skip((page - 1) * maxLimit)
            .limit(maxLimit)
        return res.status(200).json({ blogs });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

server.post("/search-blogs-count", async (req, res) => {
    try {
        const { tag, author, query } = req.body;

        const findQuery = {
            draft: false,
            ...(tag && { tags: tag }),
            ...(query && { title: new RegExp(query, 'i') }),
            ...(author && { author: author }),
        };

        const countBlog = await Blog.countDocuments(findQuery)
        return res.status(200).json({ totalDocs: countBlog });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message })
    }
})

server.post("/search-users", async (req, res) => {
    try {
        const { query } = req.body;
        const users = await User.find({ "personal_info.username": new RegExp(query, "i") })
            .limit(50)
            .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

server.post("/get-profile", async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ "personal_info.username": username })
            .select("-personal_info.password -google_auth -updateAt -blogs")
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

// Upload blog content
server.post("/create-blog", verifyJWT, async (req, res) => {
    try {
        const authorId = req.user;
        const { title, des, banner, tags, content, draft, id } = req.body;

        if (!title.length) return res.status(403).json({ error: "You must provide a title" })
        if (!draft) {
            if (!des.length || des.length > 200) return res.status(403).json({ error: "You must provide blog description under 200 characters" })
            if (!banner.length) return res.status(403).json({ error: "You must provide blog banner to publish it" })
            if (!content.blocks.length) return res.status(403).json({ error: "There must be some blog content to publish it" })
        
            if (!tags.length || tags.length > 5) return res.status(403).json({ error: "Provide tags in order to publish the blog, maximum 5 tags" })
        }

        const lowercaseTags = tags.map(tag => tag.toLowerCase());
        const blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

        if (id) {
            Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? draft : false })
                .then(() => {
                    return res.status(200).json({ id: blog_id })
                })
                .catch (error => {
                    return res.status(500).json({ error: error.message })
                })
        } else {
            const blog = new Blog({
                title, des, banner, content, tags: lowercaseTags, author: authorId, blog_id, draft: Boolean(draft)
            })
    
            const savedBlog = await blog.save();
            const incrementVal = draft ? 0 : 1;
            await User.findOneAndUpdate(
                { _id: authorId },
                { $inc: { "account_info.total_posts" : incrementVal }, $push : { "blogs": savedBlog._id } }
            )
            res.status(200).json({ id: savedBlog.blog_id });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// get blog and update total read in each blog post
server.post("/get-blog", async (req, res) => {
    try {
        const { blog_id, draft, mode } = req.body;
        let incrementVal = mode !== "edit" ? 1 : 0;

        // Update total_reads in post blog
        const blog = await Blog.findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": incrementVal } })
            .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
            .select("title des content banner activity publishedAt blog_id tags")
        
        // Update total_reads of the user
        await User.findOneAndUpdate(
            { "personal_info.username": blog.author.personal_info.username },
            { $inc: { "account_info.total_reads": incrementVal } }
        )

        if (blog.draft && !draft) {
            return res.status(500).json({ error: "You can not access draft blog" })
        }
        
        return res.status(200).json({ blog });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

server.post("/like-blog", verifyJWT, async (req, res) => {
    try {
        let user_id = req.user;
        let { _id, isLikeByUser } = req.body;

        let incrementVal = !isLikeByUser ? 1 : -1;

        const blog = await Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementVal } })
        if (!isLikeByUser) {
            let like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id,
            })

            like.save().then(notification => {
                return res.status(200).json({ liked_by_user: true })
            })
        } else {
            Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
                .then(data => {
                    return res.status(200).json({ liked_by_user: false });
                })
                .catch(error => {
                    return res.status(500).json({ error: error.message });
                })
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

server.post("/isliked-by-user", verifyJWT, async (req, res) => {
    try {
        let user_id = req.user;
        let { _id } = req.body;
        
        const result = await Notification.exists({ user: user_id, type: "like", blog: _id })
        return res.status(200).json({ result });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

server.post("/add-comment", verifyJWT, (req, res) => {
    const user_id = req.user;
    const { _id, comment, blog_author, replying_to } = req.body;

    if (!comment.length) {
        return res.status(403).json({ error: "Write something to leave a comment" })
    }

    let commentObj = { blog_id: _id, blog_author, comment, commented_by: user_id }
    
    if (replying_to) {
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }

    new Comment(commentObj).save().then(async (commentFile) => {
        let { comment, commentedAt, children } = commentFile;
        Blog.findOneAndUpdate({ _id }, { $push: { "comments": commentFile._id }, $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 } }).then(blog => console.log("New comment created"));

        let notificationObj = {
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        }

        if (replying_to) {
            notificationObj.replied_on_comment = replying_to;
            await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id } })
                .then(replyingToCommentDoc => { notificationObj.notification_for = replyingToCommentDoc.commented_by })
        }

        new Notification(notificationObj).save().then(notification => console.log("New notification created"))

        return res.status(200).json({
            comment,
            commentedAt,
            _id: commentFile._id,
            user_id,
            children
        })
    })
})

server.post("/get-blog-comments", async (req, res) => {
    try {
        let { blog_id, skip } = req.body;

        let maxLimit = 5;

        const comment = await Comment.find({ blog_id, isReply: false })
            .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
            .skip(skip)
            .limit(maxLimit)
            .sort({ "commentedAt": -1 })

        return res.status(200).json(comment);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
})

server.post("/get-replies", (req, res) => {
    let { _id, skip } = req.body;
    let maxLimit = 5;

    Comment.findOne({ _id })
        .populate({
            path: "children",
            option: {
                limit: maxLimit,
                skip: skip,
                sort: { "commentedAt": -1 }
            },
            populate: {
                path: "commented_by",
                select: "personal_info.profile_img personal_info.fullname personal_info.username"
            },
            select: "-blog_id -updatedAt"
        })
        .select("children")
        .then(docs => {
            return res.status(200).json({ replies: docs.children })
        })
        .catch(error => {
            return res.status(500).json({ error: error.message })
        })
})


const deleteComments = ( _id ) => {
    Comment.findOneAndDelete({ _id })
        .then(comment => {
            if (comment.parent) {
                Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } })
                    .then(data => console.log("comment delete from parent"))
                    .catch(error => console.log(error))
            }

            Notification.findOneAndDelete({ comment: _id }).then(notification => console.log("comment notification deleted"))
            Notification.findOneAndDelete({ reply: _id }).then(notification => console.log("reply notification deleted"))
            
            Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { "activity.total_comments": -1 }, "activity.total_parent_comments": comment.parent ? 0 : -1 }    )
                .then(blog => {
                    if (comment.children.length) {
                        comment.children.map(replies => {
                            deleteComments(replies);
                        })
                    }
                })

        })
        .catch(error => {
            console.log(error.message);
        })
}

server.post("/delete-comment", verifyJWT, (req, res) => {
    let user_id = req.user;

    let { _id } = req.body;
    
    
    Comment.findOne({ _id })
        .then(comment => {
            if (user_id == comment.commented_by || user_id == comment.blog_author) {
                deleteComments( _id )
                return res.status(200).json({ status: "done" });
            } else {
                return res.status(403).json({ error: "You can not delete this comment" })
            }
        })

})

// Include routes
// server.use("/auth", authRoutes);
// server.use("/blog", blogRoutes);
// server.use("/user", userRoutes);

server.listen(PORT, () => {
    console.log("Listening on port -> " + PORT);
})