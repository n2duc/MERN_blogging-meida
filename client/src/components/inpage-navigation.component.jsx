import { useEffect, useRef, useState } from "react";

export let activeTabLineRef;
export let activeTabRef;

const InPageNavigation = ({
    routes,
    defaultHidden = [],
    defaultActiveIndex = 0,
    children
}) => {
    activeTabLineRef = useRef();
    activeTabRef = useRef();
    const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

    const changePageState = ({ offsetWidth, offsetLeft }, index) => {
        activeTabLineRef.current.style.width = `${offsetWidth}px`;
        activeTabLineRef.current.style.left = `${offsetLeft}px`;
        setInPageNavIndex(index);
    };

    useEffect(() => {
        changePageState(activeTabRef.current, defaultActiveIndex);
    }, [defaultActiveIndex]);

    return (
        <>
            <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
                {routes.map((route, index) => (
                    <button
                        ref={index === defaultActiveIndex ? activeTabRef : null}
                        key={index}
                        className={`p-4 px-5 capitalize ${
                            inPageNavIndex === index
                                ? "text-black"
                                : "text-dark-grey"
                        } ${defaultHidden.includes(route) ? "md:hidden" : ""}`}
                        onClick={(e) => changePageState(e.target, index)}
                    >
                        {route}
                    </button>
                ))}
                <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
            </div>
            {Array.isArray(children) ? children[inPageNavIndex] : children}
        </>
    );
};

export default InPageNavigation;
