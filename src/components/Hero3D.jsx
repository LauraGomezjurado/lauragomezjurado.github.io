import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Spiral3D } from './Shared3D'

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

  return (
    <group ref={groupRef} scale={scale}>
      <Spiral3D 
        position={[0, 0, -2]}
        scale={1}
        rotationSpeed={0.1}
        opacity={0.5}
        maxRadius={3}
        turns={3}
        numRings={6}
      />
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

