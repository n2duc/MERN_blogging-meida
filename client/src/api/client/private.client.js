import axios from "axios";
import queryString from "query-string";
import { UserAuth } from "../../utils/context/AuthContext";

const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

const { userAuth: { access_token } } = UserAuth();

const privateClient = axios.create({
    baseURL,
    paramsSerializer: params => queryString.stringify(params)
});

privateClient.interceptors.request.use(async (config) => {
    return {
        ...config,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
        }
    }
})

privateClient.interceptors.response.use((response) => {
    if (response?.data) return response.data;
    return response;
}, (error) => {
    throw error.response.data;
});

export default privateClient;