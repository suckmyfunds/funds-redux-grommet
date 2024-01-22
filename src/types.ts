export class LogTypes {
    static DEBUG = "debug"
    static SYSTEM = "system"
    static ERROR = "error"
}
export interface Entity {
    id: string
    syncDate?: string

}

export interface Notification {
    type: string
    message: string
    creationTime: number
}

export interface Fund {
    name: string
    budget: number
    initialBalance: number
}
export type FundCreate = Omit<Fund, "needSync">

export type FundRemote = Fund & Entity

export interface Transaction {
    amount: number
    date: string
    description: string
    synced: boolean
    type: "INCOME" | "EXPENSE"
}

export type TransactionRemote = Transaction & Entity & { fundId: string }


// type Dimension = "DIMENSION_UNSPECIFIED" | "ROWS" | "COLUMNS"

export interface ValuesRange {
    range: string,
    majorDimension: "ROWS",
    values: any[][]

}
export interface BatchGetResponse {
    spreadsheetId: string;
    valueRanges: ValuesRange[];
}



export type FundResponseData = [string, string, string, string, string, string, string]

export interface FundCellsResponse extends ValuesRange {
    values: FundResponseData[]
}
/**  amount, date, description, synced */
export type TransactionResponseData = [string, string, string, string];

export interface TransactionResponse extends ValuesRange {
    values: TransactionResponseData[]
}

// batch get of 2 different sheets: detail & transactions
export interface FundDetailCellsResponse extends Omit<ValuesRange, "values"> {
    valueRanges: [
        FundCellsResponse,
        TransactionResponse
    ]
}
export interface UpdateResponse {
    spreadsheetId: number
    tableRange: string
    updates: {
        updatedRange: string
        updatedRows: number
        updatedColumns: number
        updatedCells: number
    }
}
export interface NumberValue {
    numberValue: number
}
export interface StringValue {
    stringValue: string
}
export interface BoolValue {
    boolValue: boolean
}
export interface FormulaValue {
    formulaValue: string
}
export type ExtendedValue = NumberValue | StringValue | BoolValue | FormulaValue

export interface CellData {
    userEnteredValue: ExtendedValue
}

export interface RowData {
    values: CellData[]
}

export type UpdateCellsRequest = {
    updateCells: {
        rows: RowData,
        fields: string,
        area: {
            start:
            {
                sheetId: number,
                rowIndex: number,
                columnIndex: number
            }
        }
    }
}
export type AppendCellsRequest = {
    appendCells: {
        sheetId: number,
        rows: RowData,
        fields: string
    }
}
export type CreateSheetRequest = {
    addSheet: {
        properties: {
            title: string
        }
    }
}
export type BatchRequest = UpdateCellsRequest | AppendCellsRequest | CreateSheetRequest

export type BatchResponse = {
    replies: (BatchReply)[]
}
export type BatchReply = {} | AddSheetResponse
export interface SheetProperties {
    sheetId: number
    title: string
    index: number
}
export type AddSheetResponse = {
    addSheet:
    {
        properties: SheetProperties
    }
}

export interface GridData {
    startRow: number
    startColumn: number
    rowData: RowData
}
export interface Sheet {
    properties: SheetProperties
    data: GridData
}
export interface SpreadSheet {
    spreadsheetId: string
    sheets: Sheet[]
    // "properties": {
    //     object (SpreadsheetProperties)
    //   },  
    // "namedRanges": [
    //   {
    //     object (NamedRange)
    //   }
    // ],
    spreadsheetUrl: string
    // "developerMetadata": [
    //   {
    //     object (DeveloperMetadata)
    //   }
    // ],
    //dataSources: DataSource[]
    //dataSourceSchedules: DataSourceRefreshSchedule[]


}