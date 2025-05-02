"use client"

import { useState } from "react"
import { processFlavorSubmission } from "@/app/actions/flavor-moderation"

export function useFlavorSubmission() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const submitFlavor = async (flavorId: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const analysisResult = await processFlavorSubmission(flavorId)
      setResult(analysisResult)
      return analysisResult
    } catch (err) {
      console.error("Error processing flavor submission:", err)
      setError(err.message || "Failed to process flavor submission")
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    submitFlavor,
    isProcessing,
    result,
    error,
    isAutoApproved: result?.autoApproved || false,
  }
}
