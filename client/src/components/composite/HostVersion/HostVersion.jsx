import React, {useEffect, useState} from "react";
import {Modal, Button} from "antd";
import {useDispatch, useSelector} from "react-redux";

// import styles from "@/components/common/modal/dialog.module.css"
import styles from './HostVersion.module.css'

import {setOpenHostVersion} from "@/features/domain/host/hostSlice.js";
import {getHostVersionAPI} from "@/features/domain/CMSConfig/CMSConfigAPI.js";



export default function (){

    const {activeHost, openHostVersion} = useSelector(state => state.host)
    const dispatch = useDispatch();
    const [versionDetail, setVersionDetail] = useState({});


    const handleOk = async () => {

    };


    const handleClose = () => {
        dispatch((setOpenHostVersion(false)))
    }

    useEffect(() => {
        if(openHostVersion){
            getHostVersionAPI(activeHost).then(res => {
                if(res.success){
                    setVersionDetail(res.result);
                }
            })
            // getResponse(activeServer, {task:"getcmsenv"}).then(res=>{
            //     console.log(res);
            //     if(res.success){
            //         setVersionDetail(res);
            //     }
            //
            // })
        }

    },[openHostVersion])

    return (
        <Modal
            title="Cubrid Version"
            open={openHostVersion}
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
            <div className={styles.layout}>
                <div className={styles.content__wrapper}>
                    <div className={"img__cubrid"}>
                        <img width={80} src={"https://www.cubrid.org/files/attach/images/3771164/522cf9a9415e01599545be25bfd8eab3.png"} alt={"cubrid logo"}/>
                    </div>
                    <p className={styles.content__text}>{versionDetail.CUBRIDVER}</p>

                </div>

            </div>
        </Modal>
    );
};

