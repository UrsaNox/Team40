"""
Export trained Keras model to TensorFlow.js format

Usage:
    python export_to_tfjs.py --model models/lstm_model.h5 --output ../frontend/public/models/
"""

import os
import argparse
import json

try:
    import tensorflowjs as tfjs
    from tensorflow import keras
except ImportError:
    print("Please install tensorflowjs: pip install tensorflowjs")
    exit(1)

def export_model(model_path, output_dir):
    """Export Keras model to TensorFlow.js format"""
    
    if not os.path.exists(model_path):
        print(f"Model not found: {model_path}")
        return False
    
    print(f"Loading model from {model_path}...")
    model = keras.models.load_model(model_path)
    
    print(f"Exporting to TensorFlow.js format...")
    print(f"Output directory: {output_dir}")
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert to TensorFlow.js
    tfjs.converters.save_keras_model(model, output_dir)
    
    print(f"✅ Model exported successfully!")
    print(f"Files created:")
    print(f"  - {output_dir}/model.json (model topology)")
    print(f"  - {output_dir}/weights.bin (model weights)")
    
    # Create metadata
    metadata = {
        "model_name": "sign_recognition_lstm",
        "sequence_length": 30,
        "landmark_features": 1662,
        "num_signs": 10,
        "signs": [
            "hello", "goodbye", "thank_you", "yes", "no",
            "water", "food", "happy", "sad", "help"
        ]
    }
    
    with open(os.path.join(output_dir, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"  - {output_dir}/metadata.json (metadata)")
    
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Export Keras model to TensorFlow.js')
    parser.add_argument('--model', type=str, required=True, help='Path to Keras model (.h5)')
    parser.add_argument('--output', type=str, required=True, help='Output directory for TensorFlow.js files')
    
    args = parser.parse_args()
    
    success = export_model(args.model, args.output)
    
    if success:
        print("\n📱 Model is now ready for browser deployment!")
        print("Load in frontend with:")
        print("  await tfjsService.loadModel('models/model.json', labels)")
