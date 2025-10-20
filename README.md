# MNIST Digit Classifier

A full-stack application for handwritten digit classification using a deep learning model with FastAPI backend and Next.js frontend.

## Features

- **Interactive Drawing Canvas**: Draw digits with mouse or touch input
- **Real-time Predictions**: Get instant classification results with confidence scores
- **Modern UI**: Clean, responsive interface with animated feedback
- **FastAPI Backend**: High-performance API with TensorFlow model integration

## Setup Instructions

### 1. Backend Setup

First, create and train the MNIST model:

\`\`\`bash
# Run the model setup script
python scripts/setup_model.py
\`\`\`

Then start the FastAPI server:

\`\`\`bash
# Start the backend server
python scripts/fastapi_backend.py
\`\`\`

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

The frontend is built with Next.js and will automatically connect to the backend.

### 3. Environment Variables (Optional)

You can customize the API URL by setting:

\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

## Usage

1. **Draw a Digit**: Use the canvas to draw a single digit (0-9)
2. **Get Prediction**: Click "Predict Digit" to classify your drawing
3. **View Results**: See the predicted digit and confidence scores for all possibilities

## API Endpoints

- `GET /health` - Check backend and model status
- `POST /predict` - Submit image for digit classification

## Technical Details

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, TensorFlow/Keras, Python
- **Model**: Convolutional Neural Network trained on MNIST dataset
- **Image Processing**: Canvas-based drawing with automatic preprocessing

## Troubleshooting

- Ensure the FastAPI backend is running on port 8000
- Make sure the model is trained by running `setup_model.py` first
- Check browser console for detailed error messages
