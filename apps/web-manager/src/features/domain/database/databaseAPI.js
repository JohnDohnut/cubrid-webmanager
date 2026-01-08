import { getResponse } from "@/api/endPoint.js";
import { isNotEmpty } from "@/lib/utils.js";
import axios from '/src/api/axiosInstant.js'

const getListDatabase = (data)=>{
    let databases = []
    if (isNotEmpty(data.activelist)) {
        for (let db of data.activelist.active) {
            databases.push({ ...db, status: "active" });
        }
    }
    if (isNotEmpty(data.dblist)) {
        for (let db of data.dblist.dbs) {
            if (!databases.some(obj => obj.dbname === db.dbname)) {
                databases.push({ ...db, status: "inactive" });
            }
        }
    }
    return  databases
}


export const getDatabasesAPI = async (host) => {
    const url = `/${host.uid}/database/start-info`
    const {data} = await axios.get(url);
    const databases = getListDatabase(data);
    return { result: databases, success: true };
}

export const getDBSpaceAPI = async (host, db) => {
    const url = `/${host.uid}/database/volume-info/${db.dbname}`
    const {data} = await axios.get(url);
    return { result: data, success: true };
}

export const startDatabaseAPI = async (host, db) => {
    const url = `/${host.uid}/database/start/${db.dbname}`
    const {data} = await axios.post(url);
    const databases = getListDatabase(data);
    return { result: databases, success: true };
}
export const stopDatabaseAPI = async (host, db) => {
    const url = `/${host.uid}/database/stop/${db.dbname}`
    const {data} = await axios.post(url);
    const databases = getListDatabase(data);
    return { result: databases, success: true };
}

export const compactDBAPI = async (host, data) => {
    const payload = {
        task: "compactdb",
        ...data
    }
    const response = await getResponse(host, payload)
    return {result: data.verbose === "y" ? response.log[0].line: [], success: true};
}

export const checkDBAPI = async (host, data) => {
    const payload = {
        task: "checkdb",
        ...data
    }
    const response = await getResponse(host, payload)
    return {result: response, success: true};
}

export const renameDBAPI = async (host, data) => {
    const payload = {
        task: "renamedb",
        ...data
    }
    const response = await getResponse(host, payload)
    return {result: response, success: true};
}
