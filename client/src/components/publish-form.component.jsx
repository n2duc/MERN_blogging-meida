import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import Tag from "./tags.component";
import AnimationWrapper from "../common/AnimationWrapper";
import { EditorCT } from "../utils/context/EditorContext";
import { UserAuth } from "../utils/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

let characterLimit = 200;
let tagLimit = 5;

const PublishForm = () => {
    const { blog_id } = useParams();
    let { userAuth: { access_token } } = UserAuth();
    let {
        blog,
        blog: { title, banner, tags, des, content },
        setEditorState,
        setBlog
    } = EditorCT();

    let navigate = useNavigate();

    const handleCloseEvent = () => {
        setEditorState("editor");
    };

    const handleBlogTitleChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, title: input.value });
    }

    const handleBlogDescChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, des: input.value });
    }

    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) e.preventDefault(); //enter key
    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 13 || e.keyCode === 188) {
            e.preventDefault();

            let tag = e.target.value;
            if (tags.length < tagLimit) {
                if (!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [ ...tags, tag ] })
                }
            } else {
                toast.error(`You can add max ${tagLimit} Tags`)
            }

            e.target.value = "";
        }
    };

    const publishBlog = async (e) => {
        if (e.target.className.includes("disable")) return;

        if (!title.length) return toast.error("Write blog title before publishing")
        if (!des.length || des.length > characterLimit) {
            return toast.error(`Write a description about your blog withing ${characterLimit} characters to publish`);
        }
        if (!tags.length) return toast.error("Enter at least 1 tag to help us rank your blog")

        let loadingToast = toast.loading("Publishing...");

        e.target.classList.add("disable");

        let blogObj = { title, banner, tags, des, content, draft: false }

        try {
            await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`, {...blogObj, id: blog_id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Published");

            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch ({ response }) {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            return toast.error(response.data.error);
        }
    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />

                <button
                    className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                    onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">Preview</p>
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner} alt="banner" className="" />
                    </div>

                    <h1 className="text-3xl font-medium mt-3 leading-tight line-clamp-2">
                        {title}
                    </h1>
                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-2">
                        {des}
                    </p>
                </div>

                <div className="border-grey lg:border lg:px-8 lg:rounded-lg lg:py-8">
                    <p className="text-dark-grey mb-2 mt-9 lg:mt-0">Blog Title</p>
                    <input
                        type="text"
                        placeholder="Blog Title"
                        defaultValue={title}
                        className="input-box pl-4"
                        onChange={handleBlogTitleChange}
                    />

                    <p className="text-dark-grey mb-2 mt-9">
                        Short description about your blog
                    </p>

                    <textarea
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDescChange}
                        onKeyDown={handleTitleKeyDown}
                    ></textarea>
                    <p className="mt-1 text-dark-grey text-sm text-right">
                        {characterLimit - des.length} characters left
                    </p>

                    <p className="text-dark-grey mb-2 mt-9">
                        Topics - ( Helps is searching and ranking your blog post )
                    </p>

                    <div className="relative input-box pl-2 py-2 pb-2">
                        <input 
                            type="text"
                            placeholder="Topic"
                            className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                            onKeyDown={handleKeyDown}
                        />
                        {tags.map((tag, index) => (
                            <Tag tag={tag} key={index} tagIndex={index} />
                        ))}
                    </div>
                    <p className="mt-1 text-dark-grey text-sm text-right">
                        {tagLimit - tags.length} Tags left
                    </p>

                    <button className="btn-dark px-8" onClick={publishBlog}>Publish</button>

                </div>
            </section>
        </AnimationWrapper>
    );
};

export default PublishForm;
