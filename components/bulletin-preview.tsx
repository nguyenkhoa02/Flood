"use client"

import {useEffect, useLayoutEffect, useRef, useState} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Download, Loader2} from "lucide-react"
import download from "downloadjs"
import domtoimage from 'dom-to-image-more'

interface BulletinData {
  date: string
  peakTime: string
  time: string
  waterLevel: string
  rainfall: string
  kv3: string
  kv3Inundation: number
  kv1: string
  kv1Inundation: number
  inundationTime: string
  warning: string
  location: string
  region: "KV1" | "KV3"
}

interface BulletinItem {
  id: string
  data: BulletinData
}


interface BulletinPreviewProps {
  data: BulletinData
  onDownload?: () => void
  bulletins: BulletinItem[]
  currentIndex: number
}

export function BulletinPreview({data, onDownload, bulletins, currentIndex}: BulletinPreviewProps) {
  const bulletinRef = useRef<HTMLDivElement>(null);
  const [currentData, setCurrentData] = useState<BulletinData>(data);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportQueue, setExportQueue] = useState<BulletinData[] | null>(null);


  const getAffectedAreaText = () => {
    return currentData.region === "KV1" ? currentData.kv1 : currentData.kv3;
  };

  const getInundationDepth = () => {
    return currentData.region === "KV1"
      ? currentData.kv1Inundation.toFixed(0)
      : currentData.kv3Inundation.toFixed(0);
  };

  const getTimeOfDay = () => {
    if (!currentData?.time) return "N/A";
    const [hourStr] = currentData.time.split(":");
    const hour = parseInt(hourStr, 10);
    return hour < 12 ? "BUỔI SÁNG" : "BUỔI CHIỀU";
  };

  const handleDownload = async () => {
    if (!bulletinRef.current) return;
    setIsExporting(true);

    try {
      const svg = bulletinRef.current.querySelector("svg");
      if (!svg) {
        alert("Không tìm thấy phần tử SVG trong bulletinRef");
        setIsExporting(false);
        return;
      }

      const clone = svg.cloneNode(true) as SVGSVGElement;

      const viewBoxAttr = clone.getAttribute("viewBox");
      const viewBox = viewBoxAttr
        ? viewBoxAttr.split(" ").map(Number)
        : [0, 0, 1200, 900];
      const [, , vbWidth, vbHeight] = viewBox;

      clone.setAttribute("width", `${vbWidth}`);
      clone.setAttribute("height", `${vbHeight}`);
      clone.style.width = `${vbWidth}px`;
      clone.style.height = `${vbHeight}px`;
      clone.style.border = "none";

      const tempWrapper = document.createElement("div");
      tempWrapper.style.background = "#fff";
      tempWrapper.style.width = `${vbWidth}px`;
      tempWrapper.style.height = `${vbHeight}px`;
      tempWrapper.appendChild(clone);
      document.body.appendChild(tempWrapper);

      const dataUrl = await domtoimage.toPng(tempWrapper, {
        quality: 1.0,
        bgcolor: "#ffffff",
        width: vbWidth,
        height: vbHeight,
        cacheBust: true,
      });

      const fileName = `bulletin-${currentData.date}-${currentData.location}-${currentData.region}.png`;
      download(dataUrl, fileName);

      document.body.removeChild(tempWrapper);
      onDownload?.();
    } catch (error) {
      console.error("❌ Lỗi xuất bản tin:", error);
      alert("Không thể xuất bản tin. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };



  const handleDownloadAll = () => {
    if (!bulletins || bulletins.length === 0) {
      alert("Không có bản tin nào để tải xuống.");
      return;
    }
    setIsExportingAll(true);
    setExportQueue(bulletins.map((b) => b.data));
  };

  useEffect(() => {
    if (!bulletins || bulletins.length === 0) return;
    const current = bulletins[currentIndex];
    if (!current || !current.data) return;
    setCurrentData(current.data);
  }, [bulletins, currentIndex]);

  const depth = getInundationDepth(); // độ sâu ngập lụt, ví dụ: 35
  const region = currentData.region;

  const imageLevels: Record<string, number[]> = {
    "KV1": [10, 15, 20, 25, 30, 35, 40],
    "KV3": [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
  };

  const getImageByDepth = (depth: string, region: string) => {
    const numericDepth = parseFloat(depth);

    const available = imageLevels[region] || [];
    if (available.length === 0) return null;

    const lowerOrEqual = available.filter((val) => val <= numericDepth);

    const selected = lowerOrEqual.length > 0 ? Math.max(...lowerOrEqual) : Math.min(...available);
    console.log(selected);
    return `${window.location.origin}/MucNuoc/${region}/${selected}CM.jpg`;
  };


  const getWaterLinePosition = (depth: string) => {
    let numericDepth = parseFloat(depth);
    const regionOffset = currentData.region === "KV1" ? 0 : 1;
    const top = (-19 / 30) * numericDepth + 90 - regionOffset;
    return `${top}%`;
  };

  const imgSrc = getImageByDepth(depth, region);
  const waterLineTop = getWaterLinePosition(depth);


  useLayoutEffect(() => {
    if (!exportQueue || exportQueue.length === 0) return;

    const exportNext = async () => {
      const [current, ...rest] = exportQueue;
      setCurrentData(current);

      // 🕒 Chờ DOM và layout cập nhật hoàn tất
      await new Promise((resolve) =>
        setTimeout(resolve, 100) // cho React & browser render xong SVG
      );

      if (bulletinRef.current) {
        const svg = bulletinRef.current.querySelector("svg");
        if (!svg) return console.error("❌ Không tìm thấy SVG");

        // Clone SVG (an toàn)
        const clone = svg.cloneNode(true) as SVGSVGElement;
        const viewBoxAttr = clone.getAttribute("viewBox");
        const viewBox = viewBoxAttr
          ? viewBoxAttr.split(" ").map(Number)
          : [0, 0, 1200, 900];
        const [, , vbWidth, vbHeight] = viewBox;

        // Container tạm
        const tempWrapper = document.createElement("div");
        tempWrapper.style.background = "#fff";
        tempWrapper.style.width = `${vbWidth}px`;
        tempWrapper.style.height = `${vbHeight}px`;
        tempWrapper.appendChild(clone);
        document.body.appendChild(tempWrapper);

        try {
          const dataUrl = await domtoimage.toPng(tempWrapper, {
            quality: 1.0,
            bgcolor: "#ffffff",
            width: vbWidth,
            height: vbHeight,
            cacheBust: true,
          });

          const fileName = `bulletin-${current.date}-${current.location}-${current.region}.png`;
          download(dataUrl, fileName);
        } catch (err) {
          console.error("❌ Xuất lỗi:", err);
        } finally {
          document.body.removeChild(tempWrapper);
        }
      }

      // Xuất tiếp
      if (rest.length > 0) {
        setExportQueue(rest);
      } else {
        setExportQueue(null);
        setIsExportingAll(false);
        alert("✅ Đã tải xuống tất cả bản tin thành công!");
      }
    };

    exportNext();
  }, [exportQueue]);




  // Dynamic sizing configuration
  const config = {
    viewBox: {width: 1200, height: 900},
    // Calculate percentages based on viewBox
    pct: (val: number, base: 'w' | 'h' = 'w') =>
      `${(val / (base === 'w' ? 1200 : 900) * 100).toFixed(2)}%`,

    // Font sizes as percentage of viewBox height
    fontSize: {
      title: 36,
      subtitle: 30,
      sectionHeader: 24,
      large: 26,
      medium: 24,
      normal: 22,
      small: 22,
      smaller: 20,
      tiny: 18,
      smallest: 16,
      depth: 40,
      footer: 22
    },

    // Layout coordinates
    layout: {
      header: {y: 5},
      subtitle: {y: 9.44},
      leftPanel: {x: 4.17, y: 14.44, width: 48.33, height: 80},
      rightPanel: {x: 54.17, y: 14.44, width: 41.67, height: 80},
      footer: {y: 95.56, height: 5.56}
    }
  }

  // @ts-ignore
  // @ts-ignore
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex  items-center justify-between">
          <span>Xem trước bản tin - {currentData.region}</span>
          <div className={'gap-2 flex'}>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={isExporting || isExportingAll}
              className="gap-2 bg-transparent"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin"/>
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4"/>
                  Tải xuống
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadAll}
              disabled={isExporting || isExportingAll}
              className="gap-2 bg-transparent"
            >
              {isExportingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin"/>
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4"/>
                  Tải xuống tất cả
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
            <div ref={bulletinRef} className={'w-full'}
                 style={{
                   border: 'none'
                 }}
            >
              <svg
                viewBox={`0 0 ${config.viewBox.width} ${config.viewBox.height}`}
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
                style={{
                  border: 'none'
                }}
              >
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: "#1a1a4d", stopOpacity: 1}}/>
                    <stop offset="100%" style={{stopColor: "#4a4a9d", stopOpacity: 1}}/>
                  </linearGradient>

                  <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
                  </filter>
                </defs>

                <foreignObject x="0" y="0" width="100%" height="100%"
                  style={{border: 'none'}}
                >
                  <img
                    src="/assets/1019713_6289.jpg"
                    style={{
                      border: 'none',
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                      overflow: "hidden",
                      objectFit: "cover",
                    }}
                  />
                </foreignObject>

                <rect
                  x={config.pct(1200)}
                  y={config.pct(900, 'h')}
                />
                <rect
                  x={config.pct(0)}
                  y={config.pct(0, 'h')}
                  width={config.pct(1200)}
                  height={config.pct(110, 'h')}
                  // rx="30"
                  fill="url(#bgGradient)"
                />

                {/* Header Section */}
                <text
                  x="50%"
                  y={config.pct(45, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.subtitle}
                  fontWeight="bold"
                  fill="#FFD670"
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
                  {currentData.location}
                </text>

                {/* Left Panel - Flood Info */}
                <rect
                  x={config.pct(50)}
                  y={config.pct(130, 'h')}
                  width={config.pct(580)}
                  height={config.pct(680, 'h')}
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
                  x={config.pct(255)}
                  y={config.pct(185, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.sectionHeader}
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  textDecoration={'uppercase'}
                >
                  ĐỘ SÂU NGẬP - {getTimeOfDay()}
                </text>
                <text
                  x={config.pct(505)}
                  y={config.pct(188, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.subtitle}
                  fontWeight="bold"
                  fill="#DC143C"
                  textAnchor="middle"
                >
                  {currentData.date}
                </text>

                {/* Time Info */}
                <text
                  x={config.pct(160)}
                  y={config.pct(235, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.medium}
                  fill="#DC143C"
                  fontWeight="bold"
                >
                  ⏰ Lưu ý: {getAffectedAreaText().toUpperCase()}
                </text>

                <text
                  x={config.pct(90)}
                  y={config.pct(275, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.medium}
                  fill="#0d4b59"
                >
                  <tspan fontWeight="bold">Bắt đầu - kết thúc:</tspan>
                  {" "}
                  <tspan fill="#DC143C" fontWeight="bold">
                    {currentData.inundationTime}
                  </tspan>
                  {" "}
                  <tspan
                    fill="#DC143C"
                    fontStyle="italic"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    fontSize={config.fontSize.small}
                  >
                    (khuyến cáo
                  </tspan>
                </text>
                <text
                  x={config.pct(90)}
                  y={config.pct(305, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.small}
                  fill="#DC143C"
                  fontStyle="italic"
                  fontWeight="bold"

                >
                  người dân hạn chế di chuyển vào thời điểm trên)
                </text>

                {/* Depth Info */}
                <text
                  x={config.pct(90)}
                  y={config.pct(340, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.normal}
                  fill="#333"
                >
                  Độ ngập sâu trung bình tại thời điểm
                  {" "}
                  <tspan
                    fill="#DC143C"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    fontSize={config.fontSize.small}>
                    đỉnh
                  </tspan>
                  {" "}
                  triều

                </text>
                <text
                  x={config.pct(90)}
                  y={config.pct(370, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.normal}
                  fill="#0d4b59"
                >
                  {parseFloat(currentData.waterLevel.match(/[\d.]+/)?.[0] || "0") / 100}m
                  lúc
                  {" "}
                  <tspan
                    fill="#DC143C"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    fontSize={config.fontSize.normal}>
                    {data.peakTime}
                  </tspan>
                  :
                </text>

                {/* Depth Box */}
                <rect
                  x={config.pct(165)}
                  y={config.pct(380, 'h')}
                  width={config.pct(350)}
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
                  ~ {getInundationDepth()} cm (+/- 6cm)
                </text>

                <text
                  x={config.pct(90)}
                  y={config.pct(490, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.medium}
                  fill="#0d4b59"
                  fontStyle="italic"
                >
                  (Độ sâu ngập có thể cao hơn nếu có mưa lớn)
                </text>

                {/* Image Placeholder */}

                <defs>
                  <clipPath id="rectClip">
                    <rect
                      x={config.pct(70)}
                      y={config.pct(500, 'h')}
                      width={config.pct(540)}
                      height={config.pct(300, 'h')}
                      rx="10"
                    />
                  </clipPath>
                </defs>


                <foreignObject
                  x={config.pct(70)}
                  y={config.pct(500, 'h')}
                  width={config.pct(540)}
                  height={config.pct(300, 'h')}
                  clipPath="url(#rectClip)"
                  style={{
                    border: 'none'

                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: 'none'

                    }}>
                    <img
                      src={`${window.location.origin}/assets/map${currentData.region}.png`}
                      crossOrigin="anonymous"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        border: 'none'

                      }}
                      alt="Flood area"

                    />

                    <img
                      src={imgSrc || ''}
                      crossOrigin="anonymous"
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: "5%", // cách mép phải một chút
                        transform: "translateY(-50%)", // canh giữa theo chiều dọc
                        width: "33%", // ảnh nhỏ lại, chỉ chiếm khoảng 1/4 chiều ngang
                        height: "auto",
                        objectFit: "contain",
                        pointerEvents: "none",
                        border: 'none'

                      }}
                      alt="Water level overlay"
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: waterLineTop, // vị trí mực nước
                      right: "6%",
                      width: "15%",
                      height: "2px",
                      backgroundColor: "red",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      border: 'none'
                    }}
                  />

                  {/* Text chú thích mực nước */}
                  <div
                    style={{
                      position: "absolute",
                      top: `calc(${waterLineTop} - 4%)`,
                      right: "3.5%",
                      width: "25%",
                      textAlign: "center",
                      color: "red",
                      fontWeight: "bold",
                      textShadow: '0.75px 0 #fff, -0.75px 0 #fff, 0 0.75px #fff, 0 -0.75px #fff, 0.75px 0.5px #fff, -0.75px -0.75px #fff, 0.75px -0.75px #fff, -0.75px 0.75px #fff',
                      fontSize: "14px",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      border: 'none'
                    }}
                  >
                    {getInundationDepth()} cm
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: `calc(${waterLineTop} + 4%)`,
                      right: "0%",
                      width: "25%",
                      textAlign: "center",
                      color: "rgb(255, 0, 0)",
                      fontWeight: "bold",
                      textShadow: '0.75px 0 #fff, -0.75px 0 #fff, 0 0.75px #fff, 0 -0.75px #fff, 0.75px 0.5px #fff, -0.75px -0.75px #fff, 0.75px -0.75px #fff, -0.75px 0.75px #fff',
                      fontSize: "14px",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      fontFamily: 'Arial, sans-serif',
                      border: 'none'
                    }}
                  >
                    Mức dự báo
                  </div>
                </foreignObject>


                <rect
                  x={config.pct(70)}
                  y={config.pct(500, 'h')}
                  width={config.pct(540)}
                  height={config.pct(300, 'h')}
                  rx="10"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                />


                {/* Source Note */}
                <text
                  x={config.pct(600)}
                  y={config.pct(840, 'h')}
                  fontFamily="Arial, sans-serif"
                  fontSize={config.fontSize.smallest}
                  fill="#000"
                  textAnchor="middle"
                  fontStyle="italic"
                >
                  (Lưu ý: Đây là kết quả đánh giá nhanh phục vụ nghiên cứu trong khuôn khổ Chương trình
                  CRMC)
                </text>

                {/* Right Panel - Advisory */}
                <rect
                  x={config.pct(650)}
                  y={config.pct(130, 'h')}
                  width={config.pct(500)}
                  height={config.pct(680, 'h')}
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
                <foreignObject
                  x={config.pct(670)}
                  y={config.pct(210, 'h')}
                  width={config.pct(460)}   // chiều rộng giới hạn text
                  height={config.pct(460)}  // chiều cao vùng chứa
                  style={{
                    border: 'none'

                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      fontSize: config.fontSize.small,
                      color: '#0d4b59',
                      fontWeight: 'bold',
                      textAlign: 'justify',
                      lineHeight: 1.4,
                      border: 'none'

                    }}
                  >
                  <span
                    style={{
                      color: '#DC143C',
                      fontSize: config.fontSize.medium,
                      fontWeight: 'bold',
                      border: 'none'

                    }}
                  >
                    📍 ĐIỂM NÓNG CẦN CHÚ Ý:
                  </span>
                    {" "}
                    Lập kế hoạch di chuyển an toàn, tránh các tuyến đường: Cách Mạng Tháng 8 (CMT8),
                    đường Lê Hồng Phong, đường Bùi Hữu Nghĩa (đoạn chợ Thủy) và hẻm Xóm Lưới...
                  </div>
                </foreignObject>


                {/* Prevention Measures */}

                <foreignObject
                  x={config.pct(670)}
                  y={config.pct(395, 'h')}
                  width={config.pct(460)}  // Giới hạn độ rộng vùng text
                  height={config.pct(400)} // Chiều cao vùng hiển thị
                  style={{
                    border: 'none'

                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      color: '#333',
                      lineHeight: 1.25,
                      // fontWeight: 'bold',
                      textAlign: 'justify',
                      border: 'none'

                    }}
                  >
                    <div
                      style={{
                        fontSize: config.fontSize.small,
                        color: '#0d4b59',
                        marginBottom: '0.4em',
                        fontWeight: 'bold',
                        border: 'none'

                      }}
                    >
                      • ✅ KHUYẾN CÁO PHÒNG TRÁNH:
                    </div>

                    <div
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: config.fontSize.tiny,
                        color: '#0d4b59',
                        border: 'none'

                      }}
                    >
                      • - Di chuyển tài sản: Kê cao hoặc di chuyển các vật dụng, đồ điện tử,
                      giấy tờ quan trọng lên cao ít nhất 90–100 cm để tránh hư hại.
                      <br/>
                      • -Lập kế hoạch di chuyển: Hạn chế đi lại qua đường Bùi Hữu Nghĩa và
                      các khu vực trũng thấp trong thời gian triều cường theo cảnh báo.

                      <br/>
                      • -An toàn điện: Rút phích cắm, ngắt nguồn điện ở những vị trí thấp
                      để đảm bảo an toàn.
                      <br/>
                      • -Đi lại: Hạn chế di chuyển bằng ô tô và xe máy trong thời gian ngập.
                      Nếu buộc phải di chuyển, đi chậm và tránh xa chỗ có dòng nước chảy mạnh.
                    </div>

                  </div>
                </foreignObject>


                <foreignObject
                  x={config.pct(670)}
                  y={config.pct(690, 'h')}
                  width={config.pct(460)}
                  height={config.pct(200)}
                  style={{
                    border: 'none'

                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      fontSize: config.fontSize.tiny,
                      color: '#0d4b59',
                      lineHeight: 1.25,
                      textAlign: 'justify',
                      fontStyle: 'italic',
                      border: 'none'

                    }}
                  >
                    <div
                      style={{
                        color: '#0d4b59',
                        fontSize: config.fontSize.small,
                        fontWeight: 'bold',
                        fontStyle: 'normal',
                        marginBottom: '0.3em',
                        border: 'none'

                      }}
                    >
                      • 📢 Khuyến nghị:
                    </div>
                    Hãy chia sẻ thông tin này đến người thân, bạn bè, nhất là các hộ dân tại
                    khu vực trũng thấp để chủ động phòng tránh.
                  </div>
                </foreignObject>


                {/* Footer */}
                <defs>
                  <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1a1a4d"/>
                    <stop offset="100%" stopColor="#4a4a9d"/>
                  </linearGradient>
                </defs>

                <rect
                  x="0"
                  y={config.pct(860, 'h')}
                  width="100%"
                  height={config.pct(50, 'h')}
                  fill="url(#footerGradient)"
                />
                <text
                  x="50%"
                  y={config.pct(890, 'h')}
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

        </div>
      </CardContent>
    </Card>
  )
}