import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/AnimationWrapper";
import { BlogContent, BlogInteraction, BlogPostCard, CommentsContainer, Loader, ScrollToTop } from "../components";
import { getDay } from "../common/date";
import { blogStructure, fetchComments } from "../utils/typeConfig";
import { Toaster } from "react-hot-toast";

export const BlogContext = createContext({});

const BlogPage = () => {
    const { blog_id } = useParams();
    
    const [blog, setBlog] = useState(blogStructure);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLikeByUser, setIsLikeByUser] = useState(false);

    const [commentWrapper, setCommentWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    const { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt } = blog;

    //Estimated Reading Time
    const textContentLength = JSON.stringify(content).trim().split(/\s+/).length;
    const timeToRead = Math.ceil(textContentLength / 265);

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setIsLikeByUser(false);
        setCommentWrapper(false);
        setTotalParentCommentsLoaded(0);
    }
    
    useEffect(() => {
        const fetchBlogInfo = async () => {
            try {
                const { data: { blog } } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id });

                blog.comments = await fetchComments({ blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentsLoaded })
                setBlog(blog);

                const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, { 
                    tag: blog.tags[0],
                    limit: 4,
                    eliminate_blog: blog_id 
                });
                setSimilarBlogs(data.blogs);

                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }

        fetchBlogInfo();
        resetStates();
    }, [blog_id]);

    return (
        <AnimationWrapper>
            <Toaster />
            {loading ? <Loader /> : (
                <BlogContext.Provider value={{ blog, setBlog, isLikeByUser, setIsLikeByUser, commentWrapper, setCommentWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>

                    <CommentsContainer />

                    <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                        <img src={banner} alt="banner" className="aspect-video rounded-lg" />

                        <div className="mt-12">
                            <h2>{title}</h2>

                            <div className="flex max-sm:flex-col justify-between my-8">
                                <div className="flex gap-5 items-start">
                                    <img src={profile_img} alt="avatar" className="h-12 w-12 rounded-full" />

                                    <p className="capitalize">
                                        {fullname}
                                        <br />
                                        @<Link to={`/user/${author_username}`} className="underline">{author_username}</Link>
                                    </p>
                                </div>
                                <div className="flex flex-col max-sm:flex-row max-sm:gap-3 text-dark-grey max-sm:mt-5 max-sm:ml-12 max-sm:pl-5">
                                    <p className="opacity-75">Publish on {getDay(publishedAt)}</p>
                                    <p className="flex gap-1"><i className="fi fi-rr-clock" />{timeToRead} min read</p>
                                </div>
                            </div>
                        </div>

                        <BlogInteraction />
                        
                        <div className="my-12 font-gelasio blog-page-content">
                            {content[0].blocks.map((block) => (
                                <div key={block.id} className="my-4 md:my-8">
                                    <BlogContent block={block} />
                                </div>
                            ))}
                        </div>

                        <BlogInteraction />

                        {similarBlogs !== null && similarBlogs.length ? (
                            <>
                                <h1 className="text-2xl mt-14 mb-10 font-medium"><i className="fi fi-rs-book-alt mr-3" />Similar Blogs</h1>
                                {similarBlogs.map((blog, index) => {
                                    let { author: { personal_info } } = blog;
                                    return (
                                        <AnimationWrapper key={index} transition={{ duration: 1, delay: index*0.08 }}>
                                            <BlogPostCard content={blog} author={personal_info} />
                                        </AnimationWrapper>
                                    )
                                })}
                            </>
                        ) : ""}

                    </div>
                </BlogContext.Provider>
            )}
            <ScrollToTop />
        </AnimationWrapper>
    );
};

export default BlogPage;