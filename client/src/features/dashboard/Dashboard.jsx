import React from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse} from 'antd';
import {useSelector} from "react-redux";
import DatabaseVolumeTable from "@/features/dashboard/components/DatabaseVolumeTable.jsx";
import BrokerTable from "@/features/dashboard/components/BrokerTable.jsx";
import DatabaseTable from "@/features/dashboard/components/DatabaseTable.jsx";




const getItems = (panelStyle, props) => [
    {
        key: '1',
        label: <b>Database Volumes</b>,
        children: < DatabaseVolumeTable{...props}/>,
        style: panelStyle,
    },
    {
        key: '2',
        label: <b>Brokers</b>,
        children: <BrokerTable {...props}/>,
        style: panelStyle,
    },
    // {
    //     key: '3',
    //     label: <b>System Status</b>,
    //     // children: <SystemStatus />,
    //     style: panelStyle,
    // },
    {
        key: '4',
        label: <b>Databases</b>,
        children: <DatabaseTable {...props}/>,
        style: panelStyle,
    },
    {
        key: '5',
        label: <b>System Info</b>,
        // children: <SystemInfo {...props}/>,
        style: panelStyle,
    },
];
const Dashboard = (props) => {
    const {activeHost} = useSelector((state) => state.host);
    const panelStyle = {
        marginBottom: 8,
    };

    if(!activeHost.key) {
        return null;
    }

    return (
        <Collapse
            bordered={false}
            defaultActiveKey={['1', '2', '3', '4', '5']}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            items={getItems(panelStyle, props)}
        />
    );
};
export default Dashboard;