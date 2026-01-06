import { Table } from 'antd';
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {getViewLogFilesAPI} from "@/features/domain/log/logAPI.js";


const columns = [
    {
        title: 'No',
        dataIndex: 'no',
        key: 'no',
        width: 60,
    },
    {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
    },
    {
        title: "Error Type",
        dataIndex: 'errortype',
        key: 'errortype',
    },
    {
        title: 'Error Code',
        dataIndex: 'errorcode',
        key: 'errorcode',
    },
    {
        title: 'Tran ID',
        dataIndex: 'tranid',
        key: 'trandid',
    },
    {
        title: 'Error Message',
        dataIndex: 'errormessage',
        key: 'errormessage',
        width: 200,
        wrap: true,
    }
];

function parseTable(logLines, start) {
    const parsedLogs = [];
    let i = 0;
    let no = start;

    while (i < logLines.length) {
        const line = logLines[i];

        if (line.startsWith("Time:")) {
            const timeMatch = line.match(/^Time:\s(.+?)\s-\s(\w+)/);
            const errorType = timeMatch?.[2] ?? "";
            const time = timeMatch?.[1] ?? "";

            const errorCodeMatch = line.match(/ERROR CODE\s*=\s*(-?\d+)/);
            const errorcode = errorCodeMatch?.[1] ?? "";

            const tranIdMatch = line.match(/Tran\s*=\s*(-?\d+)/);
            const tranid = tranIdMatch?.[1] ?? "";

            const fileNoteMatch = line.match(/\*\*\*\sfile\s(.+?),\sline\s\d+/);
            const errornote = fileNoteMatch?.[1] ?? "";
            let fileNote = ""
            if(fileNoteMatch){
                fileNote = line.split("*** file")[1]
            }

            const errormessage = logLines[i + 1] || "";

            parsedLogs.push({
                no: no++,
                time,
                errortype: errorType,
                errorcode,
                tranid,
                errormessage: fileNote + " "+ errormessage,
            });

            i += 2;
        } else {
            i++;
        }
    }
    return parsedLogs;
}


const LogServerErrorTable = ()=> {
    const {tabs, activeTabKey} = useSelector(state => state.tab);
    const {activeHost} = useSelector(state => state.host);
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
            setMessage([message, parseTable(response.result.log?.[0]?.line, start)].flat())
        }
    }
    const handlePageChange = (page, pageSize) => {
        let buffer = (page * 6) * pageSize;
        if(buffer >= message.length){
            if((message.length + 1) < total){
                loadLogs(message.length + 1, buffer)
            }
        }
        setTotal(pageSize * (page + 1))
    };


    useEffect(() => {
        loadLogs(1, 100)
    }, []);
    console.log(total)
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

export default LogServerErrorTable;
