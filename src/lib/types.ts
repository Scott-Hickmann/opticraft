export type WebGLContext = WebGLRenderingContext;

export interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
  rotateX: number;
  rotateY: number;
  lastRotateX: number;
  lastRotateY: number;
  pivotX?: number;
  pivotY?: number;
}
