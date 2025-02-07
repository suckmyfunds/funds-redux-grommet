/**
 * @jest-environment jsdom
 */
// Unit tests for: BudgetBar

import BudgetBar from '../../../src/components/BudgetBar.tsx'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('BudgetBar() BudgetBar method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render a blue progress bar when balance is within budget and above warnPercent', () => {
      // Test to ensure the progress bar is blue when balance is within budget and above warnPercent
      const { getByText } = render(<BudgetBar balance={80} budget={100} warnPercent={50} />)
      expect(getByText('80.00')).toBeInTheDocument()
      expect(getByText('80.00').closest('div')).toHaveStyle('color: blue')
    })

    it('should render a yellow progress bar when balance is within budget and below warnPercent', () => {
      // Test to ensure the progress bar is yellow when balance is within budget and below warnPercent
      const { getByText } = render(<BudgetBar balance={40} budget={100} warnPercent={50} />)
      expect(getByText('40.00')).toBeInTheDocument()
      expect(getByText('40.00').closest('div')).toHaveStyle('color: yellow')
    })

    it('should render a gray progress bar when balance is zero', () => {
      // Test to ensure the progress bar is gray when balance is zero
      const { getByText } = render(<BudgetBar balance={0} budget={100} />)
      expect(getByText('0.00')).toBeInTheDocument()
      expect(getByText('0.00').closest('div')).toHaveStyle('color: gray')
    })

    it('should render a red progress bar when balance is negative', () => {
      // Test to ensure the progress bar is red when balance is negative
      const { getByText } = render(<BudgetBar balance={-50} budget={100} />)
      expect(getByText('-50.00')).toBeInTheDocument()
      expect(getByText('-50.00').closest('div')).toHaveStyle('color: red')
    })

    it('should render an orange progress bar when balance is less than 20% of the budget', () => {
      // Test to ensure the progress bar is orange when balance is less than 20% of the budget
      const { getByText } = render(<BudgetBar balance={15} budget={100} />)
      expect(getByText('15.00')).toBeInTheDocument()
      expect(getByText('15.00').closest('div')).toHaveStyle('color: orange')
    })
  })

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle balance greater than budget by capping the progress at 100%', () => {
      // Test to ensure the progress bar caps at 100% when balance exceeds budget
      const { getByText } = render(<BudgetBar balance={150} budget={100} />)
      expect(getByText('150.00')).toBeInTheDocument()
      expect(getByText('150.00').closest('div')).toHaveStyle('color: blue')
    })

    it('should handle a zero budget gracefully', () => {
      // Test to ensure the component handles a zero budget without errors
      const { getByText } = render(<BudgetBar balance={50} budget={0} />)
      expect(getByText('50.00')).toBeInTheDocument()
      expect(getByText('50.00').closest('div')).toHaveStyle('color: blue')
    })

    it('should handle a negative budget gracefully', () => {
      // Test to ensure the component handles a negative budget without errors
      const { getByText } = render(<BudgetBar balance={50} budget={-100} />)
      expect(getByText('50.00')).toBeInTheDocument()
      expect(getByText('50.00').closest('div')).toHaveStyle('color: blue')
    })

    it('should handle a negative warnPercent gracefully', () => {
      // Test to ensure the component handles a negative warnPercent without errors
      const { getByText } = render(<BudgetBar balance={50} budget={100} warnPercent={-10} />)
      expect(getByText('50.00')).toBeInTheDocument()
      expect(getByText('50.00').closest('div')).toHaveStyle('color: blue')
    })
  })
})

// End of unit tests for: BudgetBar
