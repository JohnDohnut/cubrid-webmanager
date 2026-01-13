import React, {useState} from "react";
import {Modal, Button, Checkbox} from "antd";
import {useDispatch, useSelector} from "react-redux";
import styles from "@/features/sidenav/styles/Modal.module.css"
import {getPlanDumpAPI} from "@/features/domain/CMSConfig/CMSConfigAPI.js";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {setPlanDump} from "@/features/sidenav/sideNavSlice.js";

function bytesToMB(bytes) {
    if (bytes === 0) return 0;
    const mb = bytes / 1048576;
    return parseFloat(mb.toFixed(0))
}

const PlanDump =()=>{

    const {activeHost} = useSelector(state => state.host);
    const {planDump} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [server, setServer] = useState({});
    const [checked, setChecked] = useState(false);
    const handleOk = async () => {
        dispatch(setBuffering(true));
        const response = await getPlanDumpAPI(activeHost,{
            dbname: planDump.node.title,
            plandrop: checked ? 'y' : 'n'
        }).finally(() => dispatch(setBuffering(false)));
        if(response.success) {
            Modal.success({
                title: 'Success',
                content: `Job Plan Dump Cache - 
                        ${planDump.node.title + "@" + server.title} has been completed successfully`,
                okText: "Close"
            })
            handleClose()
        }
    };

    const handleClose = () => {
        dispatch(setPlanDump({open: false}));
    }

    return (
        <Modal
            title="Plan Cache Dump"
            open={planDump.open}
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
                    <div className={styles.text__title}>Database Name: {planDump.node?.title}</div>
                </div>
                <div className={styles.db__layout}>
                    <div className="border__text">Description</div>
                    <div> This utility displays current information of the parameters used in the server/client process</div>

                </div>
                <Checkbox
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                >
                    Drop all plans in server's cache
                </Checkbox>
            </div>
        </Modal>
    );
};

export default PlanDump;