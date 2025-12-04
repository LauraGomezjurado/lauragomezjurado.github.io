import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function ContactGeometry() {
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

  useFrame((state) => {
    // Large Icosahedron - center piece
    if (shape1.current) {
      shape1.current.rotation.x = state.clock.elapsedTime * 0.3
      shape1.current.rotation.y = state.clock.elapsedTime * 0.4
      shape1.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.8
    }
    // Torus - orbiting
    if (shape2.current) {
      shape2.current.rotation.x = state.clock.elapsedTime * 0.5
      shape2.current.rotation.y = state.clock.elapsedTime * 0.3
      shape2.current.position.x = Math.cos(state.clock.elapsedTime * 0.4) * 3
      shape2.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 2
    }
    // Octahedron - floating
    if (shape3.current) {
      shape3.current.rotation.x = state.clock.elapsedTime * 0.4
      shape3.current.rotation.z = state.clock.elapsedTime * 0.35
      shape3.current.position.x = Math.sin(state.clock.elapsedTime * 0.6) * 3.5
      shape3.current.position.y = Math.cos(state.clock.elapsedTime * 0.6) * 1.5
    }
    // Dodecahedron - slow elegant rotation
    if (shape4.current) {
      shape4.current.rotation.x = state.clock.elapsedTime * 0.2
      shape4.current.rotation.y = state.clock.elapsedTime * 0.3
      shape4.current.position.x = Math.cos(state.clock.elapsedTime * 0.35) * 4
      shape4.current.position.z = Math.sin(state.clock.elapsedTime * 0.35) * 1.5
    }
    // Tetrahedron - dynamic movement
    if (shape5.current) {
      shape5.current.rotation.x = state.clock.elapsedTime * 0.6
      shape5.current.rotation.y = state.clock.elapsedTime * 0.45
      shape5.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 2
      shape5.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 1.8
    }
    // Sphere - smooth rotation
    if (shape6.current) {
      shape6.current.rotation.x = state.clock.elapsedTime * 0.35
      shape6.current.rotation.y = state.clock.elapsedTime * 0.45
      shape6.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 4.5
      shape6.current.position.y = Math.cos(state.clock.elapsedTime * 0.4) * 2.5
    }
    // Box - tumbling
    if (shape7.current) {
      shape7.current.rotation.x = state.clock.elapsedTime * 0.5
      shape7.current.rotation.y = state.clock.elapsedTime * 0.4
      shape7.current.rotation.z = state.clock.elapsedTime * 0.3
      shape7.current.position.x = Math.cos(state.clock.elapsedTime * 0.55) * 4.2
      shape7.current.position.z = Math.sin(state.clock.elapsedTime * 0.45) * 1.8
    }
    // Cone - spinning
    if (shape8.current) {
      shape8.current.rotation.y = state.clock.elapsedTime * 0.6
      shape8.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 2.2
      shape8.current.position.x = Math.cos(state.clock.elapsedTime * 0.4) * 3.8
    }
    // Cylinder - rotating
    if (shape9.current) {
      shape9.current.rotation.x = state.clock.elapsedTime * 0.4
      shape9.current.rotation.z = state.clock.elapsedTime * 0.5
      shape9.current.position.y = Math.cos(state.clock.elapsedTime * 0.55) * 2.3
      shape9.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 2
    }
    // Torus Knot - complex
    if (shape10.current) {
      shape10.current.rotation.x = state.clock.elapsedTime * 0.45
      shape10.current.rotation.y = state.clock.elapsedTime * 0.55
      shape10.current.rotation.z = state.clock.elapsedTime * 0.35
      shape10.current.position.x = Math.sin(state.clock.elapsedTime * 0.48) * 4.8
      shape10.current.position.y = Math.cos(state.clock.elapsedTime * 0.52) * 2.8
    }
  })

  return (
    <>
      <mesh ref={shape1} position={[0, 0, -1.5]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={shape2} position={[0, 0, -2]}>
        <torusGeometry args={[0.8, 0.3, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={shape3} position={[0, 0, -1]}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
      <mesh ref={shape4} position={[0, 0, -2.5]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#a855f7" wireframe />
      </mesh>
      <mesh ref={shape5} position={[0, 0, -1.2]}>
        <tetrahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={shape6} position={[0, 0, -1.8]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
      <mesh ref={shape7} position={[0, 0, -1.3]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#ec4899" wireframe />
      </mesh>
      <mesh ref={shape8} position={[0, 0, -1.6]}>
        <coneGeometry args={[0.55, 1.1, 8]} />
        <meshStandardMaterial color="#a855f7" wireframe />
      </mesh>
      <mesh ref={shape9} position={[0, 0, -1.4]}>
        <cylinderGeometry args={[0.45, 0.45, 1.1, 32]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh ref={shape10} position={[0, 0, -1.9]}>
        <torusKnotGeometry args={[0.6, 0.18, 100, 16]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
    </>
  )
}

export default function Contact3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-20">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <ContactGeometry />
      </Canvas>
    </div>
  )
}

