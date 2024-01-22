import axios, { AxiosError } from 'axios';
import type { AddSheetResponse, BatchGetResponse, BatchRequest, BatchResponse, Fund, RowData, SpreadSheet, Transaction, UpdateCellsRequest, UpdateResponse, ValuesRange } from './types';

const SHEET_ID = "16Q3kcikjtI2YiN-JwpZoRoHPxPuoOgaiCppt0ZcwgiQ";

// function withDebounce<F extends AnyFunction>(f: AnyFunction) {
//   let debuonced = false
//   return async (...args: Parameters<F>): Promise<ReturnPromiseType<F> | undefined> => {
//     if (!debuonced) {
//       console.log("run request:", name, f, args)
//       debuonced = true
//       setTimeout(() => { debuonced = false }, 300)
//       return f(args)
//     } else {
//       console.log("debounce request", name)
//     }
//   }

// }

export interface API {
  setToken(token: string): void
  getRows(range: string): Promise<string[][]>
  appendRow(sheetName: string, rowValues: any[]): Promise<number>
  appendRows(sheetName: string, rowValues: any[][]): Promise<number>
  updateRow(sheetName: string, rowValues: any[], rowIndex: number): Promise<number>
  createSheet(title: string): Promise<AddSheetResponse>
  batchGet(ranges: string[]): Promise<BatchGetResponse>
  batchUpdate(requests: BatchRequest[]): Promise<BatchResponse>
  spreadSheetInfo(fetchData?: string): Promise<SpreadSheet>
}

export default class GoogleSpreadsheetAPI implements API {

  private spreadsheetId: string;
  private token: string

  constructor(token: string) {
    this.spreadsheetId = SHEET_ID;
    this.token = token
  }
  private basicFetch = async (method: string, url: string, body: any = null, params: any = {}): Promise<any> => {
    try {
      const response: { status: number, data: any } = await axios({
        url,
        method: method,
        data: body,
        params: params,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status >= 400) {
        // @ts-ignore
        throw new AxiosError('Failed to fetch data.', undefined, undefined, null, response);
      }
      return response.data;

    } catch (error) {
      let err = error as AxiosError;
      let content: object | string = ""
      if (err.response?.status == 400) {
        // @ts-ignore
        content = err.response.data.error.message
      }
      else {
        content = err.response ? (err.response.data ? err.response.data : err.response) : err
        console.error('Error basic fetch:', content);
      }
      throw content;
    }
  }

  setToken = (t: string) => {
    this.token = t;
  }

  appendRow = async (sheetName: string, rowValues: any[]): Promise<number> => {
    try {
      const response: UpdateResponse | undefined = await this.basicFetch(
        "POST",
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}!A:A:append`,
        {
          values: [rowValues]
        },
        {
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          includeValuesInResponse: false
        }
      );
      if (!response) {
        return -1
      }
      let range = response.updates.updatedRange as string;
      // get row number of appenden row
      return Number.parseInt(range.split("!")[1].split(":")[0].substring(1))

    } catch (error) {
      console.error('Error appending row:', error);
      throw error;
    }
  }

  appendRows = async (sheetName: string, rowValues: any[][]): Promise<number> => {
    try {
      const response: UpdateResponse = await this.basicFetch(
        "POST",
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}!A:A:append`,
        {
          values: rowValues
        },
        {
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          includeValuesInResponse: false
        }
      );

      let range = response.updates.updatedRange as string;
      return Number.parseInt(range.split("!")[1].split(":")[0].substring(1))

    } catch (error) {
      console.error('Error appending row:', error);
      throw error;
    }
  }

  updateRow = async (sheetName: string, rowValues: any[], rowIndex: number): Promise<number> => {
    try {
      const response: UpdateResponse = await this.basicFetch(
        "PUT",
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${sheetName}!A${rowIndex}:C${rowIndex}`,
        {
          values: [rowValues]
        },
        {
          valueInputOption: 'USER_ENTERED'
        }
      );

      let range = response.updates.updatedRange as string;
      // getting row number
      return Number.parseInt(range.split("!")[1].split(":")[0].substring(1))
    } catch (error) {
      console.error('Error updating row:', error);
      throw error;
    }
  }

  getRows = async (ref: string): Promise<string[][]> => {
    try {
      console.log("getRows")
      const response: ValuesRange = await this.basicFetch(
        "GET",
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${ref}`
      );

      return response.values || [];
    } catch (error: any) {
      console.error('Error getting row:', error);
      throw error;
    }
  }

  batchGet = async (ranges: string[]): Promise<BatchGetResponse> => {
    return await this.basicFetch(
      "GET",
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values:batchGet?ranges=${ranges.join("&ranges=")}`,
    )
  }

  createSheet = async (name: string): Promise<AddSheetResponse> => {
    let response = await this.batchUpdate([
      {
        addSheet: {
          properties: {
            title: name
          }
        }
      }
    ])
    return response.replies[0] as AddSheetResponse
  }

  batchUpdate = async (requests: BatchRequest[]): Promise<BatchResponse> => {
    try {
      const response: BatchResponse = await this.basicFetch(
        "POST",
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`,
        {
          requests: requests,
          includeSpreadsheetInResponse: false,
        }
      );

      return response;
    } catch (error: any) {
      console.error('Error getting row:', error.response?.data);
      throw error.response?.data;
    }
  }

  spreadSheetInfo = async (fetchData?: string): Promise<SpreadSheet> => {
    let uri = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`
    if (fetchData) {
      uri += `?includeGridData=true&${fetchData}`
    }

    try {
      const response = await this.basicFetch("GET", uri);
      return response
    } catch (error: any) {
      console.error('Error getting row:', error.response?.data);
      throw error.response?.data;
    }

  }
}


//TODO: use https://github.com/Hookyns/tst-reflect for reflection and auto generation of those functions
export function transformFundFromResponse(
  vals: string[]
): Fund {
  let [name, budget, _, __, initialBalance] = vals
  let result = {
    name,
    budget: Number.parseFloat(budget),
    initialBalance: Number.parseFloat(initialBalance)
  };

  return result;
}


//TODO: use https://github.com/Hookyns/tst-reflect for reflection and auto generation of those functions
export function transformTransactionFromResponse(vals: string[]): Transaction {
  let [amount_, date, description, synced, type_] = vals
  const amount = parseFloat(amount_.replace(",", "."))
  let type: "EXPENSE" | "INCOME" = "EXPENSE"

  if (type_ === undefined || type_.toUpperCase() == "INCOME" || amount < 0) {
    type = "INCOME"
  }
  // TODO: GET ID 
  return {
    amount
    , date
    , description
    , synced: synced == "TRUE"
    , type
  }
}


export function fundToRequest(fund: Fund) {
  return [
    fund.name,
    String(fund.budget),
    `=B4-SUM(INDIRECT("$A4")&"!$A$2:$A")`,
    '=NOT(XLOOKUP(FALSE;INDIRECT($A4&"!$D:$D");INDIRECT($A4&"!$D:$D");TRUE))'
  ]
}


export function fundToRequestObject(fund: Fund): { rows: RowData } {
  return {
    rows:
    {
      values: [
        { userEnteredValue: { stringValue: fund.name } },
        { userEnteredValue: { numberValue: fund.budget } },
        { userEnteredValue: { formulaValue: `=B4-SUM(INDIRECT("$A4")&"!$A$2:$A")` } },
        { userEnteredValue: { formulaValue: '=NOT(XLOOKUP(FALSE;INDIRECT($A4&"!$D:$D");INDIRECT($A4&"!$D:$D");TRUE))' } }
      ]
    }
  }
}


export function transactionToRequest(transaction: Transaction) {
  return [String(transaction.amount), transaction.date, transaction.description, transaction.synced ? "TRUE" : "FALSE", transaction.type]
}


export function transactionToRequestObject(transaction: Transaction): { rows: RowData } {
  return {
    rows: {
      values: [
        { userEnteredValue: { numberValue: transaction.amount } },
        { userEnteredValue: { stringValue: transaction.date } },
        { userEnteredValue: { stringValue: transaction.description } },
        { userEnteredValue: { boolValue: transaction.synced } },
      ]
    }
  }
}

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const CLIENT_ID = "651542402284-hfl9taqbdq2lri9nuuig3lcircq4qh0d.apps.googleusercontent.com"
// const API_KEY = 'AlIzaSyD2vT4nkavC_nE8YFWcPUGTCmtAzC9s2c4'
// const CLIENT_SECRET = "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"
// const REDIRECT_URL = 'http://localhost:3000'


export interface Token {
  token: string
  expires_in: number
}

export async function auth(): Promise<Token> {
  return new Promise((resolve, reject) => {
    // let token= tryLoadToken()
    // if (token.token) {
    //   resolve(token)
    //   return;
    // }
    // @ts-ignore
    let client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      // @ts-ignore
      callback: (resp) => {
        if (resp.error !== undefined) {
          console.log("callback error in authApi:", resp)
          reject({ error: resp });
          return
        }
        //savePersistent("expires")(String(Date.now() + parseInt(resp.expires_in) * 1000))
        // savePersistent("expires")(parseInt(resp.expires_in))
        // savePersistent("token")(resp.access_token)
        resolve({ token: resp.access_token, expires_in: parseInt(resp.expires_in) })
      }
    })
    client.requestAccessToken({ prompt: "consent" })
  })
}

// function tryLoadToken(): Token {
//   const tokenValue = loadPersistent("token", "")
//   const expires: number = loadPersistent<number>("expires", Date.now())
//   if (tokenValue && expires >= Date.now()) {
//     return {token: tokenValue, expires_in: expires};
//   }
//   window.localStorage.removeItem("token")
//   window.localStorage.removeItem("expires")
//   return {token: "", expires_in: 0};
// }
