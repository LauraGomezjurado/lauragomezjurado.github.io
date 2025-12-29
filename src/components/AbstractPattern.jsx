import React from 'react'

export default function AbstractPattern() {
  // Generate parallel lines for swirling figure-eight pattern
  const generateSwirlingLines = (numLines, lineSpacing) => {
    const lines = []
    const centerX = 600
    const centerY = 400
    
    for (let i = 0; i < numLines; i++) {
      const offset = (i - numLines / 2) * lineSpacing
      const points = []
      
      // Create smooth figure-eight pattern with parallel lines
      for (let t = 0; t <= 1; t += 0.005) {
        const angle = t * Math.PI * 4 // Two full rotations
        // Varying radius creates the swirling effect
        const baseRadius = 140
        const radiusVariation = Math.sin(angle * 2) * 30
        const radius = baseRadius + offset * 0.4 + radiusVariation
        
        // Figure-eight parametric equations
        const x = centerX + Math.sin(angle) * radius
        const y = centerY + Math.sin(angle * 2) * (radius * 0.55 + offset * 0.15)
        points.push(`${x},${y}`)
      }
      
      lines.push(points)
    }
    
    return lines
  }

  const lines = generateSwirlingLines(250, 0.6)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A574" stopOpacity="0.65" />
            <stop offset="25%" stopColor="#C9A068" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#B8860B" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#A0780A" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8B4513" stopOpacity="0.65" />
          </linearGradient>
        </defs>
        
        {/* Render parallel lines forming swirling figure-eight pattern */}
        <g>
          {lines.map((points, i) => {
            // Vary opacity and color based on position for depth
            const positionRatio = i / lines.length
            const opacity = 0.35 + (Math.abs(positionRatio - 0.5) * 0.4)
            
            return (
              <polyline
                key={i}
                points={points.join(' ')}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="0.35"
                opacity={opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          })}
        </g>
        
        {/* Central void circle - creates depth effect */}
        <circle
          cx="600"
          cy="400"
          r="28"
          fill="#000000"
          opacity="1"
        />
      </svg>
    </div>
  )
}

