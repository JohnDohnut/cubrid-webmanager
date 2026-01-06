import {Dropdown} from "antd";
import {ApiOutlined, DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {nanoid} from "nanoid";

import {useDispatch, useSelector} from "react-redux";
import {deleteHostAPI} from "@/features/domain/host/hostAPI.js";
import {setHosts, setOpenHostVersion} from "@/features/domain/host/hostSlice.js";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {setHostConnection} from "@/features/appbar/appBarSlice.js";
import {setChangeCMPassword} from "@/features/sidenav/sideNavSlice.js";



const HostMenu = ({host, clientX, clientY, open, onClose})=>{
    const {hosts} = useSelector(state => state.host);
    const dispatch = useDispatch();

    const menuItems = [
        {
            label: "Disconnect Host",
            key: nanoid(4),
            icon: <ApiOutlined />,
            onClick: () => {dispatch({type: "DISCONNECT"});},
        },
        {
            label: "Add Host",
            key: nanoid(4),
            icon: <PlusOutlined />,
            onClick:()=>dispatch(setHostConnection({open: true, type: "add"}))
        },
        {
            label: 'Edit Host',
            key: nanoid(4),
            icon: <EditOutlined />,
            onClick:()=>dispatch(setHostConnection({open: true, type: "edit", host}))
        },
        {
            label: 'Delete Host',
            key: nanoid(4),
            icon: <DeleteOutlined style={{color: 'var(--danger-color)'}} />,
            onClick: ()=> handleDelete()

        },
        {
            label: 'Change Manager\'s Password',
            key: nanoid(4),
            icon: <DeleteOutlined style={{color: 'var(--danger-color)'}} />,
            onClick: ()=>{
                dispatch(setChangeCMPassword({open: true, host}))
            }

        },
        {
            label: 'Server Version',
            key: nanoid(4),
            icon: <DeleteOutlined style={{color: 'var(--danger-color)'}} />,
            onClick: ()=> {
                dispatch(setOpenHostVersion(true))
            }
        },
        // {
        //     label: 'Properties',
        //     key: nanoid(4),
        //     onClick: ()=> {
        //         // dispatch(setProperty({open: true, node}))
        //     }
        //
        // },
        // {
        //     label: 'Unify settings editor',
        //     key: nanoid(4),
        //     icon: <DeleteOutlined style={{color: 'var(--danger-color)'}} />,
        //     onClick: ()=> {
        //         // dispatch(setUnifySetting({open: true, server}))
        //
        //     }
        //
        // },
    ]

    const handleDelete = async () => {
        dispatch(setBuffering(true))
        const response = await deleteHostAPI(host);
        if(response.status) {
            const newServer = hosts.filter(res=>res.uid !== host.uid)
            dispatch(setHosts(newServer));
        }
        dispatch(setBuffering(false))
    }
    return (
        <Dropdown overlayStyle={{minWidth: 200}}  menu={{items: menuItems}}
                  trigger={["contextMenu"]}
                  onOpenChange={onClose}
                  open={open} placement="bottomLeft">
            <div style={{ position: "absolute", left: clientX, top: clientY, width: 0, height: 0 }} />
        </Dropdown>
    )
}

export default HostMenu