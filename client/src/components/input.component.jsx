import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePassword = () => setPasswordVisible(currVal => !currVal)
    
    return (
        <div className="relative w-full mb-4">
            <input
                id={id}
                name={name}
                type={type === "password" ? passwordVisible ? "text" : "password" : type}
                placeholder={placeholder}
                defaultValue={value}
                className="input-box"
            />

            <i className={`fi ${icon} input-icon`}></i>
            {type === "password" ? (
                <i className={`fi fi-rr-eye${!passwordVisible ? "-crossed" : ""} input-icon left-auto right-4 cursor-pointer`} onClick={togglePassword}></i>
            ) : null}
        </div>
    );
};

export default InputBox;
