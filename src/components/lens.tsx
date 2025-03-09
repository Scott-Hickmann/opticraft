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

const LENS_COLOR = 0xffffff;

function LensFace({
  R,
  ior,
  height,
  thickness,
  front,
  reversed
}: {
  R: number;
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
    const phi = Math.asin(height / (2 * R));
    for (let i = 0; i <= segments; i++) {
      const t = reversed ? i / segments : 1 - i / segments;
      const theta = t * phi;
      points.push(new THREE.Vector2(R * Math.sin(theta), R * Math.cos(theta)));
    }

    return new THREE.LatheGeometry(points, 64);
  }, [R, height, reversed]);

  return (
    <mesh
      geometry={latheGeometry}
      rotation={front ? [0, 0, 0] : [Math.PI, 0, 0]}
      position={[
        0,
        (-Math.sign(R) * Math.sqrt(R ** 2 - height ** 2 / 4) + thickness / 2) *
          (front ? 1 : -1),
        0
      ]}
      name={reversed ? 'lensExit' : 'lensEnter'}
    >
      <meshPhysicalMaterial
        color={LENS_COLOR}
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
        R={r1}
        thickness={thickness}
        height={height}
        ior={ior}
        front={true}
        reversed={false}
      />
      <LensFace
        R={r2}
        thickness={thickness}
        height={height}
        ior={ior}
        front={false}
        reversed={false}
      />
      <LensFace
        R={r1}
        thickness={thickness}
        height={height}
        ior={ior}
        front={true}
        reversed={true}
      />
      <LensFace
        R={r2}
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
        <meshStandardMaterial color={0x00ffff} />
      </mesh>
    </group>
  );
}
