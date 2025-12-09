import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function PortfolioTorus() {
  const torusRef = useRef()
  
  useFrame((state) => {
    if (torusRef.current) {
      torusRef.current.rotation.x = state.clock.elapsedTime * 0.08
      torusRef.current.rotation.y = state.clock.elapsedTime * 0.12
      torusRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.15
    }
  })

  return (
    <mesh ref={torusRef} position={[-3, 0, -2]}>
      <torusGeometry args={[1, 0.4, 24, 64]} />
      <meshStandardMaterial 
        color="#B8860B"
        wireframe={true}
        emissive="#B8860B"
        emissiveIntensity={0.18}
        metalness={0.8}
        roughness={0.2}
        opacity={0.5}
        transparent
      />
    </mesh>
  )
}

export default function Portfolio3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#B8860B" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#B8860B" />
        <PortfolioTorus />
      </Canvas>
    </div>
  )
}

