import React, { useState} from "react";
import {Modal,  Button,Checkbox} from "antd";
import {useDispatch, useSelector} from "react-redux";
import styles from "../../../styles/Modal.module.css";

import {getParamDumpAPI} from "@/features/domain/CMSConfig/CMSConfigAPI.js";
import {setParamDump} from "@/features/sidenav/sideNavSlice.js";
import {setBuffering} from "@/shared/slice/globalSlice.js";


const ParamDump = (props) => {

    const {activeHost} = useSelector(state => state.host);
    const {paramDump} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [server, setServer] = useState({});
    const handleOk = async () => {
        dispatch(setBuffering(true));
        const response = await getParamDumpAPI(activeHost, paramDump.node).finally(()=>{
            dispatch(setBuffering(false));
        })
        if(response.success) {
            Modal.success({
                title: 'Success',
                content: `Job Param Dump Cache - 
                        ${paramDump.node.title + "@" + server.title} has been completed successfully`,
                okText: "Close"
            })
            handleClose()
        }
    };


    const handleClose = () => {
        dispatch(setParamDump({open: false}));
    }


    return (
        <Modal
            title="Param Dump"
            open={paramDump.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Dump
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <div className={styles.db__layout}>
                    <div className={styles.text__title}>Database Name: {paramDump.node?.title}</div>
                </div>
                <div className={styles.db__layout}>
                    <div className="border__text">Description</div>
                    <div> This utility is used to display information about the query plans saved (cached) on the server</div>

                </div>
                <Checkbox
                    disabled
                >
                    Dump both clint and server parameters
                </Checkbox>
            </div>
        </Modal>
    );
};

export default ParamDump;
