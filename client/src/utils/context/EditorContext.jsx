import { createContext, useContext, useState } from "react";

const blogStructure = {
    title: "",
    banner: "",
    content: [],
    tags: [],
    des: "",
    author: { personal_info: {} },
};

const EditorContext = createContext();

export const EditorContextProvider = ({ children }) => {
    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState({ isReady: false });
    const [loading, setLoading] = useState(true);

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor, loading, setLoading }}>
            {children}
        </EditorContext.Provider>
    )
}

export const EditorCT = () => {
    return useContext(EditorContext);
}