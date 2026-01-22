import React, {useEffect, useState} from "react";
import {Modal, Form, Button, Input, Row, Col, Checkbox, Select} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "../../../../../shared/slice/globalSlice";
import styles from '../../../styles/Modal.module.css'
import {setAutoVolume} from "../../../sideNavSlice";
import {getAutoVolumeAPI, setAutoVolumeAPI} from "../../../../domain/database/databaseAPI";

const SetAutoVolume = () => {
    const {activeHost} = useSelector(state => state.host);
    const {databases} = useSelector(state => state.database);
    const {autoVolume} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [checkBoxFields, setCheckBoxFields ] = useState({});
    const [database, setDatabase] = useState({});
    const handleOk = async () => {
        form.validateFields().then(async (values) => {
            const data = {
                ...values,
                "data": checkBoxFields.data ? "ON": "OFF",
                index: checkBoxFields.index ? "ON": "OFF",
                dbname: database.dbname,
            }
            dispatch(setBuffering(true));

            const response = await setAutoVolumeAPI(activeHost, data)
                .finally(()=>{
                    dispatch(setBuffering(false))
                })
            if(response.success){
                handleClose()
            }
        })
    };
    const handleCheckBox = (e)=>{
        const {name, checked} = e.target;
        setCheckBoxFields(prevState => ({...prevState, [name]: checked}));
    }


    useEffect(() => {
        if(autoVolume.open){
            form.setFieldsValue({
                data_volume: 2048,
                index_volume: 2048,
                index_ext_page: 131072,
                data_ext_page: 131072,
            })
            const database = databases.find(db=>db.key === autoVolume.node.parentId)
            setDatabase(database)
            getAutoVolumeAPI(activeHost, {dbname: database.dbname}).then(res=>{
                if(res.success){
                    const {data, index, ...other} = res.result
                    setCheckBoxFields( {
                        data: data === "ON",
                        index: index === "ON"
                    })
                    form.setFieldsValue({...other})
                }
            })
        }
    },[autoVolume])



    const handleClose = () => {
        dispatch(setAutoVolume({open: false}));
    }


    return (
        <Modal
            title="Enable Automatic Volume Creation"
            width={700}
            open={autoVolume.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8, width: 100}}>
                            Set
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                style={{width: 100}}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <Form form={form} layout="horizontal">
                    <div className={styles.db__layout}>
                        <div className={"border__text"}>
                            Volume purpose: DATA
                        </div>

                        <Row gutter={[12,6]}>
                            <Col span={24}>
                                <Checkbox name="data" checked={checkBoxFields.data}
                                          onChange={handleCheckBox}>
                                    Create volume automatically when running out of space
                                </Checkbox>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="data_warn_outofspace"
                                    labelCol={{span: 7}}
                                    label="Out of spae waring limit (%)">
                                    <Select
                                        disabled={!checkBoxFields.data}
                                        options={Array.from({ length: 30 - 5 + 1 },
                                            (_, i) => ({
                                            label: `${i + 5}`,
                                            value: `${(i + 5)/100}`
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item

                                    name="data_volume"
                                    label="Volume size (MB) : ">
                                    <Input disabled={!checkBoxFields.data}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item

                                    name="data_ext_page"
                                    label="Extension page: ">
                                    <Input disabled={!checkBoxFields.data} type={"number"}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.db__layout}>
                        <div className={"border__text"}>
                            Volume purpose: INDEX
                        </div>
                        <Row gutter={[12,6]}>
                            <Col span={24}>
                                <Checkbox name={"index"} checked={checkBoxFields.index}
                                    onChange={handleCheckBox}
                                >Create volume automatically when out of space</Checkbox>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="index_warn_outofspace"
                                    labelCol={{span: 7}}
                                    label="Out of spae waring limit (%)">
                                    <Select
                                        disabled={!checkBoxFields.index}
                                        options={Array.from({ length: 30 - 5 + 1 },
                                            (_, i) => ({
                                                label: `${i + 5}`,
                                                value: `${(i + 5)/100}`
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item

                                    name="index_volume"
                                    label="Volume size (MB) : ">
                                    <Input disabled={!checkBoxFields.index}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item

                                    name="index_ext_page"
                                    label="Extension page: ">
                                    <Input disabled={!checkBoxFields.index} type={"number"} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};

export default SetAutoVolume