import { type WebGLContext } from '../types';
import { createBuffer, createProgram, createShader } from '../utils';
import { type RenderableObject } from './renderableObject';

export class Cube implements RenderableObject {
  private buffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private program: WebGLProgram | null = null;

  constructor(
    private gl: WebGLContext,
    program: WebGLProgram | null = null
  ) {
    if (program) {
      this.program = program;
    }
    this.init();
  }

  private createProgram(): WebGLProgram | null {
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      
      varying vec3 vColor;
      
      void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
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

  private init(): void {
    this.program = this.createProgram();
    if (!this.program) return;

    // Define all vertices of the cube with colors
    const vertices = new Float32Array([
      // Front face (red)
      -0.5,
      -0.5,
      0.5,
      1.0,
      0.0,
      0.0, // Bottom left
      0.5,
      -0.5,
      0.5,
      1.0,
      0.0,
      0.0, // Bottom right
      0.5,
      0.5,
      0.5,
      1.0,
      0.0,
      0.0, // Top right
      -0.5,
      0.5,
      0.5,
      1.0,
      0.0,
      0.0, // Top left

      // Back face (green)
      -0.5,
      -0.5,
      -0.5,
      0.0,
      1.0,
      0.0, // Bottom left
      -0.5,
      0.5,
      -0.5,
      0.0,
      1.0,
      0.0, // Top left
      0.5,
      0.5,
      -0.5,
      0.0,
      1.0,
      0.0, // Top right
      0.5,
      -0.5,
      -0.5,
      0.0,
      1.0,
      0.0, // Bottom right

      // Top face (blue)
      -0.5,
      0.5,
      -0.5,
      0.0,
      0.0,
      1.0, // Back left
      -0.5,
      0.5,
      0.5,
      0.0,
      0.0,
      1.0, // Front left
      0.5,
      0.5,
      0.5,
      0.0,
      0.0,
      1.0, // Front right
      0.5,
      0.5,
      -0.5,
      0.0,
      0.0,
      1.0, // Back right

      // Bottom face (yellow)
      -0.5,
      -0.5,
      -0.5,
      1.0,
      1.0,
      0.0, // Back left
      0.5,
      -0.5,
      -0.5,
      1.0,
      1.0,
      0.0, // Back right
      0.5,
      -0.5,
      0.5,
      1.0,
      1.0,
      0.0, // Front right
      -0.5,
      -0.5,
      0.5,
      1.0,
      1.0,
      0.0, // Front left

      // Right face (magenta)
      0.5,
      -0.5,
      -0.5,
      1.0,
      0.0,
      1.0, // Bottom back
      0.5,
      0.5,
      -0.5,
      1.0,
      0.0,
      1.0, // Top back
      0.5,
      0.5,
      0.5,
      1.0,
      0.0,
      1.0, // Top front
      0.5,
      -0.5,
      0.5,
      1.0,
      0.0,
      1.0, // Bottom front

      // Left face (cyan)
      -0.5,
      -0.5,
      -0.5,
      0.0,
      1.0,
      1.0, // Bottom back
      -0.5,
      -0.5,
      0.5,
      0.0,
      1.0,
      1.0, // Bottom front
      -0.5,
      0.5,
      0.5,
      0.0,
      1.0,
      1.0, // Top front
      -0.5,
      0.5,
      -0.5,
      0.0,
      1.0,
      1.0 // Top back
    ]);

    // Indices for counter-clockwise winding (front-facing)
    const indices = new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23 // left
    ]);

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
    const stride = 24;
    const positionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
    const colorLoc = this.gl.getAttribLocation(this.program, 'aColor');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    this.gl.vertexAttribPointer(
      positionLoc,
      3,
      this.gl.FLOAT,
      false,
      stride,
      0
    );
    this.gl.vertexAttribPointer(colorLoc, 3, this.gl.FLOAT, false, stride, 12);

    this.gl.enableVertexAttribArray(positionLoc);
    this.gl.enableVertexAttribArray(colorLoc);

    // Set matrices
    const projectionLoc = this.gl.getUniformLocation(
      this.program,
      'uProjectionMatrix'
    );
    const viewLoc = this.gl.getUniformLocation(this.program, 'uViewMatrix');
    const modelLoc = this.gl.getUniformLocation(this.program, 'uModelMatrix');

    this.gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    this.gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
    this.gl.uniformMatrix4fv(modelLoc, false, modelMatrix);

    this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);
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

  public setProgram(program: WebGLProgram | null): void {
    this.program = program;
  }
}
