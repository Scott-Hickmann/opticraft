import { FunctionComponent } from 'react';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

import { BeamBlock, BeamBlockProps } from './beamBlock';
import { BeamSplitter, BeamSplitterProps } from './beamSplitter';
import { Lens, LensProps } from './lens';
import { Mirror, MirrorProps } from './mirror';
import { Ray, RayProps } from './ray';

const typeToReactComponent = {
  beamBlock: BeamBlock,
  beamSplitter: BeamSplitter,
  mirror: Mirror,
  ray: Ray,
  lens: Lens
} as const;

type ComponentPropsMap = {
  beamBlock: Omit<BeamBlockProps, 'name'>;
  beamSplitter: Omit<BeamSplitterProps, 'name'>;
  mirror: Omit<MirrorProps, 'name'>;
  ray: Omit<RayProps, 'name'>;
  lens: Omit<LensProps, 'name'>;
};

const typeToDefaultComponent: ComponentPropsMap = {
  beamBlock: {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1)
  },

  beamSplitter: {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1)
  },

  mirror: {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1)
  },

  ray: {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1)
  },

  lens: {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1),
    r1: 0.5, // positive is convex, negative is concave
    r2: 0.5, // positive is convex, negative is concave
    thickness: 0.1,
    height: 0.5,
    ior: 1.6
  }
};

type ComponentFromType<T extends ComponentType> = Extract<
  Component,
  { type: T }
>;

export function getReactComponent<T extends ComponentType>(
  type: T
): FunctionComponent<{ name: string } & ComponentPropsMap[T]> {
  return typeToReactComponent[type] as FunctionComponent<
    { name: string } & ComponentPropsMap[T]
  >;
}

export function getNewComponent<T extends ComponentType>(
  type: T
): ComponentFromType<T> {
  return {
    type,
    key: uuidv4(),
    props: typeToDefaultComponent[type]
  } as ComponentFromType<T>;
}

export function updateComponentProps<T extends ComponentType>(
  component: ComponentFromType<T>,
  updatedProps: Partial<ComponentFromType<T>['props']>
): ComponentFromType<T> {
  return {
    ...component,
    props: {
      ...component.props,
      ...updatedProps
    }
  };
}

export function canScale(type: ComponentType) {
  return type !== 'ray' && type !== 'lens';
}

export type BeamBlockComponent = {
  key: string;
  type: 'beamBlock';
  props: Omit<BeamBlockProps, 'name'>;
};

export type MirrorComponent = {
  key: string;
  type: 'mirror';
  props: Omit<MirrorProps, 'name'>;
};

export type RayComponent = {
  key: string;
  type: 'ray';
  props: Omit<RayProps, 'name'>;
};

export type BeamSplitterComponent = {
  key: string;
  type: 'beamSplitter';
  props: Omit<BeamSplitterProps, 'name'>;
};

export type LensComponent = {
  key: string;
  type: 'lens';
  props: Omit<LensProps, 'name'>;
};

export type ComponentType = keyof typeof typeToReactComponent;

export type Component =
  | BeamBlockComponent
  | BeamSplitterComponent
  | MirrorComponent
  | RayComponent
  | LensComponent;
