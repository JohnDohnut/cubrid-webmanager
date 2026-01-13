import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getTemplateFormat, getUserFormat} from "@/lib/treeFormat.js";

import {nanoid} from "nanoid";
import {getBackupInfoAPI, getQueryPlanAPI} from "@/features/sidenav/sideNavAPI.js";
import {setBackupInfo, setQueryPlan} from "@/features/domain/database/databaseSlice.js";
import useBackupAction from "@/features/sidenav/hook/useBackupAction.js";
import useQueryPlanAction from "@/features/sidenav/hook/useQueryPlanAction.js";


const useFetchJobAutomation = (node)=>{
    const {activeHost} = useSelector(state => state.host);
    const {databases, backupInfo, queryPlans} = useSelector(state => state.database);
    const {refreshBackupHook} = useBackupAction();
    const {refreshQueryPlanHook} = useQueryPlanAction()
    const {users} = useSelector(state =>state.DBUser);
    const [subJob, setSubJob] = useState([]);
    const dispatch = useDispatch();

    useEffect(()=>{
        if(node.type === "job_automation"){
            const newJobSub = [
                {
                    key: nanoid(4),
                    parentId: node.key,
                    databaseId: node.parentId,
                    title: "Backup Plan",
                    icon: "fa-folder folder__icon",
                    type: "backup"
                },
                {
                    key: nanoid(4),
                    parentId: node.key,
                    databaseId: node.parentId,
                    title: "Query Plan",
                    icon: "fa-folder folder__icon",
                    type: "query"
                }
            ]
            setSubJob([subJob, newJobSub].flat());

            const database = databases.find(item => item.key === node.parentId)
            refreshBackupHook(database, newJobSub[0])
            refreshQueryPlanHook(database, newJobSub[1])
            // getQueryPlanAPI(activeHost, {dbname: database.title}).then(res => {
            //     if(res.success){
            //         const newQueryPlan = res.result.map(item => {
            //             return {
            //                 ...item,
            //                 ...getTemplateFormat(newJobSub[1]),
            //                 databaseId: database.key,
            //                 title: item.query_id,
            //                 icon: "fa-file",
            //                 isLeaf: true
            //
            //             }
            //         })
            //         dispatch(setQueryPlan(newQueryPlan))
            //     }
            // })
        }

    },[node])

    return [subJob, backupInfo, queryPlans].flat()
}

export default useFetchJobAutomation;