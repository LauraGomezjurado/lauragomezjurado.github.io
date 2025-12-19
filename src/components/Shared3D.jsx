import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Shared spiral component - can be customized per section
export function Spiral3D({ 
  position = [0, 0, -2], 
  scale = 1, 
  rotationSpeed = 0.1,
  opacity = 0.3,
  maxRadius = 2.5,
  turns = 2.5,
  numRings = 5
}) {
  const groupRef = useRef()

  // Create spiral geometry
  const spiralGeometry = useMemo(() => {
    const points = []
    const numPoints = 150
    
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
  }, [maxRadius, turns])

  useFrame((state) => {
    if (groupRef.current) {
      // Consistent slow rotation
      groupRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main spiral */}
      <line geometry={spiralGeometry}>
        <lineBasicMaterial
          color="#B8860B"
          transparent
          opacity={opacity}
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
              opacity={opacity * (0.6 - idx * 0.2)}
            />
          </line>
        )
      })}
      
      {/* Outer rings for depth effect */}
      {Array.from({ length: numRings }, (_, idx) => {
        const radius = (idx + 1) * (maxRadius / numRings)
        return (
          <mesh key={`ring-${idx}`} position={[0, 0, -0.2 + idx * 0.05]}>
            <ringGeometry args={[radius * 0.95, radius, 64]} />
            <meshBasicMaterial
              color="#B8860B"
              transparent
              opacity={Math.max(opacity * 0.3 - idx * 0.05, 0.02)}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Shared 3D background component
export default function Shared3D({ 
  variant = 'default',
  opacity = 0.2 
}) {
  const configs = {
    hero: {
      position: [0, 0, -2],
      scale: 1,
      maxRadius: 3,
      turns: 3,
      numRings: 6
    },
    about: {
      position: [2, 0, -2],
      scale: 0.8,
      maxRadius: 2,
      turns: 2,
      numRings: 4
    },
    portfolio: {
      position: [-2, 0, -2],
      scale: 0.7,
      maxRadius: 1.8,
      turns: 2.5,
      numRings: 5
    },
    contact: {
      position: [0, 0, -2],
      scale: 0.9,
      maxRadius: 2.2,
      turns: 2.2,
      numRings: 4
    },
    skills: {
      position: [0, 0, -2],
      scale: 0.6,
      maxRadius: 1.5,
      turns: 2,
      numRings: 3
    },
    default: {
      position: [0, 0, -2],
      scale: 0.8,
      maxRadius: 2,
      turns: 2.5,
      numRings: 4
    }
  }

  const config = configs[variant] || configs.default

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-visible" style={{ willChange: 'transform' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <Spiral3D 
          position={config.position}
          scale={config.scale}
          rotationSpeed={0.1}
          opacity={opacity}
          maxRadius={config.maxRadius}
          turns={config.turns}
          numRings={config.numRings}
        />
      </Canvas>
    </div>
  )
}
