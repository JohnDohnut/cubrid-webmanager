import {Dropdown, Modal} from "antd";
import {
    PlusOutlined, ReloadOutlined,
} from "@ant-design/icons";
import {nanoid} from "nanoid";
import {useDispatch, useSelector} from "react-redux";

import {deleteDBUserAPI} from "@/features/domain/DBUser/DBUserAPI.js";
import {setCreateDBUser} from "@/features/sidenav/sideNavSlice.js";

const UserMenu = ({node, clientX, clientY, open, onClose})=>{
    const {activeHost} = useSelector(state => state.host);
    const {databases} = useSelector(state => state.database);
    const dispatch = useDispatch();
    const menuItems = [
        {
            label: "Edit User",
            key: nanoid(4),
            icon: <PlusOutlined />,
            onClick: () => {dispatch(setCreateDBUser({open: true, type: "edit", node}))}
        },
        {
            label: "Delete User",
            key: nanoid(4),
            icon: <PlusOutlined />,
            onClick: () => onDelete()
        },
        {
            label: "Refresh",
            key: nanoid(4),
            icon: <ReloadOutlined />,

        }
    ]

    const onDelete = () => {
        Modal.confirm({
            title: 'Are you sure?',
            content: `Delete User ${node.title}?`,
            okText: 'Yes',
            cancelText: 'No',
            async onOk() {

                const database = databases.find(res => res.key === node.databaseId)
                const response = await deleteDBUserAPI(activeHost,
                {
                    dbname: database.title,
                    username: node.title
                }
                )
                if(response.status){
                    // dispatch(deleteUser(node.key));
                }
            },
            onCancel() {

            },
        });
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

export default UserMenu;