import React, {useEffect, useState} from "react";
import { Modal, Form, Input, Select} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {nanoid} from "nanoid";
import Buffering from "@/components/common/Buffering/Buffering.jsx";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {isNotEmpty} from "@/lib/utils.js";
import {addDBUserAPI, getDBUsersAPI, updateDBUserAPI} from "@/features/domain/DBUser/DBUserAPI.js";
import {setCreateDBUser} from "@/features/sidenav/sideNavSlice.js";
import {setDBUsers} from "@/features/domain/DBUser/DBUserSlice.js";

const { Option } = Select;
const { TextArea } = Input;

const ManageDBUser = () => {
    const {activeHost} = useSelector(state => state.host);
    const {databases} = useSelector(state => state.database);
    const {users} = useSelector(state=>state.DBUser);
    const {createDBUser} = useSelector(state=>state.sidenav)
    const [database, setDatabase] = useState({})
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                dispatch(Buffering(true))
                let response = {}
                const data = {...values, groups: values.groups}

                if (createDBUser.type === "add") {
                    response = await addDBUserAPI(activeHost, data)
                } else {
                    response = await updateDBUserAPI(activeHost, data);
                }

                if (response.status) {
                    updateUsers(activeHost, database).then(() => {
                        handleClose()
                    })
                } else {
                    Modal.error({
                        title: 'Error',
                        content: response.note,
                        okText: "Close"
                    })
                }

            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleClose = () => {
        dispatch(setCreateDBUser({open: false}));
    }

    const updateUsers = async (server, db) => {
        dispatch(setBuffering(true))
        const responseUsers = await getDBUsersAPI(activeHost, {dbname: database.title})
        dispatch(setBuffering(false))
        if (responseUsers.status) {
            const oldUsers = users.filter(item => item.databaseId !== db.key)
            const newUsers = responseUsers.result.map(res => {
                const parentId = createDBUser.type === "add" ? createDBUser.node.key : createDBUser.node.parentId
                return {
                    serverId: createDBUser.node.serverId,
                    parentId: parentId,
                    databaseId: db.key,
                    title: res["@name"],
                    key: `${parentId}-${nanoid(8)}`,
                    type: "user",
                    icon: <i className="fa-light fa-user success"/>,
                    isLeaf: true,
                    ...res
                }
            })
            dispatch(setDBUsers([...oldUsers, ...newUsers]))
        }
    }
    useEffect(() => {
        if(createDBUser.open){
            form.resetFields()
            console.log(createDBUser)
            const db = databases.find(res=>res.key === createDBUser.node.databaseId)
            setDatabase(db)
            updateUsers(activeHost, db).then(()=>{
                form.setFieldsValue({
                    dbname: db.title,
                })
                if(createDBUser.type === "edit"){
                    form.setFieldsValue({
                        username: createDBUser.node.title,
                        groups: isNotEmpty(createDBUser.node.groups)? createDBUser.node.groups[0].group: [],
                    })
                }
            })
        }
    }, [createDBUser]);

    const getRenderGroups = ()=>{
        return users.filter(res=>{
            if(res.databaseId === database.key){
                if(createDBUser.type === "edit"){
                    return res.title !== createDBUser.node.title
                }
                return true
            }
            return false
        }).map(res=>(
            <Option key={res.key} value={res.title}>
                {res.title}
            </Option>
        ))
    }

    return (
        <Modal
            title="Create User DB"
            open={createDBUser.open}
            onCancel={handleClose}
            onOk={handleOk}
            okText="Create"
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical" name="create_user_form">
                <Form.Item
                    name="dbname"
                    label="Database"
                >
                    <Select placeholder="Select a database" open={false}>
                        {databases.map((db) => (
                            <Option key={db.key} value={db.title}>
                                {db.title}
                            </Option>
                        ))}
                        {/*<Option value={loginDB.node?.title}>{loginDB.node?.title}</Option>*/}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Please enter a username" }]}
                >
                    <Input placeholder="Enter username" readOnly={createDBUser.type === "edit"}/>
                </Form.Item>

                <Form.Item
                    name="userpass"
                    label="Password"
                    rules={[{ required: false, message: "Please enter a password" }]}
                >
                    <Input.Password placeholder="Enter password" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["userpass"]}
                    hasFeedback
                    rules={[
                        { required: false, message: "Please confirm the password" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("userpass") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error("The two passwords do not match!")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Re-enter password" />
                </Form.Item>

                <Form.Item name="memo" label="Memo">
                    <TextArea rows={3} placeholder="Optional memo" />
                </Form.Item>

                <Form.Item name="groups" label="Groups">
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select user groups"
                    >
                        {
                            getRenderGroups()
                        }
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ManageDBUser;
