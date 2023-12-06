import { EditorCT } from "../utils/context/EditorContext";

const Tag = ({ tag, tagIndex }) => {

    let { blog, blog: { tags }, setBlog } = EditorCT();

    const addEditable = (e) => {
        e.target.setAttribute("contentEditable", true);
        e.target.focus();
    }

    const handleEditTag = (e) => {
        if (e.keyCode === 13 || e.keyCode === 188) {
            e.preventDefault();
            
            let currentTag = e.target.innerText;
            tags[tagIndex] = currentTag;

            setBlog({ ...blog, tags });
            e.target.setAttribute("contentEditable", false);
        }
    }

    const handleDeleteTag = () => {
        tags = tags.filter(t => t !== tag)
        setBlog({ ...blog, tags })
    }

    return (
        <div className="relative p-2 mt-2 mr-2 px-4 bg-white rounded-lg inline-block hover:bg-opacity-50 pr-10">
            <p className="outline-none" onKeyDown={handleEditTag} onClick={addEditable} >
                {tag}
            </p>
            <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2" onClick={handleDeleteTag}>
                <i className="fi fi-br-cross text-sm pointer-events-none"></i>
            </button>
        </div>
    );
};

export default Tag;
