import '@react-three/fiber';

import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

import { OBJECT_DEPTH, OBJECT_PADDING } from '@/lib/config';

import { useStore } from './store';

export interface MirrorProps {
  name: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

const SIDE_COLOR = 0x0000ff;

function MainFace() {
  return (
    <>
      {/* Front Planes */}
      <mesh position={[-0.5 + OBJECT_PADDING / 2, 0, OBJECT_DEPTH / 2]}>
        <planeGeometry args={[OBJECT_PADDING, 1]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
      <mesh position={[0.5 - OBJECT_PADDING / 2, 0, OBJECT_DEPTH / 2]}>
        <planeGeometry args={[OBJECT_PADDING, 1]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
      <mesh position={[0, -0.5 + OBJECT_PADDING / 2, OBJECT_DEPTH / 2]}>
        <planeGeometry args={[1, OBJECT_PADDING]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
      <mesh position={[0, 0.5 - OBJECT_PADDING / 2, OBJECT_DEPTH / 2]}>
        <planeGeometry args={[1, OBJECT_PADDING]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>

      {/* Front mirror */}
      <mesh position={[0, 0, OBJECT_DEPTH / 2]} name="mirror">
        <planeGeometry
          args={[1 - 2 * OBJECT_PADDING, 1 - 2 * OBJECT_PADDING]}
        />
        <MeshReflectorMaterial resolution={2048} mirror={1} />
      </mesh>
    </>
  );
}

export function Mirror({
  name,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1)
}: MirrorProps) {
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

      <MainFace />
      {/* Back plane */}
      <mesh position={[0, 0, -OBJECT_DEPTH / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={SIDE_COLOR} />
      </mesh>
    </group>
  );
}
