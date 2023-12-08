import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { getDay } from "../common/date";
import { Link } from "react-router-dom";
import NoDataMessage from "./nodata.component";
import { UserAuth } from "../utils/context/AuthContext";

const TabPublish = ({ username }) => {
    const { userAuth: { access_token } } = UserAuth();
    const [publishBlog, setPublishBlog] = useState([]);
    const [userId, setUserId] = useState("");

    const getBlogs = async (user_id) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
                author: user_id,
            })
            setPublishBlog(data.blogs);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                const { data: user } = await axios.post(
                    `${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`,
                    { username: username }
                );
                setUserId(user._id)
                if (user !== null) {
                    getBlogs(user._id)
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAuthor();
    }, [username]);

    const handleDeletePost = async (blogId) => {
        let loadingToast = toast.loading("Loading...");
        try {
            const response = await axios.delete(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-post/${blogId}`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            getBlogs(userId);
            toast.dismiss(loadingToast);
            return toast.success(response.data.message);
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.message);
        }
    }

    return (
        <div className="flex flex-col w-full gap-4">
            {publishBlog.length ? publishBlog.map((blog, index) => (
                <div className="flex justify-between items-start py-4 border-b border-grey" key={index}>
                    <div className="flex items-start gap-3">
                        <img src={blog.banner} alt="banner" className="w-[120px] h-[100px] rounded object-cover mr-8" />
                        <div className="pt-1">
                            <Link to={`/blog/${blog.blog_id}`} className="block leading-5 text-2xl mb-4 text-black">{blog.title}</Link>
                            <p className="min-w-fit mb-3">Published on {getDay(blog.publishedAt)}</p>
                            <div className="flex justify-between items-center min-w-[100px] max-w-[120px]">
                                <Link to={`/editor/${blog.blog_id}`} className="underline text-dark-grey hover:text-black">Edit</Link>
                                <button className="underline text-red" onClick={() => handleDeletePost(blog._id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <p className="text-xl text-dark-grey"><span className="text-black font-medium pr-3">{blog.activity.total_reads}</span> Reads</p>
                        <p className="text-xl text-dark-grey"><span className="text-black font-medium pr-3">{blog.activity.total_likes}</span> Likes</p>
                        <p className="text-xl text-dark-grey"><span className="text-black font-medium pr-3">{blog.activity.total_comments}</span> Comments</p>
                    </div>
                </div>
            )) : (
                <NoDataMessage message="No blogs published" />
            )}
        </div>
    )
}

export default TabPublish;