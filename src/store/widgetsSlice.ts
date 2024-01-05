import { createSlice } from "@reduxjs/toolkit";
import { FundRemote } from "../types";

export type WidgetsState = {
    focusedFund: FundRemote | null
}

export const widgetsSlice = createSlice({
    name: "widgets",
    initialState: {
        focusedFund: null
    } as WidgetsState,
    reducers: {
      focusFund: (state, action) => {
        state.focusedFund = action.payload
      }
    },
});


export const { focusFund } = widgetsSlice.actions;