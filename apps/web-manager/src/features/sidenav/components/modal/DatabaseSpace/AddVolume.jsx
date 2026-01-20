import React, {useEffect, useState} from "react";
import {Modal, Button, Form, Row, Col, Input, Select} from "antd";
import {useDispatch, useSelector} from "react-redux";
import styles from '../../../styles/Modal.module.css'
import {setAddVolume} from "../../../sideNavSlice";
import {addVolumeAPI} from "../../../../domain/database/databaseAPI";
import {setBuffering} from "../../../../../shared/slice/globalSlice";



const AddVolume =()=>{

    const {activeHost} = useSelector(state => state.host);
    const {databases} = useSelector(state => state.database);
    const {addVolume} = useSelector(state => state.sidenav);
    const [database, setDatabase] = useState({});
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const handleOk = async () => {
        form.validateFields().then( async (values) => {
            const data = {
                ...values,
                dbname: database.dbname
            }
            dispatch(setBuffering(true));
            const response = await addVolumeAPI(activeHost, data)
                .finally(()=>{
                    dispatch(setBuffering(false))
                })
            if(response.success){
                handleClose()
                Modal.success({
                    title: 'Success',
                    content: ` Job Add Volume has been completed successfully`,
                    okText: "Close"
                })
            }
        })

    };

    const handleClose = () => {
        dispatch(setAddVolume({open: false}));
    }

    useEffect(() => {
        if(addVolume.open){
            const db = databases.find(item=>item.key === addVolume.node.parentId);
            setDatabase(db);
            form.setFieldValue("path", db.dbdir);
            form.setFieldValue("purpose", "generic")
            form.setFieldValue("size_need_mb", 512)
        }
    },[addVolume])

    return (
        <Modal
            title="Add Volume"
            open={addVolume.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Add
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
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="path"
                                    labelCol={{span: 5}}
                                    label="Path: ">
                                    <Input readOnly />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="volname"
                                    labelCol={{span: 5}}
                                    label="Vol Name: ">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="purpose"
                                    labelCol={{span: 5}}
                                    label="Purpose: ">
                                    <Select>
                                        <Option value="generic">generic</Option>
                                        <Option value="data">data</Option>
                                        <Option value="index">index</Option>
                                        <Option value="temp">temp</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="size_need_mb"
                                    labelCol={{span: 5}}
                                    label="Volume (MB): ">
                                    <Input type={"number"}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    
                </Form>
            </div>
        </Modal>
    );
};

export default AddVolume;
