export const CANVAS_WIDTH = 900
export const CANVAS_HEIGHT = 720

export const TRACK = {
  cx: CANVAS_WIDTH / 2,
  cy: CANVAS_HEIGHT / 2,
  outerW: 820,
  outerH: 580,
  outerR: 140,
  innerW: 470,
  innerH: 260,
  innerR: 86
}

export const CHECKPOINTS = [
  { x: TRACK.cx, y: TRACK.cy - TRACK.outerH / 4 },
  { x: TRACK.cx + TRACK.outerW / 4, y: TRACK.cy },
  { x: TRACK.cx, y: TRACK.cy + TRACK.outerH / 4 },
  { x: TRACK.cx - TRACK.outerW / 4, y: TRACK.cy }
]

export const pointInRoundedRect = (x, y, cx, cy, w, h, r) => {
  const dx = Math.abs(x - cx)
  const dy = Math.abs(y - cy)
  const hw = w / 2
  const hh = h / 2
  if (dx > hw || dy > hh) return false
  if (dx <= hw - r || dy <= hh - r) return true
  const cornerDx = dx - (hw - r)
  const cornerDy = dy - (hh - r)
  return cornerDx * cornerDx + cornerDy * cornerDy <= r * r
}
