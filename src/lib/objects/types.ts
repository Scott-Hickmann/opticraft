import * as THREE from 'three';

export interface Object {
  mesh: THREE.Mesh;
  cleanup: () => void;
}

export interface Ray {
  update: () => void;
  cleanup: () => void;
}

export interface RayOptions {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  color?: number;
}
