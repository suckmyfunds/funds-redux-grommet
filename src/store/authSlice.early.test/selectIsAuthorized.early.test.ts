// Unit tests for: selectIsAuthorized

import { selectIsAuthorized } from '../authSlice'
import { RootState } from '../index'

// Import necessary modules and functions
// Mock the auth function from the '../api' module
jest.mock('../../api', () => {
  const actual = jest.requireActual('../../api')
  return {
    ...actual,
    auth: jest.fn(),
  }
})

describe('selectIsAuthorized() selectIsAuthorized method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should return true when the token is not expired', () => {
      // Arrange: Set up a state where the token is valid
      const state: RootState = {
        auth: {
          token: 'valid-token',
          expiresAt: Date.now() + 10000, // Expires in 10 seconds
        },
      }

      // Act: Call the function with the state
      const result = selectIsAuthorized(state)

      // Assert: Expect the result to be true
      expect(result).toBe(true)
    })

    it('should return false when the token is expired', () => {
      // Arrange: Set up a state where the token is expired
      const state: RootState = {
        auth: {
          token: 'expired-token',
          expiresAt: Date.now() - 10000, // Expired 10 seconds ago
        },
      }

      // Act: Call the function with the state
      const result = selectIsAuthorized(state)

      // Assert: Expect the result to be false
      expect(result).toBe(false)
    })
  })

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return false when expiresAt is exactly the current time', () => {
      // Arrange: Set up a state where expiresAt is exactly now
      const state: RootState = {
        auth: {
          token: 'edge-case-token',
          expiresAt: Date.now(), // Expires now
        },
      }

      // Act: Call the function with the state
      const result = selectIsAuthorized(state)

      // Assert: Expect the result to be false
      expect(result).toBe(false)
    })

    it('should return false when the token is empty', () => {
      // Arrange: Set up a state with an empty token
      const state: RootState = {
        auth: {
          token: '',
          expiresAt: Date.now() + 10000, // Expires in 10 seconds
        },
      }

      // Act: Call the function with the state
      const result = selectIsAuthorized(state)

      // Assert: Expect the result to be false
      expect(result).toBe(false)
    })

    it('should return false when expiresAt is in the past and token is empty', () => {
      // Arrange: Set up a state with an expired token and empty token
      const state: RootState = {
        auth: {
          token: '',
          expiresAt: Date.now() - 10000, // Expired 10 seconds ago
        },
      }

      // Act: Call the function with the state
      const result = selectIsAuthorized(state)

      // Assert: Expect the result to be false
      expect(result).toBe(false)
    })
  })
})

// End of unit tests for: selectIsAuthorized
