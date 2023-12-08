import { useState } from "react";
import { UserAuth } from "../utils/context/AuthContext";
import toast from "react-hot-toast";
import InputBox from "./input.component"
import axios from "axios";

const ChangePassword = () => {
    let { userAuth: { access_token } } = UserAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleChangePassword = async () => {
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
        if (!currentPassword.length) return toast.error("Enter Current Password")
        if (!newPassword.length) return toast.error("Enter New Password")
        if (!passwordRegex.test(newPassword)) return toast.error("New Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters")
        let loadingToast = toast.loading("Loading...");
        try {
            
            const response = await axios.put(`${import.meta.env.VITE_SERVER_DOMAIN}/change-password`, { currentPassword, newPassword }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            toast.dismiss(loadingToast);
            return toast.success(response.data.message);
        } catch (error) {
            if (error.response) {
                toast.dismiss(loadingToast);
                toast.error(error.response.data.error);
            }
        }
    }
    return (
        <>
            <h1 className="text-dark-grey text-xl mb-8">Change Password</h1>
            <div className="w-full max-w-[70%] md:max-w-[70%] lg:max-w-[50%]">
                <InputBox
                    name="currentPassword"
                    type="password"
                    placeholder="Current Password"
                    icon="fi-rr-lock"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <InputBox
                    name="newPassword"
                    type="password"
                    placeholder="New Password"
                    icon="fi-rr-lock"
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button onClick={handleChangePassword} className="btn-dark mt-4">Change Password</button>
            </div>
        </>
    )
}

export default ChangePassword;