import { createSlice } from '@reduxjs/toolkit'

import { dateToExcelFormat } from '../utils'

type TempState = {
  currentDate: string
  currentFund: string | undefined
}
const initialState: TempState = {
  currentDate: dateToExcelFormat(new Date()),
  currentFund: undefined,
}
export const tempSlice = createSlice({
  name: 'temp',
  initialState,
  reducers: {
    setDate(s, a: { payload: string }) {
      s.currentDate = a.payload
    },
    setCurrentFund: (s, a: { payload: string | undefined }) => {
      s.currentFund = a.payload
    },
  },
  selectors: {
    getCurrentDate: (s) => s.currentDate,
    getCurrentFund: (s) => s.currentFund,
  },
})
