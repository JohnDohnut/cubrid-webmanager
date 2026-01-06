import React, {useEffect, useState} from "react";
import {Modal, Form, Input, Select, Button, Typography} from "antd";
import {useDispatch, useSelector} from "react-redux";
import { setUpdatePassword} from "@/features/appbar/appBarSlice.js";
import { updatePasswordAPI, updateUserAPI} from "@/features/auth/authAPI.js";
import {setBuffering} from "@/shared/slice/globalSlice.js";
const { Text } = Typography;

const UpdatePassword = () => {

    const {updatePassword} = useSelector((state) => state.appBar);
    const dispatch = useDispatch();
    const {user} = useSelector((state) => state.auth);

    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                const {oldPassword, newPassword} = values;
                dispatch(setBuffering(true))
                updatePasswordAPI({oldPassword, newPassword}).then(async response => {
                    handleClose()
                }).finally(() => dispatch(setBuffering(false)))


            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleClose = () => {
        dispatch(setUpdatePassword(false));
    }

    useEffect(()=>{
        form.setFieldValue("id", user.id);
    },[])


    return (
        <Modal
            title="User Password"
            open={updatePassword}
            cancelText="Cancel"
            footer={()=>{
                return (
                    <div style={{width: "100%", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <Button type="primary" onClick={handleOk} >
                            Update Password
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </div>
                )
            }}
        >
            <Form form={form} layout="vertical" name="create_user_form">
                <Form.Item
                    name="id"
                    label="Username"
                    rules={[{ required: true, message: "Please enter a username" }]}
                >
                    <Input readOnly placeholder="Enter username"/>
                </Form.Item>
                <Form.Item
                    label="Old Password"
                    name="oldPassword"
                    rules={[{message: "Please enter the password"}]}
                >
                    <Input.Password placeholder="Enter password" autoComplete="new-password"/>
                </Form.Item>
                <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[{message: "Please enter the password"}]}
                >
                    <Input.Password placeholder="Enter password" autoComplete="new-password"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdatePassword;
