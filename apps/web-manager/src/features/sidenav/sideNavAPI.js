import {getResponse} from "@/api/endPoint.js";


export const setBackupInfoAPI = async (server, data) => {
    let payload = {
        task: "setbackupinfo",
        ...data
    }
    return await getResponse(server, payload)
}
export const addBackupInfoAPI = async (server, data) => {
    let payload = {
        task: "addbackupinfo",
        ...data
    }
    return await getResponse(server, payload)

}
export const getBackupInfoAPI = async (server, data) => {
    let payload = {
        task: "getbackupinfo",
        ...data
    }
    const response = await getResponse(server, payload)

    return {result: response[data.dbname], success: response.success};
}

export const deleteBackupInfoAPI = async (server, data) => {
    let payload = {
        task: "deletebackupinfo",
        ...data
    }
    const response = await getResponse(server, payload)

    return {result: response[data.dbname], success: response.success};
}

export const getQueryPlanAPI = async (server, data) => {
    let payload = {
        task: "getautoexecquery",
        ...data
    }
    const response = await getResponse(server, payload)
    return {result: response.planlist?.[0]?.queryplan, success: response.success};
}