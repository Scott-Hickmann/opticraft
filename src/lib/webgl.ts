export class WebGLRenderer {
  private gl: WebGLRenderingContext;
  private canvas: HTMLCanvasElement;
  private transform: {
    scale: number;
    translateX: number;
    translateY: number;
  };
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;

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
      translateY: 0.0
    };
    this.init();
  }

  private init(): void {
    // Set viewport to match canvas size
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Set clear color to black
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
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

  private createSquareProgram(): WebGLProgram | null {
    // Updated vertex shader with transformation
    const vsSource = `
      attribute vec4 aPosition;
      uniform vec2 uTranslation;
      uniform float uScale;

      void main() {
        vec4 scaledPos = aPosition * vec4(uScale, uScale, 1.0, 1.0);
        gl_Position = scaledPos + vec4(uTranslation, 0.0, 0.0);
      }
    `;

    // Fragment shader source
    const fsSource = `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
      }
    `;

    // Create shaders
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return null;

    // Create and return program
    return this.createProgram(vertexShader, fragmentShader);
  }

  private initSquareProgram(): void {
    if (this.program) return;

    this.program = this.createSquareProgram();
    if (!this.program) return;

    // Create and store buffer
    const vertices = new Float32Array([
      -0.5,
      -0.5, // Bottom left
      0.5,
      -0.5, // Bottom right
      -0.5,
      0.5, // Top left
      0.5,
      0.5 // Top right
    ]);

    this.buffer = this.createBuffer(vertices);
  }

  public drawSquare(): void {
    if (!this.program) {
      this.initSquareProgram();
    }
    if (!this.program || !this.buffer) return;

    // Use our shader program
    this.gl.useProgram(this.program);

    // Set up vertex attributes
    const positionLocation = this.gl.getAttribLocation(
      this.program,
      'aPosition'
    );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Set uniforms for transformation
    const translationLocation = this.gl.getUniformLocation(
      this.program,
      'uTranslation'
    );
    const scaleLocation = this.gl.getUniformLocation(this.program, 'uScale');

    this.gl.uniform2f(
      translationLocation,
      this.transform.translateX,
      this.transform.translateY
    );
    this.gl.uniform1f(scaleLocation, this.transform.scale);

    // Draw the square
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
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
    return { ...this.transform };
  }
}
