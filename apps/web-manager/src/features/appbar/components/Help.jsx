import React from "react";
import {useDispatch, useSelector} from "react-redux";
import DropdownMenu from "@/features/appbar/components/DropdownMenu.jsx";
import {setOpenHostVersion} from "@/features/domain/host/hostSlice.js";
import {setAboutCubrid} from "@/features/appbar/appBarSlice.js";


const Help =()=>{
    const {activeHost} = useSelector((state)=>state.host);
    const dispatch = useDispatch();
    const menus = [
        {
            label: 'Help',
            onClick: ()=>{
                window.open('https://www.cubrid.org/', '_blank')
            }
        },
        {
            label: 'Report Bug',
            onClick: ()=>{
                window.open("http://jira.cubrid.org/secure/Dashboard.jspa", "_blank")
            }
        },
        {
            label: 'CUBRID Online Forum',
            onClick: ()=>{
                window.open("https://www.reddit.com/r/CUBRID/", "_blank")
            }
        },
        {
            label: 'CUBRID tools developments',
            onClick: ()=>{
                window.open("https://github.com/CUBRID/cubrid-manager", "_blank")
            }
        },
        {
            label: 'Check for Updates'
        },
        {
            label: 'Server Version',
            disabled: !activeHost.uid,
            onClick: ()=>{
                dispatch(setOpenHostVersion(true));
            },
        },
        {
            label: 'About CUBRID Admin',
            onClick: ()=>{
                dispatch(setAboutCubrid(true))
            }
        },
    ]

    return <DropdownMenu menus={menus} title={"Help"}/>
}

export default Help;