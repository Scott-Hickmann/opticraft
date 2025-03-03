import * as THREE from 'three';

import { calculateRefraction } from '../physics/rayPhysics';
import { Object, Ray } from './types';

export interface RayOptions {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  color?: number;
}

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

  // Add arrow helper configuration
  const arrowLength = 0.2; // Reduced from 0.3
  const headLength = 0.08; // Explicit head length instead of using arrowLength * 0.5
  const arrowWidth = 0.08; // Reduced from 0.1

  return {
    update: () => {
      // Clear previous segments
      while (rayGroup.children.length) {
        const child = rayGroup.children[0];
        if (child instanceof THREE.Line || child instanceof THREE.ArrowHelper) {
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
            child.material.dispose();
          }
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

          // Create line segment
          segmentGeometry.setFromPoints([currentOrigin, hitPoint]);
          const lineSegment = new THREE.Line(segmentGeometry, rayMaterial);
          rayGroup.add(lineSegment);

          // Add arrow at middle of segment
          const midPoint = new THREE.Vector3().lerpVectors(
            currentOrigin,
            hitPoint,
            0.5
          );
          const segmentDirection = hitPoint
            .clone()
            .sub(currentOrigin)
            .normalize();

          // Offset the arrow position backwards by half the arrow length
          const arrowPosition = midPoint
            .clone()
            .sub(segmentDirection.clone().multiplyScalar(arrowLength * 0.5));

          const arrow = new THREE.ArrowHelper(
            segmentDirection,
            arrowPosition, // Use offset position
            arrowLength,
            color,
            headLength,
            arrowWidth
          );
          rayGroup.add(arrow);

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
          const rayLength = 1000; // Define a fixed length for the final ray segment
          const farPoint = currentOrigin
            .clone()
            .add(currentDirection.clone().multiplyScalar(rayLength));

          // Create line segment
          segmentGeometry.setFromPoints([currentOrigin, farPoint]);
          const lineSegment = new THREE.Line(segmentGeometry, rayMaterial);
          rayGroup.add(lineSegment);

          // Add arrow at a reasonable distance
          const arrowDistance = 5;
          const midPoint = new THREE.Vector3().lerpVectors(
            currentOrigin,
            farPoint,
            arrowDistance / rayLength
          );
          const arrowPosition = midPoint
            .clone()
            .sub(currentDirection.clone().multiplyScalar(arrowLength * 0.5));

          const arrow = new THREE.ArrowHelper(
            currentDirection,
            arrowPosition,
            arrowLength,
            color,
            headLength,
            arrowWidth
          );
          rayGroup.add(arrow);
          break;
        }
      }
    },
    cleanup: () => {
      while (rayGroup.children.length) {
        const child = rayGroup.children[0];
        if (child instanceof THREE.Line || child instanceof THREE.ArrowHelper) {
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
            child.material.dispose();
          }
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
