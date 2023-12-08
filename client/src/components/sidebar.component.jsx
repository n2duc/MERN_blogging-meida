import { NavLink } from "react-router-dom";

const menuSettingItem = [
    {
        name: "Blogs",
        path: "blogs",
        icon: "fi-rr-document",
    },
    {
        name: "Notifications",
        path: "notifications",
        icon: "fi-rr-bell",
    },
    {
        name: "Edit Profile",
        path: "edit-profile",
        icon: "fi-rr-user",
    },
    {
        name: "Change Password",
        path: "change-password",
        icon: "fi-rr-lock",
    }
]

const Sidebar = () => {
    return (
        <div className="min-w-[30%] lg:min-w-[200px] max-w-min border-r border-grey pt-3 max-md:hidden pl-3">
            <h1 className="pb-5 pt-2 border-b border-grey mb-4 text-dark-grey text-xl">Settings</h1>
            {
                menuSettingItem.map((item, index) => (
                    <NavLink key={index} to={item.path} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link" }>
                        <div className="flex items-center gap-4">
                            <i className={`fi ${item.icon} mt-1`}></i>
                            <span>{item.name}</span>
                        </div>
                    </NavLink>
                ))
            }
        </div>
    )
}

export default Sidebar