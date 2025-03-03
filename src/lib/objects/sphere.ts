import { type WebGLContext } from '../types';
import { createBuffer } from '../utils';
import { type RenderableObject } from './renderableObject';

export class Sphere implements RenderableObject {
  private buffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private program: WebGLProgram | null = null;

  constructor(
    private gl: WebGLContext,
    program: WebGLProgram,
    private radius: number = 0.1
  ) {
    this.program = program;
    this.init();
  }

  private createSphereVertices(
    radius: number = 0.1,
    latitudeBands: number = 16,
    longitudeBands: number = 16
  ): { vertices: Float32Array; indices: Uint16Array } {
    const vertices: number[] = [];
    const indices: number[] = [];

    // Generate vertices
    for (let lat = 0; lat <= latitudeBands; lat++) {
      const theta = (lat * Math.PI) / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let long = 0; long <= longitudeBands; long++) {
        const phi = (long * 2 * Math.PI) / longitudeBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        vertices.push(
          radius * x,
          radius * y,
          radius * z, // Position
          1.0,
          0.0,
          0.0 // Color (red)
        );

        // Generate indices
        if (lat < latitudeBands && long < longitudeBands) {
          const first = lat * (longitudeBands + 1) + long;
          const second = first + longitudeBands + 1;
          indices.push(first, second, first + 1);
          indices.push(second, second + 1, first + 1);
        }
      }
    }

    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices)
    };
  }

  private init(): void {
    const { vertices, indices } = this.createSphereVertices(this.radius);

    this.buffer = createBuffer(this.gl, vertices);
    this.indexBuffer = this.gl.createBuffer();

    if (this.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      this.gl.bufferData(
        this.gl.ELEMENT_ARRAY_BUFFER,
        indices,
        this.gl.STATIC_DRAW
      );
    }
  }

  public draw(
    gl: WebGLContext,
    projectionMatrix: Float32Array,
    viewMatrix: Float32Array,
    modelMatrix: Float32Array
  ): void {
    if (!this.program || !this.buffer || !this.indexBuffer) return;

    gl.useProgram(this.program);

    const stride = 24; // 6 floats per vertex
    const positionLoc = gl.getAttribLocation(this.program, 'aPosition');
    const colorLoc = gl.getAttribLocation(this.program, 'aColor');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

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

    const numIndices = this.createSphereVertices().indices.length;
    gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
  }
}
