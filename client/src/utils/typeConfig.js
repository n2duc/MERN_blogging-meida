import axios from "axios";

export const profileDataStructure = {
    personal_info: {
        fullname: "",
        username: "",
        profile_img: "",
        email: "",
        bio: "",
    },
    account_info: {
        total_posts: 0,
        total_reads: 0,
    },
    social_links: {
        youtube: "",
        instagram: "",
        facebook: "",
        twitter: "",
        github: "",
        website: "",
    },
    joinedAt: "",
};

export const blogStructure = {
    title: "",
    des: "",
    content: [],
    tags: [],
    banner: "",
    author: { personal_info: { } },
    publishedAt: "",
}

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog-comments`, { blog_id, skip })
        const { data } = response;

        data.map(comment => comment.childrenLevel = 0)
        setParentCommentCountFun(prev => prev + data.length)
    
        const results = comment_array === null ? data : [...comment_array, ...data];
    
        return { results };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { error: "Failed to fetch comments" };
    }
}