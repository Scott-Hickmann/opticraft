import '@react-three/fiber';

import { useMemo } from 'react';
import * as THREE from 'three';

import { useStore } from './store';

export interface LensProps {
  name: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  r1: number;
  r2: number;
  thickness: number;
  height: number;
  ior: number;
}

const LENS_COLOR = 0x00ffff;

function radiusCenterToLensCenter(r: number, height: number) {
  return Math.sqrt(r ** 2 - height ** 2 / 4);
}

function lensFaceDepth(r: number, height: number) {
  return Math.abs(r) - radiusCenterToLensCenter(r, height);
}

function safeRadius(r: number, height: number, thickness: number) {
  const mag = Math.abs(r);
  const safeMag = mag < height / 2 ? height / 2 : mag;
  if (mag === 0) {
    return Number.MAX_SAFE_INTEGER;
  }
  const safeR = Math.sign(r) * safeMag;
  // Make sure concave lens doesn't go past midpoint, set to the closest safe radius
  // Assume thickness is slightly less than it actually is for the sake of safety
  const safeThickness = thickness - 0.01;
  if (safeR < 0 && lensFaceDepth(safeR, height) > safeThickness / 2) {
    return -((height * height) / (4 * safeThickness) + safeThickness / 4);
  }
  return safeR;
}

function LensFace({
  r,
  ior,
  height,
  thickness,
  front,
  reversed
}: {
  r: number;
  ior: number;
  height: number;
  thickness: number;
  front: boolean;
  reversed: boolean;
}) {
  //   Generate lathe points for the FRONT lens profile
  const latheGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 32;
    const phi = Math.asin(height / (2 * r));
    for (let i = 0; i <= segments; i++) {
      const t = reversed ? i / segments : 1 - i / segments;
      const theta = t * phi;
      points.push(new THREE.Vector2(r * Math.sin(theta), r * Math.cos(theta)));
    }

    return new THREE.LatheGeometry(points, 64);
  }, [r, height, reversed]);

  return (
    <mesh
      geometry={latheGeometry}
      rotation={front ? [0, 0, 0] : [Math.PI, 0, 0]}
      position={[
        0,
        (-Math.sign(r) * radiusCenterToLensCenter(r, height) + thickness / 2) *
          (front ? 1 : -1),
        0
      ]}
      name={reversed ? 'lensExit' : 'lensEnter'}
    >
      <meshPhysicalMaterial
        color={0xffffff}
        transparent
        opacity={1}
        roughness={0.1}
        metalness={0}
        transmission={1}
        thickness={thickness}
        specularIntensity={0.5}
        ior={ior}
      />
    </mesh>
  );
}

export function Lens({
  name,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1),
  r1, // positive is convex, negative is concave
  r2, // positive is convex, negative is concave
  thickness,
  height,
  ior
}: LensProps) {
  const { onObjectClick, onObjectMissed } = useStore();
  // Generate lathe points for the Middle cylinder  profile
  const latheGeometryCylinder = useMemo(() => {
    const points: THREE.Vector2[] = [];

    // Middle cylinder profile
    points.push(new THREE.Vector2(height / 2, -thickness / 2)); // Bottom edge
    points.push(new THREE.Vector2(height / 2, thickness / 2)); // Top edge

    return new THREE.LatheGeometry(points, 64);
  }, [thickness, height]);

  const safeR1 = safeRadius(r1, height, thickness);
  const safeR2 = safeRadius(r2, height, thickness);

  return (
    <group
      onClick={onObjectClick}
      onPointerMissed={onObjectMissed}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
    >
      <LensFace
        r={safeR1}
        thickness={thickness}
        height={height}
        ior={ior}
        front={true}
        reversed={false}
      />
      <LensFace
        r={safeR2}
        thickness={thickness}
        height={height}
        ior={ior}
        front={false}
        reversed={false}
      />
      <LensFace
        r={safeR1}
        thickness={thickness}
        height={height}
        ior={ior}
        front={true}
        reversed={true}
      />
      <LensFace
        r={safeR2}
        thickness={thickness}
        height={height}
        ior={ior}
        front={false}
        reversed={true}
      />
      <mesh
        geometry={latheGeometryCylinder}
        rotation={[0, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={LENS_COLOR} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
