import React, {useEffect, useState} from "react";
import {Button, Checkbox, Col, DatePicker, Form, Input, Modal, Radio, Row} from "antd";
import {useDispatch, useSelector} from "react-redux";
import styles from '../../../styles/Modal.module.css'
import {setBuffering} from "../../../../../shared/slice/globalSlice";
import {setRestoreDB} from "../../../sideNavSlice";


export default function () {

    const {restoreDB} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [mode, setMode] = useState('normal');
    const [level, setLevel] = useState('0');
    const [checkBoxFields, setCheckBoxFields] = useState({
        selectDatetime: false,
        backupInfo: false,
        recoveryPath: false,
    });


    const handleModeChange = (e) => {
        setMode(e.target.value);
    };
    const handleLevelChange = (e) => {
        setLevel(e.target.value);
    }
    const [form] = Form.useForm();
    const handleOk = async () => {
        form.validateFields().then(async (values) => {
            dispatch(setBuffering(true));

        })
    };

    const handleCheckBox = (e) => {
        const {name, checked} = e.target;
        setCheckBoxFields(prevState => ({...prevState, [name]: checked}));
    }

    useEffect(() => {
        if (restoreDB.open) {
            form.resetFields();
            form.setFieldsValue({
                dbname: restoreDB.node.title,
                recoverypath: restoreDB.node.dbdir,

            })


        }
    }, [restoreDB])

    const handleClose = () => {
        dispatch(setRestoreDB({open: false}));
    }


    return (
        <Modal
            title="Restore DB"
            open={restoreDB.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Restore
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{overflowY: 'auto'}}>
                <Form form={form} layout="horizontal">
                    <div className={styles.db__layout}>
                        <div className={"border__text"}> Database Name</div>
                        <Row gutter={[12, 6]}>
                            <Col span={24}>
                                <Form.Item
                                    name="dbname"
                                    labelCol={{span: 6}}
                                    label="Database Name">
                                    <Input readOnly/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.db__layout}>
                        <div className={"border__text"}>Restored Data</div>
                        <Row gutter={[12, 6]}>
                            <Col span={24}>
                                <Checkbox name="selectDatetime"
                                          value={checkBoxFields.selectDatetime}
                                          onChange={handleCheckBox}>
                                    Select Restore Date and Time </Checkbox>
                                <br/>
                            </Col>
                            <Col span={24}>
                                <Form.Item>
                                    <Radio.Group defaultValue={"normal"} style={{width: '100%'}} disabled={!checkBoxFields.selectDatetime}
                                                 onChange={handleModeChange} value={mode}>
                                        <Row gutter={[0, 6]}>
                                            <Col span={24}>
                                                <Radio value="normal">Backup Time</Radio>
                                            </Col>
                                            <Col span={9} className={"col__center"}>
                                                <Radio value="customize">Specific Restore Date</Radio>
                                            </Col>
                                            <Col span={15}>
                                                <Form.Item name="time">
                                                    <DatePicker
                                                        style={{width: '100%'}}
                                                        showTime
                                                        format="YYYY-MM-DD HH:mm:ss"
                                                        disabled={mode !== 'customize'}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>


                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <div className={"spacer__h"}/>
                            <Col span={24}>
                                <Checkbox name={"backupInfo"} value={checkBoxFields.backupInfo}
                                          onChange={handleCheckBox}> Select A validation backup information
                                </Checkbox>
                            </Col>

                            <Col span={24}>
                                <Radio.Group style={{width: '100%'}} disabled={!checkBoxFields.backupInfo}

                                             onChange={handleLevelChange} value={level}>
                                    <Row gutter={[0, 6]}>
                                        <Col span={6} className={"col__center"}>
                                            <Radio value="2">Level 2 file</Radio>
                                        </Col>
                                        <Col span={18}>
                                            <Form.Item name="path_2">
                                                <Input disabled={!checkBoxFields.backupInfo || level !== "2"}/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6} className={"col__center"}>
                                            <Radio value="1">Level 1 file</Radio>
                                        </Col>
                                        <Col span={18}>
                                            <Form.Item name="path_1">
                                                <Input disabled={!checkBoxFields.backupInfo || level !== "1"}/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={6} className={"col__center"}>
                                            <Radio value="0">Level 0 file</Radio>
                                        </Col>
                                        <Col span={18}>
                                            <Form.Item name="path_0">
                                                <Input disabled={!checkBoxFields.backupInfo || level !== "0"}/>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Radio.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className={styles.db__layout}>
                        <div className={"border__text"}>Recovery Path</div>
                        <Row gutter={[0, 6]}>
                            <Col span={7} className={"col__center"}>
                                <Checkbox name="recoveryPath"
                                          value={checkBoxFields.recoveryPath}
                                          onChange={handleCheckBox}>Recovery Path</Checkbox>
                            </Col>
                            <Col span={17}>
                                <Form.Item name="recoverypath">
                                    <Input disabled={!checkBoxFields.recoveryPath}/>
                                </Form.Item>
                            </Col>
                        </Row>

                    </div>

                    <div className={styles.db__layout}>
                        <div className={"border__text"}> Partial Recovery</div>
                        <Col span={24}>
                            <Checkbox name="partial">Partial Recovery</Checkbox>
                        </Col>
                    </div>

                </Form>
            </div>
        </Modal>
    );
};

