"""
Setup script to create a sample MNIST model for demonstration.
This creates a simple CNN model that can be used with the FastAPI backend.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import pickle
import os

def create_sample_mnist_model():
    """Create and train a simple MNIST model for demonstration"""
    print("[v0] Loading MNIST dataset...")
    
    # Load MNIST dataset
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    
    # Normalize pixel values
    x_train = x_train.astype('float32') / 255.0
    x_test = x_test.astype('float32') / 255.0
    
    # Reshape for CNN
    x_train = x_train.reshape(-1, 28, 28, 1)
    x_test = x_test.reshape(-1, 28, 28, 1)
    
    print("[v0] Creating model architecture...")
    
    # Create a simple CNN model
    model = keras.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(10, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("[v0] Training model (this may take a few minutes)...")
    
    # Train model (reduced epochs for demo)
    history = model.fit(
        x_train, y_train,
        epochs=3,
        batch_size=128,
        validation_split=0.1,
        verbose=1
    )
    
    # Evaluate model
    test_loss, test_accuracy = model.evaluate(x_test, y_test, verbose=0)
    print(f"[v0] Test accuracy: {test_accuracy:.4f}")
    
    # Save model
    model.save('mnist_model.h5')
    print("[v0] Model saved as mnist_model.h5")
    
    return model

if __name__ == "__main__":
    create_sample_mnist_model()
