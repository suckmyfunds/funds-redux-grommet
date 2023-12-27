import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { auth } from '../api'
// import persistReducer from "redux-persist/es/persistReducer";
// import createExpirationTransform from './utils/persist-expire';
// import storage from "redux-persist/es/storage";

export const authorize = createAsyncThunk("auth/login", async () => {
    const { token, expires_in } = await auth()
    return { token, expiresAt: Date.now() + expires_in * 1000 }
})

const initialState = { token: "", expiresAt: 0 }


// const expireTransform = createExpirationTransform({
//     expireKey: 'expiresAt',
//     defaultState: initialState
// });

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

// const persistAuthReducer = persistReducer({
//     key: 'auth',
//     storage,
//     transforms: [expireTransform]
// }, slice.reducer)

export const authSlice = {
    name: slice.name,
    actions: slice.actions,
    reducer: slice.reducer,
}