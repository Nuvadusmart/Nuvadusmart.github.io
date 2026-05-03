import React, { useState } from 'react'

const Calculator = () => {
  const [display, setDisplay] = useState('0')
  const [currentInput, setCurrentInput] = useState('0')
  const [prevValue, setPrevValue] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForNewInput, setWaitingForNewInput] = useState(false)
  const [showingResult, setShowingResult] = useState(false)

  const setDisplayFromState = (leftValue, op, rightText) => {
    if (leftValue !== null && op) {
      setDisplay(`${leftValue}${op}${rightText}`)
      return
    }
    setDisplay(rightText)
  }

  const handleNumber = (num) => {
    if (showingResult && !operator) {
      const next = num.toString()
      setCurrentInput(next)
      setPrevValue(null)
      setDisplay(next)
      setShowingResult(false)
      setWaitingForNewInput(false)
      return
    }

    let nextInput
    if (waitingForNewInput) {
      nextInput = num.toString()
      setWaitingForNewInput(false)
    } else {
      nextInput = currentInput === '0' ? num.toString() : currentInput + num
    }

    setCurrentInput(nextInput)
    setDisplayFromState(prevValue, operator, nextInput)
    setShowingResult(false)
  }

  const handleOperator = (op) => {
    const current = parseFloat(currentInput)
    if (prevValue !== null && operator && !waitingForNewInput) {
      const result = calculate(prevValue, current, operator)
      if (result === 'Error') {
        setDisplay('Error')
        setCurrentInput('0')
        setPrevValue(null)
        setOperator(null)
        setWaitingForNewInput(true)
        setShowingResult(true)
        return
      }
      setPrevValue(result)
      setCurrentInput('0')
      setDisplay(`${result}${op}`)
    } else {
      const base = prevValue !== null && waitingForNewInput ? prevValue : current
      setPrevValue(base)
      setCurrentInput('0')
      setDisplay(`${base}${op}`)
    }

    setOperator(op)
    setWaitingForNewInput(true)
    setShowingResult(false)
  }

  const handleEquals = () => {
    if (prevValue === null || !operator || waitingForNewInput) return
    const current = parseFloat(currentInput)
    const result = calculate(prevValue, current, operator)
    setDisplay(result.toString())
    setCurrentInput(result === 'Error' ? '0' : result.toString())
    setPrevValue(null)
    setOperator(null)
    setWaitingForNewInput(true)
    setShowingResult(true)
  }

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '*': return a * b
      case '/': return b !== 0 ? a / b : 'Error'
      default: return b
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setCurrentInput('0')
    setPrevValue(null)
    setOperator(null)
    setWaitingForNewInput(false)
    setShowingResult(false)
  }

  const handlePercent = () => {
    const next = (parseFloat(currentInput) / 100).toString()
    setCurrentInput(next)
    setDisplayFromState(prevValue, operator, next)
  }

  const handleDecimal = () => {
    if (waitingForNewInput) {
      setCurrentInput('0.')
      setDisplayFromState(prevValue, operator, '0.')
      setWaitingForNewInput(false)
      setShowingResult(false)
      return
    }
    if (!currentInput.includes('.')) {
      const next = currentInput + '.'
      setCurrentInput(next)
      setDisplayFromState(prevValue, operator, next)
    }
  }

  const buttons = [
    ['C', '%', '±', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+']
  ]

  return (
    <div className="calculator">
      <div className="calc-display">{display}</div>
      <div className="calc-buttons">
        {buttons.map((row, ri) => row.map((btn, ci) => (
          <button key={`calc-btn-${ri}-${ci}`} className="calc-btn"
            onClick={() => {
              if (!isNaN(parseInt(btn))) handleNumber(parseInt(btn))
              else if (btn === 'C') handleClear()
              else if (btn === '%') handlePercent()
              else if (btn === '+') handleOperator('+')
              else if (btn === '-') handleOperator('-')
              else if (btn === '*') handleOperator('*')
              else if (btn === '/') handleOperator('/')
            }}
          >{btn}</button>
        )))}
        <button className="calc-btn calc-zero" onClick={() => handleNumber(0)}>0</button>
        <button className="calc-btn calc-dot" onClick={handleDecimal}>.</button>
        <button className="calc-btn calc-equals" onClick={handleEquals}>=</button>
      </div>
    </div>
  )
}

export default Calculator