export class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private canvas: HTMLCanvasElement;
  private transform: {
    scale: number;
    translateX: number;
    translateY: number;
    rotateX: number;
    rotateY: number;
    lastRotateX: number;
    lastRotateY: number;
  };
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private lensBuffer: WebGLBuffer | null = null;
  private lensIndexBuffer: WebGLBuffer | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl;
    this.transform = {
      scale: 1.0,
      translateX: 0.0,
      translateY: 0.0,
      rotateX: 0.0,
      rotateY: 0.0,
      lastRotateX: 0.0,
      lastRotateY: 0.0
    };
    this.init();
  }

  private init(): void {
    // Set viewport to match canvas size
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Set clear color to black
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
  }

  public clear(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
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

  // Getter for WebGL context
  public getContext(): WebGLRenderingContext {
    return this.gl;
  }

  // Resize canvas and viewport
  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  private createCubeProgram(): WebGLProgram | null {
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

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return null;
    return this.createProgram(vertexShader, fragmentShader);
  }

  private initCubeProgram(): void {
    if (this.program) return;

    this.program = this.createCubeProgram();
    if (!this.program) return;

    // Define cube vertices and colors
    const vertices = new Float32Array([
      // Front face
      -0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.5, 0.5,
      0.5, 1.0, 0.0, 0.0, -0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

      // Back face
      -0.5, -0.5, -0.5, 0.0, 1.0, 0.0, -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.5,
      -0.5, 0.0, 1.0, 0.0, 0.5, -0.5, -0.5, 0.0, 1.0, 0.0,

      // Top face
      -0.5, 0.5, -0.5, 0.0, 0.0, 1.0, -0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 0.5,
      0.5, 0.0, 0.0, 1.0, 0.5, 0.5, -0.5, 0.0, 0.0, 1.0,

      // Bottom face
      -0.5, -0.5, -0.5, 1.0, 1.0, 0.0, 0.5, -0.5, -0.5, 1.0, 1.0, 0.0, 0.5,
      -0.5, 0.5, 1.0, 1.0, 0.0, -0.5, -0.5, 0.5, 1.0, 1.0, 0.0,

      // Right face
      0.5, -0.5, -0.5, 1.0, 0.0, 1.0, 0.5, 0.5, -0.5, 1.0, 0.0, 1.0, 0.5, 0.5,
      0.5, 1.0, 0.0, 1.0, 0.5, -0.5, 0.5, 1.0, 0.0, 1.0,

      // Left face
      -0.5, -0.5, -0.5, 0.0, 1.0, 1.0, -0.5, -0.5, 0.5, 0.0, 1.0, 1.0, -0.5,
      0.5, 0.5, 0.0, 1.0, 1.0, -0.5, 0.5, -0.5, 0.0, 1.0, 1.0
    ]);

    // Define indices for the cube faces
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

    this.buffer = this.createBuffer(vertices);
    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indices,
      this.gl.STATIC_DRAW
    );
  }

  public drawCube(): void {
    if (!this.program) {
      this.initCubeProgram();
    }
    if (!this.program || !this.buffer) return;

    this.gl.useProgram(this.program);

    // Set up vertex attributes
    const stride = 24; // 6 floats per vertex (3 position + 3 color)

    const positionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
    const colorLoc = this.gl.getAttribLocation(this.program, 'aColor');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

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

    // Create and set matrices
    const aspect = this.canvas.width / this.canvas.height;
    const projectionMatrix = this.createPerspectiveMatrix(
      45,
      aspect,
      0.1,
      100.0
    );
    const viewMatrix = this.createViewMatrix([0, 0, 4], [0, 0, 0], [0, 1, 0]);
    const modelMatrix = this.createModelMatrix();

    const projectionLoc = this.gl.getUniformLocation(
      this.program,
      'uProjectionMatrix'
    );
    const viewLoc = this.gl.getUniformLocation(this.program, 'uViewMatrix');
    const modelLoc = this.gl.getUniformLocation(this.program, 'uModelMatrix');

    this.gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    this.gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
    this.gl.uniformMatrix4fv(modelLoc, false, modelMatrix);

    // Draw the cube
    this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_SHORT, 0);
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
    // Simplified view matrix for this example
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

  private createModelMatrix(): Float32Array {
    // Use rotateX/Y for the matrix instead of lastRotate values
    const cx = Math.cos(this.transform.rotateX);
    const sx = Math.sin(this.transform.rotateX);
    const cy = Math.cos(this.transform.rotateY);
    const sy = Math.sin(this.transform.rotateY);
    const s = this.transform.scale;

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
      this.transform.translateX,
      this.transform.translateY,
      -2,
      1
    ]);
  }

  // Update methods
  public setRotation(x: number, y: number): void {
    this.transform.rotateX = x;
    this.transform.rotateY = y;
    this.transform.lastRotateX = x;
    this.transform.lastRotateY = y;
  }

  // Methods to update transformations
  public setScale(scale: number): void {
    this.transform.scale = Math.max(0.1, Math.min(10.0, scale)); // Limit scale range
  }

  public setTranslation(x: number, y: number): void {
    this.transform.translateX = x;
    this.transform.translateY = y;
  }

  public getTransform() {
    return {
      ...this.transform,
      // Ensure we return the actual rotation values
      rotateX: this.transform.rotateX,
      rotateY: this.transform.rotateY
    };
  }

  private createLensVertices(
    radius: number = 1,
    height: number = 0.2,
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

  private initLensProgram(): void {
    if (!this.program) return;

    const { vertices, indices } = this.createLensVertices(0.3, 0.1, 32);

    this.lensBuffer = this.createBuffer(vertices);
    this.lensIndexBuffer = this.gl.createBuffer();

    if (!this.lensIndexBuffer) return;

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.lensIndexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indices,
      this.gl.STATIC_DRAW
    );
  }

  public drawLens(): void {
    if (!this.program) {
      this.initCubeProgram(); // Reuse the same shader program
      this.initLensProgram();
    }
    if (!this.program || !this.lensBuffer || !this.lensIndexBuffer) return;

    this.gl.useProgram(this.program);

    // Set up vertex attributes
    const stride = 24; // 6 floats per vertex (3 position + 3 color)

    const positionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
    const colorLoc = this.gl.getAttribLocation(this.program, 'aColor');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lensBuffer);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.lensIndexBuffer);

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

    // Use the same matrices as the cube but translate up
    const aspect = this.canvas.width / this.canvas.height;
    const projectionMatrix = this.createPerspectiveMatrix(
      45,
      aspect,
      0.1,
      100.0
    );
    const viewMatrix = this.createViewMatrix([0, 0, 4], [0, 0, 0], [0, 1, 0]);

    // Create a modified model matrix for the lens (moved up)
    const lensModelMatrix = new Float32Array(this.createModelMatrix());
    lensModelMatrix[13] += 0.7; // Move up by 0.7 units

    const projectionLoc = this.gl.getUniformLocation(
      this.program,
      'uProjectionMatrix'
    );
    const viewLoc = this.gl.getUniformLocation(this.program, 'uViewMatrix');
    const modelLoc = this.gl.getUniformLocation(this.program, 'uModelMatrix');

    this.gl.uniformMatrix4fv(projectionLoc, false, projectionMatrix);
    this.gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
    this.gl.uniformMatrix4fv(modelLoc, false, lensModelMatrix);

    // Draw the lens
    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.createLensVertices().indices.length,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  public drawScene(): void {
    this.clear();
    // this.drawCube();
    this.drawLens();
  }
}

// Vector math helpers
function normalize(v: number[]): number[] {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}

function subtract(a: number[], b: number[]): number[] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
