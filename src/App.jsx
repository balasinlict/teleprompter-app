import './App.css'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import EditorPage from './pages/EditorPage.jsx'
import PlaybackPage from './pages/PlaybackPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="/play" element={<PlaybackPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
