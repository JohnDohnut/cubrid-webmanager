
import {prefAutoStartupDatabase, prefIntervalDashboard} from "@/preference/variable";
import {getObjectLocalStorage, setObjectLocalStorage} from "@/lib/storage.js";



export const setPrefAutoStartupDatabase = (node)=>{
    const key = `${node.serverId}.${node.database}`
    const prev = getObjectLocalStorage(prefAutoStartupDatabase);
    if(prev){
        setObjectLocalStorage(prefAutoStartupDatabase, [...new Set([...prev, key])])
    }else{
        setObjectLocalStorage(prefAutoStartupDatabase, [key])
    }

}

export const deletePrefAutoStartupDatabase = (node)=>{
    const key = `${node.serverId}.${node.database}`
    const prev = getObjectLocalStorage(prefAutoStartupDatabase);
    if(prev){
        let newPref = prev.filter(pre=>pre !== key)
        setObjectLocalStorage(prefAutoStartupDatabase, newPref )
    }
}

export const getPrefAutoStartupDatabase = ()=>{
   return getObjectLocalStorage(prefAutoStartupDatabase)
}


export const setIntervalDashboard = (value)=>{
    localStorage.setItem(prefIntervalDashboard, value)
}

export const getIntervalDashboard = ()=>{
    return parseInt(localStorage.getItem(prefIntervalDashboard) ?? "0", 10)
}
