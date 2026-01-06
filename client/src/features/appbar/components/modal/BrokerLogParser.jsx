import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {extractSQL, isEmptyString, isNotEmpty} from "@/lib/utils.js";
import {Button, Modal, Input, App} from "antd";
import {nanoid} from "nanoid";
import {addTab} from "@/shared/slice/tabSlice.js";
import {setBrokerLogParser} from "@/features/appbar/appBarSlice.js";

const {TextArea} = Input;

const BrokerLogParser = ()=>{
    const { modal } = App.useApp();
    const {brokerLogParser} = useSelector(state => state.appBar);
    const dispatch = useDispatch();
    const [logs, setLogs] = useState("");

    const handleConvert = ()=>{
        if(!isEmptyString(logs)){
            const sql = extractSQL(logs);
            if(isNotEmpty(sql)){
                let key = nanoid(8)
                dispatch(addTab({title: "SQL Editor", type: "sql_editor", key: nanoid(4), sql}))
                // dispatch(addContents({label: "SQL Editor", children: <SQLEditor/>, key, sql}))
                // dispatch(setActivePanel(key))

                handleClose()
            }else{
                modal.error({
                    title: "Error Paras",
                    content: "Invalid SQL log",
                    okText: "Close"
                })
            }
        }

    }

    const handleClose = ()=>{
        dispatch(setBrokerLogParser(false))
        setLogs("")
    }


    return (
        <>
            <Modal
                width={800}
                title="Broker Log Parser"
                open={brokerLogParser}
                footer={() => {
                    return (
                        <>
                            <Button type="primary" disabled={!logs} onClick={handleConvert} style={{marginRight: 8}}>
                                Convert
                            </Button>

                            <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                    onClick={() => handleClose()}>
                                Close
                            </Button>
                        </>
                    )
                }}
            >
                <div style={{overflowY: 'auto' }}>
                    <p>Convert the broker log(prepared statement and bind parameter) to normal SQL and set it to query editor</p>

                    <TextArea
                        value={logs}
                        onChange={(e) => setLogs(e.target.value)}
                        style={{ height: 220 }}
                    />
                </div>
            </Modal>
        </>

    );
};

export default BrokerLogParser;