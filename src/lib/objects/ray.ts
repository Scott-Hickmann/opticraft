import { type WebGLContext } from '../types';
import { createBuffer } from '../utils';
import { createProgram, createShader } from '../utils';
import { type RenderableObject } from './renderableObject';
import { Sphere } from './sphere';

export class Ray implements RenderableObject {
  private buffer: WebGLBuffer | null = null;
  private program: WebGLProgram | null = null;
  private origin: [number, number, number];
  private direction: [number, number, number];
  private originSphere: Sphere;

  constructor(
    private gl: WebGLContext,
    program: WebGLProgram,
    origin: [number, number, number] = [0, 0, 0],
    direction: [number, number, number] = [1, 0, 0]
  ) {
    this.program = this.createRayProgram(); // Create special shader for ray
    this.originSphere = new Sphere(gl, program, 0.05); // Use regular shader for sphere
    this.origin = origin;
    this.direction = this.normalizeVector(direction);
    this.init();
  }

  private createRayProgram(): WebGLProgram | null {
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      
      varying vec3 vColor;
      
      void main() {
        vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
        
        // If this is the endpoint (second vertex), extend it to infinity
        if (aPosition != vec3(0.0, 0.0, 0.0)) {
          // Use direction vector instead of position for the second point
          worldPos = uModelMatrix * vec4(aPosition - vec3(0.0, 0.0, 0.0), 0.0);
        }
        
        gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
        vColor = aColor;
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec3 vColor;
      
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;

    const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(
      this.gl,
      this.gl.FRAGMENT_SHADER,
      fsSource
    );

    if (!vertexShader || !fragmentShader) return null;
    return createProgram(this.gl, vertexShader, fragmentShader);
  }

  private normalizeVector(
    v: [number, number, number]
  ): [number, number, number] {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
  }

  private init(): void {
    // Only need origin and a point in the direction
    const vertices = new Float32Array([
      // Origin point (red)
      this.origin[0],
      this.origin[1],
      this.origin[2],
      1.0,
      0.0,
      0.0,
      // Direction point (yellow) - will be extended in shader
      this.origin[0] + this.direction[0],
      this.origin[1] + this.direction[1],
      this.origin[2] + this.direction[2],
      1.0,
      1.0,
      0.0
    ]);

    this.buffer = createBuffer(this.gl, vertices);
  }

  public draw(
    gl: WebGLContext,
    projectionMatrix: Float32Array,
    viewMatrix: Float32Array,
    modelMatrix: Float32Array
  ): void {
    // Draw the line
    if (!this.program || !this.buffer) return;

    gl.useProgram(this.program);

    const stride = 24;
    const positionLoc = gl.getAttribLocation(this.program, 'aPosition');
    const colorLoc = gl.getAttribLocation(this.program, 'aColor');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, stride, 12);

    gl.enableVertexAttribArray(positionLoc);
    gl.enableVertexAttribArray(colorLoc);

    const projectionLoc = gl.getUniformLocation(
      this.program,
      'uProjectionMatrix'
    );
    const viewLoc = gl.getUniformLocation(this.program, 'uViewMatrix');
    const modelLoc = gl.getUniformLocation(this.program, 'uModelMatrix');

    gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
    gl.uniformMatrix4fv(modelLoc, false, modelMatrix);

    gl.drawArrays(gl.LINES, 0, 2);

    // Draw the origin sphere
    this.originSphere.draw(gl, projectionMatrix, viewMatrix, modelMatrix);
  }

  // Method to update ray direction
  public setDirection(direction: [number, number, number]): void {
    this.direction = this.normalizeVector(direction);
    this.init(); // Recreate the vertices with new direction
  }

  // Method to update ray origin
  public setOrigin(origin: [number, number, number]): void {
    this.origin = origin;
    this.init(); // Recreate the vertices with new origin
  }

  public getDirection(): [number, number, number] {
    return this.direction;
  }

  public getOrigin(): [number, number, number] {
    return this.origin;
  }
}
