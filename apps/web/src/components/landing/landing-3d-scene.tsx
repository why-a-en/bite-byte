'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  RoundedBox,
  Torus,
  Sphere,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  QR Pattern — decorative dots arranged to suggest a QR code        */
/* ------------------------------------------------------------------ */

function QrPattern() {
  const dots: [number, number][] = [];
  // Grid of small dots (4x4 inner grid)
  for (let row = -1.5; row <= 1.5; row += 1) {
    for (let col = -1.5; col <= 1.5; col += 1) {
      // Skip corners (reserved for finder patterns)
      if (Math.abs(row) === 1.5 && Math.abs(col) === 1.5) continue;
      dots.push([col * 0.12, row * 0.12]);
    }
  }

  return (
    <group position={[0, 0, 0.05]}>
      {/* Corner finder patterns (3 larger squares) */}
      {(
        [
          [-0.3, 0.3],
          [0.3, 0.3],
          [-0.3, -0.3],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <mesh key={`finder-${i}`} position={[x, y, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Scattered inner dots */}
      {dots.map(([x, y], i) => (
        <mesh key={`dot-${i}`} position={[x, y, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={0.15}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  QR Card — slowly auto-rotates on Y axis                          */
/* ------------------------------------------------------------------ */

function QrCard() {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>
      <group ref={ref} position={[2.2, 0.5, -0.5]} rotation={[0, -0.3, 0.1]}>
        {/* Card base */}
        <RoundedBox args={[1.2, 1.2, 0.08]} radius={0.08}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.05}
            roughness={0.1}
            clearcoat={1}
          />
        </RoundedBox>
        {/* QR dot pattern on front face */}
        <QrPattern />
      </group>
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/*  Food plate — torus rim + rounded-box dome                         */
/* ------------------------------------------------------------------ */

function FoodPlate() {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group position={[0, 0, 0]}>
        {/* Plate rim */}
        <Torus args={[1.2, 0.15, 16, 48]} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.1}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </Torus>
        {/* Food dome */}
        <RoundedBox args={[1.4, 0.3, 1.4]} radius={0.15} position={[0, 0.15, 0]}>
          <meshPhysicalMaterial
            color="#f97316"
            metalness={0.3}
            roughness={0.15}
            transmission={0.4}
            thickness={0.5}
            ior={1.5}
          />
        </RoundedBox>
      </group>
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/*  Phone silhouette — dark body with glowing orange screen           */
/* ------------------------------------------------------------------ */

function Phone() {
  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[-2, -0.3, 0.5]} rotation={[0.1, 0.3, -0.05]}>
        {/* Phone body */}
        <RoundedBox args={[0.8, 1.5, 0.06]} radius={0.1}>
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
        {/* Screen — glowing orange */}
        <RoundedBox
          args={[0.65, 1.2, 0.01]}
          radius={0.06}
          position={[0, 0, 0.04]}
        >
          <meshPhysicalMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={0.4}
            metalness={0}
            roughness={0.3}
          />
        </RoundedBox>
      </group>
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/*  Ambient spheres — scattered glossy chrome orbs                    */
/* ------------------------------------------------------------------ */

const SPHERE_DATA: { pos: [number, number, number]; color: string; speed: number; intensity: number }[] = [
  { pos: [1.5, 1.2, 1], color: '#f97316', speed: 1.4, intensity: 0.5 },
  { pos: [-1.8, -1, 0.5], color: '#f97316', speed: 2.2, intensity: 0.4 },
  { pos: [0.5, -1.5, 1.5], color: '#ffffff', speed: 1.8, intensity: 0.6 },
  { pos: [-0.8, 1.6, -0.3], color: '#f97316', speed: 2.6, intensity: 0.3 },
  { pos: [2.5, -0.8, 0.8], color: '#ffffff', speed: 1.2, intensity: 0.7 },
  { pos: [-2.5, 0.9, -0.5], color: '#f97316', speed: 2.0, intensity: 0.5 },
  { pos: [0.3, 2, 0.2], color: '#ffffff', speed: 3.0, intensity: 0.4 },
  { pos: [-1.2, -1.8, 1.2], color: '#f97316', speed: 1.6, intensity: 0.8 },
  { pos: [1.8, 0.3, -1], color: '#d4d4d4', speed: 2.4, intensity: 0.5 },
  { pos: [-0.3, -0.5, 2], color: '#f97316', speed: 1.9, intensity: 0.6 },
];

function AmbientSpheres() {
  return (
    <>
      {SPHERE_DATA.map((s, i) => (
        <Float key={i} speed={s.speed} floatIntensity={s.intensity}>
          <Sphere args={[0.08, 16, 16]} position={s.pos}>
            <meshPhysicalMaterial
              color={s.color}
              metalness={0.9}
              roughness={0}
              clearcoat={1}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene group — slow overall rotation                               */
/* ------------------------------------------------------------------ */

function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Environment preset="city" />
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.3}
        scale={8}
        blur={2.5}
        far={4}
        color="#f97316"
      />

      {/* All objects in a slowly rotating group */}
      <group ref={groupRef}>
        <FoodPlate />
        <QrCard />
        <Phone />
        <AmbientSpheres />
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Canvas component                                         */
/* ------------------------------------------------------------------ */

export default function Landing3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
