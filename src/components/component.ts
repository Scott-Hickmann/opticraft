import { BeamBlock, BeamBlockProps } from './beamBlock';
import { Mirror, MirrorProps } from './mirror';

const typeToReactComponent = {
  beamBlock: BeamBlock,
  mirror: Mirror
} as const;

export function getComponent(type: ComponentType) {
  return typeToReactComponent[type];
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

export type ComponentType = keyof typeof typeToReactComponent;

export type Component = BeamBlockComponent | MirrorComponent;
