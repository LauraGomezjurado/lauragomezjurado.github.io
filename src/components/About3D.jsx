import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function AboutGeometry() {
  const meshRef1 = useRef()
  const meshRef2 = useRef()
  const meshRef3 = useRef()
  const meshRef4 = useRef()

  useFrame((state) => {
    if (meshRef1.current) {
      meshRef1.current.rotation.x = state.clock.elapsedTime * 0.3
      meshRef1.current.rotation.y = state.clock.elapsedTime * 0.2
      meshRef1.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.x = state.clock.elapsedTime * -0.25
      meshRef2.current.rotation.z = state.clock.elapsedTime * 0.3
      meshRef2.current.position.x = Math.cos(state.clock.elapsedTime * 0.5) * 2
    }
    if (meshRef3.current) {
      meshRef3.current.rotation.y = state.clock.elapsedTime * 0.4
      meshRef3.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 1.5
    }
    if (meshRef4.current) {
      meshRef4.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef4.current.rotation.y = state.clock.elapsedTime * -0.3
      meshRef4.current.position.z = Math.cos(state.clock.elapsedTime * 0.6) * 1.5
    }
  })

  return (
    <>
      <mesh ref={meshRef1} position={[-4, 1, -1]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={meshRef2} position={[4, -1, -1]}>
        <torusGeometry args={[0.5, 0.2, 16, 100]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
      <mesh ref={meshRef3} position={[0, 2, -2]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={meshRef4} position={[0, -2, -1.5]}>
        <coneGeometry args={[0.5, 1, 8]} />
        <meshStandardMaterial color="#a855f7" wireframe />
      </mesh>
    </>
  )
}

export default function About3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-30">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <AboutGeometry />
      </Canvas>
    </div>
  )
}

