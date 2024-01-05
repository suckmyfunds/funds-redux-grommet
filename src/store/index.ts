
import { combineReducers, configureStore, createAsyncThunk, createReducer } from "@reduxjs/toolkit";
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
import API, { fundToRequestObject, transformTransactionFromResponse } from '../api';

import storage from "reduxjs-toolkit-persist/lib/storage";
import { authSlice, authorize, selectIsAuthorized } from "./authSlice";
import { fetchFunds, fundsSlice, selectLocalFunds } from "./fundsSlice";
import { transactionsSlice } from "./transactionsSlice";

const expireConfig = {
    expireKey: 'expiresAt',
    defaultState: { token: "", expiresAt: 0 }
};


export const syncData = createAsyncThunk(
    "root/sync", async (_, { dispatch, getState }): Promise<void> => {
        dispatch(fundsSlice.actions.setStatus('synchronization'))

        let rootState: RootState = getState() as RootState

        let token = rootState.auth.token
        if (!selectIsAuthorized(rootState)) {
            token = (await dispatch(authorize()).unwrap()).token
        }
        const api = new API(token);
        const remoteFunds = await dispatch(fetchFunds()).unwrap()


        const info = await api.spreadSheetInfo()
        const fundByName = remoteFunds.reduce((acc: Record<string, Fund>, f) => { acc[f.name] = f; return acc }, {})

        const fundsWithIds = info.sheets.reduce((acc: FundRemote[], sheet) => {
            if (fundByName[sheet.properties.title]) {
                acc.push({
                    ...fundByName[sheet.properties.title],
                    id: String(sheet.properties.sheetId)
                })
            }
            return acc
        }, [])
        dispatch(fundsSlice.actions.replace(fundsWithIds))

        const transactionsData = (await api.batchGet(remoteFunds.map(f => `${f.name}!A2:D`)))
            .valueRanges.flatMap((v, idx): TransactionRemote[] => {
                return v.values.map((tr, id) => ({
                    ...transformTransactionFromResponse(tr),
                    fundId: fundsWithIds[idx].id,
                    id: String(10000000+ idx * 10000000 + id)
                }))
            })

        dispatch(transactionsSlice.actions.replace(transactionsData))

        const localFunds = selectLocalFunds(rootState)
        let requests: BatchRequest[] = []

        if (localFunds.length > 0) {
            requests.push({
                appendCells: {
                    sheetId: 0,
                    rows: {
                        values: localFunds.flatMap(f => fundToRequestObject(f).rows.values)
                    },
                    fields: "userEnteredValue"
                }
            })
        }

        requests.concat(localFunds.map((f) => {
            return {
                addSheet: {
                    properties: {
                        title: f.name
                    }
                }
            }
        }))

        if (requests.length > 0) {

            const response = await api.batchUpdate(requests)
            const [createdFunds, ...fundTransactionsPages] = response.replies
            console.log(createdFunds)
            console.log(fundTransactionsPages)
        }
        dispatch(fundsSlice.actions.setStatus('idle'))
    }
)

function inboundByPass<T = any>(s: T) { return s }
const combinedReducer = combineReducers({
    [authSlice.reducerPath]: authSlice.reducer,
    [fundsSlice.reducerPath]: fundsSlice.reducer,
    [transactionsSlice.reducerPath]: transactionsSlice.reducer,
})
const initialState = {
    [authSlice.reducerPath]: authSlice.initialState,
    [fundsSlice.reducerPath]: fundsSlice.initialState,
    [transactionsSlice.reducerPath]: transactionsSlice.initialState
}


const syncReducer = createReducer(initialState, (builder) => {
    builder.addCase(syncData.fulfilled, (state, _) => {
        state[fundsSlice.reducerPath].status = 'idle'
    })
    builder.addCase(syncData.pending, (state, _) => {
        state[fundsSlice.reducerPath].status = 'loading'
    })
    builder.addCase(syncData.rejected, (state, _) => {
        state[fundsSlice.reducerPath].status = 'error'
    })
})


const persistReducer_: typeof combinedReducer = persistReducer({
    key: 'root',
    storage,
    transforms: [createTransform(inboundByPass, (s: any, k: string) => {
        if (k === authSlice.name) {
            const expiresDate = s[expireConfig.expireKey]
            //console.log("transform auth", s, new Date(expiresDate), new Date())
            if (expiresDate <= Date.now()) {
                //console.log("transform expired")
                s.expiresAt = expireConfig.defaultState.expiresAt
                s.token = expireConfig.defaultState.token
            }
        }
        return s
    },)]
}, combinedReducer)


export const store = configureStore({
    reducer: (s, a) => syncReducer(persistReducer_(s, a), a),

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

import { BatchRequest, Fund, FundRemote, TransactionRemote } from "../types";
export {
    selectAllFunds,
} from './fundsSlice';


export { authorize } from './authSlice';
