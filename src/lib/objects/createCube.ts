import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';

import { Object } from './types';

interface CubeOptions {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

export function createCube({
  position = new THREE.Vector3(),
  rotation = new THREE.Euler(),
  scale = new THREE.Vector3(1, 1, 1)
}: CubeOptions): Object {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new Reflector(geometry, {
    clipBias: 0.003,
    color: 0xb5b5b5
  });

  mesh.position.copy(position);
  mesh.rotation.copy(rotation);
  mesh.scale.copy(scale);

  return {
    mesh,
    cleanup: () => {
      geometry.dispose();
      mesh.dispose();
    }
  };
}
