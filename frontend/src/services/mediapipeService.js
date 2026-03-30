/**
 * MediaPipe Holistic Service
 * Extracts pose, hand, and facial landmarks for sign language recognition
 */

import { Holistic, HAND_CONNECTIONS, POSE_CONNECTIONS, FACEMESH_CONNECTIONS } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

class MediaPipeService {
  constructor() {
    this.holistic = null;
    this.camera = null;
    this.inputImage = null;
    this.canvasElement = null;
    this.canvasCtx = null;
    
    // Landmark data storage
    this.currentLandmarks = null;
    
    // Callbacks
    this.onLandmarksDetected = null;
  }

  /**
   * Initialize MediaPipe Holistic detector
   * @param {HTMLCanvasElement} canvas - Canvas element for drawing
   * @param {Object} options - Configuration options
   */
  async initialize(canvas, options = {}) {
    this.canvasElement = canvas;
    this.canvasCtx = canvas.getContext('2d');

    this.holistic = new Holistic({
      locateFile: (file) => {
        // Provide path to MediaPipe models
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }
    });

    this.holistic.setOptions({
      staticImageMode: options.staticImageMode || false,
      modelComplexity: options.modelComplexity || 1, // 0, 1
      smoothLandmarks: options.smoothLandmarks !== undefined ? options.smoothLandmarks : true,
      enableSegmentation: options.enableSegmentation || false,
      refineFaceLandmarks: options.refineFaceLandmarks || false,
      minDetectionConfidence: options.minDetectionConfidence || 0.5,
      minTrackingConfidence: options.minTrackingConfidence || 0.5
    });

    this.holistic.onResults(this._onResults.bind(this));

    return Promise.resolve();
  }

  /**
   * Start capturing from webcam
   * @param {HTMLVideoElement} videoElement - Video element to stream to
   */
  async startCapture(videoElement) {
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        await this.holistic.send({ image: videoElement });
      },
      width: videoElement.width || 1280,
      height: videoElement.height || 720
    });

    this.camera.start();
  }

  /**
   * Stop capturing
   */
  stopCapture() {
    if (this.camera) {
      this.camera.stop();
    }
  }

  /**
   * Internal callback for MediaPipe results
   * @private
   */
  _onResults(results) {
    // Clear canvas
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Draw pose connections
    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      drawConnectors(
        this.canvasCtx,
        results.poseLandmarks,
        POSE_CONNECTIONS,
        { color: '#00FF00', lineWidth: 2 }
      );
      drawLandmarks(
        this.canvasCtx,
        results.poseLandmarks,
        { color: '#FF0000', lineWidth: 1, radius: 2 }
      );
    }

    // Draw hand connections
    if (results.leftHandLandmarks && results.leftHandLandmarks.length > 0) {
      drawConnectors(
        this.canvasCtx,
        results.leftHandLandmarks,
        HAND_CONNECTIONS,
        { color: '#00FFFF', lineWidth: 2 }
      );
      drawLandmarks(
        this.canvasCtx,
        results.leftHandLandmarks,
        { color: '#FFFF00', lineWidth: 1, radius: 1 }
      );
    }

    if (results.rightHandLandmarks && results.rightHandLandmarks.length > 0) {
      drawConnectors(
        this.canvasCtx,
        results.rightHandLandmarks,
        HAND_CONNECTIONS,
        { color: '#00FFFF', lineWidth: 2 }
      );
      drawLandmarks(
        this.canvasCtx,
        results.rightHandLandmarks,
        { color: '#FFFF00', lineWidth: 1, radius: 1 }
      );
    }

    // Draw face mesh (optional, less important for sign lang)
    if (results.faceLandmarks && results.faceLandmarks.length > 0 && false) {
      drawConnectors(
        this.canvasCtx,
        results.faceLandmarks,
        FACEMESH_CONNECTIONS,
        { color: '#FF00FF', lineWidth: 1 }
      );
    }

    // Extract and normalize landmarks
    this.currentLandmarks = this._extractNormalizedLandmarks(results);

    // Trigger callback
    if (this.onLandmarksDetected) {
      this.onLandmarksDetected(this.currentLandmarks, results);
    }
  }

  /**
   * Extract and normalize landmark data
   * @private
   * @returns {Object} Normalized landmarks
   */
  _extractNormalizedLandmarks(results) {
    const landmarks = {
      pose: [],
      leftHand: [],
      rightHand: [],
      face: []
    };

    // Extract pose landmarks (33 landmarks, 3D coordinates)
    if (results.poseLandmarks) {
      landmarks.pose = results.poseLandmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility || 0
      }));
    }

    // Extract hand landmarks (21 landmarks each)
    if (results.leftHandLandmarks) {
      landmarks.leftHand = results.leftHandLandmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z
      }));
    }

    if (results.rightHandLandmarks) {
      landmarks.rightHand = results.rightHandLandmarks.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z
      }));
    }

    // Extract key facial landmarks for expression (optional)
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      // Extract just a few key points (eyes, mouth, etc.)
      const keyIndices = [33, 133, 263, 362]; // Eyes and corners
      landmarks.face = keyIndices
        .filter(i => i < results.faceLandmarks.length)
        .map(i => ({
          x: results.faceLandmarks[i].x,
          y: results.faceLandmarks[i].y,
          z: results.faceLandmarks[i].z
        }));
    }

    return landmarks;
  }

  /**
   * Convert landmarks to flat array for ML model input
   * Concatenates pose + hand + face landmarks into a single vector
   * @returns {Array} Flattened landmark array
   */
  getLandmarkVector() {
    if (!this.currentLandmarks) return null;

    const vector = [];

    // Flatten pose (33 * 4 = 132 values)
    this.currentLandmarks.pose.forEach(lm => {
      vector.push(lm.x, lm.y, lm.z, lm.visibility);
    });

    // Flatten left hand (21 * 3 = 63 values)
    this.currentLandmarks.leftHand.forEach(lm => {
      vector.push(lm.x, lm.y, lm.z);
    });

    // Flatten right hand (21 * 3 = 63 values)
    this.currentLandmarks.rightHand.forEach(lm => {
      vector.push(lm.x, lm.y, lm.z);
    });

    // Flatten face (4 * 3 = 12 values)
    this.currentLandmarks.face.forEach(lm => {
      vector.push(lm.x, lm.y, lm.z);
    });

    return vector;
  }

  /**
   * Get current normalized landmarks
   * @returns {Object} Current landmarks
   */
  getLandmarks() {
    return this.currentLandmarks;
  }

  /**
   * Check if pose is visible (confidence check)
   * @returns {Boolean}
   */
  isPoseVisible() {
    if (!this.currentLandmarks || !this.currentLandmarks.pose.length) {
      return false;
    }
    // Check if at least 50% of pose landmarks are visible
    const visibleCount = this.currentLandmarks.pose.filter(lm => lm.visibility > 0.5).length;
    return visibleCount > this.currentLandmarks.pose.length * 0.5;
  }

  /**
   * Close and cleanup
   */
  close() {
    this.stopCapture();
    if (this.holistic) {
      this.holistic.close();
    }
  }
}

export default new MediaPipeService();
