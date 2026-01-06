import {Dropdown} from "antd";
import {ApiOutlined, PlusOutlined} from "@ant-design/icons";
import {nanoid} from "nanoid";

import {useDispatch, useSelector} from "react-redux";
import {setBackupModal} from "@/features/sidenav/sideNavSlice.js";
import {setDeleteConfirm} from "@/shared/slice/globalSlice.js";



const BackupMenu = ({node, clientX, clientY, open, onClose, onDeleteModal})=>{
    const dispatch = useDispatch();
    const menuItems = [
        {
            label: "Edit Backup Plan",
            key: nanoid(4),
            icon: <PlusOutlined />,
            onClick: ()=>{
                const updateNode = {...node, icon: null}
                dispatch(setBackupModal({open: true, node: updateNode, type: "edit"}))
            }
        },
        {
            label: "Delete Backup Plan",
            key: nanoid(4),
            icon: <PlusOutlined />,
            onClick: ()=>{
               onDeleteModal({open: true,
                   node, title: "Delete Backup Plan",
                   content: "Are you sure you want to delete this backup?"})
            }
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

export default BackupMenu