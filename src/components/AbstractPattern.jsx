import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 3D Swirling Figure-Eight Pattern
function SwirlingPattern() {
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

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation for dynamic effect
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
      // Offset position to move pattern more to sides/background
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.3
      groupRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.06) * 0.2
    }

    // Animate individual lines for more dynamic effect
    linesRef.current.forEach((line, i) => {
      if (line) {
        const time = state.clock.elapsedTime
        const phase = (i / lines.length) * Math.PI * 2
        line.position.z = Math.sin(time * 0.2 + phase) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef} scale={1.2}>
      {lines.map((line, i) => {
        // Color gradient: lighter orange-brown to darker reddish-brown
        const positionRatio = i / lines.length
        const hue = 0.08 + positionRatio * 0.05 // Orange-brown range
        const saturation = 0.6 + positionRatio * 0.2
        const lightness = 0.5 - positionRatio * 0.15
        
        const color = new THREE.Color().setHSL(hue, saturation, lightness)
        // Reduce opacity overall, especially in center area
        const centerDistance = Math.abs(positionRatio - 0.5) * 2
        const opacity = 0.25 + (centerDistance * 0.25)

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
              opacity={opacity}
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

export default function AbstractPattern() {
  return (
    <>
      {/* 3D Pattern - positioned more to the sides */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <SwirlingPattern />
        </Canvas>
      </div>
      
      {/* Dark radial gradient overlay - darker in center where text is */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          zIndex: 2,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 70%)'
        }}
      />
    </>
  )
}
