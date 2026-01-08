import React, { useState, useContext, useEffect, useRef } from 'react';
import {useDispatch, useSelector} from "react-redux";
import {nanoid} from "nanoid";

import EditableTable from "@/components/common/table/EditableTable";
import {extractParam} from "@/lib/utils.js";
import {getAllSystemParamAPI} from "@/features/appbar/appBarAPI.js";
import {getSystemParamAPI} from "@/features/domain/CMSConfig/CMSConfigAPI.js";


const BrokerConfig = () => {

    // const {contents, activePanel, unsavedPanels, closePanelKey} = useSelector(state => state.general);
    const dispatch = useDispatch()
    const {activeHost} = useSelector(state => state.host);
    const [columns, setColumns] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [isChange, setIsChange] = useState(false);
    const activeRef = useRef(null);
    let reserved = []

    // useEffect(()=>{
    //     if(isChange){
    //         dispatch(setUnsavedPanels([...unsavedPanels, activePanel]))
    //     }
    // },[isChange])
    useEffect(()=>{
        // activeRef.current = activePanel;
        // const content = contents.find(res => res.key === activePanel)
        // const server = servers.find(res => res.uid === content.uid)
        // setServer(server);
        getSystemParamAPI(activeHost, "cubrid_broker.conf").then(res=>{
            if(res.success){
                const data = extractParam(res.result)
                // const cols = Object.keys(data[0]).map(col=>{
                //     return {
                //         key: nanoid(4),
                //         title: col,
                //         editable: true,
                //         dataIndex: col.toLowerCase(),
                //     }
                // });

                const cols = Object.keys(data[0]).map((col, index)=>{
                    return {
                        key: nanoid(4),
                        title: `Broker#${index}`,
                        editable: true,
                        dataIndex: col.toLowerCase(),
                    }
                });
                cols.unshift({
                    key: nanoid(4),
                    title: "Property Name",
                    dataIndex: "propertyName",
                })
                const firstValue =
                    { key: nanoid(4), propertyName: <b>BROKER_NAME</b>}
                Object.keys(data[0]).forEach(col=>{
                    firstValue[col.toLowerCase()] = <b>{`[${col.toLowerCase()}]`}</b>;
                });

                setColumns(cols.map(col => ({
                    ...col,
                    onCell: col.editable
                        ? (record) => ({
                            record,
                            editable: col.editable,
                            dataIndex: col.dataIndex,
                            title: col.title,
                            handleSave,
                        })
                        : undefined,
                })))
                const values = [...data[1]].map(res=>{
                    const brokers = Object.keys(data[0]).map(col=>{
                        return {
                            key: nanoid(4),
                            [col]: data[0][col][res] ?? "",
                        }
                    })
                    return {
                        key: nanoid(4),
                        propertyName: res,
                        ...Object.assign({}, ...brokers)
                    }
                });
                setDataSource([firstValue, ...values])
                reserved = values;
            }
        })
        // getCubridBrokerConfig({...getAPIParam(server)}).then((res) => {
        //     if(res.status){
        //         const data = extractParam(res.result.conflist[0].confdata)
        //         const cols = Object.keys(data[0]).map(col=>{
        //             return {
        //                 key: nanoid(4),
        //                 title: col,
        //                 editable: true,
        //                 dataIndex: col.toLowerCase(),
        //             }
        //         });
        //         cols.unshift({
        //             key: nanoid(4),
        //             title: "Property Name",
        //             dataIndex: "propertyName",
        //         })
        //         setColumns(cols.map(col => ({
        //             ...col,
        //             onCell: col.editable
        //                 ? (record) => ({
        //                     record,
        //                     editable: col.editable,
        //                     dataIndex: col.dataIndex,
        //                     title: col.title,
        //                     handleSave,
        //                 })
        //                 : undefined,
        //         })))
        //
        //         const values = [...data[1]].map(res=>{
        //         const brokers = Object.keys(data[0]).map(col=>{
        //                 return {
        //                     key: nanoid(4),
        //                     [col]: data[0][col][res] ?? "",
        //                 }
        //             })
        //             return {
        //                 key: nanoid(4),
        //                 propertyName: res,
        //                 ...Object.assign({}, ...brokers)
        //             }
        //         });
        //         setDataSource(values)
        //         reserved = values;
        //     }
        //
        // })
    },[])

    const handleSave = (row) => {
        setIsChange(true)
        const newData = reserved.map(res=>{
            if(res.key === row.key){
                return row
            }
            return res
        })
        reserved = newData
        setDataSource(newData)

    };


    // useEffect(()=>{
    //     if(closePanelKey === activeRef.current){
    //         ConfirmAction({
    //             content: "Do you want to save changes?",
    //             onOk: () => {
    //                 dispatch(setLoading(true))
    //                 const lines = injectParam(dataSource);
    //                 setAllSystemParamAPI(activeServer, {confname: "cubrid_broker.conf", confdata: lines}).then(res =>{
    //                     dispatch(setLoading(false))
    //                     if(res.success) {
    //                         removePanel()
    //                     }
    //                 })
    //             },
    //             onCancel: () => {
    //                 removePanel()
    //             }
    //         })
    //     }
    // },[closePanelKey])
    //
    // const removePanel = ()=>{
    //     if(contents.length > 1) {
    //         const activeKey = contents.at(-2).key;
    //         dispatch(setActivePanel(activeKey));
    //     }
    //     dispatch(deleteContents(activePanel));
    //     dispatch(deleteUnsavedPanels(activePanel));
    //     dispatch(setClosePanelKey(null));
    // }


    return (


        <EditableTable
            dataSource={dataSource}
            columns={columns}
        />
    );
};

export default BrokerConfig;
