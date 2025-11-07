"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

interface BulletinData {
  date: string
  peakTime: string
  waterLevel: string
  rainfall: string
  kv3: string
  kv1: string
  inundationTime: string
  warning: string
  location: string
  region: "KV1" | "KV3"
}

interface BulletinPreviewProps {
  data: BulletinData
  onDownload?: () => void
}

export function BulletinPreview({ data, onDownload }: BulletinPreviewProps) {
  const bulletinRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      if (bulletinRef.current) {
        bulletinRef.current.id = "bulletin-export-target"
        const fileName = `bulletin-${data.date}-${data.location}-${data.region}.png`
        // Simulated export - replace with actual export logic
        console.log("Exporting:", fileName)
        onDownload?.()
      }
    } catch (error) {
      console.error("Failed to export bulletin:", error)
      alert("Không thể xuất bản tin. Vui lòng thử lại.")
    } finally {
      setIsExporting(false)
    }
  }

  const getAffectedAreaText = () => {
    return data.region === "KV1" ? data.kv1 : data.kv3
  }

  // Dynamic sizing configuration
  const config = {
    viewBox: { width: 1200, height: 900 },
    // Calculate percentages based on viewBox
    pct: (val: number, base: 'w' | 'h' = 'w') =>
      `${(val / (base === 'w' ? 1200 : 900) * 100).toFixed(2)}%`,

    // Font sizes as percentage of viewBox height
    fontSize: {
      title: 32,
      subtitle: 28,
      sectionHeader: 24,
      large: 18,
      medium: 16,
      normal: 15,
      small: 14,
      smaller: 13,
      tiny: 12,
      smallest: 11,
      depth: 48,
      footer: 22
    },

    // Layout coordinates
    layout: {
      header: { y: 5 },
      subtitle: { y: 9.44 },
      leftPanel: { x: 4.17, y: 14.44, width: 48.33, height: 80 },
      rightPanel: { x: 54.17, y: 14.44, width: 41.67, height: 80 },
      footer: { y: 95.56, height: 5.56 }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Xem trước bản tin - {data.region}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={isExporting}
            className="gap-2 bg-transparent"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Tải xuống
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div ref={bulletinRef} className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
            <svg
              viewBox={`0 0 ${config.viewBox.width} ${config.viewBox.height}`}
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="10%" y2="10%">
                  <stop offset="0%" style={{ stopColor: "#1a1a4d", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#4a4a9d", stopOpacity: 1 }} />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Header Section */}
              <text
                x="50%"
                y={config.pct(45, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.title}
                fontWeight="bold"
                fill="#FFD700"
                textAnchor="middle"
              >
                NHẬN ĐỊNH ĐỘ SÂU NGẬP
              </text>
              <text
                x="50%"
                y={config.pct(85, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.subtitle}
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                {data.location}
              </text>

              {/* Left Panel - Flood Info */}
              <rect
                x={config.pct(50)}
                y={config.pct(130, 'h')}
                width={config.pct(580)}
                height={config.pct(720, 'h')}
                rx="20"
                fill="#B8E6F0"
                filter="url(#shadow)"
              />

              {/* Orange Header Box */}
              <rect
                x={config.pct(70)}
                y={config.pct(145, 'h')}
                width={config.pct(540)}
                height={config.pct(60, 'h')}
                rx="30"
                fill="#F5A442"
              />
              <text
                x={config.pct(350)}
                y={config.pct(175, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.large}
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                ĐỘ SÂU NGẬP - {data.region}
              </text>
              <text
                x={config.pct(550)}
                y={config.pct(190, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.sectionHeader}
                fontWeight="bold"
                fill="#DC143C"
                textAnchor="middle"
              >
                {data.date}
              </text>

              {/* Time Info */}
              <text
                x={config.pct(90)}
                y={config.pct(235, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.medium}
                fill="#DC143C"
                fontWeight="bold"
              >
                ⏰ Lưu ý: {getAffectedAreaText()}
              </text>

              <text
                x={config.pct(90)}
                y={config.pct(265, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.medium}
                fill="#333"
              >
                <tspan fontWeight="bold">Bắt đầu - kết thúc:</tspan>{" "}
                <tspan fill="#DC143C" fontWeight="bold">
                  {data.inundationTime}
                </tspan>
              </text>
              <text
                x={config.pct(90)}
                y={config.pct(290, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.small}
                fill="#DC143C"
                fontStyle="italic"
              >
                (khuyến cáo người dân hạn chế di chuyển vào thời điểm trên)
              </text>

              {/* Depth Info */}
              <text
                x={config.pct(90)}
                y={config.pct(330, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.normal}
                fill="#333"
              >
                Độ ngập sâu trung bình tại thời điểm đỉnh
              </text>
              <text
                x={config.pct(90)}
                y={config.pct(355, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.normal}
                fill="#333"
              >
                triều lúc {data.peakTime}:
              </text>

              {/* Depth Box */}
              <rect
                x={config.pct(250)}
                y={config.pct(380, 'h')}
                width={config.pct(180)}
                height={config.pct(80, 'h')}
                rx="5"
                fill="none"
                stroke="#DC143C"
                strokeWidth="4"
              />
              <text
                x={config.pct(340)}
                y={config.pct(435, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.depth}
                fontWeight="bold"
                fill="#DC143C"
                textAnchor="middle"
              >
                {data.waterLevel}
              </text>

              <text
                x={config.pct(90)}
                y={config.pct(490, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.small}
                fill="#555"
                fontStyle="italic"
              >
                (Độ sâu ngập có thể cao hơn nếu có mưa lớn)
              </text>

              {/* Rainfall Info */}
              <text
                x={config.pct(90)}
                y={config.pct(530, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.small}
                fill="#333"
                fontWeight="bold"
              >
                Lượng mưa dự báo:
              </text>
              <text
                x={config.pct(90)}
                y={config.pct(555, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.medium}
                fill="#DC143C"
                fontWeight="bold"
              >
                {data.rainfall}
              </text>

              {/* Image Placeholder */}
              <rect
                x={config.pct(70)}
                y={config.pct(570, 'h')}
                width={config.pct(540)}
                height={config.pct(170, 'h')}
                rx="10"
                fill="#E0E0E0"
                stroke="#999"
                strokeWidth="2"
              />
              <text
                x={config.pct(340)}
                y={config.pct(650, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.large}
                fill="#666"
                textAnchor="middle"
              >
                📷 Bản đồ khu vực ảnh hưởng
              </text>

              {/* Source Note */}
              <text
                x={config.pct(340)}
                y={config.pct(805, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.smallest}
                fill="#555"
                textAnchor="middle"
                fontStyle="italic"
              >
                (Lưu ý: Đây là kết quả đánh giá nhanh phục vụ nghiên cứu trong khuôn khổ Chương trình CRMC)
              </text>

              {/* Right Panel - Advisory */}
              <rect
                x={config.pct(650)}
                y={config.pct(130, 'h')}
                width={config.pct(500)}
                height={config.pct(720, 'h')}
                rx="20"
                fill="#B8E6F0"
                filter="url(#shadow)"
              />

              {/* Teal Header */}
              <rect
                x={config.pct(670)}
                y={config.pct(145, 'h')}
                width={config.pct(460)}
                height={config.pct(60, 'h')}
                rx="30"
                fill="#1CA9C9"
              />
              <text
                x={config.pct(900)}
                y={config.pct(185, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.sectionHeader}
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                KHUYẾN CÁO
              </text>

              {/* Hot Spots Section */}
              <text
                x={config.pct(690)}
                y={config.pct(235, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.medium}
                fill="#DC143C"
                fontWeight="bold"
              >
                📍 ĐIỂM NÓNG CẦN CHÚ Ý:
              </text>
              <text
                x={config.pct(690)}
                y={config.pct(260, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.small}
                fill="#333"
                fontWeight="bold"
              >
                Khu vực ảnh hưởng:
              </text>
              <text
                x={config.pct(690)}
                y={config.pct(282, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.smaller}
                fill="#333"
              >
                {getAffectedAreaText()}
              </text>

              {/* Prevention Measures */}
              <text
                x={config.pct(690)}
                y={config.pct(320, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.small}
                fill="#333"
                fontWeight="bold"
              >
                • ✅ KHUYẾN CÁO PHÒNG TRÁNH:
              </text>

              <text
                x={config.pct(700)}
                y={config.pct(345, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                • - Di chuyển tài sản: Kê cao hoặc di chuyển các vật
              </text>
              <text
                x={config.pct(710)}
                y={config.pct(365, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                dụng, đồ điện tử, giấy tờ quan trọng lên cao ít nhất
              </text>
              <text
                x={config.pct(710)}
                y={config.pct(385, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                90–100 cm để tránh hư hại.
              </text>

              <text
                x={config.pct(700)}
                y={config.pct(410, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                • - Lập kế hoạch di chuyển: Hạn chế đi lại qua các
              </text>
              <text
                x={config.pct(710)}
                y={config.pct(430, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                tuyến đường ngập trong khu vực {getAffectedAreaText()}.
              </text>

              <text
                x={config.pct(700)}
                y={config.pct(455, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                • - An toàn điện: Rút phích cắm, ngắt nguồn điện ở
              </text>
              <text
                x={config.pct(710)}
                y={config.pct(475, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                những vị trí thấp để đảm bảo an toàn.
              </text>

              <text
                x={config.pct(700)}
                y={config.pct(500, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                • - Đi lại: Hạn chế di chuyển bằng ô tô và xe máy
              </text>
              <text
                x={config.pct(710)}
                y={config.pct(520, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                trong thời gian ngập. Nếu buộc phải di chuyển, đi chậm
              </text>
              <text
                x={config.pct(710)}
                y={config.pct(540, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
              >
                và tránh xa chỗ có dòng nước chảy mạnh.
              </text>

              {/* Recommendation */}
              <text
                x={config.pct(690)}
                y={config.pct(575, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.small}
                fill="#DC143C"
                fontWeight="bold"
              >
                • 📢 Khuyến nghị:
              </text>
              <text
                x={config.pct(700)}
                y={config.pct(600, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
                fontStyle="italic"
              >
                Hãy chia sẻ thông tin này đến người thân, bạn bè, nhất là
              </text>
              <text
                x={config.pct(700)}
                y={config.pct(620, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
                fontStyle="italic"
              >
                các hộ dân tại {getAffectedAreaText()} để chủ động phòng tránh.
              </text>
              <text
                x={config.pct(700)}
                y={config.pct(640, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.tiny}
                fill="#333"
                fontStyle="italic"
              >
              </text>

              {/* Footer */}
              <rect x="0" y={config.pct(860, 'h')} width="100%" height={config.pct(50, 'h')} fill="#000000" />
              <text
                x="50%"
                y={config.pct(895, 'h')}
                fontFamily="Arial, sans-serif"
                fontSize={config.fontSize.footer}
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                CHỦ ĐỘNG PHÒNG TRÁNH - AN TOÀN LÀ TRÊN HẾT!
              </text>
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}