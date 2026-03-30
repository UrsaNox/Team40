/**
 * TensorFlow.js Sign Language Recognition Service
 * Loads and runs LSTM model for real-time sign inference
 */

import * as tf from '@tensorflow/tfjs';

class TFJSService {
  constructor() {
    this.model = null;
    this.modelReady = false;
    this.sequenceBuffer = [];
    this.sequenceLength = 30; // Number of frames to accumulate
    this.signLabels = []; // Mapping of class indices to sign names
  }

  /**
   * Load pre-trained LSTM model
   * @param {String} modelPath - Path to model.json file
   * @param {Array} labels - Array of sign labels
   */
  async loadModel(modelPath, labels) {
    try {
      this.model = await tf.loadLayersModel(modelPath);
      this.signLabels = labels;
      this.modelReady = true;
      console.log('TensorFlow.js model loaded successfully');
      console.log('Model summary:', this.model.summary());
      return true;
    } catch (err) {
      console.error('Failed to load model:', err);
      this.modelReady = false;
      throw err;
    }
  }

  /**
   * Add landmark vector to sequence buffer
   * @param {Array} landmarkVector - Flattened landmark array from MediaPipe
   */
  addToSequence(landmarkVector) {
    if (!landmarkVector) return;

    // Convert to tensor and normalize
    const tensorData = tf.tensor(landmarkVector, [1, landmarkVector.length]);
    
    this.sequenceBuffer.push(tensorData);

    // Keep buffer size fixed
    if (this.sequenceBuffer.length > this.sequenceLength) {
      const removed = this.sequenceBuffer.shift();
      removed.dispose(); // Clean up disposed tensor
    }
  }

  /**
   * Get sequence buffer size
   */
  getBufferSize() {
    return this.sequenceBuffer.length;
  }

  /**
   * Check if buffer is ready for inference
   */
  isReady() {
    return this.sequenceBuffer.length === this.sequenceLength;
  }

  /**
   * Perform sign recognition inference
   * @returns {Object} Prediction result with sign and confidence
   */
  async predict() {
    if (!this.modelReady) {
      throw new Error('Model not loaded');
    }

    if (!this.isReady()) {
      return null; // Not enough frames yet
    }

    return tf.tidy(() => {
      try {
        // Stack buffered frames into single tensor
        // Shape: (sequenceLength, landmarkFeatures)
        const sequenceTensor = tf.stack(this.sequenceBuffer);
        
        // Add batch dimension: (1, sequenceLength, landmarkFeatures)
        const batchTensor = sequenceTensor.expandDims(0);

        // Run inference
        const predictions = this.model.predict(batchTensor);
        
        // Get the prediction data
        const predictionsData = predictions.dataSync();
        const classScores = Array.from(predictionsData);

        // Find top prediction
        const maxScore = Math.max(...classScores);
        const classIndex = classScores.indexOf(maxScore);

        // Create result
        const result = {
          signId: classIndex,
          signName: this.signLabels[classIndex] || `Sign ${classIndex}`,
          confidence: maxScore,
          allPredictions: classScores.map((score, i) => ({
            signId: i,
            signName: this.signLabels[i] || `Sign ${i}`,
            confidence: score
          }))
        };

        return result;
      } catch (err) {
        console.error('Inference error:', err);
        throw err;
      }
    });
  }

  /**
   * Clear sequence buffer
   */
  clearBuffer() {
    this.sequenceBuffer.forEach(tensor => tensor.dispose());
    this.sequenceBuffer = [];
  }

  /**
   * Reset model state
   */
  reset() {
    this.clearBuffer();
  }

  /**
   * Get model info
   */
  getModelInfo() {
    if (!this.model) return null;
    return {
      modelReady: this.modelReady,
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape,
      totalParams: this.model.countParams(),
      sequenceLength: this.sequenceLength,
      labels: this.signLabels
    };
  }

  /**
   * Cleanup
   */
  dispose() {
    this.clearBuffer();
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.modelReady = false;
  }
}

export default new TFJSService();
