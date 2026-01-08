import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import axios from "/src/api/axiosInstant.js";
import { getUserAPI } from "../features/auth/authAPI.js";
import { setUser } from "../features/auth/authSlice.js";
import LoadingScreen from "@/layouts/GlobalPage/LoadingScreen.jsx";

export default function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!isAuthenticated) {
                    const token = localStorage.getItem("token");
                    if (token) {
                        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                        const response = await getUserAPI();
                        dispatch(setUser(response.data));
                    }
                }
            } catch (error) {
                console.error("❌ Auth check failed:", error);
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [dispatch, isAuthenticated]);

    // 🌀 Loading screen while checking auth
    if (loading) {
        return <LoadingScreen/>;
    }

    // 🚪 Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ✅ Authenticated → render protected page
    return children;
}
