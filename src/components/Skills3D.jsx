import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function SkillsGeometry() {
  const shape1 = useRef()
  const shape2 = useRef()
  const shape3 = useRef()
  const shape4 = useRef()
  const shape5 = useRef()
  const shape6 = useRef()
  const shape7 = useRef()
  const shape8 = useRef()
  const shape9 = useRef()
  const shape10 = useRef()
  const shape11 = useRef()
  const shape12 = useRef()

  useFrame((state) => {
    // Icosahedron - rotating and floating
    if (shape1.current) {
      shape1.current.rotation.x = state.clock.elapsedTime * 0.4
      shape1.current.rotation.y = state.clock.elapsedTime * 0.5
      shape1.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 1.2
      shape1.current.position.x = Math.cos(state.clock.elapsedTime * 0.4) * 1.5
    }
    // Torus - spinning and moving
    if (shape2.current) {
      shape2.current.rotation.x = state.clock.elapsedTime * 0.6
      shape2.current.rotation.z = state.clock.elapsedTime * 0.3
      shape2.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2
      shape2.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 1
    }
    // Octahedron - rotating on multiple axes
    if (shape3.current) {
      shape3.current.rotation.x = state.clock.elapsedTime * 0.3
      shape3.current.rotation.y = state.clock.elapsedTime * 0.4
      shape3.current.rotation.z = state.clock.elapsedTime * 0.2
      shape3.current.position.y = Math.cos(state.clock.elapsedTime * 0.7) * 1.5
    }
    // Dodecahedron - slow rotation
    if (shape4.current) {
      shape4.current.rotation.x = state.clock.elapsedTime * 0.25
      shape4.current.rotation.y = state.clock.elapsedTime * 0.35
      shape4.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 2.5
      shape4.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 1
    }
    // Tetrahedron - fast spinning
    if (shape5.current) {
      shape5.current.rotation.x = state.clock.elapsedTime * 0.7
      shape5.current.rotation.y = state.clock.elapsedTime * 0.5
      shape5.current.position.z = Math.sin(state.clock.elapsedTime * 0.6) * 1.5
    }
    // Torus Knot - complex movement
    if (shape6.current) {
      shape6.current.rotation.x = state.clock.elapsedTime * 0.4
      shape6.current.rotation.y = state.clock.elapsedTime * 0.6
      shape6.current.rotation.z = state.clock.elapsedTime * 0.3
      shape6.current.position.y = Math.cos(state.clock.elapsedTime * 0.8) * 1.8
    }
    // Sphere - smooth rotation
    if (shape7.current) {
      shape7.current.rotation.x = state.clock.elapsedTime * 0.35
      shape7.current.rotation.y = state.clock.elapsedTime * 0.45
      shape7.current.position.x = Math.sin(state.clock.elapsedTime * 0.4) * 3
      shape7.current.position.y = Math.cos(state.clock.elapsedTime * 0.5) * 1.2
    }
    // Box - tumbling
    if (shape8.current) {
      shape8.current.rotation.x = state.clock.elapsedTime * 0.5
      shape8.current.rotation.y = state.clock.elapsedTime * 0.4
      shape8.current.rotation.z = state.clock.elapsedTime * 0.3
      shape8.current.position.x = Math.cos(state.clock.elapsedTime * 0.6) * 3.5
      shape8.current.position.z = Math.sin(state.clock.elapsedTime * 0.4) * 1.2
    }
    // Cone - spinning
    if (shape9.current) {
      shape9.current.rotation.y = state.clock.elapsedTime * 0.6
      shape9.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 2
      shape9.current.position.x = Math.cos(state.clock.elapsedTime * 0.3) * 2.8
    }
    // Cylinder - rotating
    if (shape10.current) {
      shape10.current.rotation.x = state.clock.elapsedTime * 0.4
      shape10.current.rotation.z = state.clock.elapsedTime * 0.5
      shape10.current.position.y = Math.cos(state.clock.elapsedTime * 0.6) * 1.8
      shape10.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 1.5
    }
    // Ring/Torus - different size
    if (shape11.current) {
      shape11.current.rotation.x = state.clock.elapsedTime * 0.5
      shape11.current.rotation.y = state.clock.elapsedTime * 0.35
      shape11.current.position.x = Math.sin(state.clock.elapsedTime * 0.45) * 4
      shape11.current.position.y = Math.cos(state.clock.elapsedTime * 0.55) * 1.5
    }
    // Icosahedron - smaller variant
    if (shape12.current) {
      shape12.current.rotation.x = state.clock.elapsedTime * 0.45
      shape12.current.rotation.y = state.clock.elapsedTime * 0.55
      shape12.current.rotation.z = state.clock.elapsedTime * 0.25
      shape12.current.position.x = Math.cos(state.clock.elapsedTime * 0.35) * 3.2
      shape12.current.position.z = Math.sin(state.clock.elapsedTime * 0.65) * 1.8
    }
  })

  return (
    <>
      <mesh ref={shape1} position={[-4, 0, -2]}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={shape2} position={[4, 1, -1.5]}>
        <torusGeometry args={[0.7, 0.25, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={shape3} position={[0, 2, -2]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
      <mesh ref={shape4} position={[-3, -1.5, -1]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#a855f7" wireframe />
      </mesh>
      <mesh ref={shape5} position={[3, -1, -1.5]}>
        <tetrahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={shape6} position={[0, -2, -1]}>
        <torusKnotGeometry args={[0.5, 0.15, 100, 16]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={shape7} position={[-5, 1.5, -1.8]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
      <mesh ref={shape8} position={[5, -1.5, -1.2]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#a855f7" wireframe />
      </mesh>
      <mesh ref={shape9} position={[-2, 2.5, -2.2]}>
        <coneGeometry args={[0.5, 1, 8]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={shape10} position={[2, -2.5, -1.3]}>
        <cylinderGeometry args={[0.4, 0.4, 1, 32]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={shape11} position={[-4.5, -0.5, -1.5]}>
        <torusGeometry args={[0.6, 0.2, 16, 100]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
      <mesh ref={shape12} position={[4.5, 0.5, -1.8]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#a855f7" wireframe />
      </mesh>
    </>
  )
}

export default function Skills3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-25">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <SkillsGeometry />
      </Canvas>
    </div>
  )
}

