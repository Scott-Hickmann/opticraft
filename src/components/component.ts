import { BeamBlock, BeamBlockProps } from './beamBlock';
import { Mirror, MirrorProps } from './mirror';
import { Ray, RayProps } from './ray';

const typeToReactComponent = {
  beamBlock: BeamBlock,
  mirror: Mirror,
  ray: Ray
} as const;

export function getComponent(type: ComponentType) {
  return typeToReactComponent[type];
}

export function canScale(type: ComponentType) {
  return type !== 'ray';
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

export type ComponentType = keyof typeof typeToReactComponent;

export type Component = BeamBlockComponent | MirrorComponent | RayComponent;
