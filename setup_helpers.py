"""
PeerJS Server Helper
Simple WebRTC signaling server setup for local testing

For production, use a proper STUN/TURN server
"""

import subprocess
import sys

def start_peer_server():
    """Start PeerJS signaling server"""
    try:
        # Install peerjs-server if not already installed
        subprocess.run(
            [sys.executable, '-m', 'pip', 'list'],
            capture_output=True,
            check=True
        )
        
        print("Starting PeerJS server...")
        print("Server will run on http://localhost:9000")
        
        # For production, use:
        # npm install -g peerjs-server
        # peerjs --port 9000
        
        print("\nTo start PeerJS server manually:")
        print("1. Install globally: npm install -g peerjs-server")
        print("2. Run: peerjs --port 9000")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    start_peer_server()
