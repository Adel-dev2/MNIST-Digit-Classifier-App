"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Eraser, Zap } from "lucide-react"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { PredictionDisplay } from "@/components/prediction-display"
import { MNISTApiService } from "@/lib/api"

interface PredictionResult {
  predicted_digit: number
  confidence: number
  probabilities: number[]
}

export default function MNISTClassifier() {
  const [currentDrawing, setCurrentDrawing] = useState<string>("")
  const [canvasClearFunction, setCanvasClearFunction] = useState<(() => void) | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { canvas, clearCanvas } = DrawingCanvas({
    onDrawingChange: handleDrawingChange,
    className: "w-full h-full",
  })

  useEffect(() => {
    setCanvasClearFunction(() => clearCanvas)
  }, [clearCanvas])

  function handleDrawingChange(imageData: string) {
    setCurrentDrawing(imageData)
    if (prediction) {
      setPrediction(null)
      setError(null)
    }
  }

  const handleClearCanvas = () => {
    if (canvasClearFunction) {
      canvasClearFunction()
      setCurrentDrawing("")
      setPrediction(null)
      setError(null)
    }
  }

  const handlePredict = async () => {
    if (!currentDrawing) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First check if the backend is healthy
      const healthCheck = await MNISTApiService.healthCheck()

      if (!healthCheck.model_loaded) {
        throw new Error("Model is not loaded on the backend. Please run the setup_model.py script first.")
      }

      // Make the actual prediction
      const result = await MNISTApiService.predictDigit(currentDrawing)

      setPrediction(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to predict digit"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">MNIST Digit Classifier</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Draw a digit (0-9) in the canvas below and watch our AI model predict what you've drawn in real-time!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Drawing Canvas Section */}
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Drawing Canvas
              </CardTitle>
              <CardDescription>Draw a single digit clearly in the center of the canvas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full aspect-square flex items-center justify-center">{canvas}</div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleClearCanvas}>
                  <Eraser className="h-4 w-4 mr-2" />
                  Clear Canvas
                </Button>
                <Button className="flex-1" onClick={handlePredict} disabled={!currentDrawing || isLoading}>
                  {isLoading ? "Predicting..." : "Predict Digit"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Results Section */}
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Prediction Results
              </CardTitle>
              <CardDescription>Real-time classification results with confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionDisplay prediction={prediction} isLoading={isLoading} error={error} />
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 border border-border">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold">Draw a Digit</h3>
                <p className="text-sm text-muted-foreground">
                  Use your mouse or finger to draw a single digit (0-9) in the canvas
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold">Get Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI model will analyze your drawing and predict the digit
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold">View Results</h3>
                <p className="text-sm text-muted-foreground">
                  See the predicted digit and confidence scores for all possibilities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
