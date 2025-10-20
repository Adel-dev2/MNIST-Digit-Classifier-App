"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

interface PredictionResult {
  predicted_digit: number
  confidence: number
  probabilities: number[]
}

interface PredictionDisplayProps {
  prediction: PredictionResult | null
  isLoading: boolean
  error: string | null
}

export function PredictionDisplay({ prediction, isLoading, error }: PredictionDisplayProps) {
  const getStatusBadge = () => {
    if (error) {
      return (
        <Badge variant="destructive" className="text-sm">
          Error occurred
        </Badge>
      )
    }

    if (isLoading) {
      return (
        <Badge variant="secondary" className="text-sm">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Analyzing...
        </Badge>
      )
    }

    if (prediction) {
      return (
        <Badge variant="default" className="text-sm bg-primary">
          Confidence: {(prediction.confidence * 100).toFixed(1)}%
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="text-sm">
        Waiting for input
      </Badge>
    )
  }

  const getPredictedDigit = () => {
    if (error) return "!"
    if (isLoading) return "..."
    if (prediction) return prediction.predicted_digit.toString()
    return "?"
  }

  const getDigitColor = () => {
    if (error) return "text-destructive"
    if (isLoading) return "text-muted-foreground"
    if (prediction) return "text-primary"
    return "text-primary"
  }

  return (
    <div className="space-y-6">
      {/* Main prediction display */}
      <div className="text-center space-y-2">
        <div className={`text-6xl font-bold transition-all duration-300 ${getDigitColor()}`}>{getPredictedDigit()}</div>
        {getStatusBadge()}
      </div>

      <Separator />

      {/* Confidence scores for all digits */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Confidence Scores</h4>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 10 }, (_, i) => {
            const probability = prediction?.probabilities[i] || 0
            const percentage = Math.round(probability * 100)
            const isHighest = prediction?.predicted_digit === i

            return (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-md transition-all duration-300 ${
                  isHighest ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                }`}
              >
                <span className={`font-medium ${isHighest ? "text-primary font-bold" : ""}`}>{i}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        isHighest ? "bg-primary" : "bg-muted-foreground"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={`text-xs w-8 ${isHighest ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-center p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
