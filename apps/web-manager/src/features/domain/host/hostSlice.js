import { createSlice } from '@reduxjs/toolkit'

export const initialHostState = {
    hosts: [],
    activeHost: {},
    openHostVersion: false
}

const hostSlice = createSlice({
    name: 'host',
    initialState:initialHostState,
    reducers: {
        setHosts: (state, action) => {
            state.hosts = action.payload
        },
        setActiveHost: (state, action) => {
            state.activeHost = action.payload
        },
        setOpenHostVersion: (state, action) => {
            state.openHostVersion = action.payload
        }

    },
})

export const { setHosts, setActiveHost, setOpenHostVersion} = hostSlice.actions
export default hostSlice.reducer
