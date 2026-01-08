import React, {useEffect, useState} from "react";
import {Modal, Form, Select, Button} from "antd";
import styles from "@/features/sidenav/styles/Modal.module.css"
import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {setOptimizeDB} from "@/features/sidenav/sideNavSlice.js";



const OptimizeDB =()=>{

    const {activeHost} = useSelector(state => state.host);
    const {optimizeDB} = useSelector(state => state.sidenav);
    const dispatch = useDispatch();
    const [tables, setTables] = useState([]);
    const [server, setServer] = useState({});
    const [content, setContent] = useState([]);
    const [form] = Form.useForm();

    const handleOk = async () => {
        // dispatch(setBuffering(true));
        const values = await form.validateFields()
        const tableName = values.table === "all"? "": values.table
        // const response = await getOptimizeDB({...getAPIParam(server), dbname: optimizeDB.node.title, classname: tableName});

        // if(response.success){
            setContent(prevState => [...prevState, `Optimize Success: ${values.table === "all" ? "All tables in database": tableName}`]);
            // Modal.success({
            //     title: 'Success',
            //     content: `Job Optimize Database -
            //             ${optimizeDB.node.title + "@" + server.title} has been completed successfully`,
            //     okText: "Close"
            // })
            // handleClose()
        // }
    };


    useEffect(() => {
        if(optimizeDB.open){
            form.resetFields();
            setContent([])
            // dispatch(setBuffering(true));
            // getTables({...getAPIParam(server), database: optimizeDB.node.title, virtual: "normal"}).then(res => {
            //     dispatch(setLoading(false));
            //     if(res.status){
            //         setTables(res.result.user_class)
            //         form.setFieldsValue({table: "all"});
            //     }
            // }).finally(()=>{
            //     dispatch(setBuffering(false));
            // });
            form.setFieldsValue({table: "all"});
        }
    },[optimizeDB])

    const handleClose = () => {
        dispatch(setOptimizeDB({open: false}));
    }


    return (
        <Modal
            title="Optimize DB"
            open={optimizeDB.open}
            footer={() => {
                return (
                    <>
                        <Button type="primary" onClick={handleOk} style={{marginRight: 8}}>
                            Optimize
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div className={styles.db__layout}>
                    <div className={styles.text__title}>Database Name: {optimizeDB.node?.title}</div>
                    <Form form={form} layout="horizontal" name="create_user_form">
                        <Form.Item
                            name="table"
                            label="Table Name: "
                        >
                            <Select>
                                <Option value={"all"}>All Tables</Option>
                                {/*{tables.map((table) => (*/}
                                {/*    <Option key={table.id} value={table.classname}>*/}
                                {/*        {table.classname}*/}
                                {/*    </Option>*/}
                                {/*))}*/}

                            </Select>
                        </Form.Item>
                    </Form>
                </div>
                <div className={styles.db__layout}>
                    <div className={styles.text__title}>Description</div>
                    <div>The query optimizer uses statistical information such as the number of objects in a table, the number of pages to access and the distribution of attribute values.</div>
                </div>

                <div className={styles.db__content}>
                    {
                        content.map(res => (<div>{res}</div>))
                    }
                </div>
            </div>
        </Modal>
    );
};

export default OptimizeDB