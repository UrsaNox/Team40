# ML Training - LSTM Sign Language Model

Training pipeline for the LSTM model that recognizes sign language in real-time.

## Overview

The model:
- Takes **MediaPipe Holistic pose sequences** as input (pose + hand + face landmarks)
- Outputs **sign classification** (which sign is being performed)
- Trained with **LSTM layers** for temporal/sequential understanding
- Converts to **TensorFlow.js format** for browser deployment

## Setup

```bash
pip install -r requirements.txt
```

## Data Preparation

Create a dataset directory:
```
data/
├── sign_1/
│   ├── video_1.mp4
│   ├── video_2.mp4
│   └── ...
├── sign_2/
│   ├── video_1.mp4
│   └── ...
└── ...
```

Extract pose landmarks from videos:
```bash
python extract_landmarks.py --data-dir data/
```

## Training

```bash
python train.py --epochs 50 --batch-size 32
```

This will:
1. Load extracted landmark data
2. Create LSTM model architecture
3. Train on pose sequences
4. Evaluate on test set
5. Save model to `models/lstm_model.h5`

## Model Export

Convert to TensorFlow.js format for browser:
```bash
python export_to_tfjs.py --model models/lstm_model.h5 --output ../frontend/public/models/
```

## Project Structure

```
├── train.py              # Main training script
├── extract_landmarks.py  # Extract poses from videos using MediaPipe
├── export_to_tfjs.py     # Convert Keras model to TensorFlow.js
├── models/
│   └── lstm_model.py     # Model architecture definition
├── data/                 # Dataset directory (not in repo)
├── output/               # Training outputs (checkpoints, metrics)
└── requirements.txt
```

## Model Architecture

```
Input Layer (Pose Sequence)
    ↓
LSTM Layer 1 (128 units, return_sequences=True)
    ↓
Dropout (0.2)
    ↓
LSTM Layer 2 (64 units)
    ↓
Dropout (0.2)
    ↓
Dense Layer (32 units, ReLU)
    ↓
Output Layer (num_signs classes, Softmax)
```

## Hyperparameters

- **Sequence Length**: 30 frames (1 second @ 30 FPS)
- **Landmark Features**: 1662 (543 landmarks × 3 coordinates)
- **Batch Size**: 32
- **Learning Rate**: 0.001 (Adam optimizer)
- **Epochs**: 50
- **Validation Split**: 0.2

## Performance Metrics

After training, check:
- `output/training_history.png` - Loss/accuracy curves
- `output/confusion_matrix.png` - Per-sign accuracy
- `output/metrics.json` - Detailed performance stats

## Troubleshooting

**GPU not detected?**
```bash
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```

**Out of memory?**
Reduce batch size in `train.py`

**Poor accuracy?**
- Collect more diverse training data
- Increase sequence length
- Train for more epochs
