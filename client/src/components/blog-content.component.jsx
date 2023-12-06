import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from "react-hot-toast";

const ImageContent = ({ url, caption }) => {
    return (
        <div>
            <img src={url} alt={caption} className="rounded-lg" />
            {caption.length > 0 && (
                <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">{caption}</p>
            )}
        </div>
    )
}

const QuoteContent = ({ quote, caption }) => {
    return (
        <div className="bg-green/10 p-3 pl-5 border-l-4 border-green rounded-md">
            <p className="text-xl leading-10 md:text-2xl">{quote}</p>
            {caption.length > 0 && (
                <p className="w-full text-base text-green leading-5">{caption}</p>
            )}
        </div>
    )
}

const ListContent = ({ style, items }) => {
    return (
        <ol className={`pl-5 ${style === "ordered" ? "list-decimal" : "list-disc"}`}>
            {items.map((item, index) => (
                <li key={index} className="my-4" dangerouslySetInnerHTML={{ __html: item }}></li>
            ))}
        </ol>
    )
}

const CodeContent = ({ code }) => {
    const copyToClipBoard = () => {
        navigator.clipboard.writeText(code);
        toast.success("Copied to clipboard")
    }
    return (
        <div className="relative">
            <button className="absolute right-5 top-5 rounded text-white p-3 text-lg bg-dark-grey/60 hover:bg-dark-grey/80" onClick={copyToClipBoard}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentcolor" id="Outline" viewBox="0 0 24 24" className="h-5 w-5"><path d="M21.155,3.272,18.871.913A3.02,3.02,0,0,0,16.715,0H12A5.009,5.009,0,0,0,7.1,4H7A5.006,5.006,0,0,0,2,9V19a5.006,5.006,0,0,0,5,5h6a5.006,5.006,0,0,0,5-5v-.1A5.009,5.009,0,0,0,22,14V5.36A2.988,2.988,0,0,0,21.155,3.272ZM13,22H7a3,3,0,0,1-3-3V9A3,3,0,0,1,7,6v8a5.006,5.006,0,0,0,5,5h4A3,3,0,0,1,13,22Zm4-5H12a3,3,0,0,1-3-3V5a3,3,0,0,1,3-3h4V4a2,2,0,0,0,2,2h2v8A3,3,0,0,1,17,17Z"/></svg>
            </button>
            <SyntaxHighlighter language="javascript" style={dracula}>
                {code}
            </SyntaxHighlighter>
        </div>
    )
}

const BlogContent = ({ block }) => {

    const { type, data } = block;

    if (type === "paragraph") {
        return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>
    }
    if (type === "header") {
        if (data.level === 3) {
            return <h3 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }}></h3>
        }
        return <h2 className="text-4xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }}></h2>
    }
    if (type === "image") {
        return <ImageContent url={data.file.url} caption={data.caption} />
    }
    if (type === "quote") {
        return <QuoteContent quote={data.text} caption={data.caption} />
    }
    if (type === "list") {
        return <ListContent style={data.style} items={data.items} />
    }
    if (type === "code") {
        return <CodeContent code={data.code} />
    }

    return (
        <div>BlogContent</div>
    )
}

export default BlogContent