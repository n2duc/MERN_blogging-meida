import { Link, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import EditorJS from "@editorjs/editorjs";

import AnimationWrapper from "../common/AnimationWrapper";
import { uploadImage } from "../common/aws";
import logo from "../imgs/logo.png";
import defaultBanner from "../imgs/blog-banner.png";
import { EditorCT } from "../utils/context/EditorContext";
import { tools } from "../components/tools.component"
import axios from "axios";
import { UserAuth } from "../utils/context/AuthContext";

const BlogEditor = () => {
    const { blog_id } = useParams();
    let { userAuth: { access_token } } = UserAuth();
    let { blog, blog: { title, banner, content, tags, des }, setBlog, setEditorState, textEditor, setTextEditor } = EditorCT();

    let navigate = useNavigate();

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holder: "textEditor",
                data: Array.isArray(content) ? content[0] : content,
                tools: tools,
                placeholder: "Let's write an awesome story"
            }));
        }

    }, [setTextEditor, content, textEditor.isReady]);

    const handleBannerUpLoad = (e) => {
        let img = e.target.files[0];
        
        if (img) {
            let loadingToast = toast.loading("Uploading...")
            uploadImage(img).then((url) => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded");
                    setBlog({...blog, banner: url });
                }
            })
            .catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            })
        }
    }

    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) e.preventDefault(); //enter key
    }

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;

        setBlog({
            ...blog,
            title: input.value,
        })
    }

    const handleError = (e) => {
        let img = e.target;
        img.src = defaultBanner;
    }

    const handlePublishEvent = () => {
        if (!banner.length) return toast.error("Upload a blog banner to publish it")
        if (!title.length) return toast.error("Write blog title to publish it")
        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data })
                    setEditorState("publish")
                } else {
                    return toast.error("Write something in your blog to publish it")
                }
            }).catch((err) => console.log(err))
        }
    }

    const handleSaveDraft = async (e) => {
        if (e.target.className.includes("disable")) return;

        if (!title.length) return toast.error("Write blog title before saving it as a draft")

        const loadingToast = toast.loading("Saving Draft...");

        e.target.classList.add("disable");

        try {
            if (textEditor.isReady) {
                const content = await textEditor.save();
                const blogObj = { title, banner, tags, des, content, draft: true };

                await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`, {...blogObj, id: blog_id }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });
                
                e.target.classList.remove("disable");
                toast.dismiss(loadingToast);
                toast.success("Saved");

                setTimeout(() => navigate("/"), 500);
            }
        } catch (error) {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            if (error.response) {
                toast.error(error.response.data.error);
            }
        }
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} alt="logo" />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {title.length ? title : "New Blog"}
                </p>

                <div className="flex gap-4 ml-auto ">
                    <button className="btn-dark py-2" onClick={handlePublishEvent}>Publish</button>
                    <button className="btn-light py-2" onClick={handleSaveDraft}>Save Draft</button>
                </div>
            </nav>
            <Toaster />
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video bg-white hover:opacity-80 border-2 border-grey rounded-md">
                            <label htmlFor="uploadBanner">
                                <img
                                    src={banner}
                                    alt="default banner"
                                    className="z-20 rounded"
                                    onError={handleError}
                                />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .webp"
                                    hidden
                                    onChange={handleBannerUpLoad}
                                />
                            </label>
                        </div>

                        <textarea
                            defaultValue={title}
                            placeholder="Blog Title"
                            className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        ></textarea>
                        <hr className="w-full opacity-10 my-5" />

                        <div id="textEditor" className="font-gelasio"></div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
};

export default BlogEditor;
