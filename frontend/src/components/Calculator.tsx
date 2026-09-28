import { useCallback, useEffect, useState } from 'react'
import './Calculator.css'

type Operator = '+' | '−' | '×' | '÷' | '^'
type UnaryOp = 'percent' | 'sqrt'

type ButtonKind = 'digit' | 'function' | 'operator' | 'equals'

interface CalcButton {
  label: string
  kind: ButtonKind
  ariaLabel: string
  onPress: () => void
  wide?: boolean
}

const MAX_DIGITS = 16
const ERROR_TEXT = 'Error'
const OPERATORS: Operator[] = ['+', '−', '×', '÷', '^']

// Trim floating point noise such as 0.30000000000000004
const formatNumber = (n: number) => String(Number(n.toPrecision(15)))

const OPERATOR_URLS: Record<Operator, string> = {
  '+': '/api/v1/sum',
  '−': '/api/v1/subtraction',
  '×': '/api/v1/multiplication',
  '÷': '/api/v1/division',
  '^': '/api/v1/exponentiation',
}

async function fetchOperation(op: Operator, a: number, b: number): Promise<number> {
  const response = await fetch(`${OPERATOR_URLS[op]}?a=${a}&b=${b}`)
  if (!response.ok) throw new Error('Request failed')
  const data = await response.json()
  return data.result
}

async function fetchSquareRoot(a: number): Promise<number> {
  const response = await fetch(`/api/v1/squareroot?a=${a}`)
  if (!response.ok) throw new Error('Request failed')
  const data = await response.json()
  return data.result
}

// a percent of b
async function fetchPercentage(a: number, b: number): Promise<number> {
  const response = await fetch(`/api/v1/percentage?a=${a}&b=${b}`)
  if (!response.ok) throw new Error('Request failed')
  const data = await response.json()
  return data.result
}

const endsWithOperator = (expr: string) =>
  OPERATORS.some((op) => expr.endsWith(` ${op}`))

const formatUnary = (op: UnaryOp, value: string) => {
  switch (op) {
    case 'percent':
      return `${value}%`
    case 'sqrt':
      return `√(${value})`
  }
}

function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  // Left operand and operator waiting for the right operand
  const [accumulator, setAccumulator] = useState<number | null>(null)
  const [pendingOp, setPendingOp] = useState<Operator | null>(null)

  const isError = display === ERROR_TEXT

  const showError = useCallback(() => {
    setDisplay(ERROR_TEXT)
    setExpression('')
    setAccumulator(null)
    setPendingOp(null)
    setWaitingForOperand(true)
  }, [])
  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit)
        setWaitingForOperand(false)
        if (expression.endsWith('=')) setExpression('')
        return
      }
      setDisplay((prev) => {
        if (prev.replace(/[-.]/g, '').length >= MAX_DIGITS) return prev
        return prev === '0' ? digit : prev + digit
      })
    },
    [waitingForOperand, expression],
  )

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      if (expression.endsWith('=')) setExpression('')
      return
    }
    setDisplay((prev) => (prev.includes('.') ? prev : prev + '.'))
  }, [waitingForOperand, expression])

  const inputOperator = useCallback(
    async (op: Operator) => {
      if (isError) return

      if (waitingForOperand && endsWithOperator(expression)) {
        // Replace the pending operator
        setExpression(expression.slice(0, -1) + op)
        setPendingOp(op)
        return
      }

      // Chained operation, e.g. "2 + 3 ×": resolve the pending one through the API first
      if (pendingOp !== null && accumulator !== null) {
        try {
          const result = await fetchOperation(pendingOp, accumulator, Number(display))
          const text = formatNumber(result)
          setDisplay(text)
          setExpression(`${text} ${op}`)
          setAccumulator(result)
        } catch {
          showError()
          return
        }
      } else {
        setExpression(`${display} ${op}`)
        setAccumulator(Number(display))
      }
      setPendingOp(op)
      setWaitingForOperand(true)
    },
    [display, expression, waitingForOperand, isError, pendingOp, accumulator, showError],
  )

  const inputUnary = useCallback(
    async (op: UnaryOp) => {
      if (isError) return
      const current = Number(display)
      try {
        let result: number
        if (op === 'sqrt') {
          result = await fetchSquareRoot(current)
        } else if (accumulator !== null && (pendingOp === '+' || pendingOp === '−')) {
          // e.g. 200 + 10% -> 10% of 200
          result = await fetchPercentage(current, accumulator)
        } else {
          // e.g. 10% -> 0.1
          result = await fetchPercentage(current, 1)
        }
        const base = endsWithOperator(expression) ? `${expression} ` : ''
        setExpression(`${base}${formatUnary(op, display)}`)
        setDisplay(formatNumber(result))
        setWaitingForOperand(true)
      } catch {
        showError()
      }
    },
    [display, expression, isError, accumulator, pendingOp, showError],
  )

  const equals = useCallback(async () => {
    if (isError) return

    let fullExpression: string
    if (endsWithOperator(expression)) {
      fullExpression = `${expression} ${display} =`
    } else if (expression && !expression.endsWith('=')) {
      fullExpression = `${expression} =`
    } else {
      fullExpression = `${display} =`
    }

    if (pendingOp !== null && accumulator !== null) {
      try {
        const result = await fetchOperation(pendingOp, accumulator, Number(display))
        setDisplay(formatNumber(result))
      } catch {
        showError()
        return
      }
    }

    setExpression(fullExpression)
    setAccumulator(null)
    setPendingOp(null)
    setWaitingForOperand(true)
  }, [display, expression, isError, pendingOp, accumulator, showError])

  const clearEntry = useCallback(() => {
    setDisplay('0')
    setWaitingForOperand(false)
    if (expression.endsWith('=')) setExpression('')
  }, [expression])

  const clearAll = useCallback(() => {
    setDisplay('0')
    setExpression('')
    setAccumulator(null)
    setPendingOp(null)
    setWaitingForOperand(false)
  }, [])

  const backspace = useCallback(() => {
    if (waitingForOperand) {
      if (expression.endsWith('=')) setExpression('')
      return
    }
    setDisplay((prev) => {
      const next = prev.slice(0, -1)
      return next === '' || next === '-' ? '0' : next
    })
  }, [waitingForOperand, expression])

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { key } = e
      if (/^[0-9]$/.test(key)) inputDigit(key)
      else if (key === '.' || key === ',') inputDecimal()
      else if (key === '+') void inputOperator('+')
      else if (key === '-') void inputOperator('−')
      else if (key === '*') void inputOperator('×')
      else if (key === '/') void inputOperator('÷')
      else if (key === '^') void inputOperator('^')
      else if (key === '%') void inputUnary('percent')
      else if (key === 'Enter' || key === '=') void equals()
      else if (key === 'Backspace') backspace()
      else if (key === 'Escape') clearAll()
      else if (key === 'Delete') clearEntry()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    inputDigit,
    inputDecimal,
    inputOperator,
    inputUnary,
    equals,
    backspace,
    clearAll,
    clearEntry,
  ])

  const digit = (d: string): CalcButton => ({
    label: d,
    kind: 'digit',
    ariaLabel: d,
    onPress: () => inputDigit(d),
  })

  const buttons: CalcButton[] = [
    // Row 1
    { label: 'CE', kind: 'function', ariaLabel: 'Clear entry', onPress: clearEntry },
    { label: 'C', kind: 'function', ariaLabel: 'Clear', onPress: clearAll },
    { label: '⌫', kind: 'function', ariaLabel: 'Backspace', onPress: backspace, wide: true },
    // Row 2
    { label: '%', kind: 'function', ariaLabel: 'Percent', onPress: () => inputUnary('percent') },
    { label: 'xʸ', kind: 'function', ariaLabel: 'Power', onPress: () => inputOperator('^') },
    { label: '²√x', kind: 'function', ariaLabel: 'Square root', onPress: () => inputUnary('sqrt') },
    { label: '÷', kind: 'operator', ariaLabel: 'Divide', onPress: () => inputOperator('÷') },
    // Row 3
    digit('7'),
    digit('8'),
    digit('9'),
    { label: '×', kind: 'operator', ariaLabel: 'Multiply', onPress: () => inputOperator('×') },
    // Row 4
    digit('4'),
    digit('5'),
    digit('6'),
    { label: '−', kind: 'operator', ariaLabel: 'Subtract', onPress: () => inputOperator('−') },
    // Row 5
    digit('1'),
    digit('2'),
    digit('3'),
    { label: '+', kind: 'operator', ariaLabel: 'Add', onPress: () => inputOperator('+') },
    // Row 6
    { ...digit('0'), wide: true },
    { label: '.', kind: 'digit', ariaLabel: 'Decimal separator', onPress: inputDecimal },
    { label: '=', kind: 'equals', ariaLabel: 'Equals', onPress: equals },
  ]

  const displaySizeClass =
    display.length > 12 ? 'calc-display--small' : display.length > 9 ? 'calc-display--medium' : ''

  return (
    <div className="calculator" role="application" aria-label="Calculator">
      <div className="calc-header">Standard</div>
      <div className="calc-screen">
        <div className="calc-expression" aria-label="Expression">
          {expression || '\u00A0'}
        </div>
        <div className={`calc-display ${displaySizeClass}`} aria-live="polite">
          {display}
        </div>
      </div>
      <div className="calc-grid">
        {buttons.map((b) => (
          <button
            key={b.ariaLabel}
            type="button"
            className={`calc-btn calc-btn--${b.kind}${b.wide ? ' calc-btn--wide' : ''}`}
            aria-label={b.ariaLabel}
            onClick={b.onPress}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calculator
