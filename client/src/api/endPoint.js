import axios from './axiosInstant.js'

export const requestCMAPI = (server, payload)=>{
    const {uid} = server;
    return axios.post(`${uid}/cms-https-client/forward`, {...payload});
}

export const revokeLogin = async (server) => {
    try {
        await axios.post("/cms-auth/login", {...server, hostUid: server.uid}) // revoke session/token
        return true
    } catch (retryError) {
        return false
    }
}

export const getResponse = async (server, payload) => {
    try{
        const {data} = await requestCMAPI(server, payload);
        if (data.status === "failure" &&
            data.note?.includes("invalid token")) {
            await revokeLogin(server);
            const {data} = await requestCMAPI(server, payload);
            return {...data};
        }
        return {...data, success: data.status === "success" };
    }catch(error){
        if (error.response.status === 401) {
            window.location.reload();
        }
        return {success: false}
    }

}