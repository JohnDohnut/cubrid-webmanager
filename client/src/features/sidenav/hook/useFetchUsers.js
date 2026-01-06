import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {getDBUsersAPI} from "@/features/domain/DBUser/DBUserAPI.js";
import {setDBUsers} from "@/features/domain/DBUser/DBUserSlice.js";
import {getUserFormat} from "@/lib/treeFormat.js";


const useFetchUsers = (node)=>{
    const {activeHost} = useSelector(state => state.host);
    const {databases} = useSelector(state => state.database);
    const {users} = useSelector(state =>state.DBUser);
    const dispatch = useDispatch();

    useEffect(()=>{
        if(node.type === "users"){
            const database = databases.find(item => item.key === node.parentId)
            getDBUsersAPI(activeHost, {dbname: database.title}).then(res => {
                if(res.success){
                    const newUser = res.result.map(item => ({...getUserFormat(item, node),
                        databaseId: database.key}))
                    dispatch(setDBUsers([...users, ...newUser]))
                }
            })
        }

    },[node])
}

export default useFetchUsers;