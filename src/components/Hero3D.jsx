import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GrowingSpiral() {
  const groupRef = useRef()
  const [scale, setScale] = useState(0)
  
  useEffect(() => {
    // Animate scale from 0 to 1 over 3 seconds
    const duration = 3000
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic for smooth growth
      const eased = 1 - Math.pow(1 - progress, 3)
      setScale(eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [])

  // Create spiral geometry
  const spiralGeometry = useMemo(() => {
    const points = []
    const numPoints = 200
    const maxRadius = 3
    const turns = 3
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const angle = t * Math.PI * 2 * turns
      const radius = t * maxRadius
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      const z = (t - 0.5) * 0.3
      points.push(x, y, z)
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    return geometry
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow rotation
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main spiral */}
      <line geometry={spiralGeometry}>
        <lineBasicMaterial
          color="#B8860B"
          transparent
          opacity={0.5}
        />
      </line>
      
      {/* Additional spirals for depth */}
      {[1, 2].map((layer, idx) => {
        const layerGeometry = spiralGeometry.clone()
        layerGeometry.translate(0, 0, layer * 0.1)
        return (
          <line key={idx} geometry={layerGeometry}>
            <lineBasicMaterial
              color="#B8860B"
              transparent
              opacity={0.3 - idx * 0.1}
            />
          </line>
        )
      })}
      
      {/* Outer rings for depth effect */}
      {[0.5, 1, 1.5, 2, 2.5, 3].map((radius, idx) => (
        <mesh key={`ring-${idx}`} position={[0, 0, -0.2 + idx * 0.05]}>
          <ringGeometry args={[radius * 0.95, radius, 64]} />
          <meshBasicMaterial
            color="#B8860B"
            transparent
            opacity={Math.max(0.1 - idx * 0.015, 0.02)}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <GrowingSpiral />
      </Canvas>
    </div>
  )
}

