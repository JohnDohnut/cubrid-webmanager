import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    hostHeight: 200,
    backupModal: {open: false},
    queryPlanModal: {open: false},
    createDBUser: {open: false},
    paramDump: {open: false},
    planDump: {open: false},
    optimizeDB: {open: false},
    compactDB: {open: false},
    checkDB: {open: false},
    changeCMPassword: {open: false},
    renameDB: {open: false},


}

const sideNavSlice = createSlice({
    name: 'sidenav',
    initialState,
    reducers: {
        setHostHeight: (state, action) => {
            state.hostHeight = action.payload
        },
        setBackupModal: (state, action) => {
            state.backupModal = action.payload
        },
        setQueryPlanModal: (state, action) => {
            state.queryPlanModal = action.payload
        },
        setCreateDBUser: (state, action) => {
            state.createDBUser = action.payload
        },
        setParamDump: (state, action) => {
            state.paramDump = action.payload
        },
        setPlanDump: (state, action) => {
            state.planDump = action.payload
        },
        setOptimizeDB: (state, action) => {
            state.optimizeDB = action.payload
        },
        setChangeCMPassword: (state, action) => {
            state.changeCMPassword = action.payload
        },
        setCompactDB: (state, action) => {
            state.compactDB = action.payload
        },
        setCheckDB: (state, action) => {
            state.checkDB = action.payload
        },
        setRenameDB: (state, action) => {
            state.renameDB = action.payload
        }

    },
})

export const { setHostHeight, setBackupModal,
    setQueryPlanModal, setCreateDBUser,
    setParamDump, setPlanDump, setOptimizeDB,
    setChangeCMPassword, setCompactDB, setCheckDB,
    setRenameDB} = sideNavSlice.actions
export default sideNavSlice.reducer
