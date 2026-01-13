import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    databases: [],
    DBSpaceItem: [],
    backupInfo: [],
    queryPlans: []
}

const databaseSlice = createSlice({
    name: 'database',
    initialState,
    reducers: {
        setDatabases: (state, action) => {
            state.databases = action.payload
        },
        addDBSpaceItem: (state, action) => {
            state.DBSpaceItem = [state.DBSpaceItem, action.payload].flat()
        },
        setBackupInfo: (state, action) => {
            state.backupInfo = action.payload
        },
        setQueryPlan: (state, action) => {
            state.queryPlans = action.payload
        }

    },
})

export const { setDatabases, addDBSpaceItem, setBackupInfo, setQueryPlan} = databaseSlice.actions
export default databaseSlice.reducer
