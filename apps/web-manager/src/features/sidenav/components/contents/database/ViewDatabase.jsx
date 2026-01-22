import {Divider, Table} from "antd";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {getDBSpaceAPI} from "../../../../domain/database/databaseAPI";
import {nanoid} from "nanoid";
import PieChart from "../../../../../components/common/chart/PieChart";
import {getHostVersionAPI} from "../../../../domain/host/hostAPI";

const generalInfoColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Value", dataIndex: "value", key: "value" },
];

const dbInfoColumns = [
    { title: "type", dataIndex: "type"},
    { title: "purpose", dataIndex: "purpose"},
    { title: "volume_count", dataIndex: "volume_count"},
    { title: "used_size", dataIndex: "used_size"},
    { title: "free_size", dataIndex: "free_size"},
    { title: "total_size", dataIndex: "total_size"},
]


const dbSpaceInfoColumns = [
    {
        title: 'volid',
        dataIndex: 'volid',
        key: 'volid',
        width: 80,
        render: (text) => text || '0',
    },
    {
        title: 'type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
            <span style={{ fontWeight: type?.toLowerCase().includes('log') ? 'bold' : 'normal' }}>
        {type}
      </span>
        ),
    },
    {
        title: 'usedpage',
        dataIndex: 'usedpage',
        key: 'usedpage',
        render: (text, record) => (record.freepage === " " ? "0" : text),
    },
    {
        title: 'totalpage',
        dataIndex: 'totalpage',
        key: 'totalpage',
    },
    {
        title: 'freepage',
        dataIndex: 'freepage',
        key: 'freepage',
        render: (text) => (text === " " ? "N/A" : text),
    },
    {
        title: 'location',
        dataIndex: 'location',
        key: 'location',
        ellipsis: true,
        width: 420, // Longer column
    }
];

const fileTypeColumns = [
    {
        title: 'data_type',
        dataIndex: 'data_type',
        key: 'data_type',
        width: 250, // Making this column significantly longer
        render: (text) => <strong>{text}</strong>,
    },
    {
        title: 'file_count',
        dataIndex: 'file_count',
        key: 'file_count',
        width: 120,
        align: 'right',
    },
    {
        title: 'file_table_size',
        dataIndex: 'file_table_size',
        key: 'file_table_size',
        width: 150,
        align: 'right',
    },
    {
        title: 'used_size',
        dataIndex: 'used_size',
        key: 'used_size',
        width: 120,
        align: 'right',
        render: (val) => `${val} MB`, // Assuming these are MB based on CUBRID stats
    },
    {
        title: 'reserved_size',
        dataIndex: 'reserved_size',
        key: 'reserved_size',
        width: 150,
        align: 'right',
    },
    {
        title: 'total_size',
        dataIndex: 'total_size',
        key: 'total_size',
        width: 120,
        align: 'right',
        render: (val) => `${val} MB`,
    },
];


const ViewDatabase = (props)=>{
    const {tabs} = useSelector((state)=>state.tab);
    const {activeHost} = useSelector((state)=>state.host);
    const {databases} = useSelector((state)=>state.database);
    const [dbSpace, setDbSpace] = useState({});
    const [generInfo, setGeneralInfo] = useState([])
    const [chartData, setChartData] = useState([]);
    const getSize = (pages, pageSize) => {
        return Number(pages * parseInt(pageSize)/1048576);
    }
    useEffect(()=>{
        const tab = tabs.find(res=>res.key === props.uniqueKey)
        const database = databases.find(res=>res.key === tab.parentId)
        getDBSpaceAPI(activeHost, {dbname: database.dbname}).then(res=>{
            if(res.success){
                setDbSpace(res.result);
                const {pagesize, logpagesize, spaceinfo } = res.result

                let totalPage = 0
                let remainPage = 0
                let usedPage = 0
                spaceinfo.forEach(item=>{
                    if(item.type === "PERMANENT"){
                        totalPage = totalPage + Number(item.totalpage)
                        remainPage = remainPage + Number(item.freepage)
                        usedPage = usedPage + Number(item.usedpage)
                    }
                })

                setChartData([getSize(usedPage, pagesize), getSize(remainPage, pagesize)])



                getHostVersionAPI(activeHost).then(res => {
                    if(res.success){
                        setGeneralInfo([
                            {
                                name: "Version",
                                value: res.result.CUBRIDVER,
                            },
                            {
                                name: "Status",
                                value: database.status === "active" ? "Started": "Stopped",
                                key: nanoid(4)
                            },
                            {
                                name: "Page size",
                                value: pagesize,
                                key: nanoid(4)
                            },
                            {
                                name: "Log page size",
                                value: logpagesize,
                            },
                            {
                                name: "Total size",
                                value: `${getSize(totalPage, pagesize)}M (${totalPage} pages)`,
                            },
                            {
                                name: "Remaining size",
                                value: `${getSize(remainPage, pagesize)}M (${remainPage} pages)`,
                            }
                        ]);
                    }
                })
            }
        })
    },[])

    return <div style={{padding: "8px 12px"}}>

        <Table
            bordered
            pagination={false}
            columns={generalInfoColumns}
            dataSource={generInfo}
            showHeader={false}
        />
        <Divider style={{ margin: "8px 0" }} />
        <Table
            bordered
            pagination={false}
            columns={dbInfoColumns}
            dataSource={dbSpace.dbinfo}
        />
        <Divider />
        <Table
            bordered
            pagination={false}
            columns={dbSpaceInfoColumns}
            dataSource={dbSpace.spaceinfo}
        />
        <Divider />

        <Table
            bordered
            pagination={false}
            columns={fileTypeColumns}
            dataSource={dbSpace.fileinfo}
        />

        <Divider/>
        <div style={{ width: 300, height: 300 }}>
            <PieChart data={
                {
                    labels: [`Used Size ${chartData[0]}M`, `Free Size ${chartData[1]}M`],
                    datasets: [
                        {
                            data: chartData,
                            backgroundColor: ["#f28e2b", "#4e79a7"],
                        },
                    ],
                }
            }/>
        </div>
    </div>
}

export default ViewDatabase