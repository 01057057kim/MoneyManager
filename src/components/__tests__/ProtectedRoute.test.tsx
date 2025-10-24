import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ProtectedRoute from '../ProtectedRoute'

// Mock the auth store
const mockCheckAuth = vi.fn()
vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    checkAuth: mockCheckAuth
  })
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockCheckAuth).toHaveBeenCalled()
  })

  it('redirects to login when user is not authenticated', () => {
    // Mock unauthenticated state
    vi.mocked(require('../../store/authStore').useAuthStore).mockReturnValue({
      isAuthenticated: false,
      checkAuth: mockCheckAuth
    })

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    )

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
