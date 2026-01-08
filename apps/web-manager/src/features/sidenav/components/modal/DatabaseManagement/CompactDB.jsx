import React, {useEffect, useState} from "react";
import {Modal, Checkbox, Button} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import styles from '../../../styles/Modal.module.css'
import {compactDBAPI} from "@/features/domain/database/databaseAPI.js";
import {setCompactDB} from "@/features/sidenav/sideNavSlice.js";


const CompactDB =()=>{
    const {activeHost} = useSelector(state => state.host);
    const {compactDB} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [checked, setChecked] = useState(false);
    const [content, setContent] = useState(null);
    const handleOk = async () => {
        dispatch(setBuffering(true));
        const response = await compactDBAPI(activeHost,
            {dbname: compactDB.node.title, verbose: checked ? "y":"n"})
            .finally(()=>{
                dispatch(setBuffering(false));
            });
        if(response.success){
            if(checked){
                setContent(response.result);
            }else{
                Modal.success({
                    title: 'Success',
                    content: `Job Compact Database - 
                        ${compactDB.node.title + "@" + activeHost.title} has been completed successfully`,
                    okText: "Close"
                })
                handleClose()
            }

        }
    };

    const handleClose = () => {
        dispatch(setCompactDB({open: false}));
    }

    useEffect(()=>{
        if(compactDB.open){
            setContent(null)
        }
    },[compactDB])

    const renderDescription = ()=>{
        return (
            <div>
                <div className={styles.db__layout}>
                    <div className={styles.text__title}>Database Name: {compactDB.node?.title}</div>
                    <Checkbox
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    >
                        Show Verbose Status Message
                    </Checkbox>
                </div>
                <div className={styles.db__layout}>
                    <div className={styles.text__title}>Description</div>
                    <div>This utility reclaim from two source</div>

                    <br/>
                    <div>- OID of deleted object</div>
                    <div>- multiple table representations</div>

                </div>
            </div>
        )
    }

    const renderResponse = () => {
        return (
            <div className={styles.db__content}>
                {content.map(res=>(
                    <div>{res}</div>
                ))}
            </div>
        )
    }

    return (
        <Modal
            title="Compact DB"
            open={compactDB.open}
            footer={() => {
                return (
                    <>
                        {!content?<Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Compact
                        </Button>:null}

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {content?renderResponse():renderDescription()}
            </div>
        </Modal>
    );
};

export default CompactDB