interface PredictionRequest {
  image: string
}

interface PredictionResponse {
  predicted_digit: number
  confidence: number
  probabilities: number[]
}

interface ApiError {
  detail: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class MNISTApiService {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorData: ApiError = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          // If we can't parse the error response, use the default message
        }

        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the prediction server. Please ensure the FastAPI backend is running on port 8000.",
        )
      }
      throw error
    }
  }

  static async healthCheck(): Promise<{ status: string; model_loaded: boolean }> {
    return this.makeRequest("/health")
  }

  static async predictDigit(imageData: string): Promise<PredictionResponse> {
    // Remove data URL prefix if present for cleaner base64
    const base64Image = imageData.includes(",") ? imageData.split(",")[1] : imageData

    const requestBody: PredictionRequest = {
      image: base64Image,
    }

    return this.makeRequest("/predict", {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
  }
}
