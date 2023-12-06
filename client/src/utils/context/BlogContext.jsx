import { createContext, useContext, useState } from "react";
import { blogStructure } from "../typeConfig";

const BlogContext = createContext({});

export const BlogContextProvider = ({ children }) => {
    const [blog, setBlog] = useState(blogStructure);

    return (
        <BlogContext.Provider value={{ blog, setBlog }}>
            {children}
        </BlogContext.Provider>
    )
}

export const BlogCT = () => {
    return useContext(BlogContext);
}