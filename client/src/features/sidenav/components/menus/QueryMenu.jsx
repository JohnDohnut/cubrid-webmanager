import {Dropdown} from "antd";
import {ApiOutlined, PlusOutlined} from "@ant-design/icons";
import {nanoid} from "nanoid";

import {useDispatch, useSelector} from "react-redux";
import {setQueryPlanModal} from "@/features/sidenav/sideNavSlice.js";



const QueryMenu = ({node, clientX, clientY, open, onClose})=>{
    console.log(clientX, clientY);
    const {hosts} = useSelector(state => state.host);
    const dispatch = useDispatch();

    const menuItems = [
        {
            label: "Add Query Plan",
            key: nanoid(4),
            icon: <PlusOutlined />,
            onClick: ()=>{
                const updateNode = {...node, icon: null};
                dispatch(setQueryPlanModal({open: true, node: updateNode, type: "add"}))
            },
        },
        {
            label: "Auto Query Plan",
            key: nanoid(4),
            icon: <PlusOutlined />
        },
        {
            label: "Refresh",
            key: nanoid(4),
            icon: <ApiOutlined />
        },

    ]


    return (
        <Dropdown overlayStyle={{minWidth: 200}}  menu={{items: menuItems}}
                  trigger={["contextMenu"]}
                  onOpenChange={onClose}
                  open={open} placement="bottomLeft">
            <div style={{ position: "absolute", left: clientX, top: clientY, width: 0, height: 0 }} />
        </Dropdown>
    )
}

export default QueryMenu