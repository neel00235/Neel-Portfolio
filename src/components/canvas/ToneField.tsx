'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Geometry } from 'ogl';
import { useTone, hexToRgb } from '@/store/useTone';
import { scrollState } from '@/components/scroller/SmoothScroller';

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
  uniform float uVelocity;
  uniform vec2 uResolution;
  uniform vec3 uTone;
  varying vec2 vUv;

  // Description : Array and textureless GLSL 2D/3D/4D simplex 
  //               noise functions.
  //      Author : Ian McEwan, Ashima Arts.
  //  Maintainer : stegu
  //     Lastmod : 20110822 (ijm)
  //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
  //               Distributed under the MIT License. See LICENSE file.
  //               https://github.com/ashima/webgl-noise

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    float n_ = 0.142857142857; // 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    // 1. Scroll-velocity displacement: radial UV pinch/barrel distortion
    vec2 centered = vUv - 0.5;
    float r2 = dot(centered, centered);
    vec2 uvDisplaced = vUv + centered * (r2 * uVelocity * 0.35);

    // 2. RGB shift: offset scaled by uVelocity, max 3px per R-35
    float maxShiftUV = 3.0 / max(uResolution.x, 800.0);
    float shift = min(maxShiftUV, uVelocity * 0.003);
    vec2 uvR = uvDisplaced + vec2(shift, 0.0);
    vec2 uvG = uvDisplaced;
    vec2 uvB = uvDisplaced - vec2(shift, 0.0);

    // 3. Ambient noise field: 3D simplex noise, domain-warped, uTime at 0.15 speed
    float t = uTime * 0.15;
    float warpR = snoise(vec3(uvR * 0.8, t * 0.5));
    float warpG = snoise(vec3(uvG * 0.8, t * 0.5));
    float warpB = snoise(vec3(uvB * 0.8, t * 0.5));

    float nR = snoise(vec3(uvR * 1.2 + vec2(warpR * 0.2), t));
    float nG = snoise(vec3(uvG * 1.2 + vec2(warpG * 0.2), t));
    float nB = snoise(vec3(uvB * 1.2 + vec2(warpB * 0.2), t));

    float combined = smoothstep(-0.4, 0.8, (nR + nG + nB) * 0.333);

    vec3 bg = vec3(0.075, 0.063, 0.047); // #13100c ground
    vec3 toneRgb = uTone / 255.0;

    // Dark cinematic ambient illumination
    vec3 finalColor = mix(bg, toneRgb * 0.4, combined * 0.22);
    gl_FragColor = vec4(finalColor, 0.45);
  }
`;

export function ToneField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTone = useTone((s) => s.activeTone);
  const targetRgbRef = useRef<[number, number, number]>(hexToRgb(activeTone));

  // Update target tone when activeTone changes in store
  useEffect(() => {
    targetRgbRef.current = hexToRgb(activeTone);
  }, [activeTone]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 6 Strict Pre-Flight Gates per R-35 & Phase 11 Gate:
    // 1. desktop (width >= 768)
    // 2. pointer: fine
    // 3. !prefers-reduced-motion
    // 4. hardwareConcurrency >= 4
    // 5. !saveData
    // 6. webgl2 probe succeeds
    const isDesktop = window.innerWidth >= 768;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const concurrency = navigator.hardwareConcurrency || 4;
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    const isSaveData = Boolean(nav.connection?.saveData);

    let webgl2Supported = false;
    try {
      const probeCanvas = document.createElement('canvas');
      webgl2Supported = Boolean(probeCanvas.getContext('webgl2'));
    } catch {
      webgl2Supported = false;
    }

    if (
      !isDesktop ||
      !isFinePointer ||
      prefersReducedMotion ||
      concurrency < 4 ||
      isSaveData ||
      !webgl2Supported
    ) {
      return; // Gate failed: 0 WebGL bytes initialized
    }

    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      // DPR capped at 1.5 per R-35
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        dpr: Math.min(1.5, window.devicePixelRatio || 1),
        webgl: 2,
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const camera = new Camera(gl);
    camera.position.z = 1;

    const scene = new Transform();

    // Exactly 1 plane (full-viewport triangle): 0 texture uploads
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    const [initR, initG, initB] = targetRgbRef.current;
    // Current interpolated tone for smooth transitions
    let currentR = initR;
    let currentG = initG;
    let currentB = initB;

    // Pre-allocated uniforms: ZERO allocations inside render loop
    const uniforms = {
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uResolution: { value: [window.innerWidth, window.innerHeight] },
      uTone: { value: [initR, initG, initB] },
    };

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value[0] = width;
      program.uniforms.uResolution.value[1] = height;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let animationFrameId: number | null = null;
    let isVisible = !document.hidden;

    // Render loop: 1 draw call / 1 plane / 0 texture uploads / zero allocations
    const render = (time: number) => {
      if (isVisible) {
        program.uniforms.uTime.value = time * 0.001;

        // Velocity coupling without getComputedStyle (Defect 2e)
        const velVal = scrollState.vel;
        program.uniforms.uVelocity.value += (velVal - program.uniforms.uVelocity.value) * 0.1;

        // Smooth uTone interpolation on tone changes
        const [tarR, tarG, tarB] = targetRgbRef.current;
        currentR += (tarR - currentR) * 0.06;
        currentG += (tarG - currentG) * 0.06;
        currentB += (tarB - currentB) * 0.06;
        program.uniforms.uTone.value[0] = currentR;
        program.uniforms.uTone.value[1] = currentG;
        program.uniforms.uTone.value[2] = currentB;

        // Exactly 1 draw call per frame
        renderer.render({ scene, camera });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Canvas pauses on tab hide per Phase 11 Gate
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (!isVisible && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      } else if (isVisible && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (gl.canvas && gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-70 transition-opacity duration-1000 bg-tone-blend/20"
      aria-hidden="true"
    />
  );
}
