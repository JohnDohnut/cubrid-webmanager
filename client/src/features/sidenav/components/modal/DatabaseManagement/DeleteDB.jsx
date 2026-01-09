import React, {useEffect, useState} from "react";
import {Modal, Form, Input, Select, Checkbox, Button, Space, Table} from "antd";
import {useDispatch, useSelector} from "react-redux";
import styles from '../../../styles/Modal.module.css'
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {deleteDBAPI, getDatabasesAPI, getDBSpaceAPI, loginDatabaseAPI} from "@/features/domain/database/databaseAPI.js";
import {nanoid} from "nanoid";
import {setDeleteDB} from "@/features/sidenav/sideNavSlice.js";
import {setDatabases} from "@/features/domain/database/databaseSlice.js";

const columns = [
    {
        title: 'Volume Name',
        dataIndex: 'spacename',
        key: 'spacename',
    },
    {
        title: 'Volume Path',
        dataIndex: 'location',
        key: 'location',
    },
    {
        title: 'Change Date',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: 'Volume Type',
        dataIndex: 'type',
        key: 'type',
    },
    {
        title: 'Total Size (pages)',
        dataIndex: 'totalpage',
        key: 'totalpage',
    },
    {
        title: 'Remained Size (pages)',
        dataIndex: 'freepage',
        key: 'freepage',
    },
    {
        title: 'Volume Size (MB)',
        dataIndex: 'volumeSizeMB',
        key: 'volumeSizeMB',
    },
];
const newRow = {
    key: nanoid(4),
    spacename: '\u00A0',       // non-breaking space
    location: '\u00A0',
    date: '\u00A0',
    type: '\u00A0',
    totalpage: '\u00A0',
    freepage: '\u00A0',
    volumeSizeMB: '\u00A0',
};

const DeleteDB =()=>{

    const {activeHost} = useSelector(state => state.host);
    const {deleteDB} = useSelector(state => state.sidenav);
    const {databases} = useSelector(state => state.database);
    const dispatch = useDispatch();
    const [info, setInfo] = useState([{}]);
    const [deleteBackup, setDeleteBackup] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [form] = Form.useForm();
    const handleOk = async () => {
        form.validateFields().then( async (values) => {
            dispatch(setBuffering(true))
            const response = await loginDatabaseAPI(
                activeHost,{
                    id: "dba",
                    password: values.password,
                    dbname: deleteDB.node.title
                }).catch(()=>{
                    dispatch(setBuffering(false))
            })
            if (response.success) {
                const deleteResponse = await deleteDBAPI(activeHost, {
                    dbname: deleteDB.node.title,
                    delbackup: deleteBackup ? 'y' : 'n'
                });
                if (deleteResponse.success) {
                    const resDatabase = await getDatabasesAPI(activeHost)
                        .finally(() => {
                            dispatch(setBuffering(false))
                        })
                    if (resDatabase.success) {

                        const newListDB = databases.filter(db=>{
                            const isFound = resDatabase.result.find(item=>item.dbname === db.dbname);
                            return isFound;
                        })
                        dispatch(setDatabases(newListDB))


                        // const newDatabases = resDatabase.result.map(item => {
                        //     return {
                        //         serverId: deleteDB.node.serverId,
                        //         parentId: deleteDB.node.parentId,
                        //         title: item.dbname,
                        //         key: nanoid(8),
                        //         type: "database",
                        //         isLogin: false,
                        //         status: item.status,
                        //         icon: <i
                        //             className={`fa-light fa-database ${item.status === "inactive" ? "warning" : "success"}`}/>,
                        //         ...item
                        //     }
                        // })
                        // dispatch(setDatabase(newDatabases))
                        handleClose()
                        Modal.success({
                            title: 'Success',
                            content: `Delete Database - 
                        ${deleteDB.node.title + "@" + deleteDB.node.title} has been completed successfully`,
                            okText: "Close"
                        })
                    }

                }
            }
            dispatch(setBuffering(false))

        })


    };

    const handleClose = () => {
        dispatch(setDeleteDB({open: false}));
        setOpenConfirm(false);
    }

    useEffect(()=>{
        if(deleteDB.open){
            form.resetFields();
            dispatch(setBuffering(true));
            getDBSpaceAPI(activeHost, deleteDB.node).then(res=>{
                if(res.success){
                    for(const spaceinfo of res.result.spaceinfo ){
                        if(spaceinfo.type === "Active_log"){
                            setInfo([{...spaceinfo, key: nanoid(4)}, newRow]);
                            break
                        }
                    }
                }
            }).finally(()=>{
                dispatch(setBuffering(false));
            })
        }
    },[deleteDB])

    return (
        <>
            <Modal
                width="auto"
                title="Delete DB"
                open={deleteDB.open}
                footer={() => {
                    return (
                        <>
                            <Button type="primary" onClick={()=>setOpenConfirm(true)} style={{marginRight: 8}}>
                                Delete
                            </Button>

                            <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                    onClick={handleClose}>
                                Close
                            </Button>
                        </>
                    )
                }}
            >
                <div style={{overflowY: 'auto' }}>
                    <div className={styles.db__layout}>
                        <div className={styles.text__title}>Database Name: {deleteDB.node?.title}</div>
                    </div>
                    <Space/>
                    <div className={styles.text__title}>Volume Information of Database</div>

                    <div className={styles.db__layout}>
                        <Table columns={columns} dataSource={info} bordered pagination={false} />
                    </div>
                </div>
                <Checkbox name="overwrite" checked={deleteBackup}
                          onChange={({target})=>setDeleteBackup(target.checked)}>Delete Backup Volumes</Checkbox>
            </Modal>

            <Modal
                title="Confirm Password"
                open={openConfirm}
                footer={() => {
                    return (
                        <>
                            <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                                Confirm
                            </Button>

                            <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                    onClick={()=>setOpenConfirm(false)}>
                                Cancel
                            </Button>
                        </>
                    )
                }}
            >
                <div style={{overflowY: 'auto' }}>
                    <div className={styles.db__layout}>
                        <Form form={form} layout="horizontal" name="confirm_password_form">
                            <Form.Item
                                name="password"
                                label="DBA Password"
                            >
                                <Input.Password/>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default DeleteDB