import * as THREE from 'three';

import { calculateRefraction } from '../physics/rayPhysics';
import { Object, Ray, RayOptions } from './types';

export function createRay(
  scene: THREE.Scene,
  objects: Object[],
  { origin, direction, color = 0xff0000 }: RayOptions
): Ray {
  const rayGroup = new THREE.Group();
  scene.add(rayGroup);

  const sphereGeometry = new THREE.SphereGeometry(0.05);
  const sphereMaterial = new THREE.MeshPhongMaterial({ color });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(origin);
  scene.add(sphere);

  const raycaster = new THREE.Raycaster();
  const rayMaterial = new THREE.LineBasicMaterial({ color });

  return {
    update: () => {
      // Clear previous segments
      while (rayGroup.children.length) {
        const child = rayGroup.children[0];
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          child.material.dispose();
        }
        rayGroup.remove(child);
      }

      let currentOrigin = origin.clone();
      let currentDirection = direction.clone().normalize();
      let bounces = 0;
      const maxBounces = 9999;

      while (bounces < maxBounces) {
        raycaster.set(currentOrigin, currentDirection);
        const intersects = raycaster.intersectObjects(
          objects.map((o) => o.mesh),
          false
        );

        const segmentGeometry = new THREE.BufferGeometry();

        if (intersects.length > 0) {
          const intersection = intersects[0];
          const hitPoint = intersection.point.clone();

          segmentGeometry.setFromPoints([currentOrigin, hitPoint]);
          const lineSegment = new THREE.Line(segmentGeometry, rayMaterial);
          rayGroup.add(lineSegment);

          const normal =
            intersection.face?.normal.clone() || new THREE.Vector3();
          normal.transformDirection(intersection.object.matrixWorld);

          if (intersection.object.type === 'Mesh') {
            const mesh = intersection.object as THREE.Mesh;
            const incidentAngle =
              Math.acos(normal.dot(currentDirection)) * (180 / Math.PI);

            if (
              mesh.material instanceof THREE.Material &&
              mesh.material.transparent
            ) {
              // Handle lens refraction
              currentDirection = calculateRefraction(
                currentDirection,
                normal,
                incidentAngle
              );
            } else {
              // Handle regular reflection
              currentDirection = currentDirection
                .clone()
                .reflect(normal)
                .normalize();
            }
          }

          currentOrigin = hitPoint
            .clone()
            .addScaledVector(currentDirection, 0.001);
          bounces++;
        } else {
          const farPoint = currentOrigin
            .clone()
            .add(currentDirection.clone().multiplyScalar(1000));
          segmentGeometry.setFromPoints([currentOrigin, farPoint]);
          const lineSegment = new THREE.Line(segmentGeometry, rayMaterial);
          rayGroup.add(lineSegment);
          break;
        }
      }
    },
    cleanup: () => {
      while (rayGroup.children.length) {
        const child = rayGroup.children[0];
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          child.material.dispose();
        }
        rayGroup.remove(child);
      }
      scene.remove(rayGroup);
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      scene.remove(sphere);
    }
  };
}
