const round1 = (n) => Math.round(n * 10) / 10
const FLOAT_EPS = 1e-9

const safeFloorDiv = (numerator, denominator) => Math.floor((numerator + FLOAT_EPS) / denominator)
const safeCeilDiv = (numerator, denominator) => Math.ceil((numerator - FLOAT_EPS) / denominator)

const parseOrDefault = (value, fallback) => {
  const normalized = typeof value === 'string' ? value.replace(',', '.') : value
  const parsed = parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

const pickOffcutJoistSplit = (stockPool, allowedSeamZones, areaWidth, materialLength) => {
  const epsilon = 0.0001
  const usableOffcuts = [...stockPool].filter((len) => len + epsilon < areaWidth).sort((a, b) => b - a)
  for (const offcutLen of usableOffcuts) {
    const zone = [...allowedSeamZones].sort((a, b) => b.end - a.end).find((z) => z.start <= offcutLen + epsilon)
    if (!zone) continue
    const seam = round1(Math.min(offcutLen, zone.end))
    if (seam + epsilon < zone.start || seam <= 0 || seam >= areaWidth) continue
    const second = round1(areaWidth - seam)
    if (second - materialLength > epsilon) continue
    return [seam, second]
  }
  return null
}

const takePiece = (requiredLength, stockPool, materialLength, boardState) => {
  const required = round1(requiredLength)
  const epsilon = 0.0001

  let bestIdx = -1
  let bestLen = Infinity
  for (let i = 0; i < stockPool.length; i++) {
    const len = stockPool[i]
    if (len + epsilon >= required && len < bestLen) {
      bestLen = len
      bestIdx = i
    }
  }

  if (bestIdx >= 0) {
    const sourceLen = stockPool.splice(bestIdx, 1)[0]
    const offcut = round1(sourceLen - required)
    if (offcut > 0.1) stockPool.push(offcut)
    return { ok: true, source: 'offcut', sourceLength: sourceLen, cutLength: required, offcut }
  }

  if (required - materialLength > epsilon) {
    return { ok: false, error: `Required cut ${required}cm exceeds material length ${materialLength}cm.` }
  }

  boardState.count += 1
  const boardNumber = boardState.count
  const offcut = round1(materialLength - required)
  if (offcut > 0.1) stockPool.push(offcut)
  boardState.cutsByBoard[boardNumber] = [...(boardState.cutsByBoard[boardNumber] || []), required]

  return { ok: true, source: 'new', sourceLength: materialLength, cutLength: required, boardNumber, offcut }
}

export const buildPlan = (inputs) => {
  const areaWidth = parseOrDefault(inputs.areaWidthStr, 240)
  const areaDepth = parseOrDefault(inputs.areaDepthStr, 240)
  const lipLeft = parseOrDefault(inputs.lipLeftStr, 5)
  const lipBack = parseOrDefault(inputs.lipBackStr, 5)
  const lipRight = parseOrDefault(inputs.lipRightStr, 5)
  const joistSpacing = parseOrDefault(inputs.joistSpacingStr, 60)
  const joistWidth = parseOrDefault(inputs.joistWidthStr, 4.5)
  const minJoistBearing = parseOrDefault(inputs.minJoistBearingStr, joistWidth / 2)
  const materialLength = parseOrDefault(inputs.materialLengthStr, 420)
  const materialDepth = parseOrDefault(inputs.materialDepthStr, 12)

  if (areaWidth <= 0 || areaDepth <= 0) return { error: 'Area width and depth must be positive.' }
  if (lipLeft < 0 || lipRight < 0 || lipBack < 0) return { error: 'Lip values cannot be negative.' }
  if (lipLeft + lipRight >= areaWidth) return { error: 'Lip left + right must be smaller than width.' }
  if (lipBack >= areaDepth) return { error: 'Lip back must be smaller than depth.' }
  if (joistSpacing <= 0 || joistWidth <= 0 || minJoistBearing <= 0 || materialLength <= 0 || materialDepth <= 0) return { error: 'Spacing, joist width, minimum bearing, and material values must be positive.' }
  if (joistWidth - joistSpacing > 0.0001) return { error: 'Joist width must be less than or equal to joist spacing.' }
  if (minJoistBearing - joistWidth / 2 > 0.0001) return { error: 'Minimum bearing cannot exceed half the joist width.' }

  const seamPositions = []
  // Spacing is interpreted from the deck edge to joist face, so seam support center
  // sits half a joist width further inside the board field.
  const firstSeamCenter = lipLeft + joistSpacing + joistWidth / 2
  const lastAllowedSeamCenter = areaWidth - lipRight + joistWidth / 2
  for (let pos = firstSeamCenter; pos < lastAllowedSeamCenter - 0.0001; pos += joistSpacing) {
    seamPositions.push(round1(pos))
  }

  const pattern = []
  let spanStart = 0
  for (const seam of seamPositions) {
    pattern.push(round1(seam - spanStart))
    spanStart = seam
  }
  pattern.push(round1(areaWidth - spanStart))
  const seamBuffer = round1(joistWidth / 2)
  const supportZones = seamPositions.map((center) => ({
    center,
    start: round1(Math.max(0, center - seamBuffer)),
    end: round1(Math.min(areaWidth, center + seamBuffer))
  }))
  const seamTolerance = round1(joistWidth / 2 - minJoistBearing)
  const allowedSeamZones = seamPositions.map((center) => ({
    center,
    start: round1(Math.max(0, center - seamTolerance)),
    end: round1(Math.min(areaWidth, center + seamTolerance))
  }))

  const usableDepth = areaDepth - lipBack
  const rowsNeeded = safeCeilDiv(usableDepth, materialDepth)
  if (rowsNeeded <= 0) return { error: 'No rows needed with these depth values.' }

  const stockPool = []
  const boardState = { count: 0, cutsByBoard: {} }
  const rows = []

  for (let row = 1; row <= rowsNeeded; row++) {
    const rowSegments = []
    const splitPlan = pickOffcutJoistSplit(stockPool, allowedSeamZones, areaWidth, materialLength)
    if (splitPlan) {
      for (const len of splitPlan) {
        const piece = takePiece(len, stockPool, materialLength, boardState)
        if (!piece.ok) return { error: piece.error }
        rowSegments.push({ length: piece.cutLength, source: piece.source, sourceLength: piece.sourceLength, boardNumber: piece.boardNumber || null })
      }
    } else {
      let spanIndex = 0
      while (spanIndex < pattern.length) {
        let runLength = 0
        let runEnd = spanIndex
        while (runEnd < pattern.length) {
          const nextLength = round1(runLength + pattern[runEnd])
          if (nextLength - materialLength > 0.0001) break
          runLength = nextLength
          runEnd += 1
        }

        if (runLength <= 0) {
          return { error: `A joist span near ${spanIndex + 1} exceeds material length ${materialLength}cm.` }
        }

        const piece = takePiece(runLength, stockPool, materialLength, boardState)
        if (!piece.ok) return { error: piece.error }
        rowSegments.push({ length: piece.cutLength, source: piece.source, sourceLength: piece.sourceLength, boardNumber: piece.boardNumber || null })
        spanIndex = runEnd
      }
    }

    let cursor = 0
    const segments = rowSegments.map((seg) => {
      const start = round1(cursor)
      const end = round1(start + seg.length)
      cursor = end
      return { ...seg, start, end }
    })

    rows.push({
      row,
      segments,
      seams: segments.slice(0, -1).map((s) => s.end),
      total: round1(segments.reduce((sum, s) => sum + s.length, 0))
    })
  }

  const offcuts = [...stockPool].sort((a, b) => b - a).map(round1)
  const totalWaste = round1(offcuts.reduce((sum, len) => sum + len, 0))

  return {
    error: null,
    areaWidth,
    areaDepth,
    lipLeft,
    lipBack,
    lipRight,
    joistSpacing,
    joistWidth,
    minJoistBearing,
    seamBuffer,
    seamTolerance,
    materialLength,
    materialDepth,
    usableDepth: round1(usableDepth),
    rowsNeeded,
    joistPattern: pattern,
    seamPositions,
    supportZones,
    allowedSeamZones,
    rows,
    boardsPurchased: boardState.count,
    offcuts,
    totalWaste,
    cutsByBoard: boardState.cutsByBoard
  }
}
