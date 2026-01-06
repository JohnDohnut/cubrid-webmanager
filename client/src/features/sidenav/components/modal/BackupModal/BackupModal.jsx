import React, {useEffect, useRef, useState} from 'react';
import {Button, Checkbox, Col, Form, Input, Modal, Radio, Row, Select} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import styles from '../../../styles/BackupModal.module.css'
import {setBackupModal} from "@/features/sidenav/sideNavSlice.js";
import {addBackupInfoAPI, getBackupInfoAPI, setBackupInfoAPI} from "@/features/sidenav/sideNavAPI.js";
import {nanoid} from "nanoid";
import {setBackupInfo} from "@/features/domain/database/databaseSlice.js";
import PeriodMonthly from "@/features/sidenav/components/modal/BackupModal/PeriodMonthly.jsx";
import PeriodWeekly from "@/features/sidenav/components/modal/BackupModal/PeriodWeekly.jsx";
import PeriodSpecific from "@/features/sidenav/components/modal/BackupModal/PeriodSpecific.jsx";
import useBackupAction from "@/features/sidenav/hook/useBackupAction.js";


const periodDetails = {
    Monthly: <PeriodMonthly/>,
    Weekly: <PeriodWeekly/>,
    Specific: <PeriodSpecific/>,
}


const BackupModal = () =>{
    const {backupModal} = useSelector(state => state.sidenav);
    const {databases, backupInfo} = useSelector(state => state.database);
    const {activeHost} = useSelector(state => state.host);
    const {addBackupHook, updateBackupHook} = useBackupAction();
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const [periodType, setPeriodsType] = useState("Monthly");

    const handleSubmit = async (values) => {
        const database = databases.find(db=> db.key === backupModal.node.databaseId)
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
        if(backupModal.type === "add"){
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
        dispatch(setBackupModal({open: false}));
        form.resetFields();
    }


    useEffect(() => {
        if(backupModal.open){
            const database = databases.find(db=> db.key === backupModal.node.databaseId)
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
            if(backupModal.type === "edit"){
                initializeData = {...backupModal.node}
                initializeData[initializeData.period_type] = initializeData.period_date
                setPeriodsType(initializeData.period_type)
            }

            form.setFieldsValue(initializeData)
        }
    }, [backupModal]);

    return (
        <>
            <Modal closeIcon={null}
                   className={styles.backup}
                   title={"Add Backup Plan"}
                   maskClosable={false} open={backupModal.open}
                   onOk={() => handleClose(true)}
                   onCancel={() => handleClose(false)} footer={null} centered={true}>

                <Form form={form} onFinish={handleSubmit}
                      labelCol={{ span: 4 }}  // applies to all labels
                      wrapperCol={{ span: 20 }} // applies to all input fields
                      autoComplete="off" layout="horizontal">
                    <Row gutter={[18, 0]}>
                        <Col span={24}>
                            <Form.Item
                                label="Backup Name"
                                name="backupid"
                                rules={[{required: true, message: "Required"}]}
                            >
                                <Input readOnly={backupModal.type === "edit"}  placeholder="Backup Name"/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Backup Level"
                                name="level"
                            >
                                <Select
                                    options={
                                        [
                                            {value: "0", label: "0 (Full)" },
                                            {value: "1", label: "1 (First increment)"},
                                            {value: "2", label: '2 (Second increment)' },
                                        ]
                                    }
                                />
                            </Form.Item>
                        </Col>

                        {/* Host Input */}
                        <Col span={24}>
                            <Form.Item
                                label="Backup Path"
                                name="path"
                                rules={[{required: true, message: "Required"}]}
                            >
                                <Input placeholder="Enter Backup Path"/>
                            </Form.Item>
                        </Col>


                        {/* User Input */}
                        <Col span={24}>
                            <Form.Item
                                label="Peroid Type"
                                name="period_type"
                            >
                                <Select
                                    onChange={(value)=>setPeriodsType(value)}
                                    options={
                                    [
                                        { value: 'Monthly', label: 'Monthly' },
                                        {value: "Weekly", label: "Weekly"},
                                        { value: 'Daily', label: 'Daily' },
                                        {value: "Specific", label: "Specific"}
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
                            <Form.Item name="options">
                                <Checkbox.Group style={{ width: "100%" }}>
                                    <Row>
                                        <Col span={12}>
                                            <Checkbox value="archivedel">Delete Archive Volumes</Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox value="updatestatus">Update statistics information</Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox value="check">Check database consistency</Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox value="zip">Use compression</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>
                        </Col>
                        <div style={{height: 12, width:"100%"}}></div>

                        <Col span={8}>
                            <Form.Item
                                labelCol={{ span: 16 }}
                                label="Number of threads"
                                name="mt"
                            >
                                <Input type={"number"} />
                            </Form.Item>
                        </Col>

                        <Col span={16}>
                            <Form.Item
                                labelCol={{ span: 17 }}
                                label="Number of Backup to keep before backup"
                                name="bknum"
                            >
                                <Input type={"number"} />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="onoff" labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
                                <Radio.Group
                                    options={[
                                        { value: 'ON', label: 'Online backup' },
                                        { value: 'OF', label: 'Offline backup (Notice: Database will be stopped during backup operation and then restarted)' },
                                    ]}
                                />
                            </Form.Item>
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


export default BackupModal