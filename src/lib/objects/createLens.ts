import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { Object } from './types';

interface LensOptions {
  thickness?: number;
  radius?: number;
  color?: number;
  opacity?: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
}

export function createLens({
  thickness = 0.1,
  radius = 0.5,
  color = 0x88ccff,
  opacity = 0.5,
  position = new THREE.Vector3(),
  rotation = new THREE.Euler()
}: LensOptions): Object {
  const sphere1Geometry = new THREE.SphereGeometry(
    radius,
    32,
    32,
    0,
    Math.PI * 2,
    0,
    Math.PI
  );
  const sphere2Geometry = new THREE.SphereGeometry(
    radius,
    32,
    32,
    0,
    Math.PI * 2,
    0,
    Math.PI
  );

  sphere1Geometry.scale(1, 1, thickness);
  sphere2Geometry.scale(1, 1, thickness);
  sphere2Geometry.rotateX(Math.PI);
  sphere2Geometry.translate(0, 0, 0);

  const lensGeometry = mergeGeometries([sphere1Geometry, sphere2Geometry]);
  const lensMaterial = new THREE.MeshPhongMaterial({
    color,
    transparent: true,
    opacity
  });

  const mesh = new THREE.Mesh(lensGeometry, lensMaterial);
  mesh.position.copy(position);
  mesh.rotation.copy(rotation);

  return {
    mesh,
    cleanup: () => {
      sphere1Geometry.dispose();
      sphere2Geometry.dispose();
      lensGeometry.dispose();
      lensMaterial.dispose();
    }
  };
}
