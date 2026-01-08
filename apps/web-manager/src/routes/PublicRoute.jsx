import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {Navigate, Outlet} from "react-router-dom";
import { getUserAPI } from "../features/auth/authAPI.js";
import { setUser } from "../features/auth/authSlice.js";
import axios from "/src/api/axiosInstant.js";
import LoadingScreen from "@/layouts/GlobalPage/LoadingScreen.jsx";

export default function PublicRoute() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (token && !isAuthenticated) {
                try {
                    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                    const res = await getUserAPI();
                    dispatch(setUser(res.data));
                } catch (err) {
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };
        verifyToken();
    }, [dispatch, isAuthenticated]);

    if (loading) return <LoadingScreen/>;

    if (isAuthenticated || localStorage.getItem("token")) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
