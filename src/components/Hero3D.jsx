import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function MainTorus() {
  const torusRef = useRef()
  
  useFrame((state) => {
    if (torusRef.current) {
      // Very slow, elegant rotation
      torusRef.current.rotation.x = state.clock.elapsedTime * 0.1
      torusRef.current.rotation.y = state.clock.elapsedTime * 0.15
      // Subtle floating
      torusRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <mesh ref={torusRef} position={[0, 0, -2]}>
      <torusGeometry args={[2, 0.8, 32, 100]} />
      <meshStandardMaterial 
        color="#B8860B"
        wireframe={true}
        emissive="#B8860B"
        emissiveIntensity={0.25}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

function AmbientParticles() {
  const points = useRef()
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    for (let i = 0; i < 1000; i++) {
      const radius = 3 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.x -= delta / 20
      points.current.rotation.y -= delta / 25
    }
  })

  return (
    <Points ref={points} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#B8860B"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.35}
      />
    </Points>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#B8860B" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#B8860B" />
        <MainTorus />
        <AmbientParticles />
      </Canvas>
    </div>
  )
}

