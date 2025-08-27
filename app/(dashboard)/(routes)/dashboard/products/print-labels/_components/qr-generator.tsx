"use client"

// Simple QR Code generator for labels
export function generateQRCodeSVG(data: string, size: number = 100): string {
  // Create a simple QR-like pattern for demonstration
  // In a real implementation, you'd use a proper QR code library
  const modules = 21 // Standard QR code size
  const moduleSize = size / modules
  
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="${size}" height="${size}" fill="white"/>`
  
  // Create a pattern based on the data
  const hash = simpleHash(data)
  
  // Add finder patterns (corners)
  const finderPattern = [
    [0, 0], [0, 14], [14, 0]
  ]
  
  finderPattern.forEach(([x, y]) => {
    // Outer square
    svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${7 * moduleSize}" height="${7 * moduleSize}" fill="black"/>`
    // Inner white square
    svg += `<rect x="${(x + 1) * moduleSize}" y="${(y + 1) * moduleSize}" width="${5 * moduleSize}" height="${5 * moduleSize}" fill="white"/>`
    // Center black square
    svg += `<rect x="${(x + 2) * moduleSize}" y="${(y + 2) * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" fill="black"/>`
  })
  
  // Add data modules based on hash
  for (let i = 0; i < modules; i++) {
    for (let j = 0; j < modules; j++) {
      // Skip finder patterns
      if ((i < 9 && j < 9) || (i < 9 && j > 11) || (i > 11 && j < 9)) continue
      
      // Generate pattern based on position and hash
      if ((hash + i * j) % 3 === 0) {
        svg += `<rect x="${i * moduleSize}" y="${j * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
      }
    }
  }
  
  svg += '</svg>'
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

export function generateBarcodeSVG(data: string, width: number = 100, height: number = 30): string {
  const bars = []
  const hash = simpleHash(data)
  
  // Generate bar pattern
  for (let i = 0; i < 20; i++) {
    const isBar = (hash + i) % 3 !== 0
    bars.push(isBar)
  }
  
  const barWidth = width / bars.length
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="${width}" height="${height}" fill="white"/>`
  
  bars.forEach((isBar, index) => {
    if (isBar) {
      svg += `<rect x="${index * barWidth}" y="0" width="${barWidth * 0.8}" height="${height}" fill="black"/>`
    }
  })
  
  svg += '</svg>'
  return `data:image/svg+xml;base64,${btoa(svg)}`
}