'use client';

import { useCallback, useEffect, useRef } from 'react';

import { Cube } from '@/lib/objects/cube';
import { Lens } from '@/lib/objects/lens';
import { Ray } from '@/lib/objects/ray';
import { createShaderProgram } from '@/lib/shader';
import { WebGLRenderer } from '@/lib/webgl';

const WebGLCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const dragRef = useRef({
    isDragging: false,
    isRotating: false,
    wasRotating: false,
    lastX: 0,
    lastY: 0
  });
  const animationFrameIdRef = useRef<number | undefined>(undefined);

  // Setup render loop without rotation
  const setupRenderLoop = useCallback((renderer: WebGLRenderer) => {
    const render = () => {
      renderer.render();
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Initialize renderer
      const renderer = new WebGLRenderer(canvas);
      rendererRef.current = renderer;

      // Create shared program
      const program = createShaderProgram(renderer.getContext());
      if (!program) {
        throw new Error('Failed to create shader program');
      }

      // Create and add objects to scene
      const cube = new Cube(renderer.getContext(), program);
      const lens = new Lens(renderer.getContext(), program);

      // Create a ray
      const ray = new Ray(
        renderer.getContext(),
        program,
        [0, 0, 0], // origin
        [1, 0, 0] // direction (pointing along x-axis)
      );

      const scene = renderer.getScene();
      scene.addObject(cube, { translateX: 1 });
      scene.addObject(lens, { translateY: 0.7 });
      scene.addObject(ray);

      // Select the cube for manipulation
      renderer.selectObject(0);

      // Start render loop
      const cleanup = setupRenderLoop(renderer);

      // Event handlers
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const renderer = rendererRef.current;
        if (!renderer) return;

        const transform = renderer.getTransform();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        // Calculate mouse position in clip space
        const mouseX = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
        const mouseY = (1 - (e.clientY - rect.top) / canvas.height) * 2 - 1;

        // Calculate scale factor
        const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05;
        const newScale = transform.scale * scaleFactor;

        // Adjust translation to zoom towards mouse position
        const dx = mouseX - mouseX * scaleFactor;
        const dy = mouseY - mouseY * scaleFactor;

        renderer.setScale(newScale);
        renderer.setTranslation(
          transform.translateX + dx * transform.scale,
          transform.translateY + dy * transform.scale
        );
      };

      const handleMouseDown = (e: MouseEvent) => {
        dragRef.current.isDragging = true;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        dragRef.current.isRotating = e.shiftKey;
        canvas.style.cursor = 'grabbing';
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.isDragging || !rendererRef.current) return;

        const renderer = rendererRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Check if rotation mode has changed
        const isRotating = e.shiftKey && dragRef.current.isRotating;
        if (isRotating !== dragRef.current.wasRotating) {
          // Mode changed, update last position to prevent jumps
          dragRef.current.lastX = e.clientX;
          dragRef.current.lastY = e.clientY;
          dragRef.current.wasRotating = isRotating;
          return;
        }

        if (isRotating) {
          // Handle rotation
          const rotationSpeed = 0.01;
          const dx = -(e.clientX - dragRef.current.lastX) * rotationSpeed;
          const dy = -(e.clientY - dragRef.current.lastY) * rotationSpeed;

          // Convert cursor position to clip space
          const rect = canvas.getBoundingClientRect();
          const pivotX = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
          const pivotY = (1 - (e.clientY - rect.top) / canvas.height) * 2 - 1;

          const transform = renderer.getTransform();
          renderer.setTransform({
            ...transform,
            rotateX: transform.rotateX + dy,
            rotateY: transform.rotateY + dx,
            lastRotateX: transform.rotateX + dy,
            lastRotateY: transform.rotateY + dx,
            pivotX,
            pivotY
          });
        } else {
          // Handle translation
          const dx = ((e.clientX - dragRef.current.lastX) / canvas.width) * 6.7;
          const dy =
            (-(e.clientY - dragRef.current.lastY) / canvas.height) * 6.7;

          const transform = renderer.getTransform();
          console.log('Translation:', {
            dx,
            dy,
            transform,
            mouseX: e.clientX,
            lastX: dragRef.current.lastX,
            width: canvas.width
          });

          renderer.setTranslation(
            transform.translateX + dx,
            transform.translateY + dy
          );
        }

        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
      };

      const handleMouseUp = () => {
        dragRef.current.isDragging = false;
        dragRef.current.isRotating = false; // Reset rotation state
        canvas.style.cursor = 'grab';
      };

      // Add event listeners
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);

      // Cleanup function
      return () => {
        cleanup();
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
      };
    } catch (error) {
      console.error('WebGL initialization failed:', error);
    }
  }, [setupRenderLoop]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        border: '1px solid #000',
        display: 'block',
        margin: '0 auto',
        cursor: 'grab'
      }}
    />
  );
};

export default WebGLCanvas;
