import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Shared animation state across all pattern instances
let globalTime = 0
let animationId = null

// Update global time continuously
if (typeof window !== 'undefined') {
  const updateGlobalTime = () => {
    globalTime += 0.016 // ~60fps
    animationId = requestAnimationFrame(updateGlobalTime)
  }
  updateGlobalTime()
}

// Shared color function - ensures all patterns match the same style (warmer yellow-orange tones)
function getPatternColor(positionRatio, opacity = 1) {
  // Warmer yellow-orange tone: shift towards yellow, less red
  // Hue range: 0.08-0.18 (red-orange to yellow-orange) - warmer, more yellow
  const hue = 0.08 + positionRatio * 0.10 // Red-orange to yellow-orange (warmer, more yellow)
  const saturation = 0.85 + positionRatio * 0.1 // Very high saturation for vibrant warmth
  const lightness = 0.6 - positionRatio * 0.12 // Brighter for warmth
  const color = new THREE.Color().setHSL(hue, saturation, lightness)
  const centerDistance = Math.abs(positionRatio - 0.5) * 2
  const lineOpacity = (0.25 + (centerDistance * 0.25)) * opacity
  return { color, opacity: lineOpacity }
}

// 3D Swirling Figure-Eight Pattern (Hero)
function SwirlingPattern({ position = [0, 0, 0], scale = 1.2, opacity = 1, variant = 'hero', sectionOffset = 0 }) {
  const groupRef = useRef()
  const linesRef = useRef([])

  // Create multiple parallel lines forming figure-eight pattern
  const lines = useMemo(() => {
    const numLines = 200
    const lineSpacing = 0.02
    const lines = []

    for (let i = 0; i < numLines; i++) {
      const offset = (i - numLines / 2) * lineSpacing
      const points = []
      const numPoints = 300

      // Generate figure-eight parametric curve
      for (let j = 0; j <= numPoints; j++) {
        const t = j / numPoints
        const angle = t * Math.PI * 4 // Two full rotations for figure-eight
        
        // Figure-eight parametric equations with offset for parallel lines
        // Larger scale to make it more impressive
        const radius = 1.5 + offset * 0.4
        const x = Math.sin(angle) * radius
        const y = Math.sin(angle * 2) * (radius * 0.6 + offset * 0.2)
        const z = (t - 0.5) * 0.3 + offset * 0.15 // More depth
        
        points.push(x, y, z)
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
      lines.push({ geometry, offset, index: i })
    }

    return lines
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      // Use global time + section offset for continuous animation across sections
      const time = globalTime + sectionOffset
      
      // Variant-specific variations
      const rotationSpeed = variant === 'hero' ? 0.05 : variant === 'about' ? 0.04 : 0.045
      const movementSpeed = variant === 'hero' ? 0.08 : variant === 'about' ? 0.07 : 0.075
      const movementAmount = variant === 'hero' ? 0.3 : variant === 'about' ? 0.25 : 0.28
      
      // Slow rotation for dynamic effect - continuous across sections
      groupRef.current.rotation.z = time * rotationSpeed
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1
      // Offset position to move pattern more to sides/background
      groupRef.current.position.x = Math.sin(time * movementSpeed) * movementAmount
      groupRef.current.position.y = Math.cos(time * 0.06) * 0.2
    }

    // Animate individual lines for more dynamic effect
    linesRef.current.forEach((line, i) => {
      if (line) {
        const time = globalTime + sectionOffset
        const phase = (i / lines.length) * Math.PI * 2
        line.position.z = Math.sin(time * 0.2 + phase) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {lines.map((line, i) => {
        const positionRatio = i / lines.length
        const { color, opacity: lineOpacity } = getPatternColor(positionRatio, opacity)

        return (
          <line
            key={i}
            ref={(el) => {
              if (el) linesRef.current[i] = el
            }}
            geometry={line.geometry}
          >
            <lineBasicMaterial
              color={color}
              transparent
              opacity={lineOpacity}
              linewidth={1}
            />
          </line>
        )
      })}
      
      {/* Central void sphere for depth */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

// Overlapping Circles Pattern (About) - Venn diagram style
function OverlappingCircles({ position = [0, 0, 0], scale = 1.2, opacity = 1, sectionOffset = 0 }) {
  const groupRef = useRef()
  const circlesRef = useRef([])

  const circles = useMemo(() => {
    const numCircles = 40
    const circles = []
    const baseRadius = 1.2
    
    for (let i = 0; i < numCircles; i++) {
      const offset = (i - numCircles / 2) * 0.03
      const radius = baseRadius + offset * 0.2
      
      // Create two overlapping circles
      const points1 = []
      const points2 = []
      const numPoints = 100
      
      for (let j = 0; j <= numPoints; j++) {
        const angle = (j / numPoints) * Math.PI * 2
        // First circle (left)
        const x1 = -0.3 + radius * Math.cos(angle)
        const y1 = radius * Math.sin(angle)
        const z1 = offset * 0.1
        points1.push(x1, y1, z1)
        
        // Second circle (right)
        const x2 = 0.3 + radius * Math.cos(angle)
        const y2 = radius * Math.sin(angle)
        const z2 = offset * 0.1
        points2.push(x2, y2, z2)
      }
      
      const geometry1 = new THREE.BufferGeometry()
      geometry1.setAttribute('position', new THREE.Float32BufferAttribute(points1, 3))
      const geometry2 = new THREE.BufferGeometry()
      geometry2.setAttribute('position', new THREE.Float32BufferAttribute(points2, 3))
      
      circles.push({ geometry1, geometry2, offset, index: i })
    }
    
    return circles
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      const time = globalTime + sectionOffset
      // Subtle rotation and pulsing
      groupRef.current.rotation.z = time * 0.02
      groupRef.current.scale.setScalar(1 + Math.sin(time * 0.1) * 0.05)
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {circles.map((circle, i) => {
        const positionRatio = i / circles.length
        const { color, opacity: lineOpacity } = getPatternColor(positionRatio, opacity)

        return (
          <group key={i}>
            <line geometry={circle.geometry1}>
              <lineBasicMaterial color={color} transparent opacity={lineOpacity} linewidth={1} />
            </line>
            <line geometry={circle.geometry2}>
              <lineBasicMaterial color={color} transparent opacity={lineOpacity} linewidth={1} />
            </line>
          </group>
        )
      })}
    </group>
  )
}

// Concentric Spirals Pattern (Portfolio) - different swirling style
function ConcentricSpirals({ position = [0, 0, 0], scale = 1.2, opacity = 1, sectionOffset = 0 }) {
  const groupRef = useRef()
  const spiralsRef = useRef([])

  const spirals = useMemo(() => {
    const numSpirals = 30
    const spirals = []
    
    for (let i = 0; i < numSpirals; i++) {
      const radius = 0.3 + (i / numSpirals) * 1.5
      const points = []
      const numPoints = 200
      const turns = 2 + (i / numSpirals) * 3
      
      for (let j = 0; j <= numPoints; j++) {
        const t = j / numPoints
        const angle = t * Math.PI * 2 * turns
        const r = radius * (1 + t * 0.3)
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        const z = (t - 0.5) * 0.2
        points.push(x, y, z)
      }
      
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
      spirals.push({ geometry, index: i })
    }
    
    return spirals
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      const time = globalTime + sectionOffset
      groupRef.current.rotation.z = time * 0.03
      groupRef.current.rotation.x = Math.sin(time * 0.08) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {spirals.map((spiral, i) => {
        const positionRatio = i / spirals.length
        const { color, opacity: lineOpacity } = getPatternColor(positionRatio, opacity)

        return (
          <line key={i} geometry={spiral.geometry}>
            <lineBasicMaterial color={color} transparent opacity={lineOpacity} linewidth={1} />
          </line>
        )
      })}
    </group>
  )
}

// Shared pattern component that can be used across sections
export function SwirlingPattern3D({ position = [0, 0, 0], scale = 1.2, opacity = 1 }) {
  return <SwirlingPattern position={position} scale={scale} opacity={opacity} />
}

export default function AbstractPattern({ variant = 'hero' }) {
  // Different configurations for different sections - each with unique pattern type
  const configs = {
    hero: {
      overlay: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 70%)',
      cameraPosition: [0, 0, 4],
      sectionOffset: 0,
      scale: 1.2,
      opacity: 1,
      patternType: 'swirling' // Figure-eight pattern
    },
    about: {
      overlay: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)',
      cameraPosition: [0, 0, 4],
      sectionOffset: 50,
      scale: 1.15,
      opacity: 0.9,
      patternType: 'circles' // Overlapping circles
    },
    portfolio: {
      overlay: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 70%)',
      cameraPosition: [0, 0, 4],
      sectionOffset: 100,
      scale: 1.1,
      opacity: 0.85,
      patternType: 'spirals' // Concentric spirals
    }
  }

  const config = configs[variant] || configs.hero

  // Render different pattern types based on variant
  const renderPattern = () => {
    switch (config.patternType) {
      case 'circles':
        return (
          <OverlappingCircles
            sectionOffset={config.sectionOffset}
            scale={config.scale}
            opacity={config.opacity}
          />
        )
      case 'spirals':
        return (
          <ConcentricSpirals
            sectionOffset={config.sectionOffset}
            scale={config.scale}
            opacity={config.opacity}
          />
        )
      default: // 'swirling'
        return (
          <SwirlingPattern
            variant={variant}
            sectionOffset={config.sectionOffset}
            scale={config.scale}
            opacity={config.opacity}
          />
        )
    }
  }

  return (
    <>
      {/* 3D Pattern - positioned more to the sides, extends beyond section bounds */}
      <div className="absolute inset-0 overflow-visible pointer-events-none" style={{ zIndex: 1 }}>
        <Canvas camera={{ position: config.cameraPosition, fov: 50 }}>
          <ambientLight intensity={0.4} />
          {renderPattern()}
        </Canvas>
      </div>
      
      {/* Dark radial gradient overlay - darker in center where text is */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          zIndex: 2,
          background: config.overlay
        }}
      />
    </>
  )
}
