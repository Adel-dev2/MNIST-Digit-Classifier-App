"""
FastAPI backend for MNIST digit classification.
This script creates a REST API that accepts image data and returns predictions.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import base64
from PIL import Image
import io
import uvicorn

# Initialize FastAPI app
app = FastAPI(title="MNIST Digit Classifier", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the model
model = None

class ImageData(BaseModel):
    image: str  # Base64 encoded image data

class PredictionResponse(BaseModel):
    predicted_digit: int
    confidence: float
    probabilities: list[float]

def load_model():
    """Load the trained MNIST model"""
    global model
    try:
        model = tf.keras.models.load_model('mnist_model.h5')
        print("[v0] Model loaded successfully")
    except Exception as e:
        print(f"[v0] Error loading model: {e}")
        print("[v0] Please run setup_model.py first to create the model")

def preprocess_image(image_data: str) -> np.ndarray:
    """
    Preprocess the base64 image data for model prediction
    """
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to grayscale if needed
        if image.mode != 'L':
            image = image.convert('L')
        
        # Resize to 28x28 (MNIST standard)
        image = image.resize((28, 28), Image.Resampling.LANCZOS)
        
        # Convert to numpy array and normalize
        image_array = np.array(image, dtype=np.float32)
        
        # Invert colors (MNIST expects white digits on black background)
        image_array = 255 - image_array
        
        # Normalize to 0-1 range
        image_array = image_array / 255.0
        
        # Reshape for model input (batch_size, height, width, channels)
        image_array = image_array.reshape(1, 28, 28, 1)
        
        return image_array
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "MNIST Digit Classifier API is running"}

@app.get("/health")
async def health_check():
    """Health check with model status"""
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_digit(data: ImageData):
    """
    Predict digit from base64 encoded image
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Preprocess the image
        processed_image = preprocess_image(data.image)
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        probabilities = predictions[0].tolist()
        
        # Get predicted digit and confidence
        predicted_digit = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))
        
        print(f"[v0] Predicted digit: {predicted_digit}, Confidence: {confidence:.4f}")
        
        return PredictionResponse(
            predicted_digit=predicted_digit,
            confidence=confidence,
            probabilities=probabilities
        )
        
    except Exception as e:
        print(f"[v0] Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    print("[v0] Starting FastAPI server...")
    print("[v0] Make sure to run setup_model.py first if you haven't created the model yet")
    uvicorn.run(app, host="0.0.0.0", port=8000)
