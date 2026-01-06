import {
    addBackupInfoAPI,
    deleteBackupInfoAPI,
    getBackupInfoAPI,
    setBackupInfoAPI
} from "@/features/sidenav/sideNavAPI.js";
import {nanoid} from "nanoid";
import {setBackupInfo} from "@/features/domain/database/databaseSlice.js";
import {useDispatch, useSelector} from "react-redux";


const useBackupAction = () => {
    const dispatch = useDispatch();
    const {databases, backupInfo} = useSelector(state => state.database);
    const {activeHost} = useSelector(state => state.host);
    const refreshBackupHook = async (db, parent) => {
        const response = await getBackupInfoAPI(activeHost, {dbname: db.title});
        if(response.success){
            const remainList = backupInfo.filter(item=> item.databaseId !== db.key)
            let parentId = ""
            if(parent){
                parentId = parent.key;
            }else {
                const sample = backupInfo.find(item=>item.databaseId === db.key);
                parentId = sample.parentId;
            }

            const newBackupInfo = response.result.map(item => {
                return {
                    ...item,
                    key: nanoid(4),
                    parentId,
                    databaseId: db.key,
                    title: item.backupid,
                    icon: "fa-file",
                    isLeaf: true,
                    type: "backup_item"

                }
            })
            dispatch(setBackupInfo([remainList, newBackupInfo].flat()))
        }
    }

    const deleteBackupHook = async (node) => {
        const database = databases.filter(db=> db.key !== node.databaseId);
        const response = await deleteBackupInfoAPI(activeHost, {dbname: database.dbname, backupid: node.backupid})
        if(response.success){
            await refreshBackupHook(database)
        }
        return response
    }

    const addBackupHook = async (data, db) => {
        const response = await addBackupInfoAPI(activeHost, {...data, dbname: db.title});
        if (response.success) {
            await refreshBackupHook(db)
        }
        return response
    }

    const updateBackupHook = async (data, db) => {
        const response = await setBackupInfoAPI(activeHost, {...data, dbname: db.title});
        if (response.success) {
            await refreshBackupHook(db)
        }
        return response
    }


    return {refreshBackupHook, deleteBackupHook, addBackupHook, updateBackupHook}


}

export default useBackupAction;