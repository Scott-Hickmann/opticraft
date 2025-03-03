'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import { createPointLight } from '@/lib/objects/createPointLight';

import { createCube } from '../lib/objects/createCube';
import { createLens } from '../lib/objects/createLens';
import { ThreeSceneProps } from '../lib/types';

type MaterialParams = {
  ior: number;
  metalness: number;
  thickness?: number;
  roughness?: number;
  color?: THREE.ColorRepresentation;
};

const getMaterial = (
  renderTarget: THREE.WebGLCubeRenderTarget,
  params: MaterialParams
): THREE.MeshPhysicalMaterialParameters => {
  const {
    ior,
    metalness,
    thickness = 5.0,
    roughness = 0.0,
    color = 0xffffff
  } = params;

  return {
    color,
    metalness,
    roughness,
    transmission: 1.0 - metalness,
    ior,
    thickness,
    envMapIntensity: metalness,
    envMap: renderTarget.texture
  };
};

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
    const pointLight = createPointLight(scene, objects, {
      origin: new THREE.Vector3(0, 0, 0),
      numDirections: 16
    });
    const rays = [pointLight];
    scene.add(...rays.map((r) => r.light).filter((l) => l !== undefined));

    // Sphere mirror
    const sphereGeom = new THREE.SphereGeometry(10, 32, 16);
    const renderTarget = new THREE.WebGLCubeRenderTarget(512);
    renderTarget.texture.mapping = THREE.CubeReflectionMapping;
    const mirrorSphereCamera = new THREE.CubeCamera(0.1, 5000, renderTarget);
    scene.add(mirrorSphereCamera);
    const ior = 1.5;
    const mirrorSphereMaterial = new THREE.MeshPhysicalMaterial(
      getMaterial(renderTarget, { ior, metalness: 0.0 })
    );
    const mirrorSphere = new THREE.Mesh(sphereGeom, mirrorSphereMaterial);
    mirrorSphere.position.y = -39.5;
    mirrorSphereCamera.position.copy(mirrorSphere.position);
    scene.add(mirrorSphere);

    // Walls
    const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);

    const planeTop = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeTop.position.y = 50;
    planeTop.rotateX(Math.PI / 2);
    scene.add(planeTop);

    const planeBottom = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    planeBottom.position.y = -50;
    planeBottom.rotateX(-Math.PI / 2);
    scene.add(planeBottom);

    const planeFront = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0x7f7fff })
    );
    planeFront.position.z = 50;
    planeFront.position.y = 0;
    planeFront.rotateY(Math.PI);
    scene.add(planeFront);

    const planeRight = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    );
    planeRight.position.x = 50;
    planeRight.position.y = 0;
    planeRight.rotateY(-Math.PI / 2);
    scene.add(planeRight);

    const planeLeft = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0xff0000 })
    );
    planeLeft.position.x = -50;
    planeLeft.position.y = 0;
    planeLeft.rotateY(Math.PI / 2);
    scene.add(planeLeft);

    camera.position.z = 4;

    // Add big cube in the center
    const bigCube = createCube({
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(10, 10, 10)
    });
    scene.add(bigCube.mesh);

    // Add this function to update material properties
    const updateMaterial = (metalness: number) => {
      mirrorSphereMaterial.metalness = metalness;
      mirrorSphereMaterial.transmission = 1.0 - metalness;
      mirrorSphereMaterial.envMapIntensity = metalness;
    };

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Example: Oscillate between glass and mirror
      const t = (Math.sin(Date.now() * 0.001) + 1) * 0.5; // 0 to 1
      console.log(t);
      updateMaterial(t);

      // Hide the mirror sphere before updating the cube camera
      mirrorSphere.visible = false;
      mirrorSphereCamera.update(renderer, scene);
      mirrorSphere.visible = true;

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
      renderTarget.dispose();
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
