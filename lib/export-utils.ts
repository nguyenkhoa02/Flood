// /**
//  * Utility functions for exporting bulletins as images
//  */
//
// export async function exportBulletinToImage(elementId: string, fileName = "bulletin.png"): Promise<void> {
//   try {
//     // Dynamic import to avoid issues in non-browser environments
//     const html2canvas = (await import("html2canvas")).default
//
//     const element = document.getElementById(elementId)
//     if (!element) {
//       throw new Error("Element not found")
//     }
//
//     // Create canvas from HTML element
//     const canvas = await html2canvas(element, {
//       scale: 2,
//       useCORS: true,
//       backgroundColor: "#ffffff",
//       logging: false,
//       allowTaint: true,
//     })
//
//     // Create download link
//     const link = document.createElement("a")
//     link.href = canvas.toDataURL("image/png")
//     link.download = fileName
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   } catch (error) {
//     console.error("Error exporting bulletin:", error)
//     throw error
//   }
// }
//
// export function generateBulletinFileName(date: string, location: string): string {
//   const sanitized = `${date.replace(/\./g, "-")}_${location.replace(/,\s/g, "_").replace(/\s/g, "-")}`
//   return `bulletin_${sanitized}.png`
// }
