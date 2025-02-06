// Unit tests for: Fund

import { useSelector } from 'react-redux'
import Fund from '../../../src/components/Fund.tsx'
import { useAppDispatch } from '../../../src/store'
import { addTransactionToFund } from '../../../src/store/transactionsSlice'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mocking the necessary modules
jest.mock('../../../src/utils', () => {
  const actual = jest.requireActual('../../../src/utils')
  return {
    ...actual,
    dateToExcelFormat: jest.fn(() => '01.01.2023'),
  }
})

jest.mock('../../../src/components/BudgetBar', () => {
  return jest.fn(() => <div>BudgetBar Component</div>)
})

jest.mock('../../../src/components/TransactionEditor', () => {
  return jest.fn(({ onSubmit }) => (
    <button onClick={() => onSubmit({ description: 'Test', amount: '100' })}>Submit Transaction</button>
  ))
})

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}))

jest.mock('../../../src/store', () => ({
  useAppDispatch: jest.fn(),
}))

describe('Fund() Fund method', () => {
  const mockDispatch = jest.fn()
  const mockOnClick = jest.fn()

  beforeEach(() => {
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(useSelector as jest.Mock).mockImplementation((selectorFn) =>
      selectorFn({
        funds: {
          '1': {
            name: 'Test Fund',
            budget: 1000,
            balance: 500,
            lastMonthExpensed: 200,
          },
        },
      })
    )
  })

  describe('Happy Paths', () => {
    it('should render the Fund component with correct data', () => {
      render(<Fund fundId="1" onClick={mockOnClick} />)
      expect(screen.getByText('Test Fund: 1000.00')).toBeInTheDocument()
      expect(screen.getByText('BudgetBar Component')).toBeInTheDocument()
    })

    it('should call onClick handler when the Flex component is clicked', () => {
      render(<Fund fundId="1" onClick={mockOnClick} />)
      fireEvent.click(screen.getByText('Test Fund: 1000.00'))
      expect(mockOnClick).toHaveBeenCalled()
    })

    it('should dispatch addTransactionToFund action on transaction submission', () => {
      render(<Fund fundId="1" onClick={mockOnClick} />)
      fireEvent.click(screen.getByText('Submit Transaction'))
      expect(mockDispatch).toHaveBeenCalledWith(
        addTransactionToFund({
          description: 'Test',
          amount: 100,
          date: '01.01.2023',
          synced: false,
          fundId: '1',
          type: 'EXPENSE',
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should display debt text in red when balance is negative', () => {
      ;(useSelector as jest.Mock).mockImplementation((selectorFn) =>
        selectorFn({
          funds: {
            '1': {
              name: 'Test Fund',
              budget: 1000,
              balance: -100,
              lastMonthExpensed: 200,
            },
          },
        })
      )
      render(<Fund fundId="1" onClick={mockOnClick} />)
      const debtText = screen.getByText('долг: -100.00')
      expect(debtText).toBeInTheDocument()
      expect(debtText).toHaveStyle('color: red')
    })

    it('should handle missing onClick prop gracefully', () => {
      render(<Fund fundId="1" />)
      fireEvent.click(screen.getByText('Test Fund: 1000.00'))
      expect(mockOnClick).not.toHaveBeenCalled()
    })
  })
})

// End of unit tests for: Fund
