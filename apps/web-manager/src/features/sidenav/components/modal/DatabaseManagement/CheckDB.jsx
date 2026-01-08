import React, {useEffect, useState} from "react";
import {Modal, Form, Input, Select, Checkbox, Button} from "antd";
import {useDispatch, useSelector} from "react-redux";
import styles from '../../../styles/Modal.module.css'
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {checkDBAPI} from "@/features/domain/database/databaseAPI.js";
import {setCheckDB} from "@/features/sidenav/sideNavSlice.js";


const CheckDB =()=>{

    const {activeHost} = useSelector(state => state.host);
    const {checkDB} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [checked, setChecked] = useState(false);
    const handleOk = async () => {
        dispatch(setBuffering(true));
        const response = await checkDBAPI(activeHost,
            {dbname: checkDB.node.title, repairdb: checked ? "y":"n"})
            .finally(()=>{
                dispatch(setBuffering(false));
            })
        if(response.success){
            Modal.success({
                title: 'Success',
                content: `Job Check Database - 
                        ${checkDB.node.title + "@" + activeHost.title} has been completed successfully`,
                okText: "Close"
            })
            handleClose()
        }else{
            Modal.error({
                title: 'Error',
                content: response.note,
                okText: "Close"
            })

        }
    };

    const handleClose = () => {
        dispatch(setCheckDB({open: false}));
    }


    return (
        <Modal
            title="Check DB"
            open={checkDB.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Check
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div className={styles.db__layout}>
                    <div className={styles.text__title}>Database Name: {checkDB.node?.title}</div>
                </div>
                <div className={styles.db__layout}>
                    <div className={styles.text__title}>Description</div>
                    <div>Verified a database. If inconsistencies are found, please contact CUBRID Support to help interpret the output and address any indicated problem so that it will not reoccur.</div>
                </div>
                <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                >
                    Repaired when inconsistent is found
                </Checkbox>
            </div>
        </Modal>
    );
};

export default CheckDB;
