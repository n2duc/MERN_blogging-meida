import { useEffect, useState } from "react";
import axios from "axios";

import AnimationWrapper from "../common/AnimationWrapper";
import { filterPaginationData } from "../common/filter-pagination-data";
import { activeTabRef } from "../components/inpage-navigation.component"

import { Loader, MinimalBlogPost, NoDataMessage, BlogPostCard, LoadMoreDataBtn, InPageNavigation } from "../components"

const HomePage = () => {
    const [blogs, setBlogs] = useState(null);
    const [trendingBlogs, setTrendingBlogs] = useState(null);
    const [pageState, setPageState] = useState("home");

    const categories = ["coding", "travel", "learn", "test", "css", "html", "js", "framework"];

    // Fetch latest blogs data
    const fetchLatestBlogs = async ({ page = 1 }) => {
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`,
                { page }
            );
            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/all-latest-blogs-count"
            })
            setBlogs(formatedData);
        } catch (error) {
            console.log(error);
        }
    };

    
    useEffect(() => {
        // Fetch trending blogs data
        const fetchTrendingBlogs = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`)
                setTrendingBlogs(response.data.blogs)
            } catch (error) {
                console.log(error);
            }
        }
        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }

    }, [trendingBlogs])

    // Fetch blogs by category
    const fetchBlogsByCategory = async ({ page = 1 }) => {
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`,
                { tag: pageState, page }
            );
            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { tag: pageState }
            })
            setBlogs(formatedData);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        activeTabRef.current.click();

        if (pageState === "home") {
            fetchLatestBlogs({ page: 1 });
        } else {
            fetchBlogsByCategory({ page: 1 });
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageState]);
    
    const loadBlogByCategory = (e) => {
        const category = e.target.innerText.toLowerCase();
        setBlogs(null);

        if (pageState === category) {
            setPageState("home");
            return;
        }
        setPageState(category);
    }

    const TrendingBlogs = () => {
        return (
            trendingBlogs.length ?
                trendingBlogs.map((blog, index) => (
                    <AnimationWrapper key={index} transition={{ duration: 1, delay: index*.1 }}>
                        <MinimalBlogPost blog={blog} index={index} />
                    </AnimationWrapper>
                ))
            : <NoDataMessage message="No trending blogs" />
        )
    }

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-0 md:gap-10">
                {/* latest blogs */}
                <div className="w-full">
                    <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]} >
                        <>
                            {blogs === null ? (
                                <Loader />
                            ) : (
                                blogs.results.length ?
                                    blogs.results.map((blog, index) => (
                                        <AnimationWrapper key={index} transition={{ duration: 1, delay: index*.1 }}>
                                            <BlogPostCard content={blog} author={blog.author.personal_info} />
                                        </AnimationWrapper>
                                    ))
                                : <NoDataMessage message="No blogs published" />
                            )}
                            <LoadMoreDataBtn state={blogs} fetchDataFunc={(pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory)} />
                        </>
                        {trendingBlogs === null ? <Loader /> : <TrendingBlogs />}
                    </InPageNavigation>
                </div>

                {/* filters and trending blog */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">Stories from all interests</h1>
                            <div className="flex flex-wrap gap-3">
                                {categories.map((category, index) => (
                                    <button 
                                        key={index}
                                        onClick={loadBlogByCategory} 
                                        className={`tag ${pageState === category ? "bg-black text-white" : ""}`} 
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Trending
                                <i className="fi fi-rr-arrow-trend-up ml-2" />
                            </h1>
                            {trendingBlogs === null ? <Loader /> : <TrendingBlogs />}
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );
};

export default HomePage;
