"use client";

import { useState, useCallback } from "react";
import type { Product } from "../services/recommendation-service";

interface RecommendationApiResponse {
  success: boolean;
  products: Product[];
  category: string;
  reason: string;
  timestamp: string;
}

interface UseRecommendationsReturn {
  recommendations: Record<string, Product[]>;
  isLoading: boolean;
  error: string | null;
  getRecommendations: (category: string, userEmail: string) => Promise<void>;
  refreshRecommendations: (userEmail: string) => Promise<void>;
  clearRecommendations: () => void;
}

export function useRecommendations(
  userEmail: string
): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<
    Record<string, Product[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(
    async (category: string, email: string) => {
      if (!email) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email, category, limit: 6 }),
        });

        const data: RecommendationApiResponse = await res.json();

        if (!data.success) throw new Error("API error");

        setRecommendations((prev) => ({
          ...prev,
          [category]: data.products,
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch recommendations"
        );
        // Set empty array for failed category to prevent infinite loading
        setRecommendations((prev) => ({
          ...prev,
          [category]: [],
        }));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshRecommendations = useCallback(async (email: string) => {
    if (!email) return;

    const categories = ["digital", "clothes", "food"];
    setIsLoading(true);
    setError(null);

    try {
      const promises = categories.map((category) =>
        fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email, category, limit: 6 }),
        }).then((r) => r.json() as Promise<RecommendationApiResponse>)
      );

      const responses = await Promise.allSettled(promises);
      const newRecommendations: Record<string, Product[]> = {};

      responses.forEach((result, index) => {
        if (
          result.status === "fulfilled" &&
          (result.value as RecommendationApiResponse).success
        ) {
          newRecommendations[categories[index]] = (
            result.value as RecommendationApiResponse
          ).products;
        }
      });

      setRecommendations(newRecommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh recommendations"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations({});
    setError(null);
  }, []);

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
  };
}
