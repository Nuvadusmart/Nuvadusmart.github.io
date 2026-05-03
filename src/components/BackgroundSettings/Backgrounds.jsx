import React, { useState } from 'react'

const MODES = [
  { id: 'gradient', label: 'Gradient' },
  { id: 'orbs', label: 'Bouncing Orbs + Haze' },
  { id: 'matrix', label: 'Matrix Rain + Haze' }
]

const PRESETS = [
  { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { name: 'Sunset', colors: ['#f093fb', '#f5576c'] },
  { name: 'Forest', colors: ['#11998e', '#38ef87'] },
  { name: 'Fire', colors: ['#ff4e50', '#f9d423'] },
  { name: 'Night', colors: ['#232526', '#414348'] },
  { name: 'Dawn', colors: ['#e57a90', '#c33f64'] }
]

const Backgrounds = ({ bgConfig, setBgConfig }) => {
  const initialColors = (bgConfig?.colors || PRESETS[0].colors).slice()
  const [mode, setMode] = useState(bgConfig?.mode || bgConfig?.type || 'gradient')
  const [colors, setColors] = useState(initialColors)
  const [animated, setAnimated] = useState(bgConfig?.animated || false)

  const commitConfig = (nextMode, nextColors, nextAnimated) => {
    const next = { mode: nextMode, colors: nextColors, animated: nextAnimated }
    if (setBgConfig) {
      setBgConfig(next)
    } else {
      localStorage.setItem('browseros-bg', JSON.stringify(next))
    }
  }

  const handleColorChange = (index, value) => {
    const newColors = [...colors]
    newColors[index] = value
    setColors(newColors)
  }

  const applyPreset = (preset) => {
    setColors(preset.colors)
    setAnimated(false)
  }

  const handleApply = () => {
    commitConfig(mode, colors, animated)
  }

  const previewStyle = mode === 'gradient'
    ? {
      backgroundImage: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      animation: animated ? 'gradientShift 8s ease infinite' : undefined,
      backgroundSize: animated ? '400% 400%' : undefined
    }
    : (mode === 'orbs'
      ? { backgroundImage: 'radial-gradient(circle at 20% 20%, #16203a 0%, #0b1022 60%, #070b16 100%)' }
      : { backgroundImage: 'linear-gradient(165deg, #060b0f 0%, #0a1218 45%, #071018 100%)' })

  return (
    <div className="backgrounds-app">
      <h3>Background Settings</h3>
      <div className={`bg-preview ${mode !== 'gradient' ? `bg-preview-${mode}` : ''}`} style={previewStyle}>
        {mode === 'orbs' && (
          <>
            <span className="preview-orb preview-orb-1" />
            <span className="preview-orb preview-orb-2" />
            <span className="preview-orb preview-orb-3" />
            <span className="preview-haze" />
          </>
        )}
        {mode === 'matrix' && (
          <>
            <div className="preview-matrix-lines" />
            <span className="preview-haze preview-haze-matrix" />
          </>
        )}
      </div>

      <div className="mode-picker">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`mode-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'gradient' && (
        <>
          <div className="color-pickers">
            {colors.map((c, i) => (
              <label key={i}>
                Color {i + 1}
                <input type="color" value={c} onChange={(e) => handleColorChange(i, e.target.value)} />
              </label>
            ))}
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={animated}
              onChange={() => {
                const nextAnimated = !animated
                setAnimated(nextAnimated)
                commitConfig(mode, colors, nextAnimated)
              }}
            />
            Animated Gradient
          </label>
          <div className="presets">
            {PRESETS.map(preset => (
              <button key={preset.name} className={`preset-btn ${colors[0] === preset.colors[0] ? 'active' : ''}`}
                onClick={() => applyPreset(preset)} style={{ background: `linear-gradient(135deg, ${preset.colors.join(', ')})` }}>
                {preset.name}
              </button>
            ))}
          </div>
        </>
      )}

      <button className="apply-btn" onClick={handleApply}>Apply</button>
    </div>
  )
}

export default Backgrounds