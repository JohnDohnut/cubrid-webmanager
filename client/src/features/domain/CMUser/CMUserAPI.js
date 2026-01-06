import {getResponse} from "@/api/endPoint.js";



export const getCMUsersAPI = async (host) => {
    let payload = {
        task: "getdbmtuserinfo"
    }
    const response= await getResponse(host, payload)
    console.log(response)
    return {result: response.userlist?.[0].user, success: true};
}

export const createCMUserAPI = async (host, data = {}) => {
    let payload = {
        task: "createdbmtuserinfo",
        ...data
    }
    const response = await getResponse(host, payload)
    return {result: response, success: true};
}

export const updateCMUserAPI = async (host, data = {}) => {
    let payload = {
        task: "updatedbmtuserinfo",
        ...data
    }
    const response = await getResponse(host, payload)
    return {result: response, success: true};
}

export const deleteCMUserAPI = async (host, data = {}) => {
    let payload = {
        task: "deletedbmtuserinfo",
        ...data
    }
    const response = await getResponse(host, payload)
    return {result: response, success: true};
}

export const updateCMPasswordAPI = async (host, data) => {
    let payload = {
        task: "setdbmtpasswd",
        ...data
    }
    const response = await getResponse(host, payload)
    return {result: response.user, success: true};
}