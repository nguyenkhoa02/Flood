/**
 * API client for forecast backend integration
 * Connects to the flood prediction webhook backend
 */

export interface ForecastPayload {
  forecastDate: string
  forecastTime: string
  rainfall: number
  waterLevel: number
}

export interface FileUploadPayload {
  file: File
}

export interface BackendForecast {
  ngay: string
  thoi_diem: string
  luong_mua: string
  muc_nuoc: string
  thoi_gian: string
  ghi_chu: string
}

export interface BackendResponse {
  du_bao: BackendForecast[]
}

export interface ForecastResult {
  id: string
  ngay: string
  thoi_diem: string
  luong_mua: string
  muc_nuoc: string
  thoi_gian: string
  ghi_chu: string
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

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

/**
 * Submit forecast data to the backend
 */
export async function submitForecast(data: ForecastPayload): Promise<BackendResponse> {
  try {
    // Simulated backend response
    const response = {
      du_bao: [
        {
          ngay: data.forecastDate.split("-").reverse().join("/"),
          thoi_diem: "Chiều",
          luong_mua: `${data.rainfall} mm`,
          muc_nuoc: `${(data.waterLevel)} cm`,
          thoi_gian: data.forecastTime,
          ghi_chu: data.waterLevel > 200 ? "Cao hơn BĐIII: 0,35(m)" : "",
        },
      ],
    }

    return response
  } catch (error) {
    console.error("Error in submitForecast:", error)
    throw error
  }
}

/**
 * Upload a file containing forecast data - delegates to server action
 */
export async function uploadForecastFile(file: File): Promise<BackendResponse> {
  try {
    // Import and use server action
    const { processFileWithAI } = await import("@/app/actions/file-processing")

    const formData = new FormData()
    formData.append("file", file)

    const result = await processFileWithAI(formData)

    console.log("[v0] File processed successfully:", result)
    return result
  } catch (error) {
    console.error("[v0] Error in uploadForecastFile:", error)
    throw error
  }
}

/**
 * Transform backend forecast data to app format
 */
export function transformBackendForecast(forecast: BackendForecast, index: number): ForecastResult {
  const severity = determineSeverity(forecast.ghi_chu, forecast.muc_nuoc)

  // Extract numeric values
  const waterLevelMeters = extractNumericValue(forecast.muc_nuoc)
  const rainfallMm = extractRainfallValue(forecast.luong_mua)

  // Calculate inundation depths
  const kv3Inundation = calculateKV3Inundation(waterLevelMeters, rainfallMm)
  const kv1Inundation = calculateKV1Inundation(kv3Inundation)

  const [hour, minute] = forecast.thoi_gian.split(":").map(Number);

const base = new Date(0, 0, 0, hour, minute);
const before = new Date(base.getTime() - 2 * 60 * 60 * 1000);
const after = new Date(base.getTime() + 2 * 60 * 60 * 1000);

// format lại giờ: luôn có 2 chữ số
const pad = (n:number) => n.toString().padStart(2, "0");

const inundationTime = `${pad(before.getHours())}:${pad(before.getMinutes())} - ${pad(after.getHours())}:${pad(after.getMinutes())}`;

  return {
    id: `forecast-${index}-${forecast.ngay.replace(/\D/g, "")}-${Date.now()}`,
    ngay: forecast.ngay.replaceAll("/", "."),
    date: forecast.ngay.replaceAll("/", "."),
    thoi_diem: forecast.thoi_diem,
    luong_mua: forecast.luong_mua,
    muc_nuoc: forecast.muc_nuoc,
    thoi_gian: forecast.thoi_gian,
    ghi_chu: forecast.ghi_chu,
    peakTime: forecast.thoi_gian,
    waterLevel: forecast.muc_nuoc,
    rainfall: forecast.luong_mua,
    kv3: `Khu vực 3 - Bình Thủy`,
    kv3Inundation: kv3Inundation > 0 ? kv3Inundation : 0,
    kv1: `Khu vực 1 - Cần Thơ`,
    kv1Inundation: kv1Inundation > 0 ? kv1Inundation : 0,
    inundationTime: inundationTime,
    warning: forecast.ghi_chu,
    severity,
  }
}

/**
 * Determine severity level based on water level and notes
 */
function determineSeverity(notes: string, waterLevel: string): "low" | "medium" | "high" | "critical" {
  const level = Number.parseFloat(waterLevel.match(/[\d.]+/)?.[0] || "0")

  if (level > 2.5) return "critical"
  if (level > 2.0) return "high"
  if (level > 1.5) return "medium"
  return "low"
}

/**
 * Get warning level label
 */
function getWarningLevel(notes: string): string {
  if (notes.includes("cao") || notes.includes("BĐIII")) return "Cảnh báo cao"
  if (notes.includes("trung bình")) return "Cảnh báo trung bình"
  return "Cảnh báo thấp"
}

/**
 * Calculate inundation depth for KV3
 * Formula: 3.285 + (-0.195)*Mực nước + 0.002*Mực nước^2 + 0.059*Lượng mưa
 */
function calculateKV3Inundation(waterLevel: number, rainfall: number): number {
  return 3.285 + -0.195 * waterLevel + 0.002 * Math.pow(waterLevel, 2) + 0.059 * rainfall
}

/**
 * Calculate inundation depth for KV1
 * Formula: 1.842 + (-0.187)*(Độ ngập KV3) + 0.009*(Độ ngập KV3)^2 + 10 (độ lệch địa hình)
 */
function calculateKV1Inundation(kv3Inundation: number, terrainDeviation = 10): number {
  return 1.842 + -0.187 * kv3Inundation + 0.009 * Math.pow(kv3Inundation, 2) + terrainDeviation
}

/**
 * Extract numeric value from string (e.g., "0.35 m" -> 0.35)
 */
function extractNumericValue(value: string): number {
  const match = value.match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

/**
 * Extract rainfall value, handling ranges (e.g., "5 - 25 mm" -> 15)
 */
function extractRainfallValue(rainfallStr: string): number {
  const matches = rainfallStr.match(/[\d.]+/g)
  if (!matches) return 0

  if (matches.length > 1) {
    // If range, take average
    const min = Number.parseFloat(matches[0])
    const max = Number.parseFloat(matches[1])
    return (min + max) / 2
  }

  return Number.parseFloat(matches[0])
}
