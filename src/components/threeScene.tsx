'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface ThreeSceneProps {
  width: number;
  height: number;
}

const ThreeScene = ({ width, height }: ThreeSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(width, height, false);

    // Add orbit controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    // Array to store ray objects for cleanup
    const rays: { update: () => void; cleanup: () => void }[] = [];

    // Create cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = 2;
    cube.rotation.y = Math.PI / 3; // Rotate 45 degrees around y-axis
    scene.add(cube);

    const cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube2.position.z = -2;
    cube2.rotation.y = Math.PI / 3; // Rotate 45 degrees around y-axis
    scene.add(cube2);

    const cube3 = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube3.position.x = 2;
    cube3.position.z = -2;
    cube3.rotation.y = Math.PI / 4; // Rotate 45 degrees around y-axis
    scene.add(cube3);

    // Create lens
    const lensThickness = 0.1;
    const sphereRadius = 0.5;

    // Create two sphere segments and combine them
    const sphere1Geometry = new THREE.SphereGeometry(
      sphereRadius,
      32,
      32,
      0, // phiStart
      Math.PI * 2, // phiLength
      0, // thetaStart
      Math.PI // thetaLength (changed from Math.PI/2 to Math.PI)
    );
    const sphere2Geometry = new THREE.SphereGeometry(
      sphereRadius,
      32,
      32,
      0, // phiStart
      Math.PI * 2, // phiLength
      0, // thetaStart (changed from Math.PI/2 to 0)
      Math.PI // thetaLength (changed from Math.PI/2 to Math.PI)
    );

    // Scale and position the segments to create lens shape
    sphere1Geometry.scale(1, 1, lensThickness);
    sphere2Geometry.scale(1, 1, lensThickness);
    sphere2Geometry.rotateX(Math.PI);
    sphere2Geometry.translate(0, 0, 0); // Add translation to align properly

    // Merge geometries
    const lensGeometry = mergeGeometries([sphere1Geometry, sphere2Geometry]);

    const lensMaterial = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.5
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.y = 0;
    lens.position.z = 0.7;
    // Rotate the lens 90 degrees around the x-axis
    lens.rotation.y = 0.4;
    scene.add(lens);

    // Create rays
    const createRay = (origin: THREE.Vector3, direction: THREE.Vector3) => {
      // Create a group to hold all line segments
      const rayGroup = new THREE.Group();
      scene.add(rayGroup);

      const sphereGeometry = new THREE.SphereGeometry(0.05);
      const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(origin);
      scene.add(sphere);

      const raycaster = new THREE.Raycaster();
      const rayMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

      const ray = {
        update: () => {
          // Clear previous line segments
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
              [cube, cube2, cube3, lens],
              false
            );

            // Create geometry for this segment
            const segmentGeometry = new THREE.BufferGeometry();

            if (intersects.length > 0) {
              const intersection = intersects[0];
              const hitPoint = intersection.point.clone();

              // Create line segment from current origin to hit point
              segmentGeometry.setFromPoints([currentOrigin, hitPoint]);
              const lineSegment = new THREE.Line(segmentGeometry, rayMaterial);
              rayGroup.add(lineSegment);

              // Calculate reflection or refraction
              const normal =
                intersection.face?.normal.clone() || new THREE.Vector3();
              if (intersection.object !== lens) {
                // For non-lens objects, calculate reflection
                normal.transformDirection(intersection.object.matrixWorld);
                const reflectedDirection = currentDirection
                  .clone()
                  .reflect(normal);
                currentDirection = reflectedDirection.normalize();
                currentOrigin = hitPoint
                  .clone()
                  .addScaledVector(currentDirection, 0.001);
                bounces++;
              } else {
                // For lens, calculate refraction
                normal.transformDirection(intersection.object.matrixWorld);

                // Calculate incident angle in degrees
                const incidentAngle =
                  Math.acos(normal.dot(currentDirection)) * (180 / Math.PI);
                console.log(
                  'Incident angle:',
                  incidentAngle.toFixed(2),
                  'degrees'
                );

                // Determine if we're entering or exiting the lens
                let n1, n2;
                // We're exiting if the angle is greater than 90 degrees
                const isExiting = incidentAngle > 90;
                if (isExiting) {
                  // Ray is exiting the lens
                  n1 = 1.5; // Glass
                  n2 = 1.0; // Air
                  normal.negate(); // Flip the normal to point outward

                  // Calculate critical angle (in degrees)
                  const criticalAngle = Math.asin(n2 / n1) * (180 / Math.PI);
                  console.log(
                    'Critical angle:',
                    criticalAngle.toFixed(2),
                    'degrees'
                  );
                  console.log(
                    'Is exiting, should reflect?',
                    Math.abs(180 - incidentAngle) > criticalAngle
                  );
                } else {
                  // Ray is entering the lens
                  n1 = 1.0; // Air
                  n2 = 1.5; // Glass
                  console.log('Is entering lens');
                }

                // Calculate the ratio of refractive indices
                const eta = n1 / n2;

                // Calculate cosine of incident angle
                const dotNI = normal.dot(currentDirection);

                // Calculate refraction using Snell's law
                const k = 1.0 - eta * eta * (1.0 - dotNI * dotNI);
                console.log('k value:', k);

                if (k < 0.0) {
                  console.log('Total internal reflection occurring');
                  // Total internal reflection
                  const reflectedDirection = currentDirection
                    .clone()
                    .reflect(normal);
                  currentDirection = reflectedDirection.normalize();
                } else {
                  // Refraction
                  currentDirection = currentDirection
                    .clone()
                    .multiplyScalar(eta)
                    .add(normal.multiplyScalar(eta * dotNI - Math.sqrt(k)))
                    .normalize();
                }

                currentOrigin = hitPoint
                  .clone()
                  .addScaledVector(currentDirection, 0.001);
                bounces++;
              }
            } else {
              // Draw ray extending into space
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
          // Clean up all line segments
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

      rays.push(ray);
      return ray;
    };

    // Create two rays
    createRay(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
    createRay(new THREE.Vector3(0, 2, 0), new THREE.Vector3(1, 0, 0));

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Position camera
    camera.position.z = 4;

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      rays.forEach((ray) => ray.update());
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    handleResize();

    return () => {
      cancelAnimationFrame(animationFrameId);

      // Clean up rays
      rays.forEach((ray) => ray.cleanup());

      // Dispose of additional geometries
      sphere1Geometry.dispose();
      sphere2Geometry.dispose();
      lensGeometry.dispose();

      // Dispose of Three.js resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
      controls.dispose();

      // Clear the scene
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default ThreeScene;
