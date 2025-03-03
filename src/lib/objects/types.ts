import * as THREE from 'three';

export interface Object {
  mesh: THREE.Mesh;
  cleanup: () => void;
}

export interface Ray {
  update: () => void;
  cleanup: () => void;
}
