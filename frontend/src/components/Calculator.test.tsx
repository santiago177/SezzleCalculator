import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Calculator from './Calculator'

const fetchMock = vi.fn()

const okResponse = (result: number) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ result }),
})

const errorResponse = (error: string, status = 400) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error }),
})

let container: HTMLElement

const display = () => {
  const el = container.querySelector<HTMLElement>('.calc-display')
  if (!el) throw new Error('Calculator display not found')
  return el
}
const expression = () => screen.getByLabelText('Expression')
const button = (name: string) => screen.getByRole('button', { name })

/** Returns endpoint path and query params of the n-th fetch call. */
const fetchCall = (index = 0) => {
  const url = new URL(String(fetchMock.mock.calls[index][0]), 'http://localhost')
  return {
    path: url.pathname,
    a: url.searchParams.get('a'),
    b: url.searchParams.get('b'),
  }
}

const setup = () => {
  const user = userEvent.setup()
  ;({ container } = render(<Calculator />))
  const press = async (...names: string[]) => {
    for (const name of names) await user.click(button(name))
  }
  return { user, press }
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Calculator', () => {
  describe('initial state', () => {
    it('starts with 0 on the screen', () => {
      setup()
      expect(display()).toHaveTextContent(/^0$/)
      expect(expression().textContent?.trim()).toBe('')
    })
  })

  describe('number input', () => {
    it('updates the screen with the clicked number', async () => {
      const { press } = setup()
      await press('7')
      expect(display()).toHaveTextContent(/^7$/)
    })

    it('appends consecutive digits', async () => {
      const { press } = setup()
      await press('1', '2', '3')
      expect(display()).toHaveTextContent(/^123$/)
    })

    it('replaces the leading zero', async () => {
      const { press } = setup()
      await press('0', '0', '5')
      expect(display()).toHaveTextContent(/^5$/)
    })

    it('supports the decimal separator only once', async () => {
      const { press } = setup()
      await press('1', 'Decimal separator', '5', 'Decimal separator', '2')
      expect(display()).toHaveTextContent(/^1\.52$/)
    })
  })

  describe('operators', () => {
    it('adds the operator to the screen when no operator was present', async () => {
      const { press } = setup()
      await press('1', '2', 'Add')
      expect(expression()).toHaveTextContent('12 +')
      expect(display()).toHaveTextContent(/^12$/)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('replaces the operator when clicked twice in a row without calling the API', async () => {
      const { press } = setup()
      await press('1', '2', 'Add', 'Multiply')
      expect(expression()).toHaveTextContent('12 ×')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('starts a new number after an operator', async () => {
      const { press } = setup()
      await press('1', '2', 'Add', '3')
      expect(display()).toHaveTextContent(/^3$/)
      expect(expression()).toHaveTextContent('12 +')
    })

    describe('chaining', () => {
      it('calls the sum endpoint after Add and shows the result', async () => {
        fetchMock.mockResolvedValueOnce(okResponse(8))
        const { press } = setup()

        await press('6', 'Add', '2', 'Add')

        await waitFor(() => expect(display()).toHaveTextContent(/^8$/))
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchCall()).toEqual({ path: '/api/v1/sum', a: '6', b: '2' })
        expect(expression()).toHaveTextContent('8 +')
      })

      it('calls the subtraction endpoint after Subtract and shows the result', async () => {
        fetchMock.mockResolvedValueOnce(okResponse(4))
        const { press } = setup()

        await press('6', 'Subtract', '2', 'Add')

        await waitFor(() => expect(display()).toHaveTextContent(/^4$/))
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchCall()).toEqual({ path: '/api/v1/subtraction', a: '6', b: '2' })
        expect(expression()).toHaveTextContent('4 +')
      })

      it('calls the multiplication endpoint after Multiply and shows the result', async () => {
        fetchMock.mockResolvedValueOnce(okResponse(12))
        const { press } = setup()

        await press('6', 'Multiply', '2', 'Add')

        await waitFor(() => expect(display()).toHaveTextContent(/^12$/))
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchCall()).toEqual({ path: '/api/v1/multiplication', a: '6', b: '2' })
        expect(expression()).toHaveTextContent('12 +')
      })

      it('calls the division endpoint after Divide and shows the result', async () => {
        fetchMock.mockResolvedValueOnce(okResponse(3))
        const { press } = setup()

        await press('6', 'Divide', '2', 'Add')

        await waitFor(() => expect(display()).toHaveTextContent(/^3$/))
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchCall()).toEqual({ path: '/api/v1/division', a: '6', b: '2' })
        expect(expression()).toHaveTextContent('3 +')
      })

      it('calls the exponentiation endpoint after Power and shows the result', async () => {
        fetchMock.mockResolvedValueOnce(okResponse(8))
        const { press } = setup()

        await press('2', 'Power', '3', 'Add')

        await waitFor(() => expect(display()).toHaveTextContent(/^8$/))
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchCall()).toEqual({ path: '/api/v1/exponentiation', a: '2', b: '3' })
        expect(expression()).toHaveTextContent('8 +')
      })

      it('uses the chained result as the left operand of the next operation', async () => {
        fetchMock.mockResolvedValueOnce(okResponse(5)).mockResolvedValueOnce(okResponse(20))
        const { press } = setup()

        await press('2', 'Add', '3', 'Multiply')
        await waitFor(() => expect(display()).toHaveTextContent(/^5$/))
        await press('4', 'Equals')

        await waitFor(() => expect(display()).toHaveTextContent(/^20$/))
        expect(fetchCall(1)).toEqual({ path: '/api/v1/multiplication', a: '5', b: '4' })
      })
    })
  })

  describe('square root', () => {
    it('calls the squareroot endpoint and shows the result', async () => {
      fetchMock.mockResolvedValueOnce(okResponse(4))
      const { press } = setup()

      await press('1', '6', 'Square root')

      await waitFor(() => expect(display()).toHaveTextContent(/^4$/))
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchCall()).toEqual({ path: '/api/v1/squareroot', a: '16', b: null })
      expect(expression()).toHaveTextContent('√(16)')
    })

    it('shows Error when the squareroot endpoint responds with an error', async () => {
      fetchMock.mockResolvedValueOnce(errorResponse('square root of negative number'))
      const { press } = setup()

      await press('9', 'Square root')

      await waitFor(() => expect(display()).toHaveTextContent(/^Error$/))
      expect(fetchCall()).toEqual({ path: '/api/v1/squareroot', a: '9', b: null })
    })
  })

  describe('percentage', () => {
    it('converts a number to its fraction when no operation is pending', async () => {
      fetchMock.mockResolvedValueOnce(okResponse(0.1))
      const { press } = setup()

      await press('1', '0', 'Percent')

      await waitFor(() => expect(display()).toHaveTextContent(/^0\.1$/))
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchCall()).toEqual({ path: '/api/v1/percentage', a: '10', b: '1' })
      expect(expression()).toHaveTextContent('10%')
    })

    it('uses the left operand as the base after Add', async () => {
      fetchMock.mockResolvedValueOnce(okResponse(20))
      const { press } = setup()

      await press('2', '0', '0', 'Add', '1', '0', 'Percent')

      await waitFor(() => expect(display()).toHaveTextContent(/^20$/))
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchCall()).toEqual({ path: '/api/v1/percentage', a: '10', b: '200' })
      expect(expression()).toHaveTextContent('200 + 10%')
    })
  })

  describe('equals', () => {
    it('calls the endpoint when an operator is present and shows the result', async () => {
      fetchMock.mockResolvedValueOnce(okResponse(10))
      const { press } = setup()

      await press('7', 'Add', '3', 'Equals')

      await waitFor(() => expect(display()).toHaveTextContent(/^10$/))
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchCall()).toEqual({ path: '/api/v1/sum', a: '7', b: '3' })
      expect(expression()).toHaveTextContent('7 + 3 =')
    })

    it('does not call any endpoint when no operator is present', async () => {
      const { press } = setup()

      await press('7', 'Equals')

      expect(fetchMock).not.toHaveBeenCalled()
      expect(display()).toHaveTextContent(/^7$/)
      expect(expression()).toHaveTextContent('7 =')
    })

    it('starts a new calculation when a digit is clicked after the result', async () => {
      fetchMock.mockResolvedValueOnce(okResponse(10))
      const { press } = setup()

      await press('7', 'Add', '3', 'Equals')
      await waitFor(() => expect(display()).toHaveTextContent(/^10$/))
      await press('4')

      expect(display()).toHaveTextContent(/^4$/)
      expect(expression().textContent?.trim()).toBe('')
    })
  })

  describe('backspace', () => {
    it('removes the last digit', async () => {
      const { press } = setup()
      await press('1', '2', '3', 'Backspace')
      expect(display()).toHaveTextContent(/^12$/)
    })

    it('goes back to 0 after removing every digit', async () => {
      const { press } = setup()
      await press('1', '2', 'Backspace', 'Backspace')
      expect(display()).toHaveTextContent(/^0$/)
      await press('Backspace')
      expect(display()).toHaveTextContent(/^0$/)
    })

    it('does not remove digits from a number that was not typed by the user', async () => {
      const { press } = setup()
      await press('1', '2', 'Add', 'Backspace')
      expect(display()).toHaveTextContent(/^12$/)
    })

    it('does not modify a result, only clears the expression', async () => {
      fetchMock.mockResolvedValueOnce(okResponse(10))
      const { press } = setup()

      await press('7', 'Add', '3', 'Equals')
      await waitFor(() => expect(display()).toHaveTextContent(/^10$/))
      await press('Backspace')

      expect(display()).toHaveTextContent(/^10$/)
      expect(expression().textContent?.trim()).toBe('')
    })
  })

  describe('clear', () => {
    it('CE clears only the current entry and keeps the pending operation', async () => {
      fetchMock.mockResolvedValueOnce(okResponse(17))
      const { press } = setup()

      await press('1', '2', 'Add', '3', '4', 'Clear entry')

      expect(display()).toHaveTextContent(/^0$/)
      expect(expression()).toHaveTextContent('12 +')

      await press('5', 'Equals')
      await waitFor(() => expect(display()).toHaveTextContent(/^17$/))
      expect(fetchCall()).toEqual({ path: '/api/v1/sum', a: '12', b: '5' })
    })

    it('C clears everything including the pending operation', async () => {
      const { press } = setup()

      await press('1', '2', 'Add', '3', 'Clear')

      expect(display()).toHaveTextContent(/^0$/)
      expect(expression().textContent?.trim()).toBe('')

      await press('4', 'Equals')
      expect(fetchMock).not.toHaveBeenCalled()
      expect(expression()).toHaveTextContent('4 =')
    })
  })

  describe('errors', () => {
    it('shows Error when the endpoint responds with an error on equals', async () => {
      fetchMock.mockResolvedValueOnce(errorResponse('division by zero'))
      const { press } = setup()

      await press('8', 'Divide', '0', 'Equals')

      await waitFor(() => expect(display()).toHaveTextContent(/^Error$/))
      expect(fetchCall()).toEqual({ path: '/api/v1/division', a: '8', b: '0' })
    })

    it('shows Error when the endpoint responds with an error on a chained operator', async () => {
      fetchMock.mockResolvedValueOnce(errorResponse('division by zero'))
      const { press } = setup()

      await press('8', 'Divide', '0', 'Add')

      await waitFor(() => expect(display()).toHaveTextContent(/^Error$/))
    })

    it('shows Error when the request fails', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      const { press } = setup()

      await press('2', 'Add', '2', 'Equals')

      await waitFor(() => expect(display()).toHaveTextContent(/^Error$/))
    })

    it('starts over when a digit is clicked after an error', async () => {
      fetchMock.mockResolvedValueOnce(errorResponse('division by zero'))
      const { press } = setup()

      await press('8', 'Divide', '0', 'Equals')
      await waitFor(() => expect(display()).toHaveTextContent(/^Error$/))
      await press('5')

      expect(display()).toHaveTextContent(/^5$/)
      expect(expression().textContent?.trim()).toBe('')
    })
  })
})

