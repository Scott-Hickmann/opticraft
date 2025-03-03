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
    // Create vertices for infinite ray (will be updated if intersection occurs)
    const farPoint = [
      this.origin[0] + this.direction[0] * 1000.0,
      this.origin[1] + this.direction[1] * 1000.0,
      this.origin[2] + this.direction[2] * 1000.0
    ];

    const vertices = new Float32Array([
      // Origin point (red)
      this.origin[0],
      this.origin[1],
      this.origin[2],
      1.0,
      0.0,
      0.0,
      // Far point (yellow)
      farPoint[0],
      farPoint[1],
      farPoint[2],
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
    modelMatrix: Float32Array,
    cubePosition?: [number, number, number]
  ): void {
    // Draw the line
    if (!this.program || !this.buffer) return;

    // Check for intersection if cube position is provided
    let intersectionDistance: number | null = null;
    if (cubePosition) {
      intersectionDistance = this.intersectCube(cubePosition);
      if (intersectionDistance !== null) {
        // Update the vertex buffer with intersection point
        const intersectionPoint: [number, number, number] = [
          this.origin[0] + this.direction[0] * intersectionDistance,
          this.origin[1] + this.direction[1] * intersectionDistance,
          this.origin[2] + this.direction[2] * intersectionDistance
        ];

        const vertices = new Float32Array([
          // Origin point (red)
          this.origin[0],
          this.origin[1],
          this.origin[2],
          1.0,
          0.0,
          0.0,
          // Intersection point (yellow)
          intersectionPoint[0],
          intersectionPoint[1],
          intersectionPoint[2],
          1.0,
          1.0,
          0.0
        ]);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      }
    }

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

    // Create a translation matrix for the sphere at the ray origin
    const sphereMatrix = new Float32Array(modelMatrix);

    // Apply the ray's origin position through the model matrix
    const originVec = [this.origin[0], this.origin[1], this.origin[2], 1.0];

    // Transform the origin by the model matrix (preserving scene transformations)
    sphereMatrix[12] =
      modelMatrix[0] * originVec[0] +
      modelMatrix[4] * originVec[1] +
      modelMatrix[8] * originVec[2] +
      modelMatrix[12];
    sphereMatrix[13] =
      modelMatrix[1] * originVec[0] +
      modelMatrix[5] * originVec[1] +
      modelMatrix[9] * originVec[2] +
      modelMatrix[13];
    sphereMatrix[14] =
      modelMatrix[2] * originVec[0] +
      modelMatrix[6] * originVec[1] +
      modelMatrix[10] * originVec[2] +
      modelMatrix[14];

    // Draw the origin sphere with its own transform
    this.originSphere.draw(gl, projectionMatrix, viewMatrix, sphereMatrix);
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

  public intersectCube(
    cubePosition: [number, number, number],
    cubeSize: number = 1.0
  ): number | null {
    // Transform ray to cube's local space
    const localOrigin: [number, number, number] = [
      this.origin[0] - cubePosition[0],
      this.origin[1] - cubePosition[1],
      this.origin[2] - cubePosition[2]
    ];

    const halfSize = cubeSize / 2;
    const bounds = {
      min: [-halfSize, -halfSize, -halfSize],
      max: [halfSize, halfSize, halfSize]
    };

    // Check intersection with axis-aligned bounding box
    let tmin = -Infinity;
    let tmax = Infinity;

    for (let i = 0; i < 3; i++) {
      if (Math.abs(this.direction[i]) < 1e-8) {
        // Ray is parallel to slab
        if (localOrigin[i] < bounds.min[i] || localOrigin[i] > bounds.max[i]) {
          return null; // No intersection
        }
      } else {
        // Calculate intersection with slab
        const invD = 1.0 / this.direction[i];
        let t1 = (bounds.min[i] - localOrigin[i]) * invD;
        let t2 = (bounds.max[i] - localOrigin[i]) * invD;

        if (t1 > t2) {
          [t1, t2] = [t2, t1];
        }

        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);

        if (tmin > tmax) {
          return null; // No intersection
        }
      }
    }

    // Return the nearest intersection point (tmin)
    return tmin > 0 ? tmin : null;
  }
}
