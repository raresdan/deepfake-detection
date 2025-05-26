import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [msg, setMsg] = useState('Loading...')

  useEffect(() => {
    axios.get('/api/hello')
      .then(res => setMsg(res.data.message))
      .catch(() => setMsg("Couldn't connect to Flask backend"))
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Vite + React + Flask</h1>
      <p>Backend says: {msg}</p>
    </div>
  )
}

export default App
