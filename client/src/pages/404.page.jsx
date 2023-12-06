import { Link } from "react-router-dom";
// import pageNotFoundImg from "../imgs/404.png";
import pageNotFoundImg from "../imgs/404-animate.gif";
import fullLogo from "../imgs/full-logo.png";

const PageNotFound = () => {
    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-10 text-center">
            <img src={pageNotFoundImg} alt="404" className="select-none border-2 border-grey w-80 aspect-square object-cover rounded-md" />
            <h1 className="text-4xl font-gelasio leading-7">Page not found</h1>
            <p className="text-dark-grey text-xl leading-7 -mt-4">The page you are looking for does not exists. Head back to the <Link className="text-black underline font-medium text-2xl" to="/">Home Page</Link></p>

            <div className="mt-auto">
                <img src={fullLogo} alt="full logo" className="h-8 object-contain block mx-auto select-none" />
                <p className="text-dark-grey mt-5">Read milions of stories around the world</p>
            </div>
        </section>
    )
}

export default PageNotFound;