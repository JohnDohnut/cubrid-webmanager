import React, {useEffect, useState} from "react";
import {Modal, Form, Select, Button, Input, Row, Col, Checkbox} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {renameDBAPI} from "@/features/domain/database/databaseAPI.js";
import {setDatabases} from "@/features/domain/database/databaseSlice.js";
import {setRenameDB} from "@/features/sidenav/sideNavSlice.js";
import styles from '../../../styles/Modal.module.css'


const RenameDB = ()=>{

    const {activeHost} = useSelector(state => state.host);
    const {databases} = useSelector(state => state.database);
    const {renameDB} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [dbname, setDbname] = useState("");
    const [form] = Form.useForm();
    const handleOk = async () => {
        form.validateFields().then(async (values) => {
            dispatch(setBuffering(true));
            const data = {
                ...values,
                rename: values.dbname,
                dbname: renameDB.node.title,
                advanced: "off", forcedel: values.forcedel ? "y" : "n"}
            const response = await renameDBAPI(activeHost, data)
                .finally(()=>{
                    dispatch(setBuffering(false))
                })
            if(response.success){

                const newDatabases = databases.map(db=>{
                    if(renameDB.node.key === db.key){
                        return {...db, dbname: values.dbname, title: values.dbname};
                    }
                    return db
                })

                dispatch(setDatabases(newDatabases));

                // const resDatabase = await getDatabases({...getAPIParam(server)})
                // dispatch(setBuffering(false));
                // if(resDatabase.status){
                //     const newDatabases = resDatabase.result.map(item=>{
                //         return {
                //             serverId: renameDB.node.serverId,
                //             parentId: renameDB.node.parentId,
                //             title: item.dbname,
                //             key: nanoid(8),
                //             type: "database",
                //             isLogin: false,
                //             status: item.status,
                //             icon: <i className={`fa-light fa-database ${item.status === "inactive" ? "warning" : "success"}`}/>,
                //             ...item
                //         }
                //     })
                //     dispatch(setDatabase(newDatabases))
                    Modal.success({
                        title: 'Success',
                        content: `Job Rename Database - 
                        ${renameDB.node.title + "@" + renameDB.node.title} has been completed successfully`,
                        okText: "Close"
                    })
                handleClose()
                }


        })
    };


    useEffect(() => {
        if(renameDB.open){
            form.resetFields();
            form.setFieldValue("dbname", renameDB.node.title);
            form.setFieldValue("exvolpath", renameDB.node.dbdir);

        }
    },[renameDB])

    useEffect(() => {
        if(renameDB.open){
            let path = renameDB.node.dbdir.split("/");
            path.pop();
            form.setFieldValue("exvolpath", `${path.join("/")}/${dbname}`);
        }

    },[dbname])

    const handleClose = () => {
        dispatch(setRenameDB({open: false}));
    }


    return (
        <Modal
            width={650}
            title="Rename DB"
            open={renameDB.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Rename
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}

        >
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <Form form={form} layout="horizontal">
                    <div className={styles.db__layout}>
                        <Row gutter={[12, 6]}>
                            <Col span={24}>
                                <Form.Item
                                    name="dbname"
                                    labelCol={{span: 6}}
                                    label="Database Name">
                                    <Input onChange={e => setDbname(e.target.value)} placeholder="Database Name" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="exvolpath"
                                    labelCol={{span: 6}}
                                    label="External Volume Path">
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    <Row>
                        <Col span={24}>
                            <Checkbox name="forcedel"> Force Delete Backup Volume </Checkbox>
                            <br/>

                        </Col>
                    </Row>

                </Form>
            </div>
        </Modal>
    );
};

export default RenameDB