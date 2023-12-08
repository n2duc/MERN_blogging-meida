import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageNotFound from "./404.page";
import { UserAuth } from "../utils/context/AuthContext";
import AnimationWrapper from "../common/AnimationWrapper";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Loader, AboutUser, NoDataMessage, BlogPostCard, LoadMoreDataBtn, InPageNavigation } from "../components"
import { profileDataStructure } from "../utils/typeConfig";

const ProfilePage = () => {
    let { userAuth: { username } } = UserAuth();

    const { id: profileId } = useParams();
    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState(null);
    const [profileLoaded, setProfileLoaded] = useState("");

    const { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_posts, total_reads }, social_links, joinedAt } = profile;

    const resetState = () => {
        setProfile(profileDataStructure);
        setProfileLoaded("");
        setLoading(true);
    }

    const getBlogs = async ({ page = 1, user_id }) => {
        user_id = (user_id === undefined) ? blogs.user_id : user_id;

        try {
            const { data } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
                author: user_id,
                page
            })
            
            let formatedDate = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { author: user_id }
            })

            formatedDate.user_id = user_id;
            setBlogs(formatedDate);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: user } = await axios.post(
                    `${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`,
                    { username: profileId }
                );
                if (user !==null) {
                    setProfile(user);
                }
                setProfileLoaded(profileId);
                getBlogs({ user_id: user._id })
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };

        if (profileId !== profileLoaded) {
            setBlogs(null);
        }
        if (blogs === null) {
            resetState();
            fetchUserProfile();
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, blogs])

    return (
        <AnimationWrapper>
            {loading ? <Loader /> : profile_username.length ? (
                <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                    <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-8">
                        <img src={profile_img} alt="avatar" className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32" />
                        <h1 className="text-2xl font-medium">{profile_username}</h1>
                        <p className="text-xl capitalize h-6">{fullname}</p>
                        <p>{total_posts.toLocaleString()} {total_posts > 0 ? "Blogs" : "Blog"} - {total_reads.toLocaleString()} {total_reads > 0 ? "Reads" : "Read"}</p>

                        <div className="flex gap-4 mt-2">
                            {profileId === username ? (
                                <Link to="/settings/edit-profile" className="btn-light rounded-md">Edit Profile</Link>
                            ) : ""}
                        </div>

                        <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt} />
                    </div>

                    <div className="max-md:mt-12 w-full">
                        <InPageNavigation
                            routes={["Blogs Published", "About"]}
                            defaultHidden={["About"]}
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
                                <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs}/>
                            </>

                            <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />
                        </InPageNavigation>
                    </div>

                </section>
            ) : <PageNotFound />}
        </AnimationWrapper>
    );
};

export default ProfilePage;
