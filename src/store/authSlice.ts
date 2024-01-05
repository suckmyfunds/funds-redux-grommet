import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { auth } from '../api';


export const authorize = createAsyncThunk("auth/login", async () => {
    const { token, expires_in } = await auth()
    return { token, expiresAt: Date.now() + expires_in * 1000 }
})

const initialState = { token: "", expiresAt: 0 }


const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (_) => {
            return initialState
        }
    },
    extraReducers: (builder) => {
        builder.addCase(authorize.fulfilled, (_, action) => {
            return action.payload;
        });
    }
});

export const authSlice = {
    name: slice.name,
    reducerPath: slice.reducerPath,
    actions: slice.actions,
    reducer: slice.reducer,
    initialState,
}

export function selectIsAuthorized(state: { auth: { expiresAt: number } }) {
    return state.auth.expiresAt > Date.now()
}