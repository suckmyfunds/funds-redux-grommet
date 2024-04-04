import { combineReducers, configureStore, createReducer } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import {
  createTransform,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'reduxjs-toolkit-persist'
import storage from 'reduxjs-toolkit-persist/lib/storage'

import { dateToExcelFormat } from '../utils'
import { authSlice } from './authSlice'
import { fundsSlice } from './fundsSlice'
import { tempSlice } from './temp'
import { makeMonthIncome, transactionsSlice } from './transactionsSlice'

const expireConfig = {
  expireKey: 'expiresAt',
  defaultState: { token: '', expiresAt: 0 },
}

function inboundByPass<T = any>(s: T) {
  return s
}
const combinedReducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [fundsSlice.reducerPath]: fundsSlice.reducer,
  [transactionsSlice.reducerPath]: transactionsSlice.reducer,
  [tempSlice.reducerPath]: tempSlice.reducer,
})

export const initialState = {
  [authSlice.reducerPath]: authSlice.initialState,
  [fundsSlice.reducerPath]: fundsSlice.initialState,
  [transactionsSlice.reducerPath]: transactionsSlice.initialState,
}

const persistReducer_ = persistReducer(
  {
    key: 'root',
    storage,
    transforms: [
      createTransform(inboundByPass, (s: any, k: string) => {
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
      }),
    ],
  },
  combinedReducer
)

// TODO: check that in this month income was done. Transaction should have a type?
const newIncomeReducer = createReducer(initialState, (builder) => {
  builder.addCase(makeMonthIncome.fulfilled, (s, a) => {
    a.payload.map((tId) => (s.transactions.entities[tId].syncDate = dateToExcelFormat(new Date())))
  })
  builder.addCase(makeMonthIncome.rejected, (_, a) => {
    console.error(a.error)
  })
})

const reducers = [persistReducer_, newIncomeReducer]
export const store = configureStore({
  reducer: (state, a) => reducers.reduce((s, r) => r(s, a), state),

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

export { authorize } from './authSlice'
export { selectAllFunds } from './fundsSlice'
