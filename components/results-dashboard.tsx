"use client"

import {useEffect, useState} from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Droplets } from "lucide-react"

interface ForecastResult {
  id: string
  date: string
  peakTime: string
  waterLevel: string
  rainfall: string
  kv3: string
  kv3Inundation: number
  kv1: string
  kv1Inundation: number
  inundationTime: string
  warning: string
  severity: "low" | "medium" | "high" | "critical"
}

interface ResultsDashboardProps {
  results?: ForecastResult[]
  isLoading?: boolean
  onSelectResults?: (selectedIds: string[]) => void
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-300"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-300"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    default:
      return "bg-green-100 text-green-800 border-green-300"
  }
}

export function ResultsDashboard({ results = [], isLoading = false, onSelectResults }: ResultsDashboardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // const handleSelectResult = (id: string) => {
  //   setSelectedIds((prev) => {
  //     const newSelection = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  //     onSelectResults?.(newSelection)
  //     return newSelection
  //   })
  // }
  //
  // const handleSelectAll = () => {
  //   if (selectedIds.length === results.length) {
  //     setSelectedIds([])
  //     onSelectResults?.([])
  //   } else {
  //     const allIds = results.map((r) => r.id)
  //     setSelectedIds(allIds)
  //     onSelectResults?.(allIds)
  //   }
  // }

  const handleSelectResult = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.length === results.length) return []
      return results.map((r) => r.id)
    })
  }

  useEffect(() => {
    onSelectResults?.(selectedIds)
  }, [selectedIds, onSelectResults])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang xử lý dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Chưa có kết quả dự báo</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kết quả dự báo</h2>
          <p className="text-sm text-muted-foreground mt-1">{results.length} kết quả dự báo</p>
        </div>
        <Button variant="outline" onClick={handleSelectAll} className="text-sm bg-transparent">
          {selectedIds.length === results.length ? "Bỏ chọn" : "Chọn tất cả"}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card
            key={result.id}
            className={`cursor-pointer transition border-2 ${
              selectedIds.includes(result.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => handleSelectResult(result.id)}
          >
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Key info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày dự báo</p>
                      <p className="text-2xl font-bold text-primary">{result.date}</p>
                    </div>
                    {selectedIds.includes(result.id) && <CheckCircle2 className="h-6 w-6 text-primary" />}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Đỉnh ngập (giờ)</p>
                      <p className="text-xl font-semibold">{result.peakTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Mực nước dự báo</p>
                      <p className="text-xl font-semibold text-accent">{result.waterLevel}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Lượng mưa</p>
                    <p className="text-lg font-semibold">{result.rainfall}</p>
                  </div>
                </div>

                {/* Right column - Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Khu vực ảnh hưởng</p>
                    <div className="space-y-2">
                      <p className="text-sm bg-secondary/10 p-2 rounded border border-secondary/30">
                        KV3: {result.kv3Inundation > 0 ? result.kv3Inundation.toFixed(2) : "Không ngập"}
                      </p>
                      <p className="text-sm bg-secondary/10 p-2 rounded border border-secondary/30">
                        KV1: {result.kv1Inundation.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Thời gian ngập</p>
                    <p className="text-sm bg-muted/50 p-2 rounded">{result.inundationTime}</p>
                  </div>

                  {/*<div className={`p-3 rounded-lg border ${getSeverityColor(result.severity)} flex items-center gap-2`}>*/}
                  {/*  <AlertCircle className="h-4 w-4 flex-shrink-0" />*/}
                  {/*  <span className="text-sm font-medium">{result.warning}</span>*/}
                  {/*</div>*/}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Đã chọn {selectedIds.length} kết quả</p>
            {/*<Button className="bg-primary text-primary-foreground">Tạo bản tin</Button>*/}
          </div>
        </div>
      )}
    </div>
  )
}
