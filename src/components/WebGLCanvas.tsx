'use client';

import { useCallback, useEffect, useRef } from 'react';

import { WebGLRenderer } from '@/lib/webgl';

const WebGLCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const dragRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0
  });

  // Setup render loop
  const setupRenderLoop = useCallback((renderer: WebGLRenderer) => {
    let animationFrameId: number;

    const render = () => {
      renderer.clear();
      renderer.drawSquare();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      rendererRef.current = new WebGLRenderer(canvas);
      const renderer = rendererRef.current;
      const drag = dragRef.current;

      // Event handlers
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (!renderer) return;

        const transform = renderer.getTransform();
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
        drag.isDragging = true;
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!drag.isDragging || !renderer) return;

        const transform = renderer.getTransform();
        const dx = ((e.clientX - drag.lastX) / canvas.width) * 2;
        const dy = (-(e.clientY - drag.lastY) / canvas.height) * 2;

        renderer.setTranslation(
          transform.translateX + dx,
          transform.translateY + dy
        );

        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
      };

      const handleMouseUp = () => {
        drag.isDragging = false;
        canvas.style.cursor = 'grab';
      };

      // Add event listeners
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseUp);

      // Start render loop
      const cleanup = setupRenderLoop(renderer);

      // Cleanup
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
