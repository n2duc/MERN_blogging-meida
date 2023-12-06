import { Link } from "react-router-dom";
import AnimationWrapper from "../common/AnimationWrapper";
import { removeFromSession } from "../common/sesstion";
import { UserAuth } from "../utils/context/AuthContext";

const UserNavigationPanel = () => {

    let { userAuth: { username }, setUserAuth } = UserAuth();

    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null });
    }

    return (
        <AnimationWrapper
            className="absolute right-0 z-50"
            transition={{ duration: 0.2 }}
        >
            <div className="p-2 bg-white absolute top-2 right-0 border border-grey w-60 duration-200 rounded-md">
                <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
                    <i className="fi fi-rr-file-edit"></i>
                    <p>Write</p>
                </Link>
                <Link to={`/user/${username}`} className="link pl-8 py-4">
                    Profile
                </Link>
                <Link to="/dashboard/blogs" className="link pl-8 py-4">
                    Dashboard
                </Link>
                <Link to="/settings/edit-profile" className="link pl-8 py-4">
                    Settings
                </Link>

                <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4 border-t border-grey" onClick={signOutUser}>
                    <h1 className="font-medium text-xl mg-1">Sign Out</h1>
                    <p className="text-dark-grey">@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    )
}

export default UserNavigationPanel;