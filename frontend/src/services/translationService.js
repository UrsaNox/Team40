/**
 * Backend Translation Service
 * Communicates with FastAPI backend for sign↔text translation
 */

import axios from 'axios';

class TranslationService {
  constructor() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    this.apiClient = axios.create({
      baseURL: this.backendUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Send recognized sign to backend for text conversion
   * @param {Number} signId - ID of recognized sign
   * @param {Number} confidence - Confidence score (0-1)
   * @param {String} context - Optional context for better translation
   * @returns {Promise<Object>} Text translation result
   */
  async signToText(signId, confidence, context = '') {
    try {
      const response = await this.apiClient.post('/api/sign-to-text', {
        sign_id: signId,
        confidence: confidence,
        context: context
      });
      return response.data;
    } catch (err) {
      console.error('Sign to text error:', err);
      throw err;
    }
  }

  /**
   * Send text to backend for sign pose sequence generation
   * @param {String} text - Text to convert to sign
   * @returns {Promise<Object>} Pose sequence data
   */
  async textToSign(text) {
    try {
      const response = await this.apiClient.post('/api/text-to-sign', {
        text: text
      });
      return response.data;
    } catch (err) {
      console.error('Text to sign error:', err);
      throw err;
    }
  }

  /**
   * Batch convert multiple signs to text
   * @param {Array<Object>} signs - Array of {signId, confidence}
   * @returns {Promise<Array>} Text translations
   */
  async batchSignToText(signs) {
    try {
      const response = await this.apiClient.post('/api/batch-sign-to-text', {
        signs: signs
      });
      return response.data;
    } catch (err) {
      console.error('Batch sign to text error:', err);
      throw err;
    }
  }

  /**
   * Health check to verify backend is running
   * @returns {Promise<Boolean>}
   */
  async healthCheck() {
    try {
      const response = await this.apiClient.get('/api/health');
      return response.status === 200;
    } catch (err) {
      console.error('Backend health check failed:', err);
      return false;
    }
  }

  /**
   * Set backend URL
   * @param {String} url - New backend URL
   */
  setBackendUrl(url) {
    this.backendUrl = url;
    this.apiClient.defaults.baseURL = url;
  }

  /**
   * Get backend URL
   * @returns {String}
   */
  getBackendUrl() {
    return this.backendUrl;
  }
}

export default new TranslationService();
