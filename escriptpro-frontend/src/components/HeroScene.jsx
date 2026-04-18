import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Torus, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/* ── shared mouse state ── */
const mouse = new THREE.Vector2(0, 0)
const smoothMouse = new THREE.Vector2(0, 0)

function MouseTracker() {
  useEffect(() => {
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(() => {
    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.04
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.04
  })

  return null
}

/* ── mouse-reactive shapes ── */

function ReactiveOrb({ basePosition, color, scale = 1, influence = 0.8, distort = 0.3, speed = 2 }) {
  const ref = useRef()
  const origin = useRef(new THREE.Vector3(...basePosition))

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    ref.current.position.x = origin.current.x + smoothMouse.x * influence
    ref.current.position.y = origin.current.y + smoothMouse.y * influence * 0.6 + Math.sin(t * 0.5) * 0.15
    ref.current.position.z = origin.current.z + Math.sin(t * 0.3) * 0.1
    ref.current.rotation.x += delta * 0.08
    ref.current.rotation.y += delta * 0.12
  })

  return (
    <Sphere ref={ref} args={[1, 64, 64]} position={basePosition} scale={scale}>
      <MeshDistortMaterial color={color} roughness={0.15} metalness={0.1} distort={distort} speed={speed} transparent opacity={0.82} />
    </Sphere>
  )
}

function ReactiveRing({ basePosition, color, scale = 1, influence = 0.6 }) {
  const ref = useRef()
  const origin = useRef(new THREE.Vector3(...basePosition))

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    ref.current.position.x = origin.current.x + smoothMouse.x * influence
    ref.current.position.y = origin.current.y + smoothMouse.y * influence * 0.5 + Math.cos(t * 0.4) * 0.12
    ref.current.rotation.x += delta * 0.15
    ref.current.rotation.z += delta * 0.1
  })

  return (
    <Torus ref={ref} args={[0.6, 0.18, 24, 48]} position={basePosition} scale={scale}>
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.2} transparent opacity={0.75} />
    </Torus>
  )
}

function ReactiveCapsule({ basePosition, color, scale = 1, influence = 0.7 }) {
  const ref = useRef()
  const origin = useRef(new THREE.Vector3(...basePosition))

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    ref.current.position.x = origin.current.x + smoothMouse.x * influence
    ref.current.position.y = origin.current.y + smoothMouse.y * influence * 0.5 + Math.sin(t * 0.6 + 1) * 0.1
    ref.current.rotation.z += delta * 0.12
    ref.current.rotation.x += delta * 0.06
  })

  return (
    <mesh ref={ref} position={basePosition} scale={scale}>
      <capsuleGeometry args={[0.25, 0.7, 16, 32]} />
      <MeshDistortMaterial color={color} roughness={0.2} metalness={0.1} distort={0.12} speed={1.5} transparent opacity={0.8} />
    </mesh>
  )
}

function ReactivePlus({ basePosition, color, scale = 1, influence = 0.5 }) {
  const ref = useRef()
  const origin = useRef(new THREE.Vector3(...basePosition))

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    ref.current.position.x = origin.current.x + smoothMouse.x * influence
    ref.current.position.y = origin.current.y + smoothMouse.y * influence * 0.4 + Math.sin(t * 0.45 + 2) * 0.08
    ref.current.rotation.z += delta * 0.18
  })

  return (
    <group ref={ref} position={basePosition} scale={scale}>
      <RoundedBox args={[0.14, 0.56, 0.14]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} transparent opacity={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.56, 0.14, 0.14]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.15} transparent opacity={0.7} />
      </RoundedBox>
    </group>
  )
}

/* ── scene composition ── */

function SceneContent() {
  return (
    <>
      <MouseTracker />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#e8f4ff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} color="#6ee7f8" />

      <ReactiveOrb basePosition={[1.8, 0.3, -1]} color="#3a7bd5" scale={1.4} influence={1} distort={0.35} speed={2.5} />
      <ReactiveOrb basePosition={[-2.4, 1.2, -2]} color="#6ee7f8" scale={0.7} influence={0.6} distort={0.25} speed={1.8} />
      <ReactiveOrb basePosition={[-1.2, -1.8, -1.5]} color="#7ce4d8" scale={0.55} influence={0.5} distort={0.2} speed={2} />
      <ReactiveOrb basePosition={[3.2, -1.4, -2.5]} color="#1d2d50" scale={0.5} influence={0.4} distort={0.18} speed={1.5} />

      <ReactiveRing basePosition={[-2.8, -0.4, -0.8]} color="#3a7bd5" scale={0.6} influence={0.7} />
      <ReactiveRing basePosition={[2.6, 1.6, -1.8]} color="#6ee7f8" scale={0.4} influence={0.45} />

      <ReactiveCapsule basePosition={[3.6, 0.8, -1.2]} color="#7ce4d8" scale={0.6} influence={0.55} />
      <ReactiveCapsule basePosition={[-3.4, 1.6, -2]} color="#3a7bd5" scale={0.45} influence={0.35} />

      <ReactivePlus basePosition={[0.6, 2.2, -1.5]} color="#ffffff" scale={0.5} influence={0.6} />
      <ReactivePlus basePosition={[-1.6, -2.4, -2]} color="#6ee7f8" scale={0.35} influence={0.3} />
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneContent />
    </Canvas>
  )
}
