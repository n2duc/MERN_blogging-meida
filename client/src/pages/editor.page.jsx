import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

import { PublishForm, BlogEditor, Loader } from "../components"

import { UserAuth } from "../utils/context/AuthContext";
import { EditorCT, EditorContextProvider } from "../utils/context/EditorContext";

const Editor = () => {
    let {
        userAuth: { access_token },
    } = UserAuth();

    return (
        <EditorContextProvider>
            {access_token === null ? (
                <Navigate to="/signin" />
            ) : (
                <EditorContent />
            )}
        </EditorContextProvider>
    );
};

const EditorContent = () => {
    const { blog_id } = useParams();
    const { setBlog, editorState, loading, setLoading } = EditorCT();

    useEffect(() => {
        if (!blog_id) {
            return setLoading(false)
        }

        const fetchBlog = async () => {
            try {
                const { data: { blog } } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, {
                    blog_id, draft: true, mode: "edit"
                })
                setBlog(blog);
                setLoading(false);
            } catch (error) {
                setBlog(null);
                setLoading(false);
                console.log(error);
            }
        }
        fetchBlog();

    }, []);

    return loading ? <Loader /> : editorState === "editor" ? <BlogEditor /> : <PublishForm />;
};

export default Editor;
