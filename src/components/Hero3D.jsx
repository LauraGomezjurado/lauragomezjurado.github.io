import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedStars() {
  const ref = useRef()
  const sphere = useMemo(() => {
    const positions = new Float32Array(5000 * 3)
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#6366f1"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function FloatingGeometry() {
  const meshRef = useRef()
  const meshRef2 = useRef()
  const meshRef3 = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.x = state.clock.elapsedTime * -0.4
      meshRef2.current.rotation.y = state.clock.elapsedTime * -0.2
      meshRef2.current.position.y = Math.cos(state.clock.elapsedTime) * 0.5
    }
    if (meshRef3.current) {
      meshRef3.current.rotation.x = state.clock.elapsedTime * 0.3
      meshRef3.current.rotation.z = state.clock.elapsedTime * 0.4
      meshRef3.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.3
    }
  })

  return (
    <>
      <mesh ref={meshRef} position={[-3, 0, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={meshRef2} position={[3, 0, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={meshRef3} position={[0, 0, -2]}>
        <tetrahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
    </>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedStars />
        <FloatingGeometry />
      </Canvas>
    </div>
  )
}

