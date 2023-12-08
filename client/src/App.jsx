import { Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./utils/context/AuthContext";

import Navbar from "./components/navbar.component";
import UseAuthForm from "./pages/userAuthForm.page";
import Editor from "./pages/editor.page";
import HomePage from "./pages/home.page";
import PageNotFound from "./pages/404.page";
import SearchPage from "./pages/search.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SettingPage from "./pages/setting.page";
import EditProfile from "./components/edit-profile.component";
import ChangePassword from "./components/change-password.component";
import Notifications from "./components/notifications.component";
import BlogsDashboard from "./components/blogs-dashboard.component";

const App = () => {
    return (
        <AuthContextProvider>
            <Routes>
                <Route path="/editor" element={<Editor />} />
                <Route path="/editor/:blog_id" element={<Editor />} />
                <Route path="/" element={<Navbar />}>
                    <Route index element={<HomePage />} />
                    <Route path="signin" element={<UseAuthForm type="sign-in" />} />
                    <Route path="signup" element={<UseAuthForm type="sign-up" />} />
                    <Route path="search/:query" element={<SearchPage />}  />
                    <Route path="user/:id" element={<ProfilePage />}  />
                    <Route path="blog/:blog_id" element={<BlogPage />}/>
                    <Route path="*" element={<PageNotFound />} />
                    <Route path="settings/" element={<SettingPage />}>
                        <Route path="edit-profile" element={<EditProfile />} />
                        <Route path="change-password" element={<ChangePassword />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="blogs" element={<BlogsDashboard />} />
                    </Route>
                </Route>
            </Routes>
        </AuthContextProvider>
    );
};

export default App;