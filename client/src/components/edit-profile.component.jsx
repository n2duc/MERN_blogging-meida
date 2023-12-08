import { UserAuth } from "../utils/context/AuthContext";
import InputBox from "./input.component";
import toast from "react-hot-toast";
import { uploadImage } from "../common/aws";
import { useEffect, useState } from "react";
import axios from "axios";
import { storeInSesstion } from "../common/sesstion";
import { profileDataStructure } from "../utils/typeConfig"

const EditProfile = () => {
    const { userAuth, userAuth: { username: profileId, access_token, profile_img }, setUserAuth } = UserAuth();
    const [avatar, setAvatar] = useState("");
    const [profile, setProfile] = useState(profileDataStructure);

    const { personal_info, social_links } = profile;

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: user } = await axios.post(
                    `${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`,
                    { username: profileId }
                );
                if (user !==null) {
                    setProfile(user);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserProfile();
    }, [profileId])

    const handleChangeAvatar = (e) => {
        let img = e.target.files[0];
        
        if (img) {
            let loadingToast = toast.loading("Uploading...")
            uploadImage(img).then((url) => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded");
                    setUserAuth({ ...userAuth, profile_img: url })
                    setAvatar(url);
                }
            })
            .catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            })
        }
    }

    const changeAvatar = async () => {
        let loadingToast = toast.loading("Loading...");
        try {
            const response = await axios.put(`${import.meta.env.VITE_SERVER_DOMAIN}/change-avatar`, { avatar }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            storeInSesstion("user", JSON.stringify(userAuth));
            toast.dismiss(loadingToast);
            return toast.success(response.data.message);
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.error);
            }
        }
    }

    const handleSubmitChangeInfo = async (e) => {
        e.preventDefault();
        let formData = {};
        // eslint-disable-next-line no-undef
        let form = new FormData(formElement)
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        let { fullname, username, bio, facebook, instagram, github, youtube, twitter, website } = formData;
        console.log(formData);
        let newDataUpdate = {
            ...profile,
            personal_info: {
                ...profile.personal_info,
                fullname,
                username,
                bio,
            },
            social_links: {
                ...profile.social_links,
                facebook,
                instagram,
                github,
                youtube,
                twitter,
                website,
            },
        }
        // setProfile(newDataUpdate)
        // console.log(profile);
        try {
            const response = await axios.put(`${import.meta.env.VITE_SERVER_DOMAIN}/update-profile`, newDataUpdate, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            return toast.success(response.data.message);
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.error);
            }
        }
    }

    return (
        <>
            <h1 className="text-dark-grey text-xl mb-8">Edit Profile</h1>
            <div className="w-full flex justify-center gap-8 pb-5">
                <div className="w-[20%]">
                    <label htmlFor="uploadAvatar">
                        <img src={profile_img} alt="avatar" className="w-full aspect-square h-auto rounded-full border border-grey z-20" />
                        <input
                            id="uploadAvatar"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleChangeAvatar}
                        />
                    </label>
                    <button className="btn-light w-full mt-5" onClick={changeAvatar}>Upload</button>
                </div>
                <div className="w-full">
                    <form id="formElement" className="w-full">
                        <div className="flex w-full gap-5 mb-6">
                            <InputInfo read={false} icon="fi-sr-user" name="fullname" type="text" value={personal_info.fullname} />
                            <InputInfo icon="fi-sr-envelope" name="email" type="email" value={personal_info.email} />
                        </div>
                        <InputBox name="username" type="text" icon="fi-br-at" value={personal_info.username} />
                        <p className="text-dark-grey mb-6">User will use to search user and will be visible to all users</p>
                        <div className="w-full mb-6">
                            <textarea name="bio" id="bio" className="w-full h-32 rounded-md p-4 px-5 bg-grey border border-grey focus:bg-transparent placeholder:text-black resize-none" defaultValue={personal_info.bio} ></textarea>
                            <p className="text-dark-grey">200 characters left</p>
                        </div>
                        <div className="w-full mb-2">
                            <p className="text-dark-grey mb-6">Add your social handles below</p>
                            <div className="flex w-full gap-5 mb-6">
                                <InputSocial value={social_links.facebook} placeholder="https://" type="text" name="facebook" icon="fi-brands-facebook" />
                                <InputSocial value={social_links.instagram} placeholder="https://" type="text" name="instagram" icon="fi-brands-instagram" />
                            </div>
                            <div className="flex w-full gap-5 mb-6">
                                <InputSocial value={social_links.github} placeholder="https://" type="text" name="github" icon="fi-brands-github" />
                                <InputSocial value={social_links.youtube} placeholder="https://" type="text" name="youtube" icon="fi-brands-youtube" />
                            </div>
                            <div className="flex w-full gap-5 mb-6">
                                <InputSocial value={social_links.twitter} placeholder="https://" type="text" name="twitter" icon="fi-brands-twitter-alt" />
                                <InputSocial value={social_links.website} placeholder="https://" type="text" name="website" icon="fi-rr-globe" />
                            </div>
                        </div>

                        <button onClick={handleSubmitChangeInfo} type="submit" className="btn-dark">Update</button>
                    </form>
                </div>
            </div>
        </>
    )
}

const InputInfo = ({ name, type, id, value, placeholder, icon, read=true }) => {
    return (
        <div className="relative w-full">
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={value}
                className="input-box"
                readOnly={read}
            />
            <i className={`fi ${icon} input-icon text-dark-grey`}></i>
        </div>
    )
}

const InputSocial = ({ name, type, id, value, placeholder, icon }) => {
    return (
        <div className="relative w-full">
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={value}
                className="input-box"
            />
            <i className={`fi ${icon} input-icon text-dark-grey`}></i>
        </div>
    )
}

export default EditProfile