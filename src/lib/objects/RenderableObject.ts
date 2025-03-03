import { type WebGLContext } from '../types';

export interface RenderableObject {
  draw(
    gl: WebGLContext,
    projectionMatrix: Float32Array,
    viewMatrix: Float32Array,
    modelMatrix: Float32Array
  ): void;
}
