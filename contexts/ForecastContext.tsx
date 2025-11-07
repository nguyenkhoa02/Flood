"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import type { ForecastResult } from "@/lib/api-client"

interface ForecastContextType {
  results: ForecastResult[]
  addResults: (newResults: ForecastResult[]) => void
  clearResults: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined)

export function ForecastProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<ForecastResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResults = (newResults: ForecastResult[]) => {
    setResults((prev) => {
      // Merge new results with existing ones, avoiding duplicates
      const existingIds = new Set(prev.map((r) => r.id))
      const uniqueNewResults = newResults.filter((r) => !existingIds.has(r.id))
      return [...prev, ...uniqueNewResults]
    })
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <ForecastContext.Provider
      value={{
        results,
        addResults,
        clearResults,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ForecastContext.Provider>
  )
}

export function useForecast() {
  const context = useContext(ForecastContext)
  if (context === undefined) {
    throw new Error("useForecast must be used within a ForecastProvider")
  }
  return context
}