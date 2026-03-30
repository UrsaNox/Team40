import { useState, useEffect } from 'react'
import './App.css'
import VideoCall from './components/VideoCall'

function App() {
  const [isSetup, setIsSetup] = useState(false)
  const [yourId, setYourId] = useState('')
  const [remotePeerId, setRemotePeerId] = useState('')

  useEffect(() => {
    if (yourId) {
      setIsSetup(true)
    }
  }, [yourId])

  const handleYourIdReady = (id) => {
    setYourId(id)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤟 Sign Language Communication</h1>
        <p>Real-Time Bidirectional Video Call</p>
      </header>

      {!isSetup ? (
        <div className="setup-screen">
          <div className="setup-card">
            <h2>Initializing...</h2>
            <p>Setting up your connection...</p>
            <div className="loader"></div>
          </div>
        </div>
      ) : (
        <main className="app-main">
          <VideoCall 
            yourId={yourId}
            onIdReady={handleYourIdReady}
          />
        </main>
      )}
    </div>
  )
}

export default App
