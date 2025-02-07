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
  description: string
  type: 'INCOME' | 'EXPENSE'
}

describe('getTransactionsAVG() getTransactionsAVG method', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Happy paths', () => {
    it('should return the average of monthly expenses when transactions are provided', () => {
      // Arrange
      const mockTransactions: MockTransactionRemote[] = [
        { amount: 100, date: '2023-01-01', fundId: '1', synced: true, description: 'desc1', type: 'EXPENSE' },
        { amount: 200, date: '2023-01-15', fundId: '1', synced: true, description: 'desc2', type: 'EXPENSE' },
        { amount: 300, date: '2023-02-01', fundId: '1', synced: true, description: 'desc3', type: 'EXPENSE' },
      ] as any

      jest.mocked(groupBy).mockReturnValue({
        '1.23': [mockTransactions[0], mockTransactions[1]],
        '2.23': [mockTransactions[2]],
      } as any)

      jest.mocked(dateFromExcelFormat).mockImplementation((date) => new Date(date) as any)

      // Act
      const result = getTransactionsAVG(mockTransactions as any)

      // Assert
      expect(result).toBe(200)
    })
  })

  describe('Edge cases', () => {
    it('should return 0 when no transactions are provided', () => {
      // Arrange
      const mockTransactions: MockTransactionRemote[] = [] as any

      jest.mocked(groupBy).mockReturnValue({} as any)

      // Act
      const result = getTransactionsAVG(mockTransactions as any)

      // Assert
      expect(result).toBe(0)
    })

    it('should handle transactions with zero amounts correctly', () => {
      // Arrange
      const mockTransactions: MockTransactionRemote[] = [
        { amount: 0, date: '2023-01-01', fundId: '1', synced: true, description: 'desc1', type: 'EXPENSE' },
        { amount: 0, date: '2023-01-15', fundId: '1', synced: true, description: 'desc2', type: 'EXPENSE' },
      ] as any

      jest.mocked(groupBy).mockReturnValue({
        '1.23': [mockTransactions[0], mockTransactions[1]],
      } as any)

      // Act
      const result = getTransactionsAVG(mockTransactions as any)

      // Assert
      expect(result).toBe(0)
    })

    it('should handle transactions with negative amounts correctly', () => {
      // Arrange
      const mockTransactions: MockTransactionRemote[] = [
        { amount: -100, date: '2023-01-01', fundId: '1', synced: true, description: 'desc1', type: 'EXPENSE' },
        { amount: -200, date: '2023-01-15', fundId: '1', synced: true, description: 'desc2', type: 'EXPENSE' },
      ] as any

      jest.mocked(groupBy).mockReturnValue({
        '1.23': [mockTransactions[0], mockTransactions[1]],
      } as any)

      // Act
      const result = getTransactionsAVG(mockTransactions as any)

      // Assert
      expect(result).toBe(-150)
    })
  })
})

// End of unit tests for: getTransactionsAVG
