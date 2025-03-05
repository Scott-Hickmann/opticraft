import '@react-three/fiber';

import { useRef } from 'react';
import * as THREE from 'three';

import { Layer } from '@/lib/config';
import { useRay } from '@/lib/ray';

import { useStore } from './store';

export interface RayProps {
  name: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  color?: THREE.ColorRepresentation;
}

const RAY_COLOR = 0xffff00; // Yellow default color for the ray

export function Ray({
  name,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1),
  color = RAY_COLOR
}: RayProps) {
  const { onObjectClick, onObjectMissed } = useStore();
  const rayRef = useRef<THREE.Group>(null);

  // Compute direction from rotation - create unit vector along Z and rotate it
  const direction = new THREE.Vector3(0, 1, 0).applyEuler(rotation).normalize();

  useRay({
    origin: position,
    direction,
    color: RAY_COLOR
  });

  return (
    <group
      ref={rayRef}
      onClick={onObjectClick}
      onPointerMissed={onObjectMissed}
      position={position}
      rotation={rotation}
      scale={scale}
      layers={Layer.META}
      name={name}
    >
      {/* Sphere at origin */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.7}
        />
      </mesh>

      {/* Main ray beam */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.7}
        />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.1, 0.2, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
