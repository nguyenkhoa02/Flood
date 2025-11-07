"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ResultsDashboard } from "@/components/results-dashboard"
import { BulletinPreview } from "@/components/bulletin-preview"
import { BulletinGallery } from "@/components/bulletin-gallery"
import { Button } from "@/components/ui/button"
import { useForecast } from "@/contexts/ForecastContext"

export default function ResultsPage() {
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [showBulletinGallery, setShowBulletinGallery] = useState(false)
  const { results, isLoading } = useForecast()

  const bulletins = selectedResults.flatMap((id) => {
    const result = results.find((r) => r.id === id)
    if (!result) return []

    // Generate two bulletins for each region
    return [
      {
        id: `${id}-kv1`,
        resultId: id,
        region: "KV1" as const,
        data: {
          date: result.ngay,
          time: result.thoi_diem,
          peakTime: result.peakTime,
          waterLevel: result.waterLevel,
          rainfall: result.rainfall,
          kv3: result.kv3,
          kv3Inundation: result.kv3Inundation,
          kv1: result.kv1,
          kv1Inundation: result.kv1Inundation,
          inundationTime: result.inundationTime,
          warning: result.warning,
          location: "TP.Cần Thơ",
          region: "KV1" as const,
        },
      },
      {
        id: `${id}-kv3`,
        resultId: id,
        region: "KV3" as const,
        data: {
          date: result.ngay,
          time: result.thoi_diem,
          peakTime: result.peakTime,
          waterLevel: result.waterLevel,
          rainfall: result.rainfall,
          kv3: result.kv3,
          kv3Inundation: result.kv3Inundation,
          kv1: result.kv1,
          kv1Inundation: result.kv1Inundation,
          inundationTime: result.inundationTime,
          warning: result.warning,
          location: "Phường Bình Thủy, TP.Cần Thơ",
          region: "KV3" as const,
        },
      },
    ]
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <ResultsDashboard
          results={results}
          isLoading={isLoading}
          onSelectResults={(ids) => {
            setSelectedResults(ids)
          }}
        />

        {selectedResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tạo bản tin</h2>
              <Button onClick={() => setShowBulletinGallery(true)} className="bg-primary text-primary-foreground">
                Xem tất cả bản tin ({bulletins.length})
              </Button>
            </div>

            {bulletins.length > 0 && (
              <BulletinPreview
                data={bulletins[0].data}
                onDownload={() => {
                  console.log("Bulletin downloaded")
                }}
                bulletins={bulletins}
              />
            )}
          </div>
        )}

        {showBulletinGallery && <BulletinGallery bulletins={bulletins} onClose={() => setShowBulletinGallery(false)} />}
      </div>
    </main>
  )
}
