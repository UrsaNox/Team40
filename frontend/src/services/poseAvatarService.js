/**
 * Pose Avatar Service
 * Renders pose landmarks as an animated avatar
 */

class PoseAvatarService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 640;
    this.height = 480;
    
    // Drawing configuration
    this.poseLineColor = '#00FF00';
    this.posePointColor = '#FF0000';
    this.handLineColor = '#00FFFF';
    this.handPointColor = '#FFFF00';
    this.lineWidth = 2;
    this.pointRadius = 4;
    
    // Pose connections (indices of connected joints)
    this.poseConnections = [
      [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 12], [5, 6], [5, 11], [6, 12],
      [5, 7], [7, 9], [6, 8], [8, 10],
      [1, 2], [2, 4], [1, 3], [3, 7]
    ];
    
    // Hand connections
    this.handConnections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
    ];
  }

  /**
   * Initialize canvas
   * @param {HTMLCanvasElement} canvas
   */
  initialize(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width || 640;
    this.height = canvas.height || 480;
  }

  /**
   * Render pose from landmarks
   * @param {Object} landmarks - Normalized landmarks from MediaPipe
   */
  renderPose(landmarks) {
    if (!this.ctx) {
      console.error('Canvas not initialized');
      return;
    }

    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!landmarks) return;

    // Draw pose
    if (landmarks.pose && landmarks.pose.length > 0) {
      this._drawConnections(
        landmarks.pose,
        this.poseConnections,
        this.poseLineColor,
        this.lineWidth
      );
      this._drawPoints(landmarks.pose, this.posePointColor, this.pointRadius);
    }

    // Draw hands
    if (landmarks.leftHand && landmarks.leftHand.length > 0) {
      this._drawConnections(
        landmarks.leftHand,
        this.handConnections,
        this.handLineColor,
        this.lineWidth
      );
      this._drawPoints(landmarks.leftHand, this.handPointColor, this.pointRadius);
    }

    if (landmarks.rightHand && landmarks.rightHand.length > 0) {
      this._drawConnections(
        landmarks.rightHand,
        this.handConnections,
        this.handLineColor,
        this.lineWidth
      );
      this._drawPoints(landmarks.rightHand, this.handPointColor, this.pointRadius);
    }
  }

  /**
   * Draw lines between connected points
   * @private
   */
  _drawConnections(points, connections, color, lineWidth) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;

    connections.forEach(([start, end]) => {
      if (start < points.length && end < points.length) {
        const startPoint = points[start];
        const endPoint = points[end];

        if (startPoint && endPoint) {
          this.ctx.beginPath();
          this.ctx.moveTo(startPoint.x * this.width, startPoint.y * this.height);
          this.ctx.lineTo(endPoint.x * this.width, endPoint.y * this.height);
          this.ctx.stroke();
        }
      }
    });
  }

  /**
   * Draw points as circles
   * @private
   */
  _drawPoints(points, color, radius) {
    this.ctx.fillStyle = color;

    points.forEach(point => {
      if (point) {
        const x = point.x * this.width;
        const y = point.y * this.height;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    });
  }

  /**
   * Animate pose sequence (for replaying text-to-sign)
   * @param {Array<Object>} poseSequence - Array of pose landmark sets
   * @param {Number} fps - Frames per second (default 30)
   * @returns {Promise}
   */
  async animatePoseSequence(poseSequence, fps = 30) {
    if (!poseSequence || poseSequence.length === 0) {
      return;
    }

    const frameDuration = 1000 / fps;

    for (let i = 0; i < poseSequence.length; i++) {
      const startTime = performance.now();
      
      this.renderPose(poseSequence[i]);

      const elapsed = performance.now() - startTime;
      const delay = Math.max(0, frameDuration - elapsed);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Clear canvas
   */
  clear() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Set drawing colors
   */
  setColors(poseLineColor, posePointColor, handLineColor, handPointColor) {
    this.poseLineColor = poseLineColor;
    this.posePointColor = posePointColor;
    this.handLineColor = handLineColor;
    this.handPointColor = handPointColor;
  }
}

export default new PoseAvatarService();
