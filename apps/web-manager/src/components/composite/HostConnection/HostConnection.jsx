import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Col, Form, Input, message, Modal, Row, Select, Space} from "antd";
import styles from "./HostConection.module.css";
import {useDispatch, useSelector} from "react-redux";
import {addHostAPI, getHostsAPI, updateHostAPI} from "@/features/domain/host/hostAPI.js";
import {getHostFormat} from "@/lib/treeFormat.js";
import {setHosts} from "@/features/domain/host/hostSlice.js";
import {setHostConnection} from "@/features/appbar/appBarSlice.js";
import {setBuffering} from "@/shared/slice/globalSlice.js";

const HostConnection = () =>{
    const {hostConnection} = useSelector(state => state.appBar);
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        const connectionDetails = {
            ...values,
        };

        dispatch(setBuffering(true));
        if(hostConnection.type === "add") {
            const response = await addHostAPI(connectionDetails);
            if(response.success) {
                const responseHost = await getHostsAPI()
                const newHosts = responseHost.map(item=>getHostFormat(item));
                dispatch(setHosts(newHosts));
                handleClose(true)
            }
        }else if(hostConnection.type === "edit") {
            const response = await updateHostAPI(hostConnection.host, connectionDetails);
            if(response.success) {
                const responseHost = await getHostsAPI()
                const newHosts = responseHost.map(item=>getHostFormat(item));
                dispatch(setHosts(newHosts));
                handleClose(true)
            }
        }


    }

    function handleClose(status) {
        dispatch(setBuffering(false));
        dispatch(setHostConnection({open: false}));
        if(status){
            form.resetFields();
        }

    }
    useEffect(() => {
        if(hostConnection.open){
            form.resetFields();
            if(hostConnection.type === "edit"){
                form.setFieldsValue({...hostConnection.host});
            }
        }

    }, [hostConnection]);
    return (
        <>
            <Modal closeIcon={null}
                   title={hostConnection.type==="add"? "New Connection": "Edit Connection"}
                   maskClosable={false} open={hostConnection.open}
                   onOk={() => handleClose(true)}
                   onCancel={() => handleClose(false)} footer={null} centered={true}>

                <Form form={form} onFinish={handleSubmit} autoComplete="off" layout="vertical">
                    <Row gutter={[18, 0]}>
                        <Col span={24}>
                            <Form.Item
                                label="Name"
                                name="alias"
                                rules={[{required: true, message: "Please enter the name"}]}
                            >
                                <Input placeholder="Enter name"/>
                            </Form.Item>
                        </Col>

                        {/* Host Input */}
                        <Col span={16}>
                            <Form.Item
                                label="Host"
                                name="address"
                                rules={[{required: true, message: "Please enter the host"}]}
                            >
                                <Input placeholder="Enter host (e.g., localhost)"/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            {/* Port Input */}
                            <Form.Item
                                label="Port"
                                name="port"
                                rules={[{required: true, message: "Please enter the port"}]}
                            >
                                <Input placeholder="Enter port (e.g., 8001)"/>
                            </Form.Item>
                        </Col>


                        {/* User Input */}
                        <Col span={24}>
                            <Form.Item
                                label="User"
                                name="id"
                                rules={[{required: true, message: "Please enter the username"}]}
                            >
                                <Input placeholder="Enter username"/>
                            </Form.Item>

                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{message: "Please enter the password"}]}
                            >
                                <Input.Password placeholder="Enter password" autoComplete="new-password"/>
                            </Form.Item>
                        </Col>
                        <Col span={24} style={{marginTop:24}}>
                            <Form.Item>
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


export default HostConnection