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
  ior?: number;
}

const LENS_COLOR = 0x00ffff;

export function Lens({
  name,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1),
  r1 = 1,
  r2 = -1,
  thickness = 0.5,
  ior = 1
}: LensProps) {
  const { onObjectClick, onObjectMissed } = useStore();

  // Generate lathe points for the lens profile
  const latheGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 32;

    // Front lens curvature
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI;
      points.push(
        new THREE.Vector2(
          Math.cos(angle) * Math.abs(r1),
          Math.sin(angle) * thickness
        )
      );
    }

    return new THREE.LatheGeometry(points, 64);
  }, [r1, thickness]);

  return (
    <group
      onClick={onObjectClick}
      onPointerMissed={onObjectMissed}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
    >
      <mesh geometry={latheGeometry}>
        <meshPhysicalMaterial
          color={LENS_COLOR}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0}
          transmission={1} // Simulates realistic glass
          ior={ior}
        />
      </mesh>
    </group>
  );
}
