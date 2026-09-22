// GPU renderer for the glowing gold dust: thousands of additive-blended soft points
// with motion trails, which a 2D canvas cannot draw at 60fps.

export const FLOATS_PER_PARTICLE = 7; // x, y, diameter, alpha, r, g, b

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute float a_size;
attribute float a_alpha;
attribute vec3 a_color;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
varying float v_alpha;
varying vec3 v_color;
void main() {
  vec2 clip = (a_position / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = a_size * u_pixelRatio;
  v_alpha = a_alpha;
  v_color = a_color;
}`;

const FRAGMENT_SHADER = `
precision mediump float;
varying float v_alpha;
varying vec3 v_color;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float falloff = 1.0 - d;
  float glow = falloff * falloff;
  float core = pow(falloff, 6.0);
  vec3 color = mix(v_color, vec3(1.0, 0.98, 0.9), core * 0.85);
  float a = (glow * 0.75 + core) * v_alpha;
  gl_FragColor = vec4(color * a, a);
}`;

const FADE_VERTEX = `
attribute vec2 a_corner;
void main() { gl_Position = vec4(a_corner, 0.0, 1.0); }`;

const FADE_FRAGMENT = `
precision mediump float;
uniform float u_fade;
void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, u_fade); }`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'shader error');
  return shader;
}

function link(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'link error');
  return program;
}

export interface DustRenderer {
  resize(width: number, height: number): void;
  render(data: Float32Array, count: number, trailFade: number): void;
  dispose(): void;
}

export function createDustRenderer(canvas: HTMLCanvasElement, pixelRatio: number): DustRenderer | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
  if (!gl || gl.isContextLost()) return null;

  let points: WebGLProgram;
  let fade: WebGLProgram;
  try {
    points = link(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    fade = link(gl, FADE_VERTEX, FADE_FRAGMENT);
  } catch {
    return null;
  }

  const particleBuffer = gl.createBuffer();
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const stride = FLOATS_PER_PARTICLE * 4;
  const attributes = {
    position: gl.getAttribLocation(points, 'a_position'),
    size: gl.getAttribLocation(points, 'a_size'),
    alpha: gl.getAttribLocation(points, 'a_alpha'),
    color: gl.getAttribLocation(points, 'a_color'),
    corner: gl.getAttribLocation(fade, 'a_corner'),
  };
  const uniforms = {
    resolution: gl.getUniformLocation(points, 'u_resolution'),
    pixelRatio: gl.getUniformLocation(points, 'u_pixelRatio'),
    fade: gl.getUniformLocation(fade, 'u_fade'),
  };

  let cssWidth = 1;
  let cssHeight = 1;

  gl.enable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    resize(width, height) {
      cssWidth = width;
      cssHeight = height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },

    render(data, count, trailFade) {
      // Fade the previous frame toward transparent, leaving short trails
      gl.useProgram(fade);
      gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(uniforms.fade, trailFade);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(attributes.corner);
      gl.vertexAttribPointer(attributes.corner, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disableVertexAttribArray(attributes.corner);

      // Additive glowing points
      gl.useProgram(points);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.uniform2f(uniforms.resolution, cssWidth, cssHeight);
      gl.uniform1f(uniforms.pixelRatio, pixelRatio);
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, count * FLOATS_PER_PARTICLE), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(attributes.position);
      gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(attributes.size);
      gl.vertexAttribPointer(attributes.size, 1, gl.FLOAT, false, stride, 8);
      gl.enableVertexAttribArray(attributes.alpha);
      gl.vertexAttribPointer(attributes.alpha, 1, gl.FLOAT, false, stride, 12);
      gl.enableVertexAttribArray(attributes.color);
      gl.vertexAttribPointer(attributes.color, 3, gl.FLOAT, false, stride, 16);
      gl.drawArrays(gl.POINTS, 0, count);
    },

    dispose() {
      gl.deleteBuffer(particleBuffer);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(points);
      gl.deleteProgram(fade);
      // The context stays alive: React may mount again on the same canvas.
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
  };
}
