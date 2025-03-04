'use client';

import { OrbitControls, TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useDebounceCallback } from 'usehooks-ts';

import { Layer } from '@/lib/config';

import { useStore } from './store';

const ROTATE_KEY = 'r';
const SCALE_KEY = 's';
const TRANSLATE_SNAP_AMOUNT = 0.5;
const ROTATE_SNAP_AMOUNT = Math.PI / 12;

export const Controls = () => {
  const {
    controlsRef,
    active,
    getComponent,
    updateComponent,
    removeComponent
  } = useStore();

  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>(
    'translate'
  );
  const [snap, setSnap] = useState(false);
  const [activeObject, setActiveObject] = useState<
    THREE.Object3D | null | undefined
  >(null);

  const scene = useThree((state) => state.scene);
  const activeComponent = active ? getComponent(active) : null;

  useEffect(() => {
    if (activeComponent) {
      const object = scene.getObjectByName(activeComponent.key);
      setActiveObject(object);
    } else {
      setActiveObject(null);
    }
  }, [scene, activeComponent]);

  useEffect(() => {
    if (!activeComponent) {
      return;
    }
    setMode('translate');
    setSnap(false);
    // Keyboard controls, shift hold to rotate, alt hold to scale
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ROTATE_KEY) {
        setMode('rotate');
      }
      if (event.key === SCALE_KEY) {
        setMode('scale');
      }
      if (event.key === 'Shift') {
        setSnap(true);
      }
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (activeComponent) {
          removeComponent(activeComponent.key);
        }
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === ROTATE_KEY) {
        setMode('translate');
      }
      if (event.key === SCALE_KEY) {
        setMode('translate');
      }
      if (event.key === 'Shift') {
        setSnap(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeComponent, removeComponent]);

  const onObjectChange = useDebounceCallback(
    () => {
      if (activeComponent && activeObject) {
        updateComponent(activeComponent.key, {
          ...activeComponent,
          props: {
            ...activeComponent.props,
            position: activeObject.position,
            rotation: activeObject.rotation,
            scale: activeObject.scale
          }
        });
      }
    },
    100,
    { maxWait: 100 }
  );

  return (
    <>
      {/* Controls */}
      <OrbitControls ref={controlsRef} enableDamping />
      {activeComponent && activeObject && (
        <TransformControls
          layers={Layer.META}
          mode={mode}
          object={activeObject}
          onMouseDown={() => {
            if (controlsRef.current) {
              controlsRef.current.enabled = false;
            }
          }}
          onMouseUp={() => {
            if (controlsRef.current) {
              controlsRef.current.enabled = true;
            }
          }}
          onObjectChange={onObjectChange}
          scaleSnap={snap ? TRANSLATE_SNAP_AMOUNT : null}
          rotationSnap={snap ? ROTATE_SNAP_AMOUNT : null}
          translationSnap={snap ? TRANSLATE_SNAP_AMOUNT : null}
        />
      )}
    </>
  );
};
