// Unit tests for: getTransactionsAVG

import { getTransactionsAVG } from '../../../src/store/selectors'
import { dateFromExcelFormat, groupBy } from '../../../src/utils'

// Import necessary modules and functions
// Mock the necessary functions from utils
jest.mock('../../../src/utils', () => {
  const actual = jest.requireActual('../../../src/utils')
  return {
    ...actual,
    groupBy: jest.fn(),
    dateFromExcelFormat: jest.fn(),
  }
})

// Define a mock type for TransactionRemote
class MockTransactionRemote {
  public amount: number = 0
  public date: string = ''
  public description: string = ''
  public synced: boolean = false
  public type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
  public fundId: string = ''
}

// Test suite for getTransactionsAVG
describe('getTransactionsAVG() getTransactionsAVG method', () => {
  // Happy path tests
  describe('Happy Paths', () => {
    it('should return the average of monthly expenses when transactions are provided', () => {
      // Arrange
      const mockTransactions: MockTransactionRemote[] = [
        { amount: 100, date: '2023-01-01', fundId: '1' } as any,
        { amount: 200, date: '2023-01-15', fundId: '1' } as any,
        { amount: 300, date: '2023-02-01', fundId: '1' } as any,
      ]

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

  // Edge case tests
  describe('Edge Cases', () => {
    it('should return 0 when no transactions are provided', () => {
      // Arrange
      const mockTransactions: MockTransactionRemote[] = []

      jest.mocked(groupBy).mockReturnValue({} as any)

      // Act
      const result = getTransactionsAVG(mockTransactions as any)

      // Assert
      expect(result).toBe(0)
    })

    it('should handle transactions with zero amounts correctly', () => {
      // Arrange
      const mockTransactions: MockTransactionRemote[] = [
        { amount: 0, date: '2023-01-01', fundId: '1' } as any,
        { amount: 0, date: '2023-01-15', fundId: '1' } as any,
      ]

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
        { amount: -100, date: '2023-01-01', fundId: '1' } as any,
        { amount: -200, date: '2023-01-15', fundId: '1' } as any,
      ]

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
