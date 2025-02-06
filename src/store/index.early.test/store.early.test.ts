// Unit tests for: store

import { configureStore } from '@reduxjs/toolkit'
import { makeMonthIncome, store } from '../index'
import { selectAllFunds } from '../selectors'

// Mock dependencies
// jest.mock("../../src/store/selectors", () => ({
//   selectAllFunds: jest.fn(),
// }));

// jest.mock("../../src/api", () => {
//   return jest.fn().mockImplementation(() => {
//     return {
//       batchUpdate: jest.fn(),
//     };
//   });
// });

describe('store() store method', () => {
  let mockDispatch: jest.Mock
  let mockGetState: jest.Mock

  beforeEach(() => {
    mockDispatch = jest.fn()
    mockGetState = jest.fn(() => ({
      auth: { token: 'mockToken' },
      funds: { entities: { fund1: { id: 'fund1', budget: 100 } } },
    }))
  })

  describe('Happy Paths', () => {
    it('should configure the store correctly', () => {
      // Test to ensure the store is configured correctly
      const testStore = configureStore({
        reducer: store.reducer,
      })
      expect(testStore).toBeDefined()
    })

    it('should dispatch makeMonthIncome and update transactions', async () => {
      // Test to ensure makeMonthIncome works as expected
      ;(selectAllFunds as jest.Mock).mockReturnValue([{ id: 'fund1', budget: 100 }])
      const thunk = makeMonthIncome({ amount: 50 })
      const result = await thunk(mockDispatch, mockGetState, undefined)

      expect(selectAllFunds).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalled()
      expect(result).toEqual(['mockId'])
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty payload in makeMonthIncome', async () => {
      // Test to ensure makeMonthIncome handles empty payload
      ;(selectAllFunds as jest.Mock).mockReturnValue([{ id: 'fund1', budget: 100 }])
      const thunk = makeMonthIncome(undefined)
      const result = await thunk(mockDispatch, mockGetState, undefined)

      expect(selectAllFunds).toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalled()
      expect(result).toEqual(['mockId'])
    })

    it('should handle expired token in persistReducer', () => {
      // Test to ensure expired token is handled correctly
      const expiredState = {
        auth: { token: 'expiredToken', expiresAt: Date.now() - 1000 },
      }
      const newState = store.reducer(expiredState, { type: 'any' })

      expect(newState.auth.token).toBe('')
      expect(newState.auth.expiresAt).toBe(0)
    })
  })
})

// End of unit tests for: store
