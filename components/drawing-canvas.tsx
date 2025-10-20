"use client"

import { useRef, useEffect, useState, useCallback } from "react"

interface DrawingCanvasProps {
  onDrawingChange?: (imageData: string) => void
  className?: string
}

export function DrawingCanvas({ onDrawingChange, className = "" }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null)

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 280
    canvas.height = 280

    // Set drawing styles
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 8
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  useEffect(() => {
    setupCanvas()
  }, [setupCanvas])

  const getCanvasPosition = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }
  }

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const position = getCanvasPosition(e)
    setLastPosition(position)
  }

  const draw = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !lastPosition) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const currentPosition = getCanvasPosition(e)

    ctx.beginPath()
    ctx.moveTo(lastPosition.x, lastPosition.y)
    ctx.lineTo(currentPosition.x, currentPosition.y)
    ctx.stroke()

    setLastPosition(currentPosition)

    // Emit canvas data change
    if (onDrawingChange) {
      const imageData = canvas.toDataURL("image/png")
      onDrawingChange(imageData)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPosition(null)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (onDrawingChange) {
      const imageData = canvas.toDataURL("image/png")
      onDrawingChange(imageData)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Mouse events
    const handleMouseDown = (e: MouseEvent) => startDrawing(e)
    const handleMouseMove = (e: MouseEvent) => draw(e)
    const handleMouseUp = () => stopDrawing()
    const handleMouseLeave = () => stopDrawing()

    // Touch events
    const handleTouchStart = (e: TouchEvent) => startDrawing(e)
    const handleTouchMove = (e: TouchEvent) => draw(e)
    const handleTouchEnd = () => stopDrawing()

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchmove", handleTouchMove)
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseLeave)

      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDrawing, lastPosition])

  return {
    canvas: (
      <canvas
        ref={canvasRef}
        className={`border-2 border-border rounded-lg bg-white cursor-crosshair touch-none ${className}`}
        style={{ width: "100%", height: "100%", maxWidth: "280px", maxHeight: "280px" }}
      />
    ),
    clearCanvas,
  }
}
