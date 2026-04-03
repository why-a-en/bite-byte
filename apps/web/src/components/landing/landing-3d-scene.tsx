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

const QR_DOTS: [number, number][] = (() => {
  const d: [number, number][] = [];
  for (let row = -1.5; row <= 1.5; row += 1) {
    for (let col = -1.5; col <= 1.5; col += 1) {
      if (Math.abs(row) === 1.5 && Math.abs(col) === 1.5) continue;
      d.push([col * 0.12, row * 0.12]);
    }
  }
  return d;
})();

const FINDER_POSITIONS: [number, number][] = [
  [-0.3, 0.3],
  [0.3, 0.3],
  [-0.3, -0.3],
];

/** Single face of QR dots — reused for front and back */
function QrFace({ zOffset, flipY }: { zOffset: number; flipY: boolean }) {
  return (
    <group position={[0, 0, zOffset]} rotation={[0, flipY ? Math.PI : 0, 0]}>
      {FINDER_POSITIONS.map(([x, y], i) => (
        <mesh key={`finder-${i}`} position={[x, y, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.025]} />
          <meshPhysicalMaterial
            color="#0f0f0f"
            metalness={0.4}
            roughness={0.15}
            clearcoat={0.8}
          />
        </mesh>
      ))}
      {QR_DOTS.map(([x, y], i) => (
        <mesh key={`dot-${i}`} position={[x, y, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.025]} />
          <meshPhysicalMaterial
            color="#0f0f0f"
            metalness={0.35}
            roughness={0.2}
            clearcoat={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Double-sided QR pattern — dots on front and back faces */
function QrPattern() {
  return (
    <group>
      <QrFace zOffset={0.05} flipY={false} />
      <QrFace zOffset={-0.05} flipY={true} />
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
        {/* Card base — frosted glass slab */}
        <RoundedBox args={[1.2, 1.2, 0.08]} radius={0.08}>
          <meshPhysicalMaterial
            color="#fafafa"
            metalness={0.02}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transmission={0.15}
            thickness={0.3}
            ior={1.45}
            envMapIntensity={1.2}
          />
        </RoundedBox>
        {/* QR dot pattern on both faces */}
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
        {/* Plate rim — porcelain-like ceramic */}
        <Torus args={[1.2, 0.15, 24, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshPhysicalMaterial
            color="#f5f0eb"
            metalness={0.02}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={0.8}
          />
        </Torus>
        {/* Plate center — slightly recessed dish surface */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <circleGeometry args={[1.05, 64]} />
          <meshPhysicalMaterial
            color="#f5f0eb"
            metalness={0.01}
            roughness={0.12}
            clearcoat={0.8}
          />
        </mesh>
        {/* Food dome — warm orange glass cloche */}
        <RoundedBox args={[1.4, 0.35, 1.4]} radius={0.17} position={[0, 0.18, 0]}>
          <meshPhysicalMaterial
            color="#f97316"
            metalness={0.15}
            roughness={0.1}
            transmission={0.5}
            thickness={0.8}
            ior={1.52}
            clearcoat={0.5}
            envMapIntensity={1.5}
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
        {/* Phone body — polished midnight aluminum */}
        <RoundedBox args={[0.8, 1.5, 0.06]} radius={0.1}>
          <meshPhysicalMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.12}
            clearcoat={0.6}
            clearcoatRoughness={0.1}
            envMapIntensity={1.2}
          />
        </RoundedBox>
        {/* Screen bezel — subtle dark frame */}
        <RoundedBox
          args={[0.7, 1.3, 0.005]}
          radius={0.07}
          position={[0, 0, 0.033]}
        >
          <meshPhysicalMaterial color="#111111" metalness={0.5} roughness={0.4} />
        </RoundedBox>
        {/* Screen — glowing orange with glass sheen */}
        <RoundedBox
          args={[0.65, 1.2, 0.005]}
          radius={0.06}
          position={[0, 0, 0.037]}
        >
          <meshPhysicalMaterial
            color="#f97316"
            emissive="#f97316"
            emissiveIntensity={0.35}
            metalness={0}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={0.5}
          />
        </RoundedBox>
        {/* Camera notch dot */}
        <mesh position={[0, 0.6, 0.04]}>
          <circleGeometry args={[0.025, 16]} />
          <meshPhysicalMaterial color="#222222" metalness={0.8} roughness={0.1} />
        </mesh>
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
      {/* Lighting — three-point setup for realism */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 8, 5]} intensity={1} color="#fff5eb" />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} color="#e0e0ff" />
      <pointLight position={[0, 2, 3]} intensity={0.4} color="#f97316" distance={8} />
      <Environment preset="city" environmentIntensity={0.8} />
      <ContactShadows
        position={[0, -2.2, 0]}
        opacity={0.25}
        scale={10}
        blur={3}
        far={5}
        color="#d97706"
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
