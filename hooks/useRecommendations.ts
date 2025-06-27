"use client"

import { useState, useCallback } from "react"
import { RecommendationService, type Product } from "../services/recommendation-service"

interface UseRecommendationsReturn {
  recommendations: Record<string, Product[]>
  isLoading: boolean
  error: string | null
  getRecommendations: (category: string, userEmail: string) => Promise<void>
  refreshRecommendations: (userEmail: string) => Promise<void>
  clearRecommendations: () => void
}

export function useRecommendations(userEmail: string): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<Record<string, Product[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRecommendations = useCallback(async (category: string, email: string) => {
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await RecommendationService.getRecommendations({
        userEmail: email,
        category,
        limit: 6,
      })

      setRecommendations((prev) => ({
        ...prev,
        [category]: response.products,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations")
      // Set empty array for failed category to prevent infinite loading
      setRecommendations((prev) => ({
        ...prev,
        [category]: [],
      }))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshRecommendations = useCallback(async (email: string) => {
    if (!email) return

    const categories = ["digital", "clothes", "food"]
    setIsLoading(true)
    setError(null)

    try {
      const promises = categories.map((category) =>
        RecommendationService.getRecommendations({
          userEmail: email,
          category,
          limit: 6,
        }),
      )

      const responses = await Promise.allSettled(promises)
      const newRecommendations: Record<string, Product[]> = {}

      responses.forEach((result, index) => {
        if (result.status === "fulfilled") {
          newRecommendations[categories[index]] = result.value.products
        }
      })

      setRecommendations(newRecommendations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh recommendations")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearRecommendations = useCallback(() => {
    setRecommendations({})
    setError(null)
  }, [])

  // Remove or comment out the auto-loading useEffect:
  // useEffect(() => {
  //   if (userEmail) {
  //     refreshRecommendations(userEmail)
  //   } else {
  //     clearRecommendations()
  //   }
  // }, [userEmail, refreshRecommendations, clearRecommendations])

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
    refreshRecommendations,
    clearRecommendations,
  }
}
