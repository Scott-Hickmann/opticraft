import { type WebGLContext } from '../types';
import { createBuffer } from '../utils';
import { type RenderableObject } from './renderableObject';

export class Lens implements RenderableObject {
  private buffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private program: WebGLProgram | null = null;

  constructor(
    private gl: WebGLContext,
    private sharedProgram: WebGLProgram
  ) {
    this.program = sharedProgram;
    this.init();
  }

  private createVertices(
    radius: number = 0.3,
    height: number = 0.1,
    segments: number = 32
  ): { vertices: Float32Array; indices: Uint16Array } {
    const vertices: number[] = [];
    const indices: number[] = [];

    // Center vertices (top and bottom)
    vertices.push(0, height, 0, 0, 1, 1); // Top center
    vertices.push(0, -height, 0, 0, 1, 1); // Bottom center

    // Generate the circular vertices
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Calculate curved surface y-coordinates
      const curveHeight =
        Math.sqrt(Math.max(0, radius * radius - x * x - z * z)) * height;

      // Top rim vertex
      vertices.push(x, curveHeight, z, 0, 1, 1);
      // Bottom rim vertex
      vertices.push(x, -curveHeight, z, 0, 1, 1);

      // Generate indices for triangles
      if (i < segments) {
        const baseIndex = 2 + i * 2; // Skip center vertices

        // Top face
        indices.push(0, baseIndex, baseIndex + 2);

        // Bottom face
        indices.push(1, baseIndex + 3, baseIndex + 1);

        // Side faces
        indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
      }
    }

    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices)
    };
  }

  private init(): void {
    const { vertices, indices } = this.createVertices();

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

    // Set up attributes and uniforms
    const stride = 24; // 6 floats per vertex (3 position + 3 color)
    const positionLoc = gl.getAttribLocation(this.program, 'aPosition');
    const colorLoc = gl.getAttribLocation(this.program, 'aColor');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, stride, 12);

    gl.enableVertexAttribArray(positionLoc);
    gl.enableVertexAttribArray(colorLoc);

    // Set matrices
    const projectionLoc = gl.getUniformLocation(
      this.program,
      'uProjectionMatrix'
    );
    const viewLoc = gl.getUniformLocation(this.program, 'uViewMatrix');
    const modelLoc = gl.getUniformLocation(this.program, 'uModelMatrix');

    gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
    gl.uniformMatrix4fv(modelLoc, false, modelMatrix);

    // Draw the lens
    const numIndices = this.createVertices().indices.length;
    gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
  }

  // Getter methods
  public getProgram(): WebGLProgram | null {
    return this.program;
  }

  public getBuffer(): WebGLBuffer | null {
    return this.buffer;
  }

  public getIndexBuffer(): WebGLBuffer | null {
    return this.indexBuffer;
  }

  // Setter methods
  public setBuffer(vertices: Float32Array): void {
    this.buffer = createBuffer(this.gl, vertices);
  }

  public setIndexBuffer(indices: Uint16Array): void {
    if (!this.indexBuffer) {
      this.indexBuffer = this.gl.createBuffer();
    }
    if (this.indexBuffer) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      this.gl.bufferData(
        this.gl.ELEMENT_ARRAY_BUFFER,
        indices,
        this.gl.STATIC_DRAW
      );
    }
  }
}
