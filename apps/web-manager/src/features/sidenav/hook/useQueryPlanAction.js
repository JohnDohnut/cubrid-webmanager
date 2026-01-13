import {getQueryPlanAPI} from "@/features/sidenav/sideNavAPI.js";
import {getTemplateFormat} from "@/lib/treeFormat.js";
import {setQueryPlan} from "@/features/domain/database/databaseSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {nanoid} from "nanoid";


const useQueryPlanAction = ()=>{
    const {activeHost} = useSelector(state => state.host);
    const {queryPlans} = useSelector(state => state.database);
    const dispatch = useDispatch();

    const refreshQueryPlanHook = (db, parent)=>{
        getQueryPlanAPI(activeHost, {dbname: db.title}).then(res => {
            if(res.success){
                const remainList = queryPlans.filter(item=> item.databaseId !== db.key)
                let parentId = ""
                if(parent){
                    parentId = parent.key;
                }else{
                    const sample = queryPlans.find(item=>item.databaseId === db.key);
                    parentId = sample.parentId
                }
                const newQueryPlan = res.result.map(item => {
                    return {
                        ...item,
                        key: nanoid(4),
                        parentId: parentId,
                        databaseId: db.key,
                        title: item.query_id,
                        icon: "fa-file",
                        isLeaf: true

                    }
                })
                dispatch(setQueryPlan([remainList, newQueryPlan].flat()))
            }
        })
    }

    return {refreshQueryPlanHook}

}

export default useQueryPlanAction