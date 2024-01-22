import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from "@reduxjs/toolkit";
import API, { fundToRequest, fundToRequestObject, transformFundFromResponse } from '../api';
import type { BatchRequest, Fund, FundRemote } from '../types';
import { RootState } from "./index";
import { selectFundTransactions } from "./transactionsSlice";
import { authorize, selectIsAuthorized, selectToken } from "./authSlice";
import { loadPersistent } from "../utils";
import { clearLocals } from "./globalActions";

export const fetchFunds = createAsyncThunk("funds/fetchAll", async (_, { getState }): Promise<FundRemote[]> => {
    const rootState = getState() as RootState
    const token = selectToken(rootState);
    let api = new API(token);
    return (await api.getRows("funds!A2:E")).map((f, idx) => ({
        ...transformFundFromResponse(f),
        id: `${idx + 2}`,
        status: 'idle',
        syncDate: new Date().toISOString()
    }));
});


/**
  * - Select unsynced (local) funds and send to remote
  * - Create sheets for local funds
  * - Fetch updates from remote
  * - Update Ids for sent funds
  */
export const syncFunds = createAsyncThunk("funds/sync", async (_, { getState, dispatch }) => {
    const rootState = getState() as RootState
    let token = selectToken(rootState);
    if (!selectIsAuthorized(rootState)) {
        token = (await dispatch(authorize()).unwrap()).token;
    }
    const api = new API(token);

    const info = await api.spreadSheetInfo();

    let mainSheetIdx = loadPersistent("mainSheetIdx", -1)
    if (mainSheetIdx === -1) {
        mainSheetIdx = info.sheets.find(info => info.properties.title === "Funds")!.properties.sheetId
        if (mainSheetIdx === -1) {
            mainSheetIdx = (await api.createSheet("funds")).addSheet.properties.sheetId
        }
    }

    // const remoteSheetsIds = info.sheets.reduce((acc: Record<string, number>, info) => {
    //     acc[info.properties.title] = info.properties.sheetId
    //     return acc
    // }, {})

    const unsyncedFunds = selectLocalFunds(rootState)
    // const { local: unsyncedFunds } = storeFunds.reduce((acc: { local: Fund[], remote: Fund[] }, f) => {
    //     (remoteSheetsIds[f.name] !== undefined ? acc.remote : acc.local).push(f)
    //     return acc
    // }, { local: [], remote: [] })
    //const  unsyncedFunds = storeFunds.filter(f => remoteSheetsIds[f.name] === undefined)

    let requests: BatchRequest[] = [];
    if (unsyncedFunds.length > 0) {
        requests.push({
            appendCells: {
                sheetId: mainSheetIdx,
                rows: {
                    values: unsyncedFunds.flatMap(f => fundToRequestObject(f).rows.values)
                },
                fields: "userEnteredValue"
            }
        });
    }
    requests.concat(unsyncedFunds.map((f) => {
        return {
            addSheet: {
                properties: {
                    title: f.name
                }
            }
        };
    }));

    if (requests.length > 0) {
        const response = await api.batchUpdate(requests);
        const [_, ...fundTransactionsPages] = response.replies;
        console.log(fundTransactionsPages);
        // TODO: update fund IDs,
        // match by index localFunds and fundTransactionsPages
        // make the update action which finds transaction with fundID from localFunds and replace it with ID from fundTransactionsPage
    }

    let remoteFunds = await dispatch(fetchFunds()).unwrap();
    const remoteFundByName = remoteFunds.reduce((acc: Record<string, Fund>, f) => { acc[f.name] = f; return acc; }, {});
    const resultFunds = info.sheets.reduce((acc: FundRemote[], sheet) => {
        if (remoteFundByName[sheet.properties.title]) {
            acc.push({
                ...remoteFundByName[sheet.properties.title],
                id: String(sheet.properties.sheetId)
            });
        }
        return acc;
    }, []);
    dispatch(fundsSlice.actions.replace(resultFunds));
})
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
    // actual change of state will happens in syncData
    // because we need there to get funds sheet ids. 
    // or we can move all the funds update related staff to fetchFunds action
    extraReducers: (builder) => {
        builder.addCase(fetchFunds.pending, (s, _) => {
            if (s.status !== 'synchronization') { s.status = 'loading' }
        })
        builder.addCase(fetchFunds.fulfilled, (s, _) => {
            if (s.status !== 'synchronization') { s.status = 'idle' }
        })
        builder.addCase(clearLocals, (s, _) => {
            adapter.removeMany(s, s.ids.filter(id => s.entities[id].syncDate === undefined))
        })
    }
});


export const fundsSlice = { ...slice, initialState }


export const selectStatus = (state: RootState) => state.funds.status;

export const isSynchronizing = (state: RootState) => state.funds.status === 'synchronization'


const selectors = adapter.getSelectors((s: RootState) => s.funds)


export const { selectAll: selectAllFunds, selectIds: selectFundsIds } = selectors

export const selectFundNamesById = createSelector(selectAllFunds, (fs) => fs.reduce((acc: Record<string, string>, f) => {
    acc[f.id] = f.name
    return acc
}, {}))

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
        // transaction amount for expenses is negative, so we need to add it to balance
        balance: fund.initialBalance + transactions.reduce((a, b) => a - b.amount, 0), 
        synced: transactions.every(t => t.synced),
        transactions
    })
)


export const selectFundByName = (fundName: string) => (state: RootState) =>
    adapter.getSelectors().selectAll(state.funds).find(f => f.name === fundName)