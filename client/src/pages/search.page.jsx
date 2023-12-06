import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/AnimationWrapper";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Loader, UserCard, NoDataMessage, BlogPostCard, LoadMoreDataBtn, InPageNavigation } from "../components"

const SearchPage = () => {

    const { query } = useParams();
    const [blogs, setBlogs] = useState(null);
    const [users, setUsers] = useState(null);

    const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, { query, page })
            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr
            })
            setBlogs(formatedData);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchUser = async () => {
        const { data: { users } } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-users`, { query })
        setUsers(users);
    }   

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    }

    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_arr: true })
        fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    const UserCardWrapper = () => {
        return (
            <>
                {users === null ? <Loader /> :
                    users.length ?
                        users.map((user, index) => (
                            <AnimationWrapper key={index} transition={{ duration: 1, delay: index*0.08 }}>
                                <UserCard user={user} />
                            </AnimationWrapper>
                        ))
                    : <NoDataMessage message="No user found" />
                }
            </>
        )
    }
    
    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation
                    routes={[`Search Results from "${query}"`, `Accounts Matched`]}
                    defaultHidden={["Accounts Matched"]}
                >
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
                        <LoadMoreDataBtn state={blogs} fetchDataFunc={searchBlogs} />
                    </>

                    <UserCardWrapper />
                </InPageNavigation>
            </div>

            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                <h1 className="font-medium text-xl mb-8">User related to search <i className="fi fi-rr-user mt-1" /></h1>
                <UserCardWrapper />
            </div>
            
        </section>
    )
}

export default SearchPage