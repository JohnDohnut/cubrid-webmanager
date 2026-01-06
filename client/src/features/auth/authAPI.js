import axios from '/src/api/axiosInstant.js'

export const loginAPI = (credentials) => axios.post('/auth/login', credentials)
export const getUserAPI = () => axios.get(`/user`)
export const registerAPI = (data) => axios.post('/register', data)

export const updateUserAPI = (data) => axios.post('/user/account', data)

export const updatePasswordAPI = (data) => axios.post('/user/credential', data)

export const deleteAuthUserAPI = () => axios.delete('/user/credential')