import axios from '@/api/axiosInstant.js'


export const getSystemParamAPI = async (host, config) => {
    const url = `/${host.uid}/cms-config/all-sys-param?confname=${config}`
    const {data} = await axios.get(url)
    return {result: data.conflist[0].confdata, success: true};
}

export const setSystemParam = async (host, config) => {
    const url = `/${host.uid}/cms-config/set-sys-param`
    const {data} = await axios.post(url, config)
    return {result: data, success: true};
}

export const getHostVersionAPI = async (host) => {
    const url = `/${host.uid}/cms-config/env`
    const {data} = await axios.get(url)

    return {result: data, success: true};
}

export const getParamDumpAPI = async (host, database) => {
    const url = `/${host.uid}/cms-config/param-dump/${database.dbname}`
    const {data} = await axios.get(url)
    return {result: data, success: true};
}

export const getPlanDumpAPI = async (host, database) => {
    const url = `/${host.uid}/cms-config/stat-dump/${database.dbname}`
    const {data} = await axios.get(url)
    return {result: data, success: true};
}