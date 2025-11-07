"use client"

import { useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BulletinPreview } from "./bulletin-preview"
import { X } from "lucide-react"

interface BulletinItem {
  id: string
  data: any
}

interface BulletinGalleryProps {
  bulletins: BulletinItem[]
  onClose: () => void
}

export function BulletinGallery({ bulletins, onClose }: BulletinGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (bulletins.length === 0) {
    return null
  }

  const current = bulletins[currentIndex]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">
              Bản tin {currentIndex + 1} / {bulletins.length}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-6">
          <BulletinPreview data={current.data} bulletins={bulletins} currentIndex={currentIndex} />

          <div className="flex items-center justify-between mt-6 gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              Trước
            </Button>

            <div className="text-sm text-muted-foreground">
              Bản tin {currentIndex + 1} của {bulletins.length}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.min(bulletins.length - 1, currentIndex + 1))}
              disabled={currentIndex === bulletins.length - 1}
            >
              Tiếp
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
