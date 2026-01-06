import {getResponse} from "@/api/endPoint.js";

export const getDBUsersAPI = async (server, data) => {
    let payload = {
        task: "userinfo",
        ...data
    }
    const response = await getResponse(server, payload)
    return {result: response.user, success: true};
}

export const addDBUserAPI = async (server, data) => {
    let payload = {
        task: "createuser",
        ...data
    }
    const response = await getResponse(server, payload)
    return {result: response.user, success: true};
}
export const updateDBUserAPI = async (server, data) => {
    let payload = {
        task: "updateuser",
        ...data
    }
    const response = await getResponse(server, payload)
    return {result: response.user, success: true};
}

export const deleteDBUserAPI = async (server, data) => {
    let payload = {
        task: "deleteuser",
        ...data
    }
    const response = await getResponse(server, payload)
    return {result: response.user, success: true};
}