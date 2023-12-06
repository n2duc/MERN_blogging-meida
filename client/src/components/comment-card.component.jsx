import { useContext, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { getDay } from "../common/date";
import { UserAuth } from "../utils/context/AuthContext";
import { CommentField } from ".";
import { BlogContext } from "../pages/blog.page";

const CommentCard = ({ index, leftVal, commentData }) => {

    const { commented_by: { personal_info: { username: commented_by_username, profile_img, fullname } }, commentedAt, comment, _id, children }  = commentData;

    const { userAuth: { access_token, username } } = UserAuth();
    let { blog, blog: { comments, activity, activity: { total_parent_comments }, comments: { results: commentsArr }, author: { personal_info: { username: blog_author } } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext);

    const [isReply, setIsReply] = useState(false);

    const getParentIndex = () => {
        let startingPoint = index - 1;
        try {
            while(commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        } catch (error) {
            startingPoint = undefined;
        }
        return startingPoint;
    }

    const handleReply = () => {
        if (!access_token) {
            return toast.error("Login first to reply");
        }
        setIsReply(prev => !prev);
    }

    const removeCommentsCards = (startingPoint, isDelete = false) => {
        if (commentsArr[startingPoint]) {
            while( commentsArr[startingPoint].childrenLevel > commentsArr[index].childrenLevel ) {
                commentsArr.splice(startingPoint, 1);
                if (!commentsArr[startingPoint]) {
                    break;
                }
            }
        }

        if (isDelete) {
            let parentIndex = getParentIndex();

            if (parentIndex !== undefined) {
                commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child != _id);

                if (!commentsArr[parentIndex].children.length) {
                    commentsArr[parentIndex].isReplyLoaded = false;
                }
            }

            commentsArr.splice(index, 1);
        }

        if (commentData.childrenLevel === 0 && isDelete) {
            setTotalParentCommentsLoaded(prev => prev - 1)
        }

        setBlog({ ...blog, comments: { results: commentsArr }, activity: { ...activity, total_parent_comments: total_parent_comments - ((commentData.childrenLevel === 0 && isDelete) ? 1 : 0) } })
    }

    const deleteComment = (e) => {
        e.target.setAttribute("disabled", true);

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`, { _id }, { 
            headers: { 
                "Authorization": `Bearer ${access_token}` 
            }
        }).then(() => {
            e.target.removeAttribute("disabled");
            removeCommentsCards(index + 1, true);
        }).catch(error => console.log(error))
    }

    const hideReplies = () => {
        commentData.isReplyLoaded = false;
        removeCommentsCards(index + 1);
    }

    const loadReplies = ({ skip = 0 }) => {
        if (children.length) {
            hideReplies();

            axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`, { _id, skip })
                .then(({ data: { replies } }) => {
                    commentData.isReplyLoaded = true;

                    for (let i = 0; i < replies.length; i++) {
                        replies[i].childrenLevel = commentData.childrenLevel + 1;
                        commentsArr.splice(index + 1 + i + skip, 0, replies[i]);
                    }

                    setBlog({ ...blog, comments: { ...comments, results: commentsArr } })

                })
                .catch(error => {
                    console.log(error);
                })
        }
    }

    const checkAuthCmt = (username === commented_by_username || username === blog_author)

    return (
        <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-4">
                    <img src={profile_img} alt="avatar" className="w-6 h-6 rounded-full" />

                    <p className="line-clamp-1 font-medium">{fullname} @{commented_by_username}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>
                <p className="font-gelasio text-xl ml-3">{comment}</p>

                <div className={`flex ${checkAuthCmt ? "gap-2" : "gap-5"} items-center mt-4`}>
                    {commentData.isReplyLoaded ? (
                        <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={hideReplies}>
                            <i className="fi fi-rs-comment-dots" />
                            Hide reply
                        </button>
                    ) : (
                        <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={loadReplies}>
                            <i className="fi fi-rs-comment-dots" />
                            {children.length} reply
                        </button>
                    )}
                    <button className="underline" onClick={handleReply}>Reply</button>
                    { checkAuthCmt && (
                        <button onClick={deleteComment} className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center">
                            <i className="fi fi-rr-trash pointer-events-none" />
                        </button>
                    )}
                </div>

                {isReply && (
                    <div className="mt-5">
                        <CommentField action="reply" index={index} replyingTo={_id} setReplying={setIsReply} />
                    </div>
                )}

            </div>
        </div>
    )
}

export default CommentCard