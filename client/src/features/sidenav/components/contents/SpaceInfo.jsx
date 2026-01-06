import {Table} from "antd";
import {use, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import PieChart from "@/components/common/chart/PieChart.jsx";



const SpaceInfo = (props)=>{
    const {tabs} = useSelector((state)=>state.tab);
    const [data, setData] = useState([]);
    const [dataChart, setDataChart] = useState([]);
    const [title, setTitle] = useState("");
    const columns = [
        { title: "Name", dataIndex: "name" },
        { title: "Value", dataIndex: "value" },
    ];

    const getSize = (pages, pageSize) => {
        return Number(pages * parseInt(pageSize)/1048576);
    }


    useEffect(() => {
        const tab = tabs.find(res=>res.key === props.uniqueKey)
        setTitle(tab.title)
        let newData = [
            {
                name: "Location",
                value: tab.location
            },
            {
                name: "Type",
                value: tab.typeSpace
            }

        ]

        if (tab.purpose) {
            newData.push({
                name: "Purpose",
                value: tab.purpose
            })

        }


        let freePage = Number((tab["freepage"] || "").trim() || 0)
        let totalPage = Number((tab["totalpage"] || "").trim() || 0)
        let totalSize = getSize(totalPage, tab["pagesize"]);
        let freeSize = getSize(freePage, tab["pagesize"]);

        newData.push({
            name: "Free Size",
            value: `${freeSize}M / (${freePage} Pages)`
        })
        newData.push({
            name: "Total Size",
            value: `${totalSize}M / (${totalPage} Pages)`
        })

        newData.push({
            name: "Page size",
            value: `${tab["pagesize"]} bytes`
        })

        setData(newData);

        setDataChart([totalSize - freeSize, freeSize]);

    }, []);



    return (
        <div style={{padding: 12}}>
            <p style={{fontSize: 16}}>{title}</p>
            <Table
                columns={columns}
                dataSource={data}
                showHeader={false}   // 🔥 hides the table header
                pagination={false}
                bordered
            />
            <div style={{ width: 300, height: 300 }}>
                <PieChart data={
                    {
                        labels: [`Used Size ${dataChart[0]}M`, `Free Size ${dataChart[1]}M`],
                        datasets: [
                            {
                                data: dataChart,
                                backgroundColor: ["#f28e2b", "#4e79a7"],
                            },
                        ],
                    }
                }/>
            </div>
        </div>
    )
}

export default SpaceInfo;