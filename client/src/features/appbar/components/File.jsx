import React, {useState} from "react";
import DropdownMenu from "./DropdownMenu.jsx";
import {useDispatch, useSelector} from "react-redux";
import {setExportHost, setHostConnection, setImportHost} from "@/features/appbar/appBarSlice.js";





const File = () => {
    const {activeHost} = useSelector(state => state.host);
    const dispatch = useDispatch();

    const menus = [
        {
            label: 'Add Host',
            onClick: () => {
                dispatch(setHostConnection({open: true, type: "add"}));
            }
        },
        {
            label: 'Change Host Info',
            onClick: () => {
                dispatch(setHostConnection({open: true, type: "edit", host: activeHost}));
            }
        },
        {
            label: 'Export Host Info',
            onClick: ()=>{
                dispatch(setExportHost(true));
            }
        },
        {
            label: 'Import Host Info',
            onClick: () => {
                dispatch(setImportHost(true));
            }
        },

    ];

    return <DropdownMenu menus={menus} title={"file"}/>
}


export default File