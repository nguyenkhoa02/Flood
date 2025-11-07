"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import { submitForecast, uploadForecastFile, transformBackendForecast } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useForecast } from "@/contexts/ForecastContext"

export function ForecastForm() {
  const router = useRouter()
  const { addResults, setIsLoading: setContextLoading } = useForecast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    forecastDate: "",
    forecastTime: "",
    rainfall: "",
    waterLevel: "",
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setContextLoading(true)

    try {
      const response = await submitForecast({
        forecastDate: formData.forecastDate,
        forecastTime: formData.forecastTime,
        rainfall: Number.parseFloat(formData.rainfall),
        waterLevel: Number.parseFloat(formData.waterLevel),
      })

      // Transform and add results to context
      const transformedResults = response.du_bao.map((forecast, index) =>
        transformBackendForecast(forecast, index)
      )
      addResults(transformedResults)

      console.log("[ForecastForm] Results added to context:", transformedResults.length)

      setFormData({
        forecastDate: "",
        forecastTime: "",
        rainfall: "",
        waterLevel: "",
      })

      router.push("/results")
    } catch (error) {
      console.error("Error submitting forecast:", error)
      alert("Lỗi khi gửi dự báo. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
      setContextLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setContextLoading(true)

    try {
      const response = await uploadForecastFile(file)

      // Transform and add results to context
      const transformedResults = response.du_bao.map((forecast, index) =>
        transformBackendForecast(forecast, index)
      )
      addResults(transformedResults)

      console.log("[ForecastForm] File processed, results added:", transformedResults.length)

      router.push("/results")
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Lỗi khi tải lên tệp. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
      setContextLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin dự báo</CardTitle>
        <CardDescription>Nhập thông tin hoặc tải lên tệp (PDF, Word, hình ảnh)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tải lên tệp</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
                disabled={isLoading}
              />
              <label htmlFor="fileInput" className="cursor-pointer block">
                {isLoading ? (
                  <>
                    <Loader2 className="mx-auto h-10 w-10 text-muted-foreground mb-3 animate-spin" />
                    <p className="font-medium text-sm">Đang xử lý tệp...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium text-sm">Nhấp để tải lên hoặc kéo thả</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, Word, hoặc hình ảnh (tối đa 10MB)</p>
                  </>
                )}
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tệp có thể chứa dữ liệu cho nhiều ngày. Bạn sẽ được chọn ngày cần dự báo.
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Hoặc nhập thông tin</span>
            </div>
          </div>

          {/* Manual Form Section */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="forecastDate">Ngày dự báo</Label>
                <Input
                  id="forecastDate"
                  name="forecastDate"
                  type="date"
                  value={formData.forecastDate}
                  onChange={handleFormChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecastTime">Thời gian dự báo (giờ)</Label>
                <Input
                  id="forecastTime"
                  name="forecastTime"
                  type="time"
                  value={formData.forecastTime}
                  onChange={handleFormChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rainfall">Lượng mưa dự báo (mm)</Label>
                <Input
                  id="rainfall"
                  name="rainfall"
                  type="number"
                  placeholder="0"
                  value={formData.rainfall}
                  onChange={handleFormChange}
                  step="0.1"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterLevel">Mực nước dự báo (cm)</Label>
                <Input
                  id="waterLevel"
                  name="waterLevel"
                  type="number"
                  placeholder="0"
                  value={formData.waterLevel}
                  onChange={handleFormChange}
                  step="0.01"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi dự báo"
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}