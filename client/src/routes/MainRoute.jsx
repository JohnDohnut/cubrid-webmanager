import {BrowserRouter, HashRouter, Route, Routes} from "react-router-dom";
import PublicRoute from "@/routes/PublicRoute.jsx";
import Login from "@/layouts/AuthLayout/Login.jsx";
import Register from "@/layouts/AuthLayout/Register.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute.jsx";
import AppLayout from "@/layouts/AppLayout/AppLayout.jsx";
import Buffering from "@/components/common/Buffering/Buffering.jsx";


const MainRoute = () => {

    return (
            <HashRouter>
                <Routes>
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<Login/>} />
                        <Route path="/register" element={<Register />} />
                    </Route>
                    {/*<Route path="/login" element={<Login/>} />*/}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AppLayout/>
                            </ProtectedRoute>


                        }
                    />
                </Routes>
            </HashRouter>

    )
}

export default MainRoute;