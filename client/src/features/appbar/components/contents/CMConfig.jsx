import React, {useEffect, useRef, useState} from 'react';
import Editor from '@monaco-editor/react';

import {useDispatch, useSelector} from "react-redux";
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {getAllSystemParamAPI} from "@/features/appbar/appBarAPI.js";
import {getSystemParamAPI} from "@/features/domain/CMSConfig/CMSConfigAPI.js";


const CodeEditorPage = () => {
    // const {contents, activePanel, closePanelKey, unsavedPanels, signalSavePanel} = useSelector(state => state.general);
    const {activeHost} = useSelector(state => state.host);
    const dispatch = useDispatch()
    const [server, setServer] = useState({})
    const {servers} = useSelector(state => state);
    const [isChange, setIsChange] = useState(false);
    const [code, setCode] = useState("");
    const activeRef = useRef(null);
    useEffect(() => {
        // activeRef.current = activePanel
        dispatch(setBuffering(true))
        getSystemParamAPI(activeHost, "cm.conf").then(res => {
            dispatch(setBuffering(false))
            console.log(res)
            if(res.success) {
                setCode(res.result.join("\r\n"));
            }
        })
    },[])

    const handleChange = (value)=>{
        setCode(value)
        setIsChange(true)

    }
    // useEffect(()=>{
    //     if(isChange){
    //         dispatch(setUnsavedPanels([...new Set([...unsavedPanels, activePanel])]))
    //     }
    // },[isChange])

    // useEffect(()=>{
    //
    //     if(closePanelKey === activeRef.current){
    //         ConfirmAction({
    //             content: "Do you want to save changes?",
    //             onOk: () => {
    //                 dispatch(setLoading(true))
    //                 setAllSystemParamAPI(activeServer, {
    //                     confname: "cm.conf",
    //                     confdata: code.split("\r\n")})
    //                     .then(res =>{
    //                         dispatch(setLoading(false))
    //                         if(res.success) {
    //                             removePanel()
    //                         }
    //                     })
    //             },
    //             onCancel: () => {
    //                 removePanel()
    //             }
    //         })
    //     }
    //
    //
    // },[closePanelKey])

    // const removePanel = ()=>{
    //     if(contents.length > 1) {
    //         const activeKey = contents.at(-2).key;
    //         dispatch(setActivePanel(activeKey));
    //     }
    //     dispatch(deleteContents(activePanel));
    //     dispatch(deleteUnsavedPanels(activePanel));
    //     dispatch(setClosePanelKey(null));
    //     setIsChange(false)
    // }

    return (
        <Editor
            height="100%"
            defaultLanguage="ini"
            value={code}
            theme="vs-white"
            onChange={handleChange}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
            }}
        />
    );
};

export default CodeEditorPage;
