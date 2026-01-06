import {combineReducers, configureStore} from '@reduxjs/toolkit'
import authSlice from "../features/auth/authSlice.js";
import sideNavSlice from "../features/sidenav/sideNavSlice.js";
import hostSlice, {initialHostState} from "../features/domain/host/hostSlice.js";
import databaseSlice from "../features/domain/database/databaseSlice.js";
import brokerSlice from "../features/domain/broker/brokerSlice.js";
import tabSlice, {initialTabState} from '../shared/slice/tabSlice.js'
import globalSlice from "@/shared/slice/globalSlice.js";
import userSlice from "@/features/domain/DBUser/DBUserSlice.js";
import appBarSlice from "@/features/appbar/appBarSlice.js";

const appReducer = combineReducers({
    global: globalSlice,
    auth: authSlice,
    appBar: appBarSlice,
    sidenav: sideNavSlice,
    host: hostSlice,
    database: databaseSlice,
    broker: brokerSlice,
    DBUser: userSlice,
    tab: tabSlice
});

const rootReducer = (state, action) => {
    if (action.type === "LOGOUT") {
        // Reset everything
        return appReducer(undefined, {type: "@@INIT"});
    }

    if (action.type === "DISCONNECT") {
        // Preserve auth slice
        const authState = state?.auth;

        // Preserve hosts array inside host slice
        const hostsArray = state?.host?.hosts ?? [];

        // Get fresh initial state for all slices
        const initialState = appReducer(undefined, {type: "@@INIT"});

        // Restore auth and hosts
        const hostState = {
            ...initialHostState,
            hosts: hostsArray,
        };

        return {
            ...initialState,
            auth: authState,
            host: hostState,
        };
    }

    return appReducer(state, action);
}

export const store = configureStore({
    reducer: rootReducer
});