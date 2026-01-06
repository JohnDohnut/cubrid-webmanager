import {Layout} from "antd";
import React from "react";

import styles from "./AppLayout.module.css"
import AppBar from "../../features/appbar/AppBar.jsx";
import SideNav from "../../features/sidenav/SideNav.jsx";
import ActionBar from "../../features/actionbar/ActionBar.jsx";
import MainContent from "./MainContent";
import HostConnection from "@/components/composite/HostConnection/HostConnection.jsx";
import HostVersion from "@/components/composite/HostVersion/HostVersion.jsx";
import DeleteConfirmAction from "@/components/common/modal/DeleteConfirmAction/DeleteConfirmAction.jsx";
import ErrorModal from "@/components/common/modal/ErrorModal/ErrorModal.jsx";
import AboutCubrid from "@/features/appbar/components/modal/AboutCubrid.jsx";
import Profile from "@/features/appbar/components/modal/Profile.jsx";
import UpdatePassword from "@/features/appbar/components/modal/UpdatePassword.jsx";



export const AppLayout = ()=>{


    return(
            <Layout>
                <AppBar/>
                <ActionBar/>
                <Layout className={styles.app__container}>
                    <SideNav/>
                    <MainContent/>
                    <HostConnection/>
                </Layout>
                <HostVersion/>
            </Layout>

    )
}

export default AppLayout;