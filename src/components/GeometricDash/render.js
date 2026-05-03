import { BIG_BLOCK_HEIGHT, BIG_BLOCK_WIDTH, GROUND, H, PLAYER_SIZE, W } from './constants'

export const drawFrame = (ctx, g, score, bestScore) => {
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#0a0a2e')
  grad.addColorStop(1, '#1a1a3e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#2d3436'
  ctx.fillRect(0, GROUND, W, H - GROUND)

  for (let i = 0; i < 50; i++) {
    const sx = (i * 47 + g.frame * 0.1) % W
    const sy = (i * 31) % (GROUND - 100)
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(g.frame * 0.02 + i) * 0.3})`
    ctx.fillRect(sx, sy, 1.5, 1.5)
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  for (let i = -1; i < Math.ceil(W / 30) + 1; i++) {
    const gx = i * 30 - g.groundOffset
    ctx.beginPath()
    ctx.moveTo(gx, GROUND)
    ctx.lineTo(gx, H)
    ctx.stroke()
  }

  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 2
  ctx.shadowColor = '#667eea'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(0, GROUND)
  ctx.lineTo(W, GROUND)
  ctx.stroke()
  ctx.shadowBlur = 0

  g.obstacles.forEach((o) => {
    if (o.type === 'spike') {
      ctx.fillStyle = '#ff6b6b'
      ctx.shadowColor = '#ff6b6b'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(o.x + o.w / 2, o.y)
      ctx.lineTo(o.x + o.w, o.y + o.h)
      ctx.lineTo(o.x, o.y + o.h)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      return
    }

    const bw = BIG_BLOCK_WIDTH
    const bh = BIG_BLOCK_HEIGHT
    const bg = ctx.createLinearGradient(o.x, o.y, o.x + bw, o.y + bh)
    bg.addColorStop(0, '#e74c3c')
    bg.addColorStop(1, '#c0392b')
    ctx.fillStyle = bg
    ctx.shadowColor = '#e74c3c'
    ctx.shadowBlur = 6
    ctx.fillRect(o.x, o.y, bw, bh)
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.strokeRect(o.x + 3, o.y + 3, bw - 6, bh - 6)
  })

  if (!g.dead) {
    const p = g.player
    ctx.save()
    ctx.translate(p.x + PLAYER_SIZE / 2, p.y + PLAYER_SIZE / 2)
    ctx.rotate(p.angle)
    ctx.shadowColor = '#ffd700'
    ctx.shadowBlur = 12
    const pg = ctx.createLinearGradient(-15, -15, 15, 15)
    pg.addColorStop(0, '#ffd700')
    pg.addColorStop(1, '#ff9f43')
    ctx.fillStyle = pg
    ctx.fillRect(-15, -15, PLAYER_SIZE, PLAYER_SIZE)
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'
    ctx.lineWidth = 2
    ctx.strokeRect(-11, -11, PLAYER_SIZE - 8, PLAYER_SIZE - 8)
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(5, -3, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.arc(7, -3, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()
  }

  g.particles.forEach((pt) => {
    ctx.globalAlpha = pt.life
    ctx.fillStyle = pt.color
    ctx.fillRect(pt.x - 3, pt.y - 3, 6, 6)
  })
  ctx.globalAlpha = 1

  if (g.dead) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#ff6b6b'
    ctx.font = 'bold 48px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('CRASHED!', W / 2, H / 2 - 30)
    ctx.fillStyle = 'white'
    ctx.font = '24px Inter, sans-serif'
    ctx.fillText(`Score: ${score}  |  Best: ${bestScore}`, W / 2, H / 2 + 20)
  }
}
