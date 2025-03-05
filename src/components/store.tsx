'use client';

import { ThreeEvent } from '@react-three/fiber';
import {
  createContext,
  createRef,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState
} from 'react';
import * as THREE from 'three';
import type { OrbitControls } from 'three-stdlib';

import { Component } from './component';

interface StoreContextType {
  controlsRef: RefObject<OrbitControls | null>;
  active: string | null;
  onObjectClick: (e: ThreeEvent<MouseEvent>) => void;
  onObjectMissed: (e: ThreeEvent<PointerEvent>) => void;
  components: Component[];
  addComponent: (component: Component) => void;
  getComponent: (key: string) => Component | undefined;
  updateComponent: (key: string, component: Component) => void;
  removeComponent: (key: string) => void;
}

const StoreContext = createContext<StoreContextType>({
  controlsRef: createRef<OrbitControls>(),
  active: null,
  onObjectClick: () => {},
  onObjectMissed: () => {},
  components: [],
  addComponent: () => {},
  getComponent: () => undefined,
  updateComponent: () => {},
  removeComponent: () => {}
});

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const controlsRef = useRef<OrbitControls>(null);
  const [active, setActive] = useState<string | null>(null);
  const [components, setComponents] = useState<Component[]>([
    {
      type: 'mirror',
      key: '3123948214',
      props: {
        position: new THREE.Vector3(0, -5, 0),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      }
    },
    {
      type: 'beamBlock',
      key: '1209480129',
      props: {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      }
    },
    {
      type: 'ray',
      key: '1294021582',
      props: {
        position: new THREE.Vector3(0, 0, -2),
        rotation: new THREE.Euler(Math.PI / 2, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      }
    }
  ]);

  const onObjectClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActive(e.eventObject.name);
  };

  const onObjectMissed = (e: ThreeEvent<PointerEvent>) => {
    if (e.type === 'click') {
      setActive(null);
    }
  };

  const addComponent = (component: Component) => {
    setComponents((components) => [...components, component]);
    setActive(component.key);
  };

  const getComponent = (key: string) => {
    return components.find((component) => component.key === key);
  };

  const removeComponent = (key: string) => {
    setComponents((components) =>
      components.filter((component) => component.key !== key)
    );
    if (active === key) {
      setActive(null);
    }
  };

  const updateComponent = (key: string, component: Component) => {
    setComponents((components) =>
      components.map((c) => (c.key === key ? component : c))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        controlsRef,
        active,
        onObjectClick,
        onObjectMissed,
        components,
        addComponent,
        getComponent,
        removeComponent,
        updateComponent
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// Custom hook to use the scene context
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
