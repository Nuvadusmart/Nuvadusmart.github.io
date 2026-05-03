import { TRACK, CHECKPOINTS } from './constants'

export const drawTrack = (ctx) => {
  const outer = ctx.createRadialGradient(TRACK.cx, TRACK.cy, 90, TRACK.cx, TRACK.cy, 420)
  outer.addColorStop(0, '#4a4a4a')
  outer.addColorStop(1, '#2f2f2f')
  ctx.fillStyle = outer
  ctx.beginPath()
  ctx.roundRect(TRACK.cx - TRACK.outerW / 2, TRACK.cy - TRACK.outerH / 2, TRACK.outerW, TRACK.outerH, TRACK.outerR)
  ctx.fill()

  ctx.fillStyle = '#346f45'
  ctx.beginPath()
  ctx.roundRect(TRACK.cx - TRACK.innerW / 2, TRACK.cy - TRACK.innerH / 2, TRACK.innerW, TRACK.innerH, TRACK.innerR)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(TRACK.cx - TRACK.outerW / 2 + 10, TRACK.cy - TRACK.outerH / 2 + 10, TRACK.outerW - 20, TRACK.outerH - 20, TRACK.outerR - 10)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.setLineDash([16, 16])
  ctx.beginPath()
  ctx.ellipse(TRACK.cx, TRACK.cy, (TRACK.outerW + TRACK.innerW) / 4, (TRACK.outerH + TRACK.innerH) / 4, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  CHECKPOINTS.forEach((cp) => {
    ctx.fillStyle = 'rgba(120,170,255,0.25)'
    ctx.beginPath()
    ctx.arc(cp.x, cp.y, 10, 0, Math.PI * 2)
    ctx.fill()
  })
}

export const drawSkids = (ctx, skids) => {
  skids.forEach((s) => {
    const a = Math.max(0, s.life / s.maxLife)
    ctx.strokeStyle = s.heavy ? `rgba(14,14,14,${a * 0.65})` : `rgba(45,45,45,${a * 0.25})`
    ctx.lineWidth = s.heavy ? 7 : 3
    ctx.beginPath()
    ctx.moveTo(s.x1, s.y1)
    ctx.lineTo(s.x2, s.y2)
    ctx.stroke()
  })
}

export const drawCar = (ctx, car, boosting) => {
  ctx.save()
  ctx.translate(car.x, car.y)
  ctx.rotate(car.angle + Math.PI / 2)

  const body = ctx.createLinearGradient(-14, -24, 14, 24)
  body.addColorStop(0, boosting ? '#ff9f43' : '#ff6b6b')
  body.addColorStop(1, boosting ? '#ff6f00' : '#c0392b')
  ctx.fillStyle = body

  ctx.beginPath()
  ctx.roundRect(-12, -22, 24, 44, 8)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.beginPath()
  ctx.roundRect(-7, -12, 14, 10, 3)
  ctx.fill()

  ctx.fillStyle = '#fffde7'
  ctx.beginPath()
  ctx.arc(-7, -20, 3, 0, Math.PI * 2)
  ctx.arc(7, -20, 3, 0, Math.PI * 2)
  ctx.fill()

  if (boosting && car.speed > 2) {
    const flame = 9 + Math.random() * 8
    const grad = ctx.createLinearGradient(0, 22, 0, 22 + flame)
    grad.addColorStop(0, '#fff59d')
    grad.addColorStop(0.5, '#ff9800')
    grad.addColorStop(1, 'rgba(255,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(-5, 22)
    ctx.lineTo(0, 22 + flame)
    ctx.lineTo(5, 22)
    ctx.fill()
  }

  ctx.restore()
}
