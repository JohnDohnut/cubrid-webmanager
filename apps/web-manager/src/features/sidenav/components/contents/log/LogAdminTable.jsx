import { Table } from 'antd';
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import Buffering from "@/components/common/Buffering/Buffering.jsx";
import {getViewLogFilesAPI} from "@/features/domain/log/logAPI.js";
import {setBuffering} from "@/shared/slice/globalSlice.js";


const columns = [
    {
        title: 'No',
        dataIndex: 'no',
        key: 'no',
        width: 60,
    },
    {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    }
];


const LogAdminTable = () => {
    const {tabs, activeTabKey} = useSelector(state => state.tab);
    const {activeHost} = useSelector(state => state.host);
    const dispatch = useDispatch()
    const [message, setMessage] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const loadLogs = async (start, end) => {
        const tab = tabs.find(res => res.key === activeTabKey)
        setLoading(true)
        const response = await getViewLogFilesAPI(activeHost, {
            path: tab.path,
            start: start,
            end: end,
        }).finally(() => setLoading(false));
        if(response.success){
            setTotal(parseInt(response.result.total))
            const tempMessage = response.result.log?.[0]?.line.map((item, index)=>
            {
                const array = item.split(' ')
                const timestamp = array.slice(0, 2)
                const action = array.slice(2)
                return {no: index + start, message: timestamp, status: action};
            }
            )
            setMessage([message, tempMessage].flat())
        }
    }



    const handlePageChange = (page, pageSize) => {
        // In a real application, this is where you would trigger the API call
        let buffer = (page + 1) * pageSize;
        if(buffer >= message.length){
            if((message.length + 1) < total){
                loadLogs(message.length + 1, buffer)
            }

        }
    };


    useEffect(() => {
        loadLogs(1, 100)
    }, []);

    return <Table dataSource={message} loading={loading} columns={columns} pagination={{
        // Set the initial/default number of data items per page
        defaultPageSize: 15,
        // OR set a controlled number of data items per page
        // pageSize: 10,
        onChange: handlePageChange,
        // Total number of data items
        total: total,

        // Optionally show a dropdown to change the page size
        showSizeChanger: true,

        // Optionally specify the options available in the size changer dropdown
        pageSizeOptions: ['10', '15', '30', '50'],
    }}/>;
}

export default LogAdminTable;
