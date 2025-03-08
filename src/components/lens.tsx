import '@react-three/fiber';

import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

import { OBJECT_DEPTH, OBJECT_PADDING } from '@/lib/config';

import { useStore } from './store';

export interface LensProps {
  name: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
  r1?: number;
  r2?: number;
  ior?: number;
}

const SIDE_COLOR = 0x00ffff;

export function Lens({
  name,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1),
  r1 = 1,
  r2 = -1,
  ior = 1
}: LensProps) {
  const { onObjectClick, onObjectMissed } = useStore();

  return (
    <group
      onClick={onObjectClick}
      onPointerMissed={onObjectMissed}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
    >
      {/* Side Planes */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, OBJECT_DEPTH]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, OBJECT_DEPTH]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[OBJECT_DEPTH, 1]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
      <mesh position={[-0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[OBJECT_DEPTH, 1]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>

      {/* Back plane */}
      <mesh position={[0, 0, -OBJECT_DEPTH / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
    </group>
  );
}
