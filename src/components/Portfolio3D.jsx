import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

function PortfolioParticles() {
  const ref = useRef()
  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta / 15
      ref.current.rotation.y += delta / 20
    }
  })

  return (
    <group rotation={[0, 0, -Math.PI / 4]}>
      <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#6366f1"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

function PortfolioShapes() {
  const shapeRef1 = useRef()
  const shapeRef2 = useRef()
  const shapeRef3 = useRef()

  useFrame((state) => {
    if (shapeRef1.current) {
      shapeRef1.current.rotation.x = state.clock.elapsedTime * 0.4
      shapeRef1.current.rotation.y = state.clock.elapsedTime * 0.3
      shapeRef1.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 1
    }
    if (shapeRef2.current) {
      shapeRef2.current.rotation.x = state.clock.elapsedTime * -0.35
      shapeRef2.current.rotation.z = state.clock.elapsedTime * 0.25
      shapeRef2.current.position.x = Math.cos(state.clock.elapsedTime * 0.6) * 2.5
    }
    if (shapeRef3.current) {
      shapeRef3.current.rotation.y = state.clock.elapsedTime * 0.5
      shapeRef3.current.position.z = Math.sin(state.clock.elapsedTime * 0.7) * 1.5
    }
  })

  return (
    <>
      <mesh ref={shapeRef1} position={[-5, 0, -2]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={shapeRef2} position={[5, 1, -2]}>
        <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={shapeRef3} position={[0, -1, -1.5]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
    </>
  )
}

export default function Portfolio3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-25">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <PortfolioParticles />
        <PortfolioShapes />
      </Canvas>
    </div>
  )
}

