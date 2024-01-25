import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { auth } from '../api'
import { RootState } from './index'

export const authorize = createAsyncThunk('auth/login', async () => {
  const { token, expires_in } = await auth()
  return { token, expiresAt: Date.now() + expires_in * 1000 }
})

const initialState = { token: '', expiresAt: 0 }

export type AuthState = typeof initialState

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (_) => {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder.addCase(authorize.fulfilled, (_, action) => {
      return action.payload
    })
  },
})

export const authSlice = {
  name: slice.name,
  reducerPath: slice.reducerPath,
  actions: slice.actions,
  reducer: slice.reducer,
  initialState,
}

export function selectIsAuthorized(state: RootState): boolean {
  return state.auth.expiresAt > Date.now()
}
export function selectToken(state: RootState): string {
  return state.auth.token
}
