import axios from "@/api/axiosInstant.js";
import {getResponse} from "@/api/endPoint.js";


export const hostLogin = async (host) => {
    await axios.post(`/${host.uid}/cms-auth/login`) // revoke session/token
}

export const getHostsAPI = () => axios.get('/host').then(res=> {
    return Object.values(res.data.host_list)
})

export const addHostAPI = (payload)=>{
    return axios.post("/host", payload).then(res => {
        if(res.status === 201) {
            return {success: true}
        }
        return {success: false};
    })
}

export const updateHostAPI = async (host, payload) => {
    const url =  `/host/${host.uid}`
    return axios.put(url, payload).then(res => {
        if(res.status === 200) {
            return {...res, success: true};
        }
        return {success: false};

    })
}

export const deleteHostAPI = async (host) => {
    const url = `/host/${host.uid}`;
    return axios.delete(url).then(res => {
        if(res.status === 200) {
            return {...res, success: true};
        }
        return {success: false};

    })
}

export const getHostVersionAPI = async (server) => {
    let payload = {
        task: "getenv"
    }
    const response = await getResponse(server, payload)
    return {result: response, success: true};
}