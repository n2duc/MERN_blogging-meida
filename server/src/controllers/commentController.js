import Comment from "../../Schema/Comment.js";
import { deleteComments } from "../utils/deleteCommand.js";

const createComment = (req, res) => {
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
}

const deleteComment = (req, res) => {
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
}

const getComments = async (req, res) => {
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
}

const getReplies = (req, res) => {
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
}

export default { createComment, deleteComment, getComments, getReplies };