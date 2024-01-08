import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import API, { transformFundFromResponse } from '../api';
import type { FundRemote } from '../types';
import { RootState } from "./index";
import { selectFundTransactions, selectUnsyncedFundTransactions } from "./transactionsSlice";

export const fetchFunds = createAsyncThunk("funds/fetchAll", async (_, { getState }): Promise<FundRemote[]> => {
    const token = (getState() as RootState).auth.token;
    let api = new API(token);
    return (await api.getRows("funds!A2:E")).map((f, idx) => ({
        ...transformFundFromResponse(f),
        id: `${idx + 2}`,
        status: 'idle',
        syncDate: new Date().toISOString()
    }));
});

// export const updateFund = createAsyncThunk("funds/update", async (fund: FundRemote, { getState }) => {
//     const token = (getState() as RootState).auth.token;
//     let api = new API(token);
//     let id = await api.updateRow("funds", fundToRequest(fund), fund.id);
//     return { ...fund, id };
// });

// export const createFund = createAsyncThunk("funds/create", async (fund: FundRemote, { getState }) => {
//     const token = (getState() as RootState).auth.token;
//     let api = new API(token);
//     let id = await api.appendRow("funds", fundToRequest(fund));
//     return { ...fund, id };
// })

const adapter = createEntityAdapter({
    selectId: (fund: FundRemote) => fund.id
});

// with fetching status
const initialState = adapter.getInitialState({ status: 'idle' });

const slice = createSlice({
    name: 'funds',
    initialState,
    reducers: {
        add: adapter.addOne,
        remove: adapter.removeOne,
        update: adapter.updateOne,
        replace: adapter.setAll,
        setStatus(s, { payload }: { payload: 'loading' | 'idle' | 'synchronization' }) {
            s.status = payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFunds.pending, (s, a) => {
            if (s.status !== 'synchronization') { s.status = 'loading' }
        })
        builder.addCase(fetchFunds.fulfilled, (s, a) => {
            if (s.status !== 'synchronization') { s.status = 'idle' }
            adapter.setAll(s, a.payload)
        })
    }
});


export const fundsSlice = { ...slice, initialState }


export const selectStatus = (state: RootState) => state.funds.status;


const selectors = adapter.getSelectors((s: RootState) => s.funds)


export const { selectAll: selectAllFunds, selectIds: selectFundsIds } = selectors


export const selectLocalFunds = createSelector(
    [
        selectAllFunds
    ],
    (funds) => funds.filter(f => f.syncDate === undefined)
)


export const selectFund = createSelector(
    [
        adapter.getSelectors((s: RootState) => s.funds).selectById, selectFundTransactions
    ],
    (fund, transactions) => ({
        ...fund,
        balance: transactions.reduce((a, b) => a - b.amount, 0),
        transactions
    })
)


export const selectFundByName = (fundName: string) => (state: RootState) =>
    adapter.getSelectors().selectAll(state.funds).find(f => f.name === fundName)