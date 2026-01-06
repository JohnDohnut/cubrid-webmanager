import React, {useEffect, useState} from "react";
import {Modal, Form, Input, Select, Button, Typography} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {setProfile, setUpdatePassword} from "@/features/appbar/appBarSlice.js";
import {deleteAuthUserAPI, getUserAPI, updateUserAPI} from "@/features/auth/authAPI.js";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {setLogout, setUser} from "@/features/auth/authSlice.js";
import DeleteConfirmAction from "@/components/common/modal/DeleteConfirmAction/DeleteConfirmAction.jsx";
const { Text } = Typography;

const Profile = () => {
    const {profile} = useSelector((state) => state.appBar);
    const {user} = useSelector((state) => state.auth);
    const [deleteUser, setDeleteUser] = React.useState(false);
    const dispatch = useDispatch();

    console.log(user);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                dispatch(setBuffering(true))
                updateUserAPI(values).then(async response => {
                    await refreshUser()
                    handleClose()

                }).finally(() => dispatch(setBuffering(false)))


            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleClose = () => {
        dispatch(setProfile(false));
    }

    const refreshUser = async () => {
        const response = await getUserAPI();
        dispatch(setUser(response.data));
    }

    useEffect(()=>{
        form.setFieldValue("id", user.id);
        form.setFieldValue("department", user.department)
    },[])


    const onDeleteUser = () => {
        deleteAuthUserAPI().then(res=>{
            dispatch(setLogout())
        })
    }


    return (
        <>
            <Modal
                title="User Profile"
                open={profile}
                onCancel={handleClose}
                onOk={handleOk}
                okText="Create"
                cancelText="Cancel"
                footer={()=>{
                    return (
                        <div style={{width: "100%", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <Button type={"primary"} onClick={()=>setDeleteUser(true)} className={"error"}>Unregister</Button>
                            <Button type="primary" onClick={handleOk} >
                                Update User
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
                    <Form.Item name="department" label="Departments">
                        <Select
                            defaultValue={"default"}
                        >
                            {
                                ["Default", "IT", "Engineering"].map(group => {
                                    return <option key={group} value={group}>{group}</option>;
                                })
                            }

                        </Select>
                    </Form.Item>
                    <Text onClick={()=>dispatch(setUpdatePassword(true))}
                          style={{cursor: "pointer", color: "var(--app-color-link)"}}>
                        Update Password?
                    </Text>

                </Form>
            </Modal>
            <DeleteConfirmAction
                title={"Delete User"}
                content={"Are you sure you want to delete this DBUser?"}
                open={deleteUser}
                onClose={() => setDeleteUser(false)}
                onOK={() => onDeleteUser()}/>
        </>

    );
};

export default Profile;
