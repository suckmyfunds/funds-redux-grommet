
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

// import { createOffline, offline } from '@redux-offline/redux-offline';
// import { OfflineAction } from '@redux-offline/redux-offline/lib/types';

// const offlineConfig = createOffline({
//     effect: async (effect: any, action: OfflineAction) => {
//         return {}
//     }
// })

import {
    FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist';
import { authSlice } from "./authSlice";
import { fundsSlice } from "./fundsSlice";
import { widgetsSlice } from "./widgetsSlice";

export const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [fundsSlice.name]: fundsSlice.reducer,
        [widgetsSlice.name]: widgetsSlice.reducer
    },
    //@ts-ignore
    // enhancers: (getDefaultEnchancer) => [...getDefaultEnchancer(), offline({
    //     effect: async (e, a) => null
    // })],
    
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
export { fetchFunds, updateFund } from "./fundsSlice";
export { focusFund } from "./widgetsSlice";

