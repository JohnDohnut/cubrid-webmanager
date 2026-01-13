import React, {useEffect, useState} from "react";
import {Button, Modal, Table} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {nanoid} from "nanoid";
import {setExportHost} from "@/features/appbar/appBarSlice.js";


const columns = [
    {
        title: 'Host Name',
        dataIndex: 'alias',
        key: 'alias',
    },
    {
        title: 'Host Port',
        dataIndex: 'port',
        key: 'port',
    },
    {
        title: 'Host Address',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'User Name',
        dataIndex: 'id',
        key: 'id',
    },
]


const ExportHost = () => {

    const {hosts} = useSelector(state => state.host);
    const {exportHost} = useSelector(state => state.appBar);
    const [dataSource, setDataSource] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const dispatch = useDispatch();
    const [fileName, setFileName] = useState("hosts.xml");

    const buildContent = () => {
        let content = ``
        for (let key of selectedRowKeys) {
            let host = hosts.find(res => res.key === key)
            content += `\t<host address="${host.address}" jdbcDriver="Auto Detect" alias="${host.title}" port="${host.port}" id="${host.id}"/>\n`
        }
        return `<?xml version="1.0" encoding="UTF-8"?>
                <hosts>
                ${content}
                </hosts>
                `;
    }

    function handleDownload() {
        const blob = new Blob([buildContent()], {type: "application/xml"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    const handleOk = async () => {
        handleDownload()
        handleClose()
    };

    const handleClose = () => {
        dispatch(setExportHost(false));
        setSelectedRowKeys([]);
    }

    useEffect(() => {
        // let data = hosts.map(res => {
        //     return {
        //         alias: res.name,
        //         port: res.port,
        //         host: res.host,
        //         username: res.id,
        //         id: nanoid(4),
        //         key: res.serverId,
        //     }
        // })
        // setDataSource(data)

    }, [hosts]);

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {

            setSelectedRowKeys(keys);
        },
    };

    return (
        <Modal
            title="Export Host"
            open={exportHost}
            footer={() => {
                return (
                    <>
                        <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={handleOk}
                                style={{marginRight: 8}}>

                            Export Host
                        </Button>

                        <Button type={"primary"} variant={"filled"} className={"button button__small"}
                                onClick={() => handleClose()}>
                            Close
                        </Button>
                    </>
                )
            }}
        >
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                <p>Export host to XML: Noted password are not included</p>
                <Table
                    rowKey="key"
                    size="large"
                    columns={columns} bordered pagination={false}
                    rowSelection={rowSelection}
                    dataSource={hosts}/>
            </div>
        </Modal>
    );
};

export default ExportHost

