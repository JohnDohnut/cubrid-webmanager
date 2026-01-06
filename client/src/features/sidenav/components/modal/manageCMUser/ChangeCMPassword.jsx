import React, {useEffect, useState} from "react";
import {Modal, Form, Input, Select, Button, Row, Col} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {updateCMPasswordAPI} from "@/features/domain/CMUser/CMUserAPI.js";
import {setChangeCMPassword} from "@/features/sidenav/sideNavSlice.js";


const ChangeCMPassword = () => {
    const {changeCMPassword} = useSelector(state=> state.sidenav)
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const {host} = changeCMPassword
    const handleOk = () => {
        form.validateFields().then(async (values) => {
            dispatch(setBuffering(true));
            const data = {
                targetid: host.id,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            }
            const response = await updateCMPasswordAPI(host, data)
                .finally(()=>{
                    dispatch(setBuffering(false));
                })
            if (response.success) {
                handleClose()
            }
        })


    };

    const handleClose = () => {
        dispatch(setChangeCMPassword({open: false}));

    }





    useEffect(() => {
        if(changeCMPassword.open){
            form.resetFields()
            form.setFieldValue("username", host.id);
        }
    }, [changeCMPassword]);



    return (
        <Modal
            title="Create User DB"
            open={changeCMPassword.open}
            onCancel={handleClose}
            onOk={handleOk}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Confirm
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <Form form={form} layout="horizontal" name={"change_password"}>
                <Row gutter={[0, 6]}>
                    <Col span={24}>
                        <Form.Item
                            name="username"
                            labelCol={{span: 7}}
                            label="Username">
                            <Input readOnly/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="oldPassword"
                            labelCol={{span: 7}}
                            label="Old Password"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            name="newPassword"
                            labelCol={{span: 7}}
                            label="New Password"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="confirmPassword"
                            labelCol={{span: 7}}
                            label="Confirm Password"
                            rules={[{ required: true, message: "Required" },
                                ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error('Passwords do not match')
                                        );
                                    },
                                })

                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    </Col>



                </Row>



            </Form>
        </Modal>
    );
};

export default ChangeCMPassword;
