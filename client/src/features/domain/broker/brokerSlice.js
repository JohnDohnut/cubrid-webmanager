import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    brokers: [],
}

const brokerSlice = createSlice({
    name: 'broker',
    initialState,
    reducers: {
        setBrokers: (state, action) => {
            state.brokers = action.payload
        }

    },
})

export const { setBrokers} = brokerSlice.actions
export default brokerSlice.reducer
