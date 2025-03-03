'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import { createCube } from '../lib/objects/createCube';
import { createLens } from '../lib/objects/createLens';
import { createRay } from '../lib/objects/createRay';
import { ThreeSceneProps } from '../lib/types';

const ThreeScene = ({ width, height }: ThreeSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(width, height, false);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    // Create objects
    const objects = [
      createCube({
        position: new THREE.Vector3(2, 0, 0),
        rotation: new THREE.Euler(0, Math.PI / 3, 0)
      }),
      createCube({
        position: new THREE.Vector3(0, 0, -2),
        rotation: new THREE.Euler(0, Math.PI / 3, 0)
      }),
      createCube({
        position: new THREE.Vector3(2, 0, -2),
        rotation: new THREE.Euler(0, Math.PI / 4, 0)
      }),
      createLens({
        position: new THREE.Vector3(0, 0, 0.7),
        rotation: new THREE.Euler(0, 0.4, 0)
      }),
      createLens({
        position: new THREE.Vector3(-2, 0, 1),
        rotation: new THREE.Euler(0, -0.6, 0)
      })
    ];

    scene.add(...objects.map((o) => o.mesh));

    // Create rays
    const rays = [
      createRay(scene, objects, {
        origin: new THREE.Vector3(0, 0, 0),
        direction: new THREE.Vector3(1, 0, 0)
      }),
      createRay(scene, objects, {
        origin: new THREE.Vector3(0, 2, 0),
        direction: new THREE.Vector3(1, 0, 0)
      })
    ];

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 4;

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      rays.forEach((ray) => ray.update());
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    handleResize();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      rays.forEach((ray) => ray.cleanup());
      objects.forEach((o) => o.cleanup());
      renderer.dispose();
      controls.dispose();

      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default ThreeScene;
