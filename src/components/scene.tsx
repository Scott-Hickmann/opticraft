'use client';

import { Environment } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

import { Layer } from '@/lib/config';

import { getComponent } from './component';
import { Controls } from './controls';
import { useStore } from './store';

const Scene = () => {
  const { components } = useStore();

  const raycaster = useThree((state) => state.raycaster);

  useEffect(() => {
    raycaster.layers.enable(Layer.META);
  }, [raycaster]);

  useFrame(({ scene, camera, gl }) => {
    gl.autoClear = true;

    // Step 1: Render ONLY Layer.OBJECTS (for the mirror)
    camera.layers.set(Layer.OBJECTS);
    gl.render(scene, camera);

    // Step 2: Render everything else
    camera.layers.enableAll();
    gl.render(scene, camera);
  });

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />

      {components.map((component) => {
        const Component = getComponent(component.type);
        return (
          <Component
            key={component.key}
            name={component.key}
            {...component.props}
          />
        );
      })}

      <Environment background files="/lab.exr" />

      <Controls />
    </>
  );
};

export const CanvasScene = () => {
  return (
    <div className="flex flex-1">
      <Canvas
        className="flex-1 h-full"
        camera={{ position: [0, 0, 4], fov: 45 }}
        scene={{ background: new THREE.Color(0x000000) }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
