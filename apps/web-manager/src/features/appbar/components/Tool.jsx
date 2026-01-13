import React, {useState} from "react";
import DropdownMenu from "./DropdownMenu.jsx";
import {useDispatch, useSelector} from "react-redux";
import {setBrokerLogParser, setHostConnection, setManageCMUser} from "@/features/appbar/appBarSlice.js";





const Tool = () => {
    const {activeHost} = useSelector(state => state.host);
    const dispatch = useDispatch();

    const menus = [
        {
            label: "Parse SQL Log from broker log",
            onClick: () => {
                dispatch(setBrokerLogParser(true))
            }
        },
        {
            label: "Edit User Management",
            onClick: () => {
                dispatch(setManageCMUser(true))
            }
        }

    ];

    return <DropdownMenu menus={menus} title={"Tool"}/>
}


export default Tool