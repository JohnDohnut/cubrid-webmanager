import {ConfigProvider, theme} from "antd";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./layouts/AuthLayout/Login.jsx";
import { store } from './store/store'
import AppLayout from "./layouts/AppLayout/AppLayout.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import Register from "./layouts/AuthLayout/Register.jsx";
import MainRoute from "@/routes/MainRoute.jsx";
import Buffering from "@/components/common/Buffering/Buffering.jsx";
import ErrorModal from "@/components/common/modal/ErrorModal/ErrorModal.jsx";
import React from "react";

const lightTheme = {
    primary: "#2563EB",
    primaryAccent: "#1D4ED8",
    background: "#fff",
    card: "#FFFFFF",
    border: "#BDC3C7",
    text: "#4B5563",
    success: "#2ECC71",
    error: "#E74C3C",
    warning: "#F39C12",
    info: "#3498DB",
};


function App() {
    const customTheme = {
        token: {
            colorPrimary: lightTheme.primary,
            colorBgContainer: lightTheme.background,
            colorText: lightTheme.text,
            fontSize: 13
        },
        algorithm: theme.defaultAlgorithm,
    };
  return (
      <Provider store={store}>
          <ConfigProvider theme={customTheme}>
              <MainRoute/>
              <Buffering/>
              <ErrorModal/>
          </ConfigProvider>
      </Provider>
  )
}



export default App
