import { useContext } from "react"
import { BlogContext } from "../pages/blog.page"
import CommentField from "./comment-field.component";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/AnimationWrapper";
import CommentCard from "./comment-card.component";
import { fetchComments } from "../utils/typeConfig";

const CommentsContainer = () => {

    let { blog, blog: { _id, title, comments: { results: commentsArr }, activity: { total_parent_comments } }, commentWrapper, setCommentWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, setBlog } = useContext(BlogContext);

    const loadMoreComments = async () => {
        let newCommentsArr = await fetchComments({ skip: totalParentCommentsLoaded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLoaded, comment_array: commentsArr });

        setBlog({ ...blog, comments: newCommentsArr });
    }

    return (
        <div className={`max-sm:w-full fixed ${commentWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"} duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[380px] h-full z-50 bg-white shadow-lg p-8 px-14 overflow-y-auto overflow-x-hidden`}>
            <div className="relative">
                <h1 className="text-xl font-medium">Comments</h1>
                <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">{title}</p>

                <button className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
                onClick={() => setCommentWrapper(prev => !prev)}>
                    <i className="fi fi-br-cross text-base mt-1"></i>
                </button>
            </div>

            <hr className="border-grey my-8 w-[120%] -ml-10" />

            <CommentField />

            {commentsArr && commentsArr.length ? (
                commentsArr.map((comment, index) => (
                    <AnimationWrapper key={index}>
                        <CommentCard index={index} commentData={comment} leftVal={comment.childrenLevel * 4} />
                    </AnimationWrapper>
                ))
            ) : <NoDataMessage message="No comments" />}

            {total_parent_comments > totalParentCommentsLoaded && (
                <button
                    onClick={loadMoreComments}
                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                >
                    Load More
                </button>
            )}

        </div>
    )
}

export default CommentsContainer