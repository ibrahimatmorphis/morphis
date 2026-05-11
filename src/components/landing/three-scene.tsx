"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { MeshDistortMaterial, Float, Environment, Sphere } from "@react-three/drei"
import { useRef, Suspense } from "react"
import type { Group, Mesh } from "three"
import * as THREE from "three"

function MorphingCore() {
  const meshRef = useRef<Mesh>(null)
  const wireframeRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x = state.clock.elapsedTime * -0.1
      wireframeRef.current.rotation.y = state.clock.elapsedTime * -0.12
    }
  })

  return (
    <group>
      {/* Main distorted sphere */}
      <Sphere ref={meshRef} args={[1.4, 128, 128]}>
        <MeshDistortMaterial
          color="#7BC53A"
          distort={0.45}
          speed={2}
          roughness={0.1}
          metalness={0.3}
          envMapIntensity={1}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <mesh ref={wireframeRef} scale={1.55}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#7BC53A" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

function FloatingCube({
  position,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number]
  scale?: number
  speed?: number
}) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.4
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0.6}
          emissive="#7BC53A"
          emissiveIntensity={0.05}
        />
      </mesh>
    </Float>
  )
}

function FloatingRing({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.2
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={ringRef} position={position}>
        <torusGeometry args={[0.3, 0.04, 16, 100]} />
        <meshStandardMaterial color="#7BC53A" roughness={0.3} metalness={0.7} />
      </mesh>
    </Float>
  )
}

function ParticleField() {
  const groupRef = useRef<Group>(null)
  const count = 80
  const positions = useRef<Float32Array>(
    (() => {
      const arr = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const radius = 4 + Math.random() * 3
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        arr[i * 3 + 2] = radius * Math.cos(phi)
      }
      return arr
    })(),
  )

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions.current}
            itemSize={3}
            args={[positions.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#7BC53A"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#7BC53A" />
      <pointLight position={[5, -3, 2]} intensity={0.3} color="#ffffff" />

      <Suspense fallback={null}>
        <MorphingCore />

        {/* Floating accent objects */}
        <FloatingCube position={[2.5, 1.5, 0]} scale={0.8} speed={1} />
        <FloatingCube position={[-2.5, -1, 1]} scale={0.6} speed={1.3} />
        <FloatingCube position={[2, -1.8, -1]} scale={0.5} speed={0.8} />
        <FloatingCube position={[-2, 2, -0.5]} scale={0.4} speed={1.1} />

        <FloatingRing position={[3, 0.5, -1]} />
        <FloatingRing position={[-2.8, 1, 0.5]} />

        <ParticleField />

        <Environment preset="city" />
      </Suspense>
    </>
  )
}

export function ThreeScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
