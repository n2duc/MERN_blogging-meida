import { useState } from "react";
import TabPublish from "./tab-publish.component";
import TabDraft from "./tab-draft.component";
import { UserAuth } from "../utils/context/AuthContext";

const BlogsDashboard = () => {
    const { userAuth: { username } } = UserAuth();
    const [tabActive, setTabActive] = useState(1);
    return (
        <>
            <h1 className="text-dark-grey text-xl mb-8">Manage Blogs</h1>
            <div className="w-full text-center border-b border-grey">
                <div className="flex">
                    <button
                        className={`px-6 py-3 border-b bg-white hover:bg-grey rounded-t ${
                            tabActive === 1
                                ? "border-dark-grey text-black"
                                : "border-transparent text-dark-grey"
                        }`}
                        onClick={() => setTabActive(1)}
                    >
                        Published
                    </button>
                    <button
                        className={`px-6 py-3 border-b bg-white hover:bg-grey rounded-t ${
                            tabActive === 2
                                ? "border-dark-grey text-black"
                                : "border-transparent text-dark-grey"
                        }`}
                        onClick={() => setTabActive(2)}
                    >
                        Drafts
                    </button>
                </div>
            </div>
            <div className="content-tab mt-6 w-full">
                {tabActive === 1 && (
                    <TabPublish username={username} />
                )}
                {tabActive === 2 && (
                    <TabDraft username={username} />
                )}
            </div>
        </>
    );
};

export default BlogsDashboard;
