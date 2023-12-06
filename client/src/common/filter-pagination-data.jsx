import axios from "axios";

export const filterPaginationData = async ({ create_new_arr = false, state, data, page, countRoute, data_to_send = {} }) => {
    if (state !== null && !create_new_arr) {
        return {
            ...state,
            results: [...state.results, ...data],
            page: page
        };
    }

    try {
        const { data: { totalDocs } } = await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}${countRoute}`, data_to_send);
        return {
            results: data,
            page: 1,
            totalDocs
        }
    } catch (error) {
        console.log(error);
        return null; // Handle error appropriately in the calling code
    }
};

