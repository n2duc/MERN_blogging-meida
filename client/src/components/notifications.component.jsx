import { useEffect, useState } from "react"
import axios from "axios";
import { UserAuth } from "../utils/context/AuthContext";
import { Link } from "react-router-dom";
import { getFullDay } from "../common/date"

const Notifications = () => {
    let { userAuth: { access_token } } = UserAuth();
    const [notification, setNotification] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const noti = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-notifications`, {}, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                console.log(noti);
                setNotification(noti.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [access_token])
    return (
        <>
            <h1 className="text-dark-grey text-xl mb-8">Change Password</h1>
            <div className="w-full flex flex-col gap-4">
                {
                    notification && notification.map((noti, index) => {
                        const { type, comment, blog: { title, blog_id, updatedAt }, user: { personal_info: { username, profile_img } } } = noti;
                        return (
                            <Link to={`/blog/${blog_id}`} key={index} className="p-4 border border-grey rounded-md">
                                <div className="flex items-center gap-4 text-dark-grey">
                                    <i className="fi fi-rs-bell-ring mt-1"></i>
                                    <span className="inline-block capitalize">{type} &bull; {getFullDay(updatedAt)}</span>
                                </div>
                                <div className="w-full flex justify-between">
                                    <div className="">
                                        <p className="text-xl my-2">{title}</p>
                                        {type === "like" ? (
                                            <p>@{username} like this blog</p>
                                        ) : (
                                            <p>@{username} comment: {comment?.comment}</p>
                                        )}
                                    </div>
                                    <div className="pr-5">
                                        <img src={profile_img} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
        </>
    )
}

export default Notifications