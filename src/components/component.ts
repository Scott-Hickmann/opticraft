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

export type BeamSplitterComponent = {
  key: string;
  type: 'beamSplitter';
  props: Omit<BeamSplitterProps, 'name'>;
};

export type LensComponent = {
  key: string;
  type: 'lens';
  props: Omit<LensProps, 'name'>;
}

export type ComponentType = keyof typeof typeToReactComponent;

export type Component =
  | BeamBlockComponent
  | BeamSplitterComponent
  | MirrorComponent
  | RayComponent
  | LensComponent;
