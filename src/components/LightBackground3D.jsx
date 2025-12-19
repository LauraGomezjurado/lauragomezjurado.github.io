import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Geometric rings component for light backgrounds
export function GeometricRings({ 
  position = [0, 0, -2], 
  scale = 1, 
  rotationSpeed = 0.1,
  opacity = 0.3,
  numRings = 4
}) {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation
      groupRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Concentric rings with varying sizes */}
      {Array.from({ length: numRings }, (_, idx) => {
        const radius = (idx + 1) * 0.8
        const ringWidth = 0.15
        return (
          <mesh key={`ring-${idx}`} position={[0, 0, idx * 0.1]}>
            <ringGeometry args={[radius - ringWidth, radius, 64]} />
            <meshBasicMaterial
              color="#B8860B"
              transparent
              opacity={opacity * (1 - idx * 0.15)}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
      
      {/* Connecting lines between rings */}
      {Array.from({ length: 8 }, (_, idx) => {
        const angle = (idx / 8) * Math.PI * 2
        const startRadius = 0.5
        const endRadius = numRings * 0.8
        
        const points = [
          new THREE.Vector3(startRadius * Math.cos(angle), startRadius * Math.sin(angle), 0),
          new THREE.Vector3(endRadius * Math.cos(angle), endRadius * Math.sin(angle), 0)
        ]
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        return (
          <line key={`line-${idx}`} geometry={geometry}>
            <lineBasicMaterial
              color="#B8860B"
              transparent
              opacity={opacity * 0.4}
            />
          </line>
        )
      })}
    </group>
  )
}

// Abstract geometric shapes component
export function AbstractShapes({ 
  position = [0, 0, -2], 
  scale = 1, 
  rotationSpeed = 0.08,
  opacity = 0.3
}) {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Central hexagon */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 6]} />
        <meshBasicMaterial
          color="#B8860B"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Outer geometric pattern */}
      {Array.from({ length: 6 }, (_, idx) => {
        const angle = (idx / 6) * Math.PI * 2
        const radius = 1.8
        const x = radius * Math.cos(angle)
        const y = radius * Math.sin(angle)
        
        return (
          <mesh key={`shape-${idx}`} position={[x, y, 0]}>
            <ringGeometry args={[0.3, 0.5, 4]} />
            <meshBasicMaterial
              color="#B8860B"
              transparent
              opacity={opacity * 0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
      
      {/* Connecting lines */}
      {Array.from({ length: 6 }, (_, idx) => {
        const angle = (idx / 6) * Math.PI * 2
        const innerRadius = 1.2
        const outerRadius = 1.8
        
        const points = [
          new THREE.Vector3(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle), 0),
          new THREE.Vector3(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle), 0)
        ]
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        return (
          <line key={`connector-${idx}`} geometry={geometry}>
            <lineBasicMaterial
              color="#B8860B"
              transparent
              opacity={opacity * 0.5}
            />
          </line>
        )
      })}
    </group>
  )
}

// Light background 3D component - uses geometric patterns instead of spirals
export default function LightBackground3D({ 
  variant = 'rings',
  opacity = 0.35 
}) {
  const configs = {
    about: {
      position: [2, 0, -2],
      scale: 0.9,
      numRings: 5
    },
    portfolio: {
      position: [-2, 0, -2],
      scale: 0.8,
      numRings: 4
    },
    default: {
      position: [0, 0, -2],
      scale: 0.85,
      numRings: 4
    }
  }

  const config = configs[variant] || configs.default

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        {variant === 'portfolio' ? (
          <AbstractShapes 
            position={config.position}
            scale={config.scale}
            rotationSpeed={0.08}
            opacity={opacity}
          />
        ) : (
          <GeometricRings 
            position={config.position}
            scale={config.scale}
            rotationSpeed={0.1}
            opacity={opacity}
            numRings={config.numRings}
          />
        )}
      </Canvas>
    </div>
  )
}
