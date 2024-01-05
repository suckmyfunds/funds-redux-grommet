import { createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { TransactionRemote } from "../types";



// export const fetchTransactionsForFund = createAsyncThunk("transactions/fetchAll",
//     async (fundName: string, { getState }): Promise<TransactionRemote[]> => {
//         const token = (getState() as RootState).auth.token;
//         let api = new API(token);
//         const fundId: number = selectFundByName(fundName)(getState() as RootState)?.id!
//         assert(fundId === undefined, `Fund with name ${fundName} used to get transactions should exists is store`)

//         return (await api.getRows(`${fundName}!A2:E`)).map((t, idx) => ({ ...transformTransactionFromResponse(t), id: idx + 2, status: 'idle', fundId }));
//     });

// export const addTransactionToFund = createAsyncThunk("transactions/add",
//     async (fundName: string, { getState }): Promise<TransactionRemote[]> => {
//         const token = (getState() as RootState).auth.token;
//         let api = new API(token);
//         const fundId: number = selectFundByName(fundName)(getState() as RootState)?.id!
//         assert(fundId === undefined, `Fund with name ${fundName} used to get transactions should exists is store`)

//         return (await api.getRows(`${fundName}!A2:E`)).map((t, idx) => ({ ...transformTransactionFromResponse(t), id: idx + 2, status: 'idle', fundId }));
//     });


const adapter = createEntityAdapter({
    selectId: (t: TransactionRemote) => t.id
})

const slice = createSlice({
    name: "transactions",
    initialState: adapter.getInitialState(),
    reducers: {
        add: adapter.addOne,
        remove: adapter.removeOne,
        update: adapter.updateOne,
        replace: adapter.setAll,
    }
})


export const transactionsSlice = { ...slice, initialState: adapter.getInitialState() }
const selectors = adapter.getSelectors((s: RootState) => s.transactions)
export const { selectAll: selectAllTransactions } = selectors

export const selectFundTransactions = createSelector([
    selectAllTransactions,
    (_, fundId: string) => fundId
],
    (transactions, fundId) => transactions.filter(t => t.fundId === fundId))

export const selectUnsyncedTransactions = createSelector([
    selectAllTransactions,
], transactions => transactions.filter(t => !t.synced))