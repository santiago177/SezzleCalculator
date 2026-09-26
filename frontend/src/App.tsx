import { useState } from 'react'

import './App.css'

type SumResponse = {
  result: number
}

type ErrorResponse = {
  error?: string
}

function App() {
  const [firstNumber, setFirstNumber] = useState('')
  const [secondNumber, setSecondNumber] = useState('')
  const [result, setResult] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSum = async () => {
    const parsedFirst = Number(firstNumber)
    const parsedSecond = Number(secondNumber)

    if (firstNumber.trim() === '' || secondNumber.trim() === '') {
      setMessage('Please enter both numbers.')
      return
    }

    if (Number.isNaN(parsedFirst) || Number.isNaN(parsedSecond)) {
      setMessage('Please enter valid numbers.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const params = new URLSearchParams({
        a: String(parsedFirst),
        b: String(parsedSecond),
      })
      const response = await fetch(`/api/v1/sum?${params.toString()}`)

      let nextMessage = 'Sum calculated successfully.'

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ErrorResponse
        nextMessage = payload.error ?? 'Failed to calculate the sum.'
        setMessage(nextMessage)
        return
      }

      const data = (await response.json()) as SumResponse
      setResult(String(data.result))
      setMessage(nextMessage)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="sum-page">
      <section className="sum-card" aria-labelledby="sum-calculator-title">
        <h1 id="sum-calculator-title">Sum Calculator</h1>
        <p>Enter two numbers, then click the button to calculate their sum.</p>

        <div className="sum-form">
          <label className="sum-field" htmlFor="first-number">
            <span>First number</span>
            <input
              id="first-number"
              type="number"
              inputMode="decimal"
              value={firstNumber}
              onChange={(event) => setFirstNumber(event.target.value)}
              placeholder="0"
            />
          </label>

          <label className="sum-field" htmlFor="second-number">
            <span>Second number</span>
            <input
              id="second-number"
              type="number"
              inputMode="decimal"
              value={secondNumber}
              onChange={(event) => setSecondNumber(event.target.value)}
              placeholder="0"
            />
          </label>

          <button type="button" className="sum-button" onClick={handleSum} disabled={isLoading}>
            {isLoading ? 'Calculating…' : 'Calculate sum'}
          </button>

          <label className="sum-field" htmlFor="sum-result">
            <span>Result</span>
            <input id="sum-result" type="text" value={result} readOnly placeholder="The sum appears here" />
          </label>
        </div>

        <p className="sum-message" role="status" aria-live="polite">
          {message}
        </p>
      </section>
    </main>
  )
}

export default App
