// Unit tests for: getTransactionsAVG

import { getTransactionsAVG } from '../../../src/store/selectors'
import { dateFromExcelFormat, groupBy } from '../../../src/utils'

// Mocking necessary functions
jest.mock('../../../src/utils', () => {
  const actual = jest.requireActual('../../../src/utils')
  return {
    ...actual,
    groupBy: jest.fn(),
    dateFromExcelFormat: jest.fn(),
  }
})

// MockTransactionRemote type to simulate TransactionRemote
type MockTransactionRemote = {
  amount: number
  date: string
  fundId: string
  synced: boolean
}

describe('getTransactionsAVG() getTransactionsAVG method', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Happy paths', () => {
    it('should return the average of monthly expenses when transactions are provided', () => {
      // Mock transactions
      const transactions: MockTransactionRemote[] = [
        { amount: 100, date: '2023-01-01', fundId: '1', synced: true },
        { amount: 200, date: '2023-01-15', fundId: '1', synced: true },
        { amount: 300, date: '2023-02-01', fundId: '1', synced: true },
      ] as any

      // Mock groupBy and dateFromExcelFormat behavior
      jest.mocked(groupBy).mockReturnValue({
        '1.23': [transactions[0], transactions[1]],
        '2.23': [transactions[2]],
      } as any)

      jest.mocked(dateFromExcelFormat).mockImplementation((date) => new Date(date))

      const result = getTransactionsAVG(transactions as any)
      expect(result).toBe(300) // (100 + 200 + 300) / 2 months
    })
  })

  describe('Edge cases', () => {
    it('should return 0 when no transactions are provided', () => {
      const transactions: MockTransactionRemote[] = [] as any
      const result = getTransactionsAVG(transactions as any)
      expect(result).toBe(0)
    })

    it('should handle transactions with zero amounts correctly', () => {
      const transactions: MockTransactionRemote[] = [
        { amount: 0, date: '2023-01-01', fundId: '1', synced: true },
        { amount: 0, date: '2023-01-15', fundId: '1', synced: true },
      ] as any

      jest.mocked(groupBy).mockReturnValue({
        '1.23': [transactions[0], transactions[1]],
      } as any)

      jest.mocked(dateFromExcelFormat).mockImplementation((date) => new Date(date))

      const result = getTransactionsAVG(transactions as any)
      expect(result).toBe(0)
    })

    it('should handle transactions with negative amounts correctly', () => {
      const transactions: MockTransactionRemote[] = [
        { amount: -100, date: '2023-01-01', fundId: '1', synced: true },
        { amount: -200, date: '2023-01-15', fundId: '1', synced: true },
      ] as any

      jest.mocked(groupBy).mockReturnValue({
        '1.23': [transactions[0], transactions[1]],
      } as any)

      jest.mocked(dateFromExcelFormat).mockImplementation((date) => new Date(date))

      const result = getTransactionsAVG(transactions as any)
      expect(result).toBe(-150) // (-100 + -200) / 1 month
    })
  })
})

// End of unit tests for: getTransactionsAVG
