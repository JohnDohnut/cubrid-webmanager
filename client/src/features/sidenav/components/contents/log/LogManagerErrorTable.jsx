import { Table } from 'antd';
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";

import {getLoadAccessLogAPI} from "@/features/domain/log/logAPI.js";

const columns = [
    {
        title: 'No',
        dataIndex: 'no',
        key: 'no',
        width: 60,
    },
    {
        title: 'User',
        dataIndex: '@DBUser',
        key: 'user',
    },
    {
        title: "Task Name",
        dataIndex: 'taskname',
        key: 'taskname',
    },
    {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
    },
    {
        title: 'Description',
        dataIndex: 'errornote',
        key: 'errornote',
    }
];


const LogManagerErrorTable = () => {
    const {activeHost} = useSelector(state => state.host);
    const [message, setMessage] = useState([]);
    const [loading, setLoading] = useState(false);
    const loadLogs = async () => {
        setLoading(true)
        const response = await getLoadAccessLogAPI(activeHost)
            .finally(() => setLoading(false));
        if(response.success){
            const tempMessage = response.result.errorlog?.map((item, index)=>
                ({no: index + 1, ...item}))
            setMessage(tempMessage)
        }
    }
    useEffect(() => {
        loadLogs()
    }, []);

    return <Table dataSource={message} loading={loading} columns={columns} pagination={{
        defaultPageSize: 15,
        showSizeChanger: true,
        pageSizeOptions: ['10', '15', '30', '50'],
    }}/>;
}

export default LogManagerErrorTable;
