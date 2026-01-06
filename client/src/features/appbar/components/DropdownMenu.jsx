import {Dropdown} from "antd";
import styles from "../styles/DropdownMenu.module.css";
import React from "react";


const DropdownMenu = ({menus, title}) => {
    return (
        <Dropdown menu={{items: menus}}>
            <div className={styles.dropdown__menu} onClick={(e) => e.preventDefault()}>
                {title}
            </div>
        </Dropdown>
    )
}

export default DropdownMenu;