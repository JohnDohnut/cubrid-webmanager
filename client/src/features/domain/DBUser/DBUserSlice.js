import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    users: [],
}

const DBUserSlice = createSlice({
    name: 'DBUser',
    initialState,
    reducers: {
        setDBUsers: (state, action) => {
            state.users = action.payload
        }
    },
})

export const { setDBUsers} = DBUserSlice.actions
export default DBUserSlice.reducer
