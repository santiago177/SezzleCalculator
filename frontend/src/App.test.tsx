import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'

import App from './App'

const SUM_URL = '/api/v1/sum?a=2&b=3'

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders the calculator heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /sum calculator/i }),
    ).toBeInTheDocument()
  })

  it('shows a validation message when the numbers are missing', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /calculate sum/i }))

    expect(screen.getByText(/please enter both numbers/i)).toBeInTheDocument()
  })

  it('displays the result returned for the sum of two numbers', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === SUM_URL) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ result: 5 }),
        })
      }

      return Promise.resolve({
        ok: false,
        json: async () => ({ error: `unexpected request: ${url}` }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/first number/i), '2')
    await user.type(screen.getByLabelText(/second number/i), '3')
    await user.click(screen.getByRole('button', { name: /calculate sum/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/result/i)).toHaveValue('5')
    })

    expect(fetchMock).toHaveBeenCalledWith(SUM_URL)
  })

  it('shows the API error message when the request fails', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === SUM_URL) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'invalid query parameter: b' }),
        })
      }

      return Promise.resolve({
        ok: false,
        json: async () => ({ error: `unexpected request: ${url}` }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/first number/i), '2')
    await user.type(screen.getByLabelText(/second number/i), '3')
    await user.click(screen.getByRole('button', { name: /calculate sum/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/invalid query parameter: b/i),
      ).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledWith(SUM_URL)
  })
})
