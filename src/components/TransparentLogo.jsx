import { useEffect, useRef } from 'react'

export default function TransparentLogo({ src, alt, className, style }) {
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    
    if (!img || !canvas) return

    img.onload = () => {
      const ctx = canvas.getContext('2d')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      // Draw the image
      ctx.drawImage(img, 0, 0)
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Remove white pixels (make them transparent)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // If pixel is white or near-white (threshold: 240), make it transparent
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0 // Set alpha to 0 (fully transparent)
        }
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0)
      
      // Replace img src with canvas data URL
      img.style.display = 'none'
      canvas.style.display = 'block'
    }
  }, [src])

  return (
    <div className="relative inline-block" style={style}>
      <img 
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        style={{ display: 'block' }}
      />
      <canvas 
        ref={canvasRef}
        className={className}
        style={{ display: 'none' }}
      />
    </div>
  )
}

