import bcrypt from "bcrypt";
import { getAuth } from "firebase-admin/auth";
import User from "../models/User.js";
import { formatDataToSend, generateUsername } from "../utils/userUtils.js";

const signup = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (fullname.length < 3) {
            return res.status(403).json({ error: "Fullname must be at least 3 letters long" })
        }
    
        if (!email.length) return res.status(403).json({ error: "Enter Email" })
        if (!emailRegex.test(email)) return res.status(403).json({ error: "Email is invalid" })
    
        if (!passwordRegex.test(password)) return res.status(403).json({ error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" })

        // Hash password
        const hashed_password = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);

        const user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        });

        const savedUser = await user.save();

        return res.status(200).json(formatDataToSend(savedUser));
    } catch (error) {
        if (error.code === 11000) {
            return res.status(500).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: error.message });
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res.status(403).json({ error: "Email not found" });
        }
        // Check if the account was created using Google
        if (user.google_auth) {
            return res.status(500).json({ error: "Account was created using Google. Try logging in with Google" });
        }

        const passwordMatch = await bcrypt.compare(password, user.personal_info.password);
        if (!passwordMatch) {
            return res.status(403).json({ error: "Incorrect password" });
        }

        // If everything is fine, send the response
        return res.status(200).json(formatDataToSend(user));
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Error occurred while login. Please try again" });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { access_token } = req.body;

        const decodedUser = await getAuth().verifyIdToken(access_token);
        let { email, name, picture } = decodedUser;
        picture = picture.replace("s96-c", "s384-c");

        let user = await User.findOne({ "personal_info.email": email })
            .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
            .then((u) => u || null)
            .catch(err => res.status(500).json({ error: err.message }))
        
        if (!user) {
            const username = await generateUsername(email);

            user = new User({
                personal_info: { fullname: name, email, username },
                google_auth: true
            });
            try {
                user = await user.save();
            } catch (err) {
                return res.status(500).json({ error: err.message })
            }
        } else if (!user.google_auth) {
            return res.status(403).json({ error: "This email was signed up with google. Please log in with password to access the account" })
        }

        return res.status(200).json(formatDataToSend(user));
    } catch (error) {
        return res.status(500).json({ error: "Failed to authenticate you with Google. Try with some other Google account" });
    }
};

export { signup, signin, googleAuth };
