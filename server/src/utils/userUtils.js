import { nanoid } from "nanoid";
import User from "../Schema/User";

const formatDataToSend = (user) => {
    const access_token = generateAccessToken(user._id);
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    };
};

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameExists = await User.exists({ "personal_info.username": username }).then((result) => result);

    // If username exists, add random string of characters to it with nanoid
    isUsernameExists ? username += nanoid().substring(0, 5) : "";

    return username;
};

export { formatDataToSend, generateUsername };
