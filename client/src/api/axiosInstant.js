import axios from "axios";
import ErrorModal from "@/components/common/modal/ErrorModal/ErrorModal.jsx";
import {store} from "@/store/store.js";
import {setErrorModal} from "@/shared/slice/globalSlice.js";

const axiosInstance = axios.create({
    baseURL: "https://192.168.2.50:8080",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
    // referrerPolicy: "no-referrer" // ⭐ add this
});

// Optional: simple error handling
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data?.data || {};
        store.dispatch(setErrorModal({open: true,
            title: data.title || "Error",
            message: data.code || "Something went wrong",}));
        // ErrorModal({
        //     title: `Error ${status || ""}`.trim(),
        //     content: msg,
        // });

        return Promise.reject(error);
    }
);

export default axiosInstance;
