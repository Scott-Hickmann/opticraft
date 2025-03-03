import * as THREE from 'three';

export function calculateRefraction(
  currentDirection: THREE.Vector3,
  normal: THREE.Vector3,
  incidentAngle: number
) {
  let n1: number, n2: number;
  const isExiting = incidentAngle > 90;

  if (isExiting) {
    n1 = 1.5; // Glass
    n2 = 1.0; // Air
    normal.negate();
  } else {
    n1 = 1.0; // Air
    n2 = 1.5; // Glass
  }

  const eta = n1 / n2;
  const dotNI = normal.dot(currentDirection);
  const k = 1.0 - eta * eta * (1.0 - dotNI * dotNI);

  if (k < 0.0) {
    return currentDirection.clone().reflect(normal).normalize();
  }

  return currentDirection
    .clone()
    .multiplyScalar(eta)
    .add(normal.multiplyScalar(eta * dotNI - Math.sqrt(k)))
    .normalize();
}
