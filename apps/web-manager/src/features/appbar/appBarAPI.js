import {getResponse} from "@/api/endPoint.js";

export const getAllSystemParamAPI = async (node, data) => {
    let payload = {
        task: "getallsysparam",
        ...data
    }
    const response = await getResponse(node, payload)
    return {result: response.conflist[0].confdata, success: response.success}
}

export const setAllSystemParamAPI = async (node, data) => {
    let payload = {
        task: "setsysparam",
        ...data
    }
    const response = await getResponse(node, payload)
    return {success: response.success}
}