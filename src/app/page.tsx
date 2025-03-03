'use client';

import WebGLCanvas from '@/components/WebGLCanvas';

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        WebGL Canvas
      </h1>
      <WebGLCanvas />
    </main>
  );
}
