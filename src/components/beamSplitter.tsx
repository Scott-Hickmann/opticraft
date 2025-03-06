import '@react-three/fiber';

import { MeshTransmissionMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

import { useStore } from './store';

export interface BeamSplitterProps {
  name: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

export function BeamSplitter({
  name,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1)
}: BeamSplitterProps) {
  const { onObjectClick, onObjectMissed } = useStore();
  const mirrorRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={mirrorRef}
      onClick={onObjectClick}
      onPointerMissed={onObjectMissed}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
    >
      {/* Transparent Container */}
      <mesh position={[0, 0, 0]} name="transparent">
        <boxGeometry args={[1, 1, 1]} />
        <MeshTransmissionMaterial transmission={0.8} color={0x008800} />
      </mesh>

      {/* Splitter Plane One (rotated 45 degrees) */}
      <mesh
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, -Math.PI / 4, 0]}
        name="beamSplitter"
      >
        <planeGeometry args={[Math.SQRT2, 1]} />
        <meshStandardMaterial color={0x000000} />
      </mesh>

      {/* Splitter Plane Two */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, Math.PI / 4, 0]}
        name="beamSplitter"
      >
        <planeGeometry args={[Math.SQRT2, 1]} />
        <meshStandardMaterial color={0x000000} />
      </mesh>
    </group>
  );
}
