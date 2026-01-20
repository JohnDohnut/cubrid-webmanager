import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Col, Form, Input, Modal, Row, Select} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "../../../../../shared/slice/globalSlice";
import {backupDBAPI} from "../../../../domain/database/databaseAPI";
import {setBackupDB} from "../../../sideNavSlice";
import styles from '../../../styles/BackupModal.module.css'

export default function () {
    const {backupDB} = useSelector(state => state.sidenav);
    const {activeHost} = useSelector(state => state.host);
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [checkBoxFields, setCheckBoxFields ] = useState({
        zip: true,
        removelog: false,
        check: true,

    });


    const handleOk = () => {

        form.validateFields().then(async (values) => {
            const {zip, removelog, check} = checkBoxFields;
            const data = {
                ...values,
                zip: zip ? 'y': 'n',
                removelog: removelog? 'y': 'n',
                check: check ? 'y' : 'n',
            };
            dispatch(setBuffering(true));
            const response = await backupDBAPI(activeHost, data)
                .finally(()=>{
                    dispatch(setBuffering(false))
                })

            if(response.success){
                Modal.success({
                    title: 'Success',
                    content: "Database Backup has been completed successfully",
                    okText: "Close"
                })
                handleClose()
            }else{
                Modal.error({
                    title: 'Error',
                    content: response.note,
                    okText: "Close"
                })
            }
        })



    }

    function handleClose() {
        dispatch(setBackupDB({open: false}));
        form.resetFields();
    }

    const handleCheckBox = (e)=>{
        const {name, checked} = e.target;
        setCheckBoxFields(prevState => ({...prevState, [name]: checked}));
    }

    useEffect(()=>{
        if(backupDB.open){
            const {node} = backupDB;

            const dbName = node.title
            form.setFieldsValue({
                dbname: dbName,
                volname: `${dbName}_backup_lv0`,
                backupdir: `/var/lib/cubrid/${dbName}/backup`,
                level: "0",
                mt: 0
            })

        }

    },[backupDB])

    return (
        <>
            <Modal closeIcon={null} title="Backup Database" maskClosable={false} open={backupDB.open} onOk={() => handleClose(true)}
                   onCancel={() => handleClose(false)}
                   footer={() => {
                       return (
                           <>
                               <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                                   Check
                               </Button>

                               <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                       onClick={() => handleClose()}>
                                   Close
                               </Button>
                           </>
                       )
                   }}

                   centered={true}>

                <Form form={form} autoComplete="off" layout="horizontal">
                    <Row gutter={[12, 6]}>
                        <Col span={24}>
                            <Form.Item
                                label="Database"
                                name="dbname"
                                labelCol={{span: 6}}
                            >
                                <Input readOnly/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Vol Path"
                                name="volname"
                                labelCol={{span: 6}}
                                rules={[{required: true, message: "Required"}]}
                            >
                                <Input placeholder="Enter Vol Path"/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Backup Level"
                                name="level"
                                labelCol={{span: 6}}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Backup Level"
                                name="level"
                                labelCol={{span: 6}}
                            >
                                <Select>
                                    <Option value="0">level 0</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Backup Directory"
                                name="backupdir"
                                labelCol={{span: 6}}
                                rules={[{required: true, message: "Required"}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Parallel Backup"
                                name="mt"
                                labelCol={{span: 6}}
                            >
                                <Input type="number"/>
                            </Form.Item>
                        </Col>
                        <Col span={18}>
                            <Checkbox name="check" checked={checkBoxFields.check}
                                      onChange={handleCheckBox}>Check Database Consistency</Checkbox>
                            <br/>
                            <Checkbox name="removelog" checked={checkBoxFields.removelog}
                                      onChange={handleCheckBox}>Delete Unnecessary log-achieves</Checkbox>
                            <br/>
                            <Checkbox name="zip" checked={checkBoxFields.zip}
                                      onChange={handleCheckBox}>Compress Backup Volumes</Checkbox>
                        </Col>

                        {/*<Col span={24} style={{marginTop:24}}>*/}
                        {/*    <Form.Item>*/}
                        {/*        <Row align="middle" className={styles.action} gutter={[0, 0]} style={{ width: "100%" }}>*/}

                        {/*            <Col>*/}
                        {/*                <Button className={"button button__primary button__small"}*/}
                        {/*                        htmlType="submit">*/}
                        {/*                    Backup*/}
                        {/*                </Button>*/}
                        {/*            </Col>*/}
                        {/*            <Col>*/}
                        {/*                <Button className={"button button__small"} onClick={()=>handleClose()}>*/}
                        {/*                    Cancel*/}
                        {/*                </Button>*/}
                        {/*            </Col>*/}
                        {/*        </Row>*/}


                        {/*    </Form.Item>*/}
                        {/*</Col>*/}

                    </Row>
                </Form>
            </Modal>
        </>

    );
};