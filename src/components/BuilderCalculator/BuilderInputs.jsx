import React from 'react'

const InputField = ({ label, value, onChange }) => (
  <label>
    {label}
    <input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
)

export const BuilderInputs = ({ state, setState, onCalculate }) => {
  const set = (key) => (value) => setState((prev) => ({ ...prev, [key]: value }))

  return (
    <>
      <div className="bc-inputs">
        <InputField label="Width (cm):" value={state.areaWidthStr} onChange={set('areaWidthStr')} />
        <InputField label="Depth (cm):" value={state.areaDepthStr} onChange={set('areaDepthStr')} />
      </div>

      <div className="bc-inputs">
        <InputField label="Lip Left:" value={state.lipLeftStr} onChange={set('lipLeftStr')} />
        <InputField label="Lip Back:" value={state.lipBackStr} onChange={set('lipBackStr')} />
        <InputField label="Lip Right:" value={state.lipRightStr} onChange={set('lipRightStr')} />
        <InputField label="Joist Spacing (cm):" value={state.joistSpacingStr} onChange={set('joistSpacingStr')} />
        <InputField label="Joist Width (cm):" value={state.joistWidthStr} onChange={set('joistWidthStr')} />
        <InputField label="Min Bearing Per Side (cm):" value={state.minJoistBearingStr} onChange={set('minJoistBearingStr')} />
      </div>

      <div className="bc-inputs">
        <InputField label="Material Length (cm):" value={state.materialLengthStr} onChange={set('materialLengthStr')} />
        <InputField label="Material Depth (cm):" value={state.materialDepthStr} onChange={set('materialDepthStr')} />
      </div>

      <button className="bc-calc-btn" onClick={onCalculate}>Calculate</button>
    </>
  )
}
