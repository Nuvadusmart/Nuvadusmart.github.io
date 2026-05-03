import React from 'react'

export const BuilderResults = ({ results }) => {
  if (!results) return null
  if (results.error) return <p style={{ color: '#ff6b6b' }}>{results.error}</p>

  return (
    <div className="bc-results">
      <div className="bc-summary">
        <p><strong>Area:</strong> {results.areaWidth} x {results.areaDepth} cm</p>
        <p><strong>Lips:</strong> Left {results.lipLeft} | Back {results.lipBack} | Right {results.lipRight}</p>
        <p><strong>Material:</strong> {results.materialLength}cm x {results.materialDepth}cm</p>
        <p><strong>Joist spacing:</strong> {results.joistSpacing}cm | <strong>Joist width:</strong> {results.joistWidth}cm</p>
        <p><strong>Minimum bearing per board end:</strong> {results.minJoistBearing}cm</p>
        <p><strong>Seam support buffer:</strong> +/-{results.seamBuffer}cm from joist center</p>
        <p><strong>Usable depth:</strong> {results.usableDepth}cm | <strong>Rows:</strong> {results.rowsNeeded}</p>
        <p><strong>Pattern:</strong> {results.joistPattern.join(', ')}</p>
      </div>

      <div className="bc-plan-layout">
        <div className="bc-plan-col">
          <h4>Row Cut Plan</h4>
          <div className="bc-table-wrap">
            <table className="bc-table">
              <thead>
                <tr><th>Row</th><th>Cuts (cm)</th><th>Total</th></tr>
              </thead>
              <tbody>
                {results.rows.map((plan) => (
                  <tr key={plan.row}>
                    <td>{plan.row}</td>
                    <td>
                      {plan.segments.map((seg, i) => (
                        <div key={i}>
                          {seg.length} ({seg.source === 'new' ? `new board #${seg.boardNumber}` : `offcut ${seg.sourceLength}`})
                        </div>
                      ))}
                    </td>
                    <td>{plan.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bc-plan-col">
          <h4>Layout Visualization</h4>
          <div className="bc-layout-visual">
            <div className="bc-layout-scale">
              <span>0 cm</span>
              <span>{results.areaWidth} cm</span>
            </div>
            {results.rows.map((plan) => (
              <div key={plan.row} className="bc-layout-row">
                <div className="bc-layout-row-label">Row {plan.row}</div>
                <div className="bc-layout-track">
                  {results.supportZones.map((zone, i) => (
                    <div
                      key={`z-${plan.row}-${i}`}
                      className="bc-joist-zone"
                      style={{
                        left: `${(zone.start / results.areaWidth) * 100}%`,
                        width: `${((zone.end - zone.start) / results.areaWidth) * 100}%`
                      }}
                    />
                  ))}
                  {results.seamPositions.map((joistPos, i) => (
                    <div key={`j-${plan.row}-${i}`} className="bc-joist-line" style={{ left: `${(joistPos / results.areaWidth) * 100}%` }} />
                  ))}
                  {plan.segments.map((seg, i) => (
                    <div
                      key={`s-${plan.row}-${i}`}
                      className={`bc-layout-segment ${seg.source === 'new' ? 'new' : 'offcut'}`}
                      style={{ left: `${(seg.start / results.areaWidth) * 100}%`, width: `${(seg.length / results.areaWidth) * 100}%` }}
                    >
                      {seg.length}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bc-summary">
        <p><strong>New boards used:</strong> {results.boardsPurchased}</p>
        <p><strong>Remaining offcuts:</strong> {results.offcuts.length ? results.offcuts.join(', ') : 'None'}</p>
        <p><strong>Total offcut stock:</strong> {results.totalWaste}cm</p>
      </div>
    </div>
  )
}
