import React, { useState } from 'react'
import { buildPlan } from './calcPlan'
import { BuilderInputs } from './BuilderInputs'
import { BuilderResults } from './BuilderResults'

const defaultState = {
  areaWidthStr: '240',
  areaDepthStr: '240',
  lipLeftStr: '5',
  lipBackStr: '5',
  lipRightStr: '5',
  joistSpacingStr: '60',
  joistWidthStr: '4.8',
  minJoistBearingStr: '2.4',
  materialLengthStr: '420',
  materialDepthStr: '12'
}

const BuilderCalculator = () => {
  const [formState, setFormState] = useState(defaultState)
  const [results, setResults] = useState(null)

  const calculate = () => {
    setResults(buildPlan(formState))
  }

  return (
    <div className="builder-calc">
      <h3>Builder Calculator - Timber Frame Layout</h3>
      <BuilderInputs state={formState} setState={setFormState} onCalculate={calculate} />
      <BuilderResults results={results} />
    </div>
  )
}

export default BuilderCalculator
