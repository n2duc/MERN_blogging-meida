import AnimationWrapper from "../common/AnimationWrapper";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar.component";
import { UserAuth } from "../utils/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const SettingPage = () => {
    let {
        userAuth: { access_token },
    } = UserAuth();
    return (
        <>
            {access_token === null ? (
                <Navigate to="/signin" />
            ) : (
                <AnimationWrapper>
                    <Toaster />
                    <section className="h-cover flex justify-center gap-0 md:gap-10">
                        <Sidebar />
                        <div className="w-full pt-3">
                            <Outlet />
                        </div>
                    </section>
                </AnimationWrapper>
            )}
        </>
    )
};

export default SettingPage;