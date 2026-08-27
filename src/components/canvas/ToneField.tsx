'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Geometry } from 'ogl';
import { useTone, hexToRgb } from '@/store/useTone';

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uTone;
  varying vec2 vUv;

  // Simple simplex-like noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * 0.0243902439) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float n1 = snoise(p * 0.8 + vec2(uTime * 0.04, uTime * 0.03));
    float n2 = snoise(p * 1.5 - vec2(uTime * 0.03, uTime * 0.05));
    float combined = smoothstep(-0.5, 0.9, n1 * 0.6 + n2 * 0.4);

    vec3 bg = vec3(0.075, 0.063, 0.047); // #13100c ground
    vec3 toneColor = uTone / 255.0;

    // Extremely subtle, dark cinematic ambient illumination
    vec3 finalColor = mix(bg, toneColor * 0.35, combined * 0.18);
    gl_FragColor = vec4(finalColor, 0.45);
  }
`;

export function ToneField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTone = useTone((s) => s.activeTone);

  useEffect(() => {
    // Desktop only & fine pointer check
    if (typeof window === 'undefined') return;
    const isDesktop = window.innerWidth >= 768 && window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop || prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(1.5, window.devicePixelRatio) });
    } catch {
      return; // WebGL not supported
    }

    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl);
    camera.position.z = 1;

    const scene = new Transform();

    // Triangle covering viewport
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    const [r, g, b] = hexToRgb(activeTone);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uTone: { value: [r, g, b] },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    const resize = () => {
      if (!container) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    let animationFrameId: number;
    let isVisible = true;

    const render = (time: number) => {
      if (isVisible) {
        program.uniforms.uTime.value = time * 0.001;
        renderer.render({ scene, camera });
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (gl.canvas && gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
    };
  }, []);

  // Update tone uniform dynamically
  const toneRgb = hexToRgb(activeTone);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-70 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
}
