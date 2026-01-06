import React, {useEffect, useRef, useState} from 'react';
import Editor from '@monaco-editor/react';
import {useDispatch, useSelector} from "react-redux";
import { getAllSystemParamAPI} from '../../appBarAPI';
import {setBuffering} from "@/shared/slice/globalSlice.js";
import {getSystemParamAPI} from "@/features/domain/CMSConfig/CMSConfigAPI.js";



const CubridConfig = () => {
    const {activeHost} = useSelector((state) => state.host);
    const dispatch = useDispatch()
    const [server, setServer] = useState({})
    const [isChange, setIsChange] = useState(false);
    const [code, setCode] = useState('');
    const activeRef = useRef(null);


    useEffect(() => {
        // activeRef.current = activePanel
        dispatch(setBuffering(true))

        getSystemParamAPI(activeHost, "cubrid.conf").then(({result}) => {
            setCode(result.join("\r\n"));
        }).finally(()=>{
            dispatch(setBuffering(false))
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
    //         if(closePanelKey === activeRef.current){
    //             ConfirmAction({
    //                 content: "Do you want to save changes?",
    //                 onOk: () => {
    //                     dispatch(setLoading(true))
    //                     setAllSystemParamAPI(activeServer, {
    //                         confname: "cubrid.conf",
    //                         confdata: code.split("\r\n")})
    //                         .then(res =>{
    //                         dispatch(setLoading(false))
    //                         if(res.success) {
    //                             removePanel()
    //                         }
    //                     })
    //                 },
    //                 onCancel: () => {
    //                     removePanel()
    //                 }
    //             })
    //         }


    // },[closePanelKey])

    // const removePanel = ()=>{
    //     if(contents.length > 1) {
    //         const activeKey = contents.at(-2).key;
    //         dispatch(setActivePanel(activeKey));
    //     }
    //     dispatch(deleteContents(activePanel));
    //     dispatch(deleteUnsavedPanels(activePanel));
    //     dispatch(setClosePanelKey(null));
    // }
    console.log(code)

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

export default CubridConfig;
