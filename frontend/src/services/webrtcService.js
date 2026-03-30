/**
 * WebRTC Service using PeerJS
 * Handles P2P video call connections between peers
 */

import Peer from 'peerjs';

class WebRTCService {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.call = null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerId = null;
    
    // Event callbacks
    this.onRemoteStream = null;
    this.onRemoteStreamEnd = null;
    this.onConnectionOpen = null;
    this.onConnectionError = null;
    this.onDataMessage = null;
  }

  /**
   * Initialize the peer connection
   * @param {Object} config - Configuration options
   * @returns {String} Your peer ID
   */
  async initialize(config = {}) {
    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        host: config.peerServer || 'localhost',
        port: config.peerPort || 9000,
        path: config.peerPath || '/',
        debug: config.debug || 2,
        ...config
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        console.log('Your Peer ID:', id);
        resolve(id);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        reject(err);
      });

      // Listen for incoming calls
      this.peer.on('call', (incomingCall) => {
        console.log('Incoming call from:', incomingCall.peer);
        this.call = incomingCall;
        
        // Answer with our local stream
        if (this.localStream) {
          incomingCall.answer(this.localStream);
        }

        // Handle the stream
        incomingCall.on('stream', (remoteStream) => {
          this.remoteStream = remoteStream;
          if (this.onRemoteStream) {
            this.onRemoteStream(remoteStream);
          }
        });

        incomingCall.on('error', (err) => {
          console.error('Call error:', err);
          if (this.onConnectionError) {
            this.onConnectionError(err);
          }
        });

        incomingCall.on('close', () => {
          console.log('Call closed');
          if (this.onRemoteStreamEnd) {
            this.onRemoteStreamEnd();
          }
        });
      });

      // Listen for incoming data connections
      this.peer.on('connection', (incomingConn) => {
        console.log('Incoming data connection from:', incomingConn.peer);
        this.conn = incomingConn;
        this._setupDataConnection(incomingConn);
      });
    });
  }

  /**
   * Get local webcam stream
   * @returns {MediaStream}
   */
  async getLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      this.localStream = stream;
      return stream;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      throw err;
    }
  }

  /**
   * Call another peer
   * @param {String} peerId - The ID of the peer to call
   * @returns {Promise}
   */
  async callPeer(peerId) {
    if (!this.localStream) {
      throw new Error('Local stream not initialized. Call getLocalStream() first.');
    }

    return new Promise((resolve, reject) => {
      try {
        const outgoingCall = this.peer.call(peerId, this.localStream);
        this.call = outgoingCall;

        outgoingCall.on('stream', (remoteStream) => {
          this.remoteStream = remoteStream;
          console.log('Received remote stream');
          if (this.onRemoteStream) {
            this.onRemoteStream(remoteStream);
          }
          resolve(remoteStream);
        });

        outgoingCall.on('error', (err) => {
          console.error('Call error:', err);
          reject(err);
        });

        outgoingCall.on('close', () => {
          console.log('Call closed');
          if (this.onRemoteStreamEnd) {
            this.onRemoteStreamEnd();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Send data to peer (for pose, signs, translations, etc.)
   * @param {Object} data - Data to send
   */
  sendData(data) {
    if (!this.conn || !this.conn.open) {
      console.warn('Data connection not open');
      return;
    }
    this.conn.send(data);
  }

  /**
   * Connect to a peer for data communication
   * @param {String} peerId - Peer ID to connect to
   */
  connectToPeer(peerId) {
    return new Promise((resolve, reject) => {
      try {
        const outgoingConn = this.peer.connect(peerId);
        this.conn = outgoingConn;
        this._setupDataConnection(outgoingConn);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Setup data connection listeners
   * @private
   */
  _setupDataConnection(conn) {
    conn.on('open', () => {
      console.log('Data connection opened');
      if (this.onConnectionOpen) {
        this.onConnectionOpen();
      }
    });

    conn.on('data', (data) => {
      if (this.onDataMessage) {
        this.onDataMessage(data);
      }
    });

    conn.on('error', (err) => {
      console.error('Data connection error:', err);
      if (this.onConnectionError) {
        this.onConnectionError(err);
      }
    });

    conn.on('close', () => {
      console.log('Data connection closed');
      this.conn = null;
    });
  }

  /**
   * End call
   */
  endCall() {
    if (this.call) {
      this.call.close();
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }
  }

  /**
   * Disconnect from peer
   */
  disconnect() {
    if (this.conn) {
      this.conn.close();
    }
    this.endCall();
  }

  /**
   * Clean up on page unload
   */
  destroy() {
    this.disconnect();
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }

  /**
   * Get your peer ID
   */
  getPeerId() {
    return this.peerId;
  }

  /**
   * Check if data connection is open
   */
  isConnected() {
    return this.conn && this.conn.open;
  }

  /**
   * Check if call is active
   */
  isCallActive() {
    return this.call && !this.call.closed;
  }
}

export default new WebRTCService();
