import React, {useEffect, useState} from 'react';
import {Button, Col, Form, Input, Modal, Radio, Row, Select, Space} from "antd";
import {useDispatch, useSelector} from "react-redux";
import Editor from "@monaco-editor/react"; // assumes @monaco-editor/react is available
import {setBuffering} from "@/shared/slice/globalSlice.js";
import styles from '../../../styles/BackupModal.module.css'
import {setQueryPlanModal} from "@/features/sidenav/sideNavSlice.js";
import PeriodMonthly from "@/features/sidenav/components/modal/BackupModal/PeriodMonthly.jsx";
import PeriodWeekly from "@/features/sidenav/components/modal/BackupModal/PeriodWeekly.jsx";
import PeriodSpecific from "@/features/sidenav/components/modal/BackupModal/PeriodSpecific.jsx";
import useBackupAction from "@/features/sidenav/hook/useBackupAction.js";


const periodDetails = {
    Monthly: <PeriodMonthly/>,
    Weekly: <PeriodWeekly/>,
    Specific: <PeriodSpecific/>,
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, "0");
    const m = i % 2 === 0 ? "00" : "30";
    return { value: `${h}${m}`, label: `${h}:${m}` };
});

const QueryPlanModal = ()=>{
    const {queryPlanModal} = useSelector(state => state.sidenav);
    const {databases, backupInfo} = useSelector(state => state.database);
    const {activeHost} = useSelector(state => state.host);
    const {addBackupHook, updateBackupHook} = useBackupAction();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [active, setActive] = useState("a");
    const [periodType, setPeriodsType] = useState("Monthly");

    const handleSubmit = async (values) => {
        const database = databases.find(db=> db.key === queryPlanModal.node.databaseId)
        const {options, ...temp} = values;
        const temp_options = {
            archivedel: "OFF",
            updatestatus: "OFF",
            storeold: "OFF",
            zip: "n",
            check: "n"
        }

        options?.forEach((option) => {
            temp_options[option] = "ON";
            if(["zip", "check"].includes(option)){
                temp_options[option] = "y";
            }
        });
        temp["period_date"] = temp[periodType]
        delete temp[periodType]
        dispatch(setBuffering(true))
        let response = {}
        if(queryPlanModal.type === "add"){
            response = await addBackupHook({...temp_options, ...temp}, database )
        }else {
            response = await updateBackupHook({...temp_options, ...temp}, database)
        }
        if(response.success){
            handleClose()
        }
        dispatch(setBuffering(false))
    }
    function handleClose() {
        dispatch(setQueryPlanModal({open: false}));
        form.resetFields();
    }


    useEffect(() => {
        if(queryPlanModal.open){
            const database = databases.find(db=> db.key === queryPlanModal.node.databaseId)
            let initializeData = {
                level:"0",
                mt: 0,
                bknum: 0,
                time: "1230",
                period_type: "Monthly",
                Monthly: "1",
                path: `/home/cubrid/CUBRID-11.4.2.1824-0f0e990-Linux.x86_64/databases/${database.title}/backup`,
                onoff: "ON"
            }
            if(queryPlanModal.type === "edit"){
                initializeData = {...queryPlanModal.node}
                initializeData[initializeData.period_type] = initializeData.period_date
                setPeriodsType(initializeData.period_type)
            }

            form.setFieldsValue(initializeData)
        }
    }, [queryPlanModal]);

    return (
        <>
            <Modal closeIcon={null}
                   className={styles.backup}
                   title={"Add Query Plan"}
                   maskClosable={false} open={queryPlanModal.open}
                   onOk={() => handleClose(true)}
                   onCancel={() => handleClose(false)} footer={null} centered={true}>

                <Form form={form} onFinish={handleSubmit}
                      labelCol={{ span: 6 }}  // applies to all labels
                      wrapperCol={{ span: 18 }} // applies to all input fields
                      autoComplete="off" layout="horizontal">
                    <Row gutter={[12, 0]}>
                        <Col span={24}>
                            <Form.Item
                                label="Query Plan Name"
                                name="query_id"
                                rules={[{required: true, message: "Required"}]}
                            >
                                <Input readOnly={queryPlanModal.type === "edit"}  placeholder="Query Plan Name"/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="DB Username"
                                name="username"
                                rules={[{required: true, message: "Required"}]}
                            >
                                <Input readOnly={queryPlanModal.type === "edit"}  placeholder="DB Username"/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Password"
                                name="userpass"
                                rules={[{required: true, message: "Required"}]}
                            >
                                <Input placeholder="Password"/>
                            </Form.Item>
                        </Col>

                        {/* User Input */}
                        <Col span={24}>
                            <Form.Item
                                label="Peroid Type"
                                name="period"
                            >
                                <Select
                                    onChange={(value)=>setPeriodsType(value)}
                                    options={
                                        [
                                            { value: 'Monthly', label: 'Monthly' },
                                            {value: "Weekly", label: "Weekly"},
                                            { value: 'Daily', label: 'Daily' },
                                            {value: "One", label: "Specific"}
                                        ]
                                    }
                                />
                            </Form.Item>

                        </Col>

                        {
                            periodDetails[periodType]
                        }


                        <Col span={24}>
                            <Form.Item
                                label="Backup Time"
                                name="time"
                            >
                                <Select
                                    showSearch={{
                                        optionFilterProp: 'label',
                                        filterSort: (optionA, optionB) =>
                                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase()),
                                    }}
                                    placeholder="Search to Select"
                                    options={Array.from({ length: 48 }, (_, i) => {
                                        const h = String(Math.floor(i / 2)).padStart(2, "0");
                                        const m = i % 2 === 0 ? "00" : "30";
                                        const v = `${h}${m}`;
                                        const l = `${h}:${m}`;
                                        return { value: v, label: l };
                                    })}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Row gutter={[24, 0]}>
                                <Col style={{display: "flex"}}>
                                    <Radio
                                        checked={active === "b"}
                                        onChange={() => setActive("b")}
                                    >Run Specific Time</Radio>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label={"Query Time"}
                                        name="timeA"
                                    >
                                        <Select
                                            disabled={active !== "b"}
                                            showSearch={{
                                                optionFilterProp: "label",
                                                filterSort: (a, b) =>
                                                    a.label.toLowerCase().localeCompare(
                                                        b.label.toLowerCase()
                                                    ),
                                            }}
                                            placeholder="Select time"
                                            options={timeOptions}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        {/* Row B */}
                        <Col span={24} >
                            <Row>
                                <Col style={{display: "flex"}}>
                                    <Radio
                                        checked={active === "a"}
                                        onChange={() => setActive("a")}
                                    >Run Periodically</Radio>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label={"Interval"}
                                        name="timeA"
                                    >
                                        <Select
                                            disabled={active !== "a"}
                                            showSearch={{
                                                optionFilterProp: "label",
                                                filterSort: (a, b) =>
                                                    a.label.toLowerCase().localeCompare(
                                                        b.label.toLowerCase()
                                                    ),
                                            }}
                                            placeholder="Select time"
                                            options={timeOptions}
                                            style={{marginBottom: 0}}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <Editor
                                height="120px"
                                defaultLanguage="sql"
                                // value={sql}
                                // onChange={v => setSql(v)}
                                theme="vs-dark"
                                // onMount={handleMount}
                                options={{ minimap: { enabled: false }, fontSize: 13, tabSize: 2, lineNumbers: "off", padding: { top: 12, bottom: 12 }
                                }}
                            />
                        </Col>

                        <Col span={24} style={{marginTop:24}}>
                            <Form.Item
                                wrapperCol={{ span: 24 }}
                            >
                                <Row align="middle" className={styles.action} gutter={[0, 0]} style={{ width: "100%" }}>
                                    <Col>
                                        <Button type={"primary"} className={"button button__small"}
                                                htmlType="submit">
                                            Save
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button type="primary" variant={"solid"} onClick={()=>handleClose()}>
                                            Cancel
                                        </Button>
                                    </Col>
                                </Row>


                            </Form.Item>
                        </Col>

                    </Row>
                </Form>
            </Modal>
        </>
    );
};


export default QueryPlanModal