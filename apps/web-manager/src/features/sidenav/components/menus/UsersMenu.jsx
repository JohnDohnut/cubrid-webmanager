import {Dropdown} from "antd";
import {
    PlusOutlined, ReloadOutlined,
} from "@ant-design/icons";
import {nanoid} from "nanoid";
import {useDispatch, useSelector} from "react-redux";
import {setCreateDBUser} from "@/features/sidenav/sideNavSlice.js";

const UsersMenu = ({node, clientX, clientY, open, onClose}) =>{

    const dispatch = useDispatch();
    const menuItems = [
        {
            label: "Create DB User",
            key: nanoid(4),
            icon: <PlusOutlined />,
            onClick: () => {dispatch(setCreateDBUser({open: true, type:"add", node}))}
        },
        {
            label: "Refresh",
            key: nanoid(4),
            icon: <ReloadOutlined />,

        }
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

export default UsersMenu;