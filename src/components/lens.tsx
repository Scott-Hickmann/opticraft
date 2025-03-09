import '@react-three/fiber';

import { useMemo } from 'react';
import * as THREE from 'three';

import { useStore } from './store';

export interface LensProps {
  name: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  r1?: number;
  r2?: number;
  thickness?: number;
  height?: number;
  ior?: number;
}

const LENS_COLOR = 0xffffff;

export function Lens({
  name,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1),
  r1 = 0.5, // positive is convex, negative is concave
  r2 = 0.5, // positive is convex, negative is concave
  thickness = 0.1,
  height = 0.5,
  ior = 1.6
}: LensProps) {
  const { onObjectClick, onObjectMissed } = useStore();

  //   Generate lathe points for the FRONT lens profile
  const latheGeometryFront = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 32;

    // Determine solid angle surface points
    const R = r1;
    const phi = Math.asin(height / (2 * R));

    // Front lens curvature
    for (let i = 0; i <= segments; i++) {
      const t = 1 - i / segments;
      const theta = t * phi;
      points.push(new THREE.Vector2(R * Math.sin(theta), R * Math.cos(theta)));
    }

    return new THREE.LatheGeometry(points, 64);
  }, [r1, height]);

  //   Generate lathe points for the BACK lens profile
  const latheGeometryBack = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 32;

    // Determine solid angle surface points
    const R = r2;
    const phi = Math.asin(height / (2 * R));

    // Front lens curvature
    for (let i = 0; i <= segments; i++) {
      const t = 1 - i / segments;
      const theta = t * phi;
      points.push(new THREE.Vector2(R * Math.sin(theta), R * Math.cos(theta)));
    }

    return new THREE.LatheGeometry(points, 64);
  }, [r2, height]);

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
      <mesh
        geometry={latheGeometryFront}
        rotation={[0, 0, 0]}
        position={[
          0,
          -Math.sign(r2) * Math.sqrt(r1 ** 2 - height ** 2 / 4) + thickness / 2,
          0
        ]}
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

      <mesh
        geometry={latheGeometryCylinder}
        rotation={[0, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={0x00ffff} />
      </mesh>

      <mesh
        geometry={latheGeometryBack}
        rotation={[Math.PI, 0, 0]}
        position={[
          0,
          -(
            -Math.sign(r2) * Math.sqrt(r2 ** 2 - height ** 2 / 4) +
            thickness / 2
          ),
          0
        ]}
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
    </group>
  );
}
