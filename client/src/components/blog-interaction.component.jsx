import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { BlogContext } from "../pages/blog.page";
import { UserAuth } from "../utils/context/AuthContext";
import axios from "axios";

const BlogInteraction = () => {

    let { blog, blog: { title, _id, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog, isLikeByUser, setIsLikeByUser, setCommentWrapper } = useContext(BlogContext);

    const { userAuth: { username, access_token } } = UserAuth();

    useEffect(() => {
        if (access_token) {
            axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/isliked-by-user`, { _id }, {
                headers: {
                    "Authorization": `Bearer ${access_token}`
                }
            })
            .then(({ data: { result } }) => {
                setIsLikeByUser(Boolean(result));
            })
            .catch(err => {
                console.log(err);
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLikeBlog = async () => {
        if (access_token) {
            setIsLikeByUser(prev => !prev);
            !isLikeByUser ? total_likes++ : total_likes--;
            setBlog({ ...blog, activity: { ...activity, total_likes } })

            try {
                const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/like-blog`, { _id, isLikeByUser }, {
                    headers: {
                        "Authorization": `Bearer ${access_token}`
                    }
                })
                console.log(data);
            } catch (error) {
                console.log(error);
            }

        } else {
            toast.error("Please login to like this post")
        }
    }

    return (
        <>
            <Toaster />
            <hr className="border-grey my-2" />

            <div className="flex gap-6 justify-between">
                    <div className="flex gap-3 items-center">
                        <button className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-red/20 hover:text-red ${isLikeByUser ? "bg-red/20 text-red" : "bg-grey/80 text-black"}`} onClick={handleLikeBlog}>
                            <i className={`fi fi-${isLikeByUser ? "sr" : "rr"}-heart mt-1`} />
                        </button>
                        <p className="text-xl text-dark-grey">{ total_likes }</p>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80" onClick={() => setCommentWrapper(prev => !prev)}>
                            <i className="fi fi-rr-comment-dots mt-1" />
                        </button>
                        <p className="text-xl text-dark-grey">{ total_comments }</p>
                    </div>

                <div className="flex gap-6 items-center">
                    {username === author_username ? (
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-green">Edit</Link>
                    ) : ""}
                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}>
                        <i className="fi fi-brands-twitter mt-1 text-xl hover:text-twitter" />
                    </Link>
                </div>
            </div>

            <hr className="border-grey my-2" />
        </>
    );
};

export default BlogInteraction;