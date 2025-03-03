'use client';

import { useEffect, useRef, useState } from 'react';

import ThreeScene from './threeScene';

const WebGLCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [reset, setReset] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setReset(true);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setReset(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  if (reset) {
    return null;
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh' }}>
      <ThreeScene width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default WebGLCanvas;
