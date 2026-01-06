import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    contents: [],
}

const appLayoutSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setContents: (state, action) => {
            state.contents = action.payload
        },


    },
})

export const {setContents} = appLayoutSlice.actions
export default appLayoutSlice.reducer
