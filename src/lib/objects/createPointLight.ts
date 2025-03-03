import * as THREE from 'three';

import { createRay } from './createRay';
import { Object, Ray } from './types';

export interface PointLightOptions {
  origin: THREE.Vector3;
  numDirections?: number;
  color?: number;
  showArrows?: boolean;
}

export function createPointLight(
  scene: THREE.Scene,
  objects: Object[],
  { origin, numDirections = 32, color = 0xff0000 }: PointLightOptions
): Ray {
  const directions: THREE.Vector3[] = [];

  // Use the Fibonacci sphere algorithm for uniform distribution
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < numDirections; i++) {
    // Generate points on a sphere using the golden ratio
    const y = 1 - (i / (numDirections - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y); // radius at y

    // Golden angle increment
    const theta = (2 * Math.PI * i) / goldenRatio;

    // Convert to Cartesian coordinates
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    const direction = new THREE.Vector3(x, y, z).normalize();
    directions.push(direction);
  }

  const rays = directions.map((direction) =>
    createRay(scene, objects, {
      origin,
      direction,
      color
    })
  );

  return {
    update: () => {
      rays.forEach((ray) => ray.update());
    },
    cleanup: () => {
      rays.forEach((ray) => ray.cleanup());
    }
  };
}
