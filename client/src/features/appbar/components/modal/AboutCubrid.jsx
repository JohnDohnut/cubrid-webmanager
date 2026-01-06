import React from "react";
import {Modal, Button} from "antd";
import {useDispatch, useSelector} from "react-redux";
import styles from '../../styles/AppBar.module.css'
import {setAboutCubrid} from "@/features/appbar/appBarSlice.js";



const AboutCubrid =()=>{
    const {aboutCubrid} = useSelector(state => state.appBar);
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch((setAboutCubrid(false)))
    }

    return (
        <Modal
            width={600}
            title="About Cubrid"
            open={aboutCubrid}
            footer={() => {
                return (
                    <>
                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{display: "flex", width: '100%', gap: 18}} >
                    <div className={"img__cubrid"}>
                        <img width={100} src={"https://www.cubrid.org/files/attach/images/3771164/522cf9a9415e01599545be25bfd8eab3.png"} alt={"cubrid logo"}/>
                    </div>
                    <div className={""}>
                        <p className={styles.about__text__title}>Cubrid Web CA v1.0  (64bit)</p>
                        <div>
                            Copyright (C) 2025 Search Solution Corporation.
                            All rights reserved by Search Solution.

                            <div>Website: <a href={"http://www.cubrid.org"} target={"_blank"}>http://www.cubrid.org</a></div>
                            <div>CUBRID Manager project: <a href={"https://github.com/CUBRID/cubrid-manager"} target={"_blank"}>https://github.com/CUBRID/cubrid-manager</a></div>
                            <div>CUBRID Database project: <a href={"https://github.com/CUBRID"} target={"_blank"}>https://github.com/CUBRID</a></div>

                        </div>
                    </div>

                </div>

            </div>
        </Modal>
    );
};

export default AboutCubrid;