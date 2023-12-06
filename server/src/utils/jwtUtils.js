import jwt from "jsonwebtoken";
import { User } from "../Schema/User.js";

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.SECRET_ACCESS_KEY, { expiresIn: "1h" });
};

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No access token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ error: "User not found" });
        }
        req.user = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Access token is invalid" });
    }
};

export { generateAccessToken, verifyJWT };
