"use server"

import { GoogleGenAI } from "@google/genai"
import type { BackendResponse } from "@/lib/api-client"

/**
 * Server action to process files with AI
 * API key is kept secure on the server side
 * New server action to handle file processing securely
 */
export async function processFileWithAI(formData: FormData): Promise<BackendResponse> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("No file provided")
    }

    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    if (!apiKey) {
      throw new Error("API key not configured")
    }

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `
    Nhiệm vụ:
    Hãy đọc kỹ nội dung trong hình ảnh báo cáo khí tượng thủy văn.
    Trích xuất chính xác và có cấu trúc các thông tin dự báo thủy văn bao gồm:
    Ngày dự báo
    Thời điểm (sáng/chiều)
    Lượng mưa dự báo (mm)
    Mực nước cao nhất dự báo (m)
    Thời gian xuất hiện mực nước cao nhất
    Ghi chú (ví dụ: cao hơn báo động mấy, bao nhiêu mét)
    Yêu cầu xuất kết quả theo dạng JSON với cấu trúc như sau:
    {
      "du_bao": [
        {
          "ngay": "01/11/2025",
          "thoi_diem": "Sáng",
          "luong_mua": "5 - 25 mm",
          "muc_nuoc": "0,35 m",
          "thoi_gian": "20h30",
          "ghi_chu": ""
        },
        {
          "ngay": "02/11/2025",
          "thoi_diem": "Sáng",
          "luong_mua": "5 - 10 mm",
          "muc_nuoc": "0,34 m",
          "thoi_gian": "05h00",
          "ghi_chu": ""
        }
      ]
    }
    Lưu ý:
    Chỉ lấy phần "Dự báo", không lấy dữ liệu quan trắc quá khứ.
    Giữ nguyên đơn vị đo (mm, m, giờ).
    Nếu có ghi chú "Cao hơn BĐIII" thì ghi đầy đủ.
    Bỏ qua phần phụ lục định nghĩa.
    Câu trả lời chỉ bao gồm JSON, không thêm mô tả gì khác.
    `

    const bytes = await file.arrayBuffer()
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ inlineData: { mimeType: file.type, data: Buffer.from(bytes).toString("base64") } }, prompt],
    })

    const text = response.text?.trim();
    if (!text) throw new Error("No text response from model");

    const cleaned = text.replace(/^```json|```$/gm, "").trim();
    const parsed = JSON.parse(cleaned);

    const converted = {
      du_bao: parsed.du_bao.map((item: any) => {
        // 👉 Chuyển mực nước từ m sang cm
        const match = item.muc_nuoc?.match(/([\d.,]+)/)
        let mucNuocCm = 0
        if (match) {
          mucNuocCm = parseFloat(match[1].replace(",", ".")) * 100
        }

        let ngay = item.ngay
        if (ngay.includes("-")) {
          ngay = ngay.split("-").reverse().join("/")
        }

        let thoiGian = item.thoi_gian?.trim() || ""
        if (/[0-9]+h[0-9]*/i.test(thoiGian)) {
          thoiGian = thoiGian.replace(/h/i, ":")
        }

        console.log(thoiGian)

        const ghiChu = mucNuocCm > 200 ? "Cao hơn BĐIII: 0,35(m)" : (item.ghi_chu || "")

        return {
          ngay,
          thoi_diem: item.thoi_diem || "Chiều",
          luong_mua: item.luong_mua?.includes("mm") ? item.luong_mua : `${item.luong_mua} mm`,
          muc_nuoc: `${mucNuocCm.toFixed(0)} cm`,
          thoi_gian: thoiGian || "",
          ghi_chu: item.ghi_chu || "",
        }
      }),
    }

    return converted as BackendResponse
  } catch (error) {
    console.error("[v0] Error in processFileWithAI:", error)
    throw error
  }
}
