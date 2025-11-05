import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus'
import FlipIcon from '@mui/icons-material/Flip'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'

const STORAGE_KEY_TEXT = 'teleprompter.text'
const STORAGE_KEY_SETTINGS = 'teleprompter.settings'

function load() {
  let text = localStorage.getItem(STORAGE_KEY_TEXT) || ''
  let settings = {}
  try { settings = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || '{}') } catch {}
  return { text, settings }
}

export default function PlaybackPage() {
  const navigate = useNavigate()
  const { text, settings } = useMemo(load, [])
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(settings.speed ?? 2.0)
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const lastTs = useRef(0)
  const offset = useRef(0)
  const hudTimer = useRef()
  const [hudVisible, setHudVisible] = useState(true)

  const showHUD = useCallback(() => {
    setHudVisible(true)
    clearTimeout(hudTimer.current)
    hudTimer.current = setTimeout(() => setHudVisible(false), 2000)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); showHUD() }
      if (e.key === 'ArrowUp') { setSpeed(s => +(Math.min(5, (s + 0.1)).toFixed(2))); showHUD() }
      if (e.key === 'ArrowDown') { setSpeed(s => +(Math.max(0, (s - 0.1)).toFixed(2))); showHUD() }
      if (e.key === '1') { setSpeed(1); showHUD() }
      if (e.key === '2') { setSpeed(2); showHUD() }
      if (e.key === '3') { setSpeed(3); showHUD() }
      if (e.key.toLowerCase() === 'm') {
        const next = { ...settings, mirrorH: !settings.mirrorH }
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(next))
        showHUD()
      }
      if (e.key === 'Escape') { navigate('/') }
      if (e.key.toLowerCase() === 'f') { document.documentElement.requestFullscreen?.() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, settings, showHUD])

  useEffect(() => {
    let raf
    const step = (ts) => {
      if (!playing) { lastTs.current = ts; raf = requestAnimationFrame(step); return }
      if (!lastTs.current) lastTs.current = ts
      const dt = ts - lastTs.current
      lastTs.current = ts
      // Translate by px/ms baseline: 50px per second at 1.0x
      const pxPerMs = 50 * speed / 1000
      offset.current -= dt * pxPerMs
      contentRef.current?.style.setProperty('transform', `translateY(${offset.current}px)`)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed])

  // Touch gestures (mobile)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let startY = 0
    const onTouchStart = (e) => { startY = e.touches[0].clientY; showHUD() }
    const onTouchMove = (e) => {
      const dy = e.touches[0].clientY - startY
      if (Math.abs(dy) > 50) {
        setSpeed(s => +(Math.max(0, Math.min(5, s - Math.sign(dy) * 0.1)).toFixed(2)))
        startY = e.touches[0].clientY
      }
    }
    const onDouble = (e) => { setPlaying(p => !p); showHUD() }
    el.addEventListener('touchstart', onTouchStart)
    el.addEventListener('touchmove', onTouchMove)
    el.addEventListener('dblclick', onDouble)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('dblclick', onDouble)
    }
  }, [showHUD])

  // Apply fullscreen on mount if possible (optional)
  useEffect(() => {
    showHUD()
  }, [showHUD])

  const contrastStyles = useMemo(() => {
    switch (settings.contrast) {
      case 'light': return { bg: '#FFFFFF', fg: '#000000', guide: 'rgba(0,0,0,0.18)' }
      case 'dark': return { bg: '#000000', fg: '#FFFFFF', guide: 'rgba(255,255,255,0.18)' }
      default: return { bg: '#000000', fg: '#FFD400', guide: 'rgba(255,255,255,0.18)' }
    }
  }, [settings.contrast])

  const mirror = `scale(${settings.mirrorH ? -1 : 1}, ${settings.mirrorV ? -1 : 1})`

  return (
    <Box ref={containerRef} sx={{ bgcolor: contrastStyles.bg, color: contrastStyles.fg, width: '100vw', height: '100vh', overflow: 'hidden', cursor: hudVisible ? 'default' : 'none' }}>
      <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, bgcolor: contrastStyles.guide }} />

      <Box ref={contentRef}
        sx={{
          position: 'absolute',
          left: '50%', transform: `translate(-50%, 0) ${mirror}`,
          width: { xs: '90vw', md: '60vw' }, maxWidth: 960, minWidth: 560,
          textAlign: 'center',
          px: 2,
          pt: '60vh', // start lower, scroll upward
          fontSize: `${settings.fontSize || 40}px`,
          lineHeight: (settings.lineHeight || 1.6),
          fontWeight: 500,
          letterSpacing: '0.5px',
          wordBreak: 'keep-all',
          willChange: 'transform',
        }}
      >
        {text.split('\n').map((line, idx) => (
          <Typography key={idx} component="p" sx={{ my: 1 }}>
            {line || ' '}
          </Typography>
        ))}
      </Box>

      {hudVisible && (
        <Paper elevation={3} sx={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)', px: 2, py: 1.5, bgcolor: 'rgba(31,41,55,0.8)', color: '#fff', borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit" onClick={() => { setPlaying(p => !p); showHUD() }}>
              {playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton color="inherit" onClick={() => { setSpeed(s => +(Math.max(0, s - 0.1).toFixed(2))); showHUD() }}>
              <ArrowDownwardIcon />
            </IconButton>
            <Typography variant="body2">{speed.toFixed(2)}x</Typography>
            <IconButton color="inherit" onClick={() => { setSpeed(s => +(Math.min(5, s + 0.1).toFixed(2))); showHUD() }}>
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => { document.exitFullscreen?.(); navigate('/'); }}>
              <CloseFullscreenIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}


