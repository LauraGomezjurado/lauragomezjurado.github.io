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

// 3D Swirling Figure-Eight Pattern
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
        // Color gradient: lighter orange-brown to darker reddish-brown
        const positionRatio = i / lines.length
        const hue = 0.08 + positionRatio * 0.05 // Orange-brown range
        const saturation = 0.6 + positionRatio * 0.2
        const lightness = 0.5 - positionRatio * 0.15
        
        const color = new THREE.Color().setHSL(hue, saturation, lightness)
        // Reduce opacity overall, especially in center area
        const centerDistance = Math.abs(positionRatio - 0.5) * 2
        const lineOpacity = (0.25 + (centerDistance * 0.25)) * opacity

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

// Shared pattern component that can be used across sections
export function SwirlingPattern3D({ position = [0, 0, 0], scale = 1.2, opacity = 1 }) {
  return <SwirlingPattern position={position} scale={scale} opacity={opacity} />
}

export default function AbstractPattern({ variant = 'hero' }) {
  // Different configurations for different sections with offsets for continuity
  const configs = {
    hero: {
      overlay: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 70%)',
      cameraPosition: [0, 0, 4],
      sectionOffset: 0,
      scale: 1.2,
      opacity: 1
    },
    about: {
      overlay: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 70%)',
      cameraPosition: [0, 0, 4],
      sectionOffset: 50, // Offset to continue animation smoothly
      scale: 1.15,
      opacity: 0.9
    },
    portfolio: {
      overlay: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 70%)',
      cameraPosition: [0, 0, 4],
      sectionOffset: 100, // Further offset
      scale: 1.1,
      opacity: 0.85
    }
  }

  const config = configs[variant] || configs.hero

  return (
    <>
      {/* 3D Pattern - positioned more to the sides, extends beyond section bounds */}
      <div className="absolute inset-0 overflow-visible pointer-events-none" style={{ zIndex: 1 }}>
        <Canvas camera={{ position: config.cameraPosition, fov: 50 }}>
          <ambientLight intensity={0.4} />
          <SwirlingPattern 
            variant={variant}
            sectionOffset={config.sectionOffset}
            scale={config.scale}
            opacity={config.opacity}
          />
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
