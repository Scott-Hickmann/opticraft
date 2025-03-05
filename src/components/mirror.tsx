import '@react-three/fiber';

import { MeshReflectorMaterial } from '@react-three/drei';
// import { MeshReflectorMaterial as MeshReflectorMaterialImpl } from '@react-three/drei/materials/MeshReflectorMaterial';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { Layer, OBJECT_DEPTH, OBJECT_PADDING } from '@/lib/config';

import { useStore } from './store';

export interface MirrorProps {
  name: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

const SIDE_COLOR = 0x0000ff;

function MainFace() {
  const scene = useThree((state) => state.scene);

  useFrame(({ scene }) => {
    const metaLayer = new THREE.Layers();
    metaLayer.set(Layer.OBJECTS);
    const metaObjects = scene.children.filter(
      (child) => !metaLayer.test(child.layers)
    );
    metaObjects.forEach((object) => {
      object.visible = true;
    });
  });

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
        <MeshReflectorMaterial
          resolution={2048}
          mirror={1}
          onBeforeRender={() => {
            const metaLayer = new THREE.Layers();
            metaLayer.set(Layer.OBJECTS);
            const metaObjects = scene.children.filter(
              (child) => !metaLayer.test(child.layers)
            );
            metaObjects.forEach((object) => {
              object.visible = false;
            });
          }}
        />
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
  const mirrorRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={mirrorRef}
      onClick={onObjectClick}
      onPointerMissed={onObjectMissed}
      position={position}
      rotation={rotation}
      scale={scale}
      layers={Layer.OBJECTS}
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
      <group rotation={[0, Math.PI, 0]}>
        <MainFace />
      </group>
    </group>
  );
}
