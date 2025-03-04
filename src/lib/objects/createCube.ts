import * as THREE from 'three';

import { Object } from './types';

interface CubeOptions {
  color?: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

export function createCube({
  color = 0x00ff00,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler()
}: CubeOptions): Object {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(position);
  mesh.rotation.copy(rotation);

  return {
    mesh,
    cleanup: () => {
      geometry.dispose();
      material.dispose();
    }
  };
}
