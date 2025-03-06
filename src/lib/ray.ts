import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useStore } from '@/components/store';

import { Layer } from './config';
import { calculateRefraction } from './physics/rayPhysics';

export interface RayProps {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  color?: number;
}

export function useRay({
  origin,
  direction,
  color = 0xff0000
}: RayProps): void {
  const rayGroupRef = useRef<THREE.Group | null>(null);
  const rayMaterial = useRef<THREE.LineBasicMaterial | null>(null);

  const { components } = useStore();

  useEffect(() => {
    // Initialize
    rayGroupRef.current = new THREE.Group();
    rayMaterial.current = new THREE.LineBasicMaterial({ color });

    return () => {
      // Cleanup
      if (rayGroupRef.current) {
        while (rayGroupRef.current.children.length) {
          const child = rayGroupRef.current.children[0];
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
            child.material.dispose();
          }
          rayGroupRef.current.remove(child);
        }
      }
      rayMaterial.current?.dispose();
    };
  }, [color]);

  useFrame(({ scene }) => {
    if (!rayGroupRef.current || !rayMaterial.current) return;

    // Clear previous segments
    while (rayGroupRef.current.children.length) {
      const child = rayGroupRef.current.children[0];
      if (child instanceof THREE.Line || child instanceof THREE.ArrowHelper) {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          child.material.dispose();
        }
      }
      rayGroupRef.current.remove(child);
    }

    // Add ray group to scene if not already added
    if (!scene.children.includes(rayGroupRef.current)) {
      scene.add(rayGroupRef.current);
    }

    // Get all meshes from the scene
    const meshes: THREE.Mesh[] = components
      .map((component) => {
        if (component.type !== 'ray') {
          return scene.getObjectByName(component.key);
        }
      })
      .filter((object) => object !== undefined)
      .flatMap((object) => {
        // Get all meshes from the object
        const meshes: THREE.Mesh[] = [];
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshes.push(child);
          }
        });
        return meshes;
      });

    const raycaster = new THREE.Raycaster();
    const maxDepth = 100;

    // Arrow helper configuration
    const arrowLength = 0.2;
    const headLength = 0.08;
    const arrowWidth = 0.08;

    const currentRayMaterial = rayMaterial.current;
    const currentRayGroup = rayGroupRef.current;

    const bounce = (
      depth: number,
      currentOrigin: THREE.Vector3,
      currentDirection: THREE.Vector3
    ) => {
      if (depth > maxDepth) {
        return;
      }

      raycaster.set(currentOrigin, currentDirection);
      const intersects = raycaster.intersectObjects(meshes, false);

      const segmentGeometry = new THREE.BufferGeometry();

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const hitPoint = intersection.point.clone();

        // Create line segment
        segmentGeometry.setFromPoints([currentOrigin, hitPoint]);
        const lineSegment = new THREE.Line(segmentGeometry, currentRayMaterial);
        currentRayGroup.add(lineSegment);

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
        const arrowPosition = midPoint
          .clone()
          .sub(segmentDirection.clone().multiplyScalar(arrowLength * 0.5));

        const arrow = new THREE.ArrowHelper(
          segmentDirection,
          arrowPosition,
          arrowLength,
          color,
          headLength,
          arrowWidth
        );
        currentRayGroup.add(arrow);

        const normal = intersection.face?.normal.clone() || new THREE.Vector3();
        normal.transformDirection(intersection.object.matrixWorld);

        const newDirections: THREE.Vector3[] = [];

        if (intersection.object.type === 'Mesh') {
          const mesh = intersection.object as THREE.Mesh;
          const incidentAngle =
            Math.acos(normal.dot(currentDirection)) * (180 / Math.PI);

          if (mesh.name === 'lens') {
            // Handle lens refraction
            newDirections.push(
              calculateRefraction(currentDirection, normal, incidentAngle)
            );
          } else if (mesh.name === 'mirror') {
            // Handle regular reflection
            newDirections.push(
              currentDirection.clone().reflect(normal).normalize()
            );
          } else if (mesh.name === 'beamSplitter') {
            newDirections.push(
              currentDirection.clone(),
              currentDirection.clone().reflect(normal).normalize()
            );
          } else if (mesh.name === 'transparent') {
            // Ignore
            newDirections.push(currentDirection.clone());
          }
        }

        newDirections.forEach((direction) => {
          const newHitPoint = hitPoint
            .clone()
            .addScaledVector(direction, 0.001);
          bounce(depth + 1, newHitPoint, direction);
        });
      } else {
        // Handle ray that doesn't hit anything
        const rayLength = 1000;
        const farPoint = currentOrigin
          .clone()
          .add(currentDirection.clone().multiplyScalar(rayLength));

        segmentGeometry.setFromPoints([currentOrigin, farPoint]);
        const lineSegment = new THREE.Line(segmentGeometry, currentRayMaterial);
        currentRayGroup.add(lineSegment);

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
        currentRayGroup.add(arrow);
      }
    };

    bounce(0, origin.clone(), direction.clone().normalize());

    rayGroupRef.current.traverse((child) => {
      child.layers.set(Layer.VISUALIZATIONS);
    });
  });
}
