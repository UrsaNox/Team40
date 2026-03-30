import { useState, useEffect, useRef } from 'react'
import webrtcService from '../services/webrtcService'
import mediapipeService from '../services/mediapipeService'
import tfjsService from '../services/tfjsService'
import translationService from '../services/translationService'
import poseAvatarService from '../services/poseAvatarService'
import './VideoCall.css'

export default function VideoCall({ yourId, onIdReady }) {
  const [peerId, setPeerId] = useState('')
  const [remotePeerId, setRemotePeerId] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [recognizedSigns, setRecognizedSigns] = useState([])
  const [translatedText, setTranslatedText] = useState('')

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localCanvasRef = useRef(null)
  const remoteCanvasRef = useRef(null)
  const peerIdInputRef = useRef(null)

  // Initialize WebRTC and MediaPipe on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize WebRTC
        const id = await webrtcService.initialize()
        setPeerId(id)
        onIdReady(id)

        // Get local video stream
        const localStream = await webrtcService.getLocalStream()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }

        // Setup WebRTC callbacks
        webrtcService.onRemoteStream = (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
          }
          setConnectionStatus('connected')
        }

        webrtcService.onRemoteStreamEnd = () => {
          setConnectionStatus('disconnected')
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
          }
        }

        // Initialize MediaPipe
        await mediapipeService.initialize(localCanvasRef.current)

        // Setup MediaPipe landmark callback
        mediapipeService.onLandmarksDetected = (landmarks) => {
          // Send landmarks to TensorFlow.js for sign recognition
          const landmarkVector = mediapipeService.getLandmarkVector()
          if (landmarkVector) {
            tfjsService.addToSequence(landmarkVector)

            // Try inference if buffer is ready
            if (tfjsService.isReady()) {
              performInference()
            }
          }
        }

        // Start MediaPipe capture
        await mediapipeService.startCapture(localVideoRef.current)

        // Initialize pose avatar for rendering
        poseAvatarService.initialize(remoteCanvasRef.current)

      } catch (err) {
        console.error('Initialization error:', err)
        alert('Failed to initialize: ' + err.message)
      }
    }

    initialize()

    // Cleanup on unmount
    return () => {
      webrtcService.destroy()
      mediapipeService.close()
      tfjsService.dispose()
    }
  }, [])

  const performInference = async () => {
    try {
      const prediction = await tfjsService.predict()
      if (prediction) {
        console.log('Prediction:', prediction)
        setRecognizedSigns(prev => [...prev, prediction])

        // Send to backend for translation
        if (prediction.confidence > 0.5) {
          const result = await translationService.signToText(
            prediction.signId,
            prediction.confidence
          )
          setTranslatedText(result.natural_language)

          // Send to remote peer
          if (webrtcService.isConnected()) {
            webrtcService.sendData({
              type: 'sign_recognized',
              sign: prediction,
              translation: result
            })
          }
        }

        // Clear buffer for next sequence
        setTimeout(() => {
          tfjsService.clearBuffer()
        }, 500)
      }
    } catch (err) {
      console.error('Inference error:', err)
    }
  }

  const handleCallPeer = async () => {
    if (!remotePeerId) {
      alert('Please enter a peer ID')
      return
    }

    try {
      setConnectionStatus('calling')

      // Try to call the peer
      await webrtcService.callPeer(remotePeerId)

      // Also try data connection after slight delay
      setTimeout(() => {
        webrtcService.connectToPeer(remotePeerId)
      }, 500)

    } catch (err) {
      console.error('Call error:', err)
      setConnectionStatus('error')
      alert('Failed to call peer: ' + err.message)
    }
  }

  const handleCopyId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId)
      alert('Your ID copied to clipboard!')
    }
  }

  const handleDisconnect = () => {
    webrtcService.disconnect()
    setConnectionStatus('disconnected')
    setRecognizedSigns([])
    setTranslatedText('')
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success'
      case 'calling':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="video-call">
      {/* Control Panel */}
      <div className="control-panel">
        <div className="id-section">
          <div className="id-display">
            <label>Your ID:</label>
            <code className="peer-id">{peerId || 'Connecting...'}</code>
            <button onClick={handleCopyId} className="copy-btn">
              📋
            </button>
          </div>
        </div>

        <div className="call-section">
          <div className="input-group">
            <input
              type="text"
              ref={peerIdInputRef}
              placeholder="Enter peer ID to call..."
              value={remotePeerId}
              onChange={(e) => setRemotePeerId(e.target.value)}
              className="peer-input"
              onKeyPress={(e) => e.key === 'Enter' && handleCallPeer()}
            />
            <button
              onClick={handleCallPeer}
              className="call-btn"
              disabled={!remotePeerId}
            >
              📞 Call
            </button>
          </div>

          <div className={`status ${getStatusColor()}`}>
            Status: <strong>{connectionStatus.toUpperCase()}</strong>
          </div>

          {connectionStatus === 'connected' && (
            <button onClick={handleDisconnect} className="disconnect-btn">
              ❌ Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="video-grid">
        <div className="video-container local">
          <div className="video-label">You (Local)</div>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video"
          />
          <canvas
            ref={localCanvasRef}
            className="canvas"
            width={1280}
            height={720}
          />
        </div>

        <div className="video-container remote">
          <div className="video-label">Remote Peer</div>
          {connectionStatus === 'connected' ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="video"
              />
            </>
          ) : (
            <div className="placeholder">
              {connectionStatus === 'calling' ? 'Calling...' : 'Waiting for connection'}
            </div>
          )}
          <canvas
            ref={remoteCanvasRef}
            className="canvas"
            width={640}
            height={480}
          />
        </div>
      </div>

      {/* Translation Panel */}
      <div className="translation-panel">
        <div className="signs-display">
          <h3>Recognized Signs</h3>
          <div className="signs-list">
            {recognizedSigns.length > 0 ? (
              recognizedSigns.map((sign, i) => (
                <div key={i} className="sign-badge">
                  {sign.signName} ({(sign.confidence * 100).toFixed(0)}%)
                </div>
              ))
            ) : (
              <p className="empty">No signs recognized yet...</p>
            )}
          </div>
        </div>

        <div className="translation-display">
          <h3>Translation</h3>
          <p className="translation-text">
            {translatedText || 'Waiting for sign input...'}
          </p>
        </div>
      </div>
    </div>
  )
}
