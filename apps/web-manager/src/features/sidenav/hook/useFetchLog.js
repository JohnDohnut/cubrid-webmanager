import {useEffect, useState} from "react";
import {nanoid} from "nanoid";
import {useSelector} from "react-redux";
import {getAdminLogFilesAPI, getLogFilesAPI, getLogInfoAPI} from "@/features/domain/log/logAPI.js";
import response from "lodash";



const useFetchLog = (node)=>{
    const {activeHost} = useSelector(state => state.host);
    const {brokers} = useSelector(state => state.broker);
    const {databases} = useSelector(state => state.database);
    const [logBrokerFolder, setLogBrokerFolder] = useState([]);
    const [errorLogs, setErrorLogs] = useState([]);
    const [accessLogs, setAccessLogs] = useState([]);
    const [adminLogs, setAdminLogs] = useState([]);
    const [logManager, setLogManager] = useState([]);
    const [logServerFolder, setLogServerFolder] = useState([]);
    const [logInfo, setLogInfo] = useState([]);
    useEffect(() => {
        if(node.type === "log_broker"){
            const tempLogBroker = [
                {
                    parentId: node.key,
                    key: nanoid(4),
                    title: "Access",
                    icon: "fa-folder folder__icon"
                },
                {
                    parentId: node.key,
                    key: nanoid(4),
                    title: "Error",
                    icon: "fa-folder folder__icon",
                },
                {
                    parentId: node.key,
                    key: nanoid(4),
                    title: "Admin Log",
                    icon: "fa-folder folder__icon",
                }
            ]
            setLogBrokerFolder(tempLogBroker);

            const allBrokerRequest = brokers.map(broker=>getLogFilesAPI(activeHost, broker));
            Promise.all(allBrokerRequest).then(responses=>{
                let tempAccessLog = []
                let tempErrorLog = []


                responses.forEach(response => {
                    response.result.forEach(log => {
                        if(log.type === "error"){
                            tempErrorLog.push({
                                ...log,
                                parentId: tempLogBroker[1].key,
                                key: nanoid(4),
                                title: log.path.split("/").pop(),
                                icon: "fa-file",
                                type: "log_broker_error",
                                isLeaf: true,
                            })
                        }else if(log.type === "access"){
                            tempAccessLog.push({
                                parentId: tempLogBroker[0].key,
                                key: nanoid(4),
                                title: log.path.split("/").pop(),
                                icon: "fa-file",
                                isLeaf: true,
                            })
                        }
                    })
                })
                setErrorLogs(tempErrorLog);
                setAccessLogs(tempAccessLog);
            })
            getAdminLogFilesAPI(activeHost).then(response=>{
                const tempAdminLog = response.result.map(log => {
                    return {
                        ...log,
                        parentId: tempLogBroker[2].key,
                        key: nanoid(4),
                        title: log.path.split("/").pop(),
                        icon: "fa-file",
                        type: "log_admin",
                        isLeaf: true,
                    }
                })
                setAdminLogs(tempAdminLog);
            })

        }else if(node.type === "log_manager"){
            setLogManager([
                {
                    parentId: node.key,
                    key: nanoid(4),
                    title: "Access Log",
                    type: "log_manager_access",
                    icon: "fa-file",
                    isLeaf:true

                },
                {
                    parentId: node.key,
                    key: nanoid(4),
                    title: "Error Log",
                    type: "log_manager_error",
                    icon: "fa-file",
                    isLeaf: true,
                }
            ]);
        }else if(node.type === "log_server"){
            const tempLogServer = databases.map(db => {
                return {
                    ...db,
                    parentId: node.key,
                    key: nanoid(4),
                    title: db.dbname,
                    icon: "fa-folder folder__icon",
                    type: "log_db_info"
                }
            })
            setLogServerFolder(tempLogServer);
        }else if(node.type === "log_db_info"){
            getLogInfoAPI(activeHost, node).then(response=>{
                const tempLogInfo = response.result.map(log => {
                    return {
                        ...log,
                        parentId: node.key,
                        key: nanoid(4),
                        title: log.path.split("/").pop(),
                        icon: "fa-file",
                        type: "log_server_error",
                        isLeaf: true,
                    }
                })
                setLogInfo([logInfo, tempLogInfo].flat());
            })
        }
    }, [node]);

    return {logBrokerFolder, errorLogs, accessLogs, adminLogs,
        logManager, logServerFolder, logInfo};

}

export default useFetchLog;