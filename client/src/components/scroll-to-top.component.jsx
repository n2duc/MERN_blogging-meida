import { useState, useEffect } from "react";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        setIsVisible(scrollTop > 400); // Adjust the value as needed
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div
            className={`scroll-to-top ${isVisible ? "translate-y-0 visible" : ""}`}
            onClick={scrollToTop}
        >
            <i className="fi fi-br-angle-up" />
        </div>
    );
};

export default ScrollToTop;
