import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ({ blog, index }) => {
    const { title, blog_id: id, author: { personal_info: { fullname, username, profile_img } }, publishedAt } = blog;

    return (
        <Link to={`/blog/${id}`} className="flex gap-5 mb-8">
            <h1 className="blog-index">{index < 10 ? `0${index+1}` : index}</h1>
            <div>
                <div className="flex gap-2 items-center mb-6">
                    <img src={profile_img} className="w-6 h-6 rounded-full" alt="avatar" />
                    <p className="line-clamp-1">{fullname.split(" ").slice(1).join(" ")} @{username}</p>
                    <p className="min-w-fit">{getDay(publishedAt)}</p>
                </div>

                <h1 className="blog-title line-clamp-2">{title}</h1>
            </div>
        </Link>
    )
}

export default MinimalBlogPost