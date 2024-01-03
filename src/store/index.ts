
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import {
    FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    REHYDRATE,
    createTransform,
    persistReducer,
} from 'reduxjs-toolkit-persist';

import { authSlice } from "./authSlice";
import { fundsSlice } from "./fundsSlice";
import { transactionsSlice } from "./transactionsSlice";
import storage from "reduxjs-toolkit-persist/lib/storage";

const expireConfig = {
    expireKey: 'expiresAt',
    defaultState: { token: "", expiresAt: 0 }
};


function inboundByPass<T = any>(s: T) { return s }
const combinedReducer = combineReducers({
    [authSlice.name]: authSlice.reducer,
    [fundsSlice.name]: fundsSlice.reducer,
    [transactionsSlice.name]: transactionsSlice.reducer,
})

const persistReducer_ = persistReducer({
    key: 'root',
    storage,
    whitelist: ['auth'],

    transforms: [createTransform(inboundByPass, (s: any, k: string) => {
        if (k === authSlice.name) {
            const authState: ReturnType<typeof authSlice.reducer> = s[expireConfig.expireKey]
            const expireDate = authState.expiresAt
            if (expireDate <= Date.now()) {
                console.log("transform expired")
                s.expiresAt = expireConfig.defaultState.expiresAt
                s.token = expireConfig.defaultState.token
            }
        }
        return s
    },)]
}, combinedReducer)


export const store = configureStore({
    reducer: persistReducer_,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch

export {
    selectAll as selectFunds
} from './fundsSlice';

export { authorize } from './authSlice';


