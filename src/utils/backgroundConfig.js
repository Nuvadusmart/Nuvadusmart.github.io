export const DEFAULT_BG_CONFIG = {
  mode: 'gradient',
  colors: ['#667eea', '#764ba2'],
  animated: false
}

export const normalizeBgConfig = (cfg) => {
  const mode = cfg?.mode || cfg?.type || 'gradient'
  const colors = Array.isArray(cfg?.colors) && cfg.colors.length >= 2
    ? [cfg.colors[0], cfg.colors[1]]
    : DEFAULT_BG_CONFIG.colors

  return {
    mode,
    colors,
    animated: !!cfg?.animated
  }
}

export const getBgStyle = (cfg) => ({
  backgroundImage: (cfg?.mode || 'gradient') === 'gradient'
    ? (cfg?.animated
      ? `linear-gradient(135deg, ${cfg?.colors?.[0] || '#667eea'}, ${cfg?.colors?.[1] || '#764ba2'}, ${cfg?.colors?.[0] || '#667eea'}, ${cfg?.colors?.[1] || '#764ba2'})`
      : `linear-gradient(135deg, ${cfg?.colors?.[0] || '#667eea'}, ${cfg?.colors?.[1] || '#764ba2'})`)
    : ((cfg?.mode || 'gradient') === 'orbs'
      ? 'radial-gradient(circle at 20% 20%, #16203a 0%, #0b1022 60%, #070b16 100%)'
      : 'linear-gradient(165deg, #060b0f 0%, #0a1218 45%, #071018 100%)'),
  backgroundSize: (cfg?.mode || 'gradient') === 'gradient' && cfg?.animated ? '400% 400%' : undefined,
  animation: (cfg?.mode || 'gradient') === 'gradient' && cfg?.animated ? 'gradientShift 8s ease infinite' : undefined
})
