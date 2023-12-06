import { useContext, createContext, useState, useEffect } from "react";
import { lookInSession } from "../../common/sesstion";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [userAuth, setUserAuth] = useState({});

    useEffect(() => {
        let userInSession = lookInSession("user");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null });

    }, []);
    return (
        <AuthContext.Provider value={{ userAuth, setUserAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext);
}