"""
Train LSTM model for sign language recognition

Usage:
    python train.py --epochs 50 --batch-size 32 --data-dir data/

This script:
1. Loads extracted landmark data from data/
2. Builds LSTM model
3. Trains on pose sequences
4. Evaluates on test set
5. Saves model to models/lstm_model.h5
"""

import os
import json
import argparse
import numpy as np
from pathlib import Path

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    import matplotlib.pyplot as plt
except ImportError as e:
    print(f"Please install required packages: pip install -r requirements.txt")
    exit(1)

# Configuration
SEQUENCE_LENGTH = 30  # Frames per sequence
LANDMARK_FEATURES = 1662  # Pose(132) + LeftHand(63) + RightHand(63) + Face(12) + extras
NUM_SIGNS = 10  # Number of sign classes

def build_lstm_model(num_signs=NUM_SIGNS):
    """Build LSTM model for sign recognition"""
    model = keras.Sequential([
        # Input layer: (sequence_length, landmark_features)
        layers.Input(shape=(SEQUENCE_LENGTH, LANDMARK_FEATURES)),
        
        # First LSTM layer
        layers.LSTM(128, return_sequences=True, activation='relu'),
        layers.Dropout(0.2),
        
        # Second LSTM layer
        layers.LSTM(64, activation='relu'),
        layers.Dropout(0.2),
        
        # Dense layers
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.1),
        
        # Output layer
        layers.Dense(num_signs, activation='softmax')
    ])
    
    return model

def load_data(data_dir='data/', test_split=0.2):
    """Load extracted landmark data"""
    print(f"Loading data from {data_dir}...")
    
    X_list = []
    y_list = []
    
    # Example: Load from numpy files (you need to create these first)
    # For testing, generate dummy data
    
    for sign_id in range(NUM_SIGNS):
        for seq_id in range(10):  # 10 sequences per sign
            # Dummy data: (sequence_length, landmark_features)
            sequence = np.random.randn(SEQUENCE_LENGTH, LANDMARK_FEATURES).astype(np.float32)
            X_list.append(sequence)
            y_list.append(sign_id)
    
    X = np.array(X_list)
    y = np.array(y_list)
    
    print(f"Data shape: {X.shape}, Labels shape: {y.shape}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_split, random_state=42, stratify=y
    )
    
    return (X_train, y_train), (X_test, y_test)

def train_model(epochs=50, batch_size=32, data_dir='data/'):
    """Train the LSTM model"""
    
    # Load data
    (X_train, y_train), (X_test, y_test) = load_data(data_dir)
    
    # Normalize input data
    print("Normalizing data...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train.reshape(-1, LANDMARK_FEATURES)).reshape(X_train.shape)
    X_test_scaled = scaler.transform(X_test.reshape(-1, LANDMARK_FEATURES)).reshape(X_test.shape)
    
    # Build model
    print("Building model...")
    model = build_lstm_model(num_signs=10)
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print(model.summary())
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-6
        ),
        keras.callbacks.ModelCheckpoint(
            'models/best_model.h5',
            monitor='val_accuracy',
            save_best_only=True
        )
    ]
    
    # Train
    print("Training model...")
    history = model.fit(
        X_train_scaled, y_train,
        batch_size=batch_size,
        epochs=epochs,
        validation_split=0.2,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate
    print("Evaluating model...")
    test_loss, test_acc = model.evaluate(X_test_scaled, y_test, verbose=0)
    print(f"Test accuracy: {test_acc:.4f}")
    
    # Save model
    os.makedirs('models', exist_ok=True)
    model.save('models/lstm_model.h5')
    print(f"Model saved to models/lstm_model.h5")
    
    # Save scaler
    import pickle
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    # Plot training history
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.title('Model Loss')
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.title('Model Accuracy')
    
    os.makedirs('output', exist_ok=True)
    plt.savefig('output/training_history.png')
    print("Training plots saved to output/training_history.png")
    
    return model

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train LSTM sign recognition model')
    parser.add_argument('--epochs', type=int, default=50, help='Number of epochs')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--data-dir', type=str, default='data/', help='Data directory')
    
    args = parser.parse_args()
    
    model = train_model(
        epochs=args.epochs,
        batch_size=args.batch_size,
        data_dir=args.data_dir
    )
    
    print("\nTraining complete! ✅")
    print("Next step: Export model to TensorFlow.js")
    print("python export_to_tfjs.py --model models/lstm_model.h5")
