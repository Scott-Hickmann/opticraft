'use client';

import { Environment } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { Layer } from '@/lib/config';

import { getComponent } from './component';
import { Controls } from './controls';
import { Header } from './header';
import styles from './scene.module.css';
import { SidePanel } from './sidePanel';
import { useStore } from './store';

const Scene = () => {
  const { components } = useStore();

  const camera = useThree((state) => state.camera);

  useFrame(() => {
    camera.layers.enable(Layer.OBJECTS);
    camera.layers.enable(Layer.VISUALIZATIONS);
    camera.layers.enable(Layer.META);
  });

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      {/* Controls */}
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
    <>
      <Header />
      <div className={styles.content}>
        <Canvas
          className={styles.canvas}
          camera={{ position: [0, 0, 4], fov: 45 }}
          scene={{ background: new THREE.Color(0x000000) }}
        >
          <Scene />
        </Canvas>
        <SidePanel />
      </div>
    </>
  );
};
