import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import TextField from '@mui/material/TextField'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import ScreenRotationAltIcon from '@mui/icons-material/ScreenRotationAlt'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FlipIcon from '@mui/icons-material/Flip'

const STORAGE_KEY_TEXT = 'teleprompter.text'
const STORAGE_KEY_SETTINGS = 'teleprompter.settings'

const defaultSettings = {
  speed: 2.0,
  fontSize: 40,
  lineHeight: 1.6,
  lineWidth: 20,
  contrast: 'yellow-on-black', // light | dark | yellow-on-black
  mirrorH: false,
  mirrorV: false,
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export default function EditorPage() {
  const navigate = useNavigate()
  const [text, setText] = useState(() => localStorage.getItem(STORAGE_KEY_TEXT) || '')
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_TEXT, text)
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
    }, 150)
    return () => clearTimeout(id)
  }, [text, settings])

  const handlePlay = () => {
    navigate('/play')
  }

  const handleContrast = (_, val) => {
    if (val) setSettings((s) => ({ ...s, contrast: val }))
  }

  const handleMirror = (_, values) => {
    setSettings((s) => ({ ...s, mirrorH: values.includes('h'), mirrorV: values.includes('v') }))
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F7F9' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #E5E7EB' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#0F172A' }}>
            Teleprompter
          </Typography>
          <IconButton color="primary" onClick={() => document.documentElement.requestFullscreen?.()} title="全螢幕">
            <ScreenRotationAltIcon />
          </IconButton>
          <IconButton color="primary" onClick={() => setSettings((s) => ({ ...s, mirrorH: !s.mirrorH }))} title="鏡像">
            <FlipIcon />
          </IconButton>
          <Button variant="contained" onClick={handlePlay} startIcon={<PlayArrowIcon />}>播放</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Box sx={{ minWidth: 220 }}>
              <FormLabel>字體大小（px）</FormLabel>
              <Slider value={settings.fontSize} min={24} max={64} step={2}
                onChange={(_, v) => setSettings((s) => ({ ...s, fontSize: v }))} valueLabelDisplay="auto" />
            </Box>
            <Box sx={{ minWidth: 220 }}>
              <FormLabel>速度（x）</FormLabel>
              <Slider value={settings.speed} min={0} max={5} step={0.1}
                onChange={(_, v) => setSettings((s) => ({ ...s, speed: v }))} valueLabelDisplay="auto" />
            </Box>
            <Box sx={{ minWidth: 220 }}>
              <FormLabel>行距</FormLabel>
              <Slider value={settings.lineHeight} min={1.2} max={1.8} step={0.05}
                onChange={(_, v) => setSettings((s) => ({ ...s, lineHeight: v }))} valueLabelDisplay="auto" />
            </Box>
            <Box sx={{ minWidth: 220 }}>
              <FormLabel>行寬（每行全形字）</FormLabel>
              <Slider value={settings.lineWidth} min={14} max={26} step={1}
                onChange={(_, v) => setSettings((s) => ({ ...s, lineWidth: v }))} valueLabelDisplay="auto" />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Box>
              <FormLabel>對比</FormLabel>
              <ToggleButtonGroup exclusive color="primary" value={settings.contrast} onChange={handleContrast} sx={{ ml: 2 }}>
                <ToggleButton value="light">白底黑字</ToggleButton>
                <ToggleButton value="dark">黑底白字</ToggleButton>
                <ToggleButton value="yellow-on-black">黑底黃字</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box>
              <FormLabel>鏡像</FormLabel>
              <ToggleButtonGroup value={[settings.mirrorH && 'h', settings.mirrorV && 'v'].filter(Boolean)} onChange={handleMirror} sx={{ ml: 2 }}>
                <ToggleButton value="h">水平</ToggleButton>
                <ToggleButton value="v">垂直</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>

          <Box sx={{ position: 'relative' }}>
            <TextField
              multiline minRows={10} fullWidth
              placeholder="在此貼上你的稿件..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{
                '& textarea': {
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineHeight,
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                }
              }}
            />
            <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, bgcolor: '#000', opacity: 0.16 }} />
          </Box>

          <Box sx={{ display: { xs: 'block', sm: 'inline-block' } }}>
            <Button size="large" variant="contained" startIcon={<PlayArrowIcon />} onClick={handlePlay}>
              開始播放
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}


