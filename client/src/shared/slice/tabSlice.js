import { createSlice } from '@reduxjs/toolkit'


export const initialTabState = {
    tabs: [],
    unsavedTabs: [],
    activeTabKey: "",
}

const tabSlice = createSlice({
    name: 'tab',
    initialState: initialTabState,
    reducers: {
        addTab: (state, action) => {
            const {payload} = action
            const tab = state.tabs.find(tab => tab.key === payload.key) || false
            if(!tab){
                state.tabs.push(payload)
            }
            state.activeTabKey = payload.key
        },
        removeTab: (state, action) =>{
            state.tabs = state.tabs.filter(tab=> tab.key !== action.payload)
            let newActiveKey = ""
            if(state.tabs.length > 0){
                newActiveKey = state.tabs[-2]
            }
            state.activeTabKey = newActiveKey
        },
        setActiveTabKey: (state, action) => {
            state.activeTabKey = action.payload
        }
    },
})

export const { addTab, removeTab, setActiveTabKey} = tabSlice.actions
export default tabSlice.reducer
