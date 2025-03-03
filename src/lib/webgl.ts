import { Ray } from './objects/ray';
import { Scene } from './scene';
import { type Transform } from './types';
import { type WebGLContext } from './types';
import { cross, dot, normalize, subtract } from './utils';

export class WebGLRenderer {
  private gl: WebGLContext;
  private scene: Scene;
  private selectedObject: number = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');

    this.gl = gl;
    this.scene = new Scene();
    this.init();
  }

  private init(): void {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
  }

  public getScene(): Scene {
    return this.scene;
  }

  public render(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const aspect = this.canvas.width / this.canvas.height;
    const projectionMatrix = this.createPerspectiveMatrix(
      45,
      aspect,
      0.1,
      100.0
    );
    const viewMatrix = this.createViewMatrix([0, 0, 4], [0, 0, 0], [0, 1, 0]);

    // Get cube position from first object (assuming it's the cube)
    const cubeTransform = this.scene.getObjects()[0].transform;
    const cubePosition: [number, number, number] = [
      cubeTransform.translateX,
      cubeTransform.translateY,
      0 // Z position
    ];

    // Draw all objects
    for (const { object, transform } of this.scene.getObjects()) {
      const modelMatrix = this.createModelMatrix(transform);
      if (object instanceof Ray) {
        object.draw(
          this.gl,
          projectionMatrix,
          viewMatrix,
          modelMatrix,
          cubePosition
        );
      } else {
        object.draw(this.gl, projectionMatrix, viewMatrix, modelMatrix);
      }
    }
  }

  public getContext(): WebGLContext {
    return this.gl;
  }

  public setTransform(transform: Partial<Transform>): void {
    this.scene.updateSceneTransform(transform);
  }

  public getTransform(): Transform {
    return this.scene.getSceneTransform();
  }

  // Helper function to create and compile shaders
  public createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // Helper function to create shader program
  public createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram | null {
    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  // Helper function to create buffer
  public createBuffer(
    data: Float32Array,
    usage: number = this.gl.STATIC_DRAW
  ): WebGLBuffer | null {
    const buffer = this.gl.createBuffer();
    if (!buffer) return null;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
    return buffer;
  }

  // Resize canvas and viewport
  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  public selectObject(index: number): void {
    if (index >= 0 && index < this.scene.getObjects().length) {
      this.selectedObject = index;
    }
  }

  public getSelectedObject(): number {
    return this.selectedObject;
  }

  // Matrix creation helpers
  private createPerspectiveMatrix(
    fovDegrees: number,
    aspect: number,
    near: number,
    far: number
  ): Float32Array {
    const fovRadians = (fovDegrees * Math.PI) / 180;
    const f = 1.0 / Math.tan(fovRadians / 2);

    return new Float32Array([
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) / (near - far),
      -1,
      0,
      0,
      (2 * far * near) / (near - far),
      0
    ]);
  }

  private createViewMatrix(
    eye: number[],
    target: number[],
    up: number[]
  ): Float32Array {
    const z = normalize(subtract(eye, target));
    const x = normalize(cross(up, z));
    const y = cross(z, x);

    return new Float32Array([
      x[0],
      y[0],
      z[0],
      0,
      x[1],
      y[1],
      z[1],
      0,
      x[2],
      y[2],
      z[2],
      0,
      -dot(x, eye),
      -dot(y, eye),
      -dot(z, eye),
      1
    ]);
  }

  private createModelMatrix(objectTransform: Transform): Float32Array {
    const sceneTransform = this.scene.getSceneTransform();

    // Calculate scene rotation matrix
    const cx = Math.cos(sceneTransform.rotateX);
    const sx = Math.sin(sceneTransform.rotateX);
    const cy = Math.cos(sceneTransform.rotateY);
    const sy = Math.sin(sceneTransform.rotateY);

    // First apply object's local transform
    const localX = objectTransform.translateX;
    const localY = objectTransform.translateY;
    const localScale = objectTransform.scale;

    // Get rotation pivot point (cursor position)
    const pivotX = sceneTransform.pivotX || 0;
    const pivotY = sceneTransform.pivotY || 0;

    // Apply rotation around pivot point
    const dx = localX - pivotX;
    const dy = localY - pivotY;

    const rotX = dx * cy + dy * sx * sy;
    const rotY = dy * cx;
    const rotZ = dx * sy - dy * sx * cy;

    // Finally apply scene scale and translation
    const s = sceneTransform.scale * localScale;
    const tx = (rotX + pivotX) * s + sceneTransform.translateX;
    const ty = (rotY + pivotY) * s + sceneTransform.translateY;
    const tz = rotZ * s;

    return new Float32Array([
      cy * s,
      0,
      sy * s,
      0,
      sx * sy * s,
      cx * s,
      -sx * cy * s,
      0,
      -cx * sy * s,
      sx * s,
      cx * cy * s,
      0,
      tx,
      ty,
      tz,
      1
    ]);
  }

  // Update methods for transformations
  public setScale(scale: number): void {
    const transform = this.getTransform();
    this.setTransform({
      ...transform,
      scale: Math.max(0.1, Math.min(10.0, scale)) // Limit scale range
    });
  }

  public setRotation(x: number, y: number): void {
    const transform = this.getTransform();
    this.setTransform({
      ...transform,
      rotateX: x,
      rotateY: y,
      lastRotateX: x,
      lastRotateY: y
    });
  }

  public setTranslation(x: number, y: number): void {
    const transform = this.getTransform();
    console.log('Setting translation:', {
      x,
      y,
      currentTransform: transform,
      selectedObject: this.selectedObject
    });
    this.setTransform({
      ...transform,
      translateX: x,
      translateY: y
    });
  }
}
