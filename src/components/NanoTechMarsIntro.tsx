import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Language } from '../data/bilingualContent';
import { computeIglooIntroChoreography } from '../utils/missionMath';

interface NanoTechMarsIntroProps {
  lang: Language;
}

export const NanoTechMarsIntro: React.FC<NanoTechMarsIntroProps> = ({ lang }) => {
  // Run on every initial load and browser reload (F5) via React useState(true).
  // No localStorage/sessionStorage locks. Respects ?autostart=1 query param if present.
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      // Clean up any legacy storage key from earlier versions
      window.localStorage.removeItem('insight_nano_intro_played_v1');
      window.sessionStorage.removeItem('insight_nano_intro_played_v1');
    } catch {
      // Ignore storage access errors
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return false;
    return true;
  });

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const telemetryPctRef = useRef<HTMLSpanElement | null>(null);
  const telemetryStageRef = useRef<HTMLSpanElement | null>(null);
  const progressBarFillRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<Language>(lang);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    if (!isVisible) {
      document.documentElement.style.setProperty('--igloo-reveal-y', '0px');
      document.documentElement.style.setProperty('--igloo-reveal-opacity', '1');
      return;
    }

    const mountEl = canvasMountRef.current;
    if (!mountEl) {
      setIsVisible(false);
      return;
    }

    // Detect software WebGL from the renderer string (never user-agent) per threejs skill
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl =
          probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let width = Math.max(window.innerWidth || 1440, 320);
    let height = Math.max(window.innerHeight || 900, 320);
    const isMobile = width <= 768;

    // 16,000 particles on desktop, 8,000 on mobile viewports <= 768px
    const totalParticles = isMobile ? 8000 : 16000;
    const orbitalRingParticles = isMobile ? 1250 : 2500;
    const marsGlobeParticles = totalParticles - orbitalRingParticles;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
    } catch {
      document.documentElement.style.setProperty('--igloo-reveal-y', '0px');
      document.documentElement.style.setProperty('--igloo-reveal-opacity', '1');
      setIsVisible(false);
      return;
    }

    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(dpr);
    renderer.setSize(
      isSoftwareGl ? Math.min(width, 960) : width,
      isSoftwareGl ? Math.min(height, 600) : height,
      false
    );
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // =========================================================================
    // BUILD 5 BUFFER ATTRIBUTES FOR 16,000 / 8,000 GLSL PARTICLES
    // 1. aOriginPos (vec3): Deep-space Milky Way nebula coordinates
    // 2. aSpherePos (vec3): Fibonacci-sphere 3D Mars globe + 2,500 orbital ring
    // 3. aVortexPos (vec3): 3D curl-noise / golden-ratio spiral dispersion field
    // 4. aTargetHeroPos (vec3): 3D local coordinates for Page 01 right-hand Hero frame
    // 5. aColor (vec3) & aScale (float): Curated Martian terracotta/gold/crimson/cyan
    // =========================================================================
    const geometry = new THREE.BufferGeometry();

    const originPositions = new Float32Array(totalParticles * 3);
    const spherePositions = new Float32Array(totalParticles * 3);
    const vortexPositions = new Float32Array(totalParticles * 3);
    const targetHeroPositions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const scales = new Float32Array(totalParticles);

    // Curated HDR color palette
    const colTerracotta = new THREE.Color('#F4A261'); // Luminous Martian terracotta
    const colMoltenGold = new THREE.Color('#FFD1A6'); // Molten core gold
    const colCrimson = new THREE.Color('#E76F51');    // Deep iron-oxide crimson
    const colStarCyan = new THREE.Color('#64DFDF');   // Starlight cyan
    const colPolarIce = new THREE.Color('#FFF8F2');   // Polar frost highlight

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const marsRadius = isMobile ? 1.65 : 1.96;
    const heroScale = 0.56;

    // Deterministic pseudo-random helper for consistent, zero-jitter distributions
    const fract = (n: number) => n - Math.floor(n);
    const prng = (seed: number) => fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453);

    for (let i = 0; i < totalParticles; i++) {
      const i3 = i * 3;
      const r1 = prng(i * 1.13 + 0.1);
      const r2 = prng(i * 2.47 + 0.3);
      const r3 = prng(i * 3.89 + 0.7);
      const r4 = prng(i * 5.17 + 1.1);

      // 1. aOriginPos: Scattered deep-space Milky Way nebula coordinates
      const nebulaAngle = r1 * Math.PI * 2.0 + (i % 7) * 0.45;
      const nebulaRadius = 3.8 + Math.pow(r2, 0.7) * 10.5;
      const nebulaZ = (r3 - 0.42) * 12.0;
      originPositions[i3] = Math.cos(nebulaAngle) * nebulaRadius;
      originPositions[i3 + 1] =
        Math.sin(nebulaAngle) * nebulaRadius * 0.68 + (r4 - 0.5) * 2.8;
      originPositions[i3 + 2] = nebulaZ;

      let sx = 0;
      let sy = 0;
      let sz = 0;
      let chosenColor = colTerracotta;
      let pointScale = 1.0;

      if (i < marsGlobeParticles) {
        // Fibonacci-sphere Mars globe point-cloud
        const yNorm = 1 - (i / Math.max(1, marsGlobeParticles - 1)) * 2; // +1 to -1
        const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
        const lon = goldenAngle * i;

        // Topographic continent & Valles Marineris canyon relief
        const continentWave =
          Math.sin(lon * 3.0 + yNorm * 2.4) * Math.cos(lon * 2.0 - yNorm * 3.1);
        const isVallesMarineris =
          Math.abs(yNorm + 0.08) < 0.11 && Math.sin(lon + 0.6) > 0.35;
        const isPolarCap = Math.abs(yNorm) > 0.87;

        const reliefOffset = isVallesMarineris
          ? -0.06
          : continentWave > 0.2
            ? 0.04 * continentWave
            : -0.015;

        const rGlobe = marsRadius * (1 + reliefOffset + (r1 - 0.5) * 0.015);
        sx = Math.cos(lon) * radiusAtY * rGlobe;
        sy = yNorm * rGlobe;
        sz = Math.sin(lon) * radiusAtY * rGlobe;

        if (isPolarCap) {
          chosenColor = colPolarIce;
          pointScale = 1.15;
        } else if (isVallesMarineris) {
          chosenColor = colStarCyan;
          pointScale = 1.25;
        } else if (i % 23 === 0) {
          chosenColor = colStarCyan;
          pointScale = 1.25;
        } else if (continentWave > 0.25) {
          chosenColor = colMoltenGold;
          pointScale = 1.1;
        } else if (continentWave < -0.15) {
          chosenColor = colCrimson;
          pointScale = 0.9;
        } else {
          chosenColor = colTerracotta;
          pointScale = 1.0;
        }
      } else {
        // Inclined Orbital Telemetry Ring around Mars (2,500 desktop / 1,250 mobile particles)
        const ringIdx = i - marsGlobeParticles;
        const ringT = ringIdx / Math.max(1, orbitalRingParticles);
        const ringAngle = ringT * Math.PI * 2.0 * 3.0 + r1 * 0.2;
        const ringBand = marsRadius * (1.34 + (ringIdx % 5) * 0.055 + (r2 - 0.5) * 0.03);

        const flatX = Math.cos(ringAngle) * ringBand;
        const flatZ = Math.sin(ringAngle) * ringBand;
        const flatY = (r3 - 0.5) * 0.05;

        // Tilt orbital telemetry ring by 24 degrees in X and 16 degrees in Z
        const tiltX = 0.42;
        const tiltZ = -0.28;
        const y1 = flatY * Math.cos(tiltX) - flatZ * Math.sin(tiltX);
        const z1 = flatY * Math.sin(tiltX) + flatZ * Math.cos(tiltX);
        sx = flatX * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
        sy = flatX * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
        sz = z1;

        chosenColor = ringIdx % 3 === 0 ? colStarCyan : colMoltenGold;
        pointScale = ringIdx % 9 === 0 ? 1.35 : 0.88;
      }

      spherePositions[i3] = sx;
      spherePositions[i3 + 1] = sy;
      spherePositions[i3 + 2] = sz;

      // 3. aVortexPos: 3D curl-noise / golden-ratio spiral dispersion field tracing UI architecture
      const spiralArm = (i % 5) * ((Math.PI * 2) / 5);
      const vortexTheta = goldenAngle * (i * 0.35) + spiralArm;
      const vortexRadial = 1.1 + Math.pow(i / totalParticles, 0.65) * (isMobile ? 3.8 : 5.6);

      // 25% of particles trace the architectural grid / header frame perimeter during Stage 2
      if (i % 4 === 0) {
        const frameW = isMobile ? 3.1 : 5.4;
        const frameH = isMobile ? 2.8 : 3.1;
        const perim = r4 * 4.0;
        if (perim < 1.0) {
          vortexPositions[i3] = (perim * 2.0 - 1.0) * frameW;
          vortexPositions[i3 + 1] = frameH + (r1 - 0.5) * 0.18;
        } else if (perim < 2.0) {
          vortexPositions[i3] = frameW + (r1 - 0.5) * 0.18;
          vortexPositions[i3 + 1] = ((perim - 1.0) * 2.0 - 1.0) * frameH;
        } else if (perim < 3.0) {
          vortexPositions[i3] = ((perim - 2.0) * 2.0 - 1.0) * -frameW;
          vortexPositions[i3 + 1] = -frameH + (r1 - 0.5) * 0.18;
        } else {
          vortexPositions[i3] = -frameW + (r1 - 0.5) * 0.18;
          vortexPositions[i3 + 1] = ((perim - 3.0) * 2.0 - 1.0) * -frameH;
        }
        vortexPositions[i3 + 2] = (r2 - 0.5) * 1.6;
      } else {
        const curlY = Math.sin(vortexTheta * 2.0 + r2 * 4.0) * 1.15;
        const curlZ = Math.cos(vortexTheta * 1.5 - r3 * 3.5) * 1.8;
        vortexPositions[i3] = Math.cos(vortexTheta) * vortexRadial;
        vortexPositions[i3 + 1] =
          Math.sin(vortexTheta) * vortexRadial * 0.58 + curlY * 0.4;
        vortexPositions[i3 + 2] = curlZ;
      }

      // 4. aTargetHeroPos: Exact 3D local offset for Page 01 right-hand Hero visual frame
      targetHeroPositions[i3] = sx * heroScale;
      targetHeroPositions[i3 + 1] = sy * heroScale;
      targetHeroPositions[i3 + 2] = sz * heroScale;

      // 5. aColor & aScale
      colors[i3] = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;
      scales[i] = pointScale * (0.72 + r1 * 0.48);
    }

    // Set position attribute (required by Three.js shader pipeline) + custom attributes
    geometry.setAttribute('position', new THREE.BufferAttribute(spherePositions, 3));
    geometry.setAttribute('aOriginPos', new THREE.BufferAttribute(originPositions, 3));
    geometry.setAttribute('aSpherePos', new THREE.BufferAttribute(spherePositions, 3));
    geometry.setAttribute('aVortexPos', new THREE.BufferAttribute(vortexPositions, 3));
    geometry.setAttribute(
      'aTargetHeroPos',
      new THREE.BufferAttribute(targetHeroPositions, 3)
    );
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    // =========================================================================
    // CUSTOM GLSL VERTEX & FRAGMENT SHADER (THREE.ShaderMaterial)
    // =========================================================================
    const particleUniforms = {
      uTime: { value: 0.0 },
      uStage1: { value: 0.0 },
      uStage2: { value: 0.0 },
      uStage3: { value: 0.0 },
      uShockwave: { value: 0.0 },
      uFadeOut: { value: 1.0 },
      uPixelRatio: { value: dpr },
      uHeroCenter: { value: new THREE.Vector3(2.25, -0.15, 0.0) },
    };

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: particleUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute vec3 aOriginPos;
        attribute vec3 aSpherePos;
        attribute vec3 aVortexPos;
        attribute vec3 aTargetHeroPos;
        attribute vec3 aColor;
        attribute float aScale;

        uniform float uTime;
        uniform float uStage1;
        uniform float uStage2;
        uniform float uStage3;
        uniform float uShockwave;
        uniform float uPixelRatio;
        uniform vec3 uHeroCenter;

        varying vec3 vColor;
        varying float vAlpha;

        mat3 rotateY(float angle) {
          float s = sin(angle);
          float c = cos(angle);
          return mat3(
            c, 0.0, s,
            0.0, 1.0, 0.0,
            -s, 0.0, c
          );
        }

        mat3 rotateX(float angle) {
          float s = sin(angle);
          float c = cos(angle);
          return mat3(
            1.0, 0.0, 0.0,
            0.0, c, -s,
            0.0, s, c
          );
        }

        void main() {
          // Majestic rotation of the 3D Mars globe & orbital ring
          float spinAngle = uTime * 1.45;
          mat3 rot = rotateY(spinAngle) * rotateX(0.18);
          vec3 rotatedSphere = rot * aSpherePos;
          vec3 rotatedHeroTarget = uHeroCenter + (rot * aTargetHeroPos);

          // STAGE 1 (0.0s - 1.1s): Quantum LiDAR Convergence along curved paths
          vec3 lidarArc = normalize(vec3(-rotatedSphere.z, rotatedSphere.y * 0.4, rotatedSphere.x) + vec3(0.001))
                          * sin(uStage1 * 3.14159265) * 1.35;
          vec3 posStage1 = mix(aOriginPos, rotatedSphere, uStage1) + lidarArc;

          // STAGE 2 (1.1s - 2.2s): Seismic Pulse & 3D Harmonic Curl-Noise Vortex Dispersion
          vec3 curlWave = vec3(
            sin(aVortexPos.y * 1.9 + uTime * 2.8) * cos(aVortexPos.z * 1.4),
            cos(aVortexPos.x * 1.8 - uTime * 2.5) * sin(aVortexPos.z * 1.5),
            sin(aVortexPos.x * 1.6 + aVortexPos.y * 1.5 + uTime * 3.1)
          ) * 0.42;
          vec3 vortexAnimated = rotateY(uTime * 0.55) * aVortexPos + curlWave;

          // Radial seismic shockwave displacement at 1.1s
          float distFromCenter = length(rotatedSphere);
          float waveFront = uShockwave * 3.8;
          float shockRing = exp(-pow(distFromCenter - waveFront, 2.0) * 4.0) * sin(uShockwave * 3.14159265);
          vec3 shockImpulse = normalize(rotatedSphere + vec3(0.0001)) * shockRing * 0.65;

          vec3 posStage2 = mix(posStage1 + shockImpulse, vortexAnimated, uStage2);

          // STAGE 3 (2.2s - 3.1s): Graceful Sweep & Re-Convergence into Page 01 Right-Hand Hero Frame
          float lockT = smoothstep(0.0, 0.92, uStage3);
          vec3 heroSweepArc = vec3(
            sin(lockT * 3.14159265) * 0.45,
            sin(lockT * 3.14159265) * 0.35,
            sin(lockT * 3.14159265) * 0.65
          );
          vec3 finalPos = mix(posStage2, rotatedHeroTarget, lockT) + heroSweepArc;

          vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Boost glow during seismic shockwave and LiDAR lock-in
          float shockGlow = 1.0 + shockRing * 0.55;
          vColor = mix(aColor, vec3(1.0, 0.94, 0.82), clamp(shockRing * 0.6, 0.0, 0.7));

          // Crisp LiDAR micro-point sizing so the 16,000-particle Mars globe & orbital ring stay razor-sharp
          float depthAtten = 12.5 / max(1.6, -mvPosition.z);
          gl_PointSize = clamp(aScale * uPixelRatio * depthAtten * shockGlow, 1.4, 6.2);

          // Smooth depth fade
          vAlpha = smoothstep(20.0, 2.2, -mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform float uFadeOut;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = exp(-d * d * 10.0);

          vec3 hdrCore = mix(vColor, vec3(1.0, 0.98, 0.94), smoothstep(0.58, 1.0, glow) * 0.6);
          float alpha = glow * vAlpha * uFadeOut * 0.88;
          gl_FragColor = vec4(hdrCore * (0.9 + glow * 0.55), alpha);
        }
      `,
    });

    const particlePoints = new THREE.Points(geometry, particleMaterial);
    particlePoints.frustumCulled = false;
    scene.add(particlePoints);

    // =========================================================================
    // GOLDEN SEISMIC SHOCKWAVE RING AT 1.1s (STAGE 2 PULSE)
    // =========================================================================
    const shockwaveGeo = new THREE.RingGeometry(0.18, 0.34, 72);
    const shockwaveUniforms = {
      uProgress: { value: 0.0 },
      uOpacity: { value: 0.0 },
    };
    const shockwaveMat = new THREE.ShaderMaterial({
      uniforms: shockwaveUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float ringFade = sin(vUv.y * 3.14159265);
          vec3 col = mix(vec3(0.96, 0.64, 0.38), vec3(0.39, 0.87, 0.87), vUv.y);
          gl_FragColor = vec4(col * 1.4, ringFade * uOpacity);
        }
      `,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = -0.38;
    shockwaveMesh.rotation.y = 0.22;
    scene.add(shockwaveMesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // MOUSE & GYROSCOPE CAMERA PARALLAX (LERP SMOOTHING 0.06)
    // =========================================================================
    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nw = window.innerWidth || 1;
      const nh = window.innerHeight || 1;
      targetMouseX = (e.clientX / nw - 0.5) * 2.0;
      targetMouseY = -(e.clientY / nh - 0.5) * 2.0;
    };

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        targetMouseX = Math.max(-1, Math.min(1, e.gamma / 30));
        targetMouseY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });

    // Pre-allocated vector for unprojecting Page 01's right-hand Hero frame into 3D world space
    const _ndcVec = new THREE.Vector3();
    const _dirVec = new THREE.Vector3();
    const _heroWorldVec = new THREE.Vector3();

    const updateHeroTargetWorldCoord = () => {
      const heroEl = document.querySelector('[data-testid="page01-hero-visual-card"]');
      const vw = window.innerWidth || 1440;
      const vh = window.innerHeight || 900;

      let centerScreenX = vw * (vw <= 768 ? 0.5 : 0.71);
      let centerScreenY = vh * (vw <= 768 ? 0.68 : 0.49);

      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        if (rect.width > 40 && rect.height > 40) {
          centerScreenX = rect.left + rect.width * 0.5;
          centerScreenY = rect.top + rect.height * 0.5;
        }
      }

      const ndcX = (centerScreenX / vw) * 2 - 1;
      const ndcY = -(centerScreenY / vh) * 2 + 1;

      _ndcVec.set(ndcX, ndcY, 0.5);
      _ndcVec.unproject(camera);
      _dirVec.copy(_ndcVec).sub(camera.position).normalize();
      const distanceToZeroPlane = -camera.position.z / (_dirVec.z || -1);
      _heroWorldVec
        .copy(camera.position)
        .addScaledVector(_dirVec, distanceToZeroPlane);

      particleUniforms.uHeroCenter.value.copy(_heroWorldVec);
    };

    const onResize = () => {
      width = Math.max(window.innerWidth || 1440, 320);
      height = Math.max(window.innerHeight || 900, 320);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(
        isSoftwareGl ? Math.min(width, 960) : width,
        isSoftwareGl ? Math.min(height, 600) : height,
        false
      );
    };
    window.addEventListener('resize', onResize);

    // =========================================================================
    // 4-STAGE 3.4s ANIMATION LOOP (WITH SOFTWARE-WEBGL AFTERDRAW PACING)
    // =========================================================================
    const startTime = performance.now();
    let frameId = 0;
    let unmounted = false;

    // Initialize Page 01 staggered reveal CSS variables at start of boot
    document.documentElement.style.setProperty('--igloo-reveal-y', '18px');
    document.documentElement.style.setProperty('--igloo-reveal-opacity', '0.06');

    const cleanupAndFinish = () => {
      if (unmounted) return;
      unmounted = true;
      document.documentElement.style.setProperty('--igloo-reveal-y', '0px');
      document.documentElement.style.setProperty('--igloo-reveal-opacity', '1');
      setIsVisible(false);
    };

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (unmounted) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (unmounted) return;
      const elapsedSec = (performance.now() - startTime) / 1000;
      const choreo = computeIglooIntroChoreography(elapsedSec);

      if (choreo.completed) {
        cleanupAndFinish();
        return;
      }

      // Smooth mouse/gyroscope camera parallax (lerp factor 0.06)
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.06;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.06;

      // Camera dolly trajectory across the 4 stages:
      // Stage 1 (0.0s - 1.1s): Deep space 9.2 -> 6.8
      // Stage 2 (1.1s - 2.2s): Dolly forward through glowing curl-noise vortex 6.8 -> 5.25
      // Stage 3 (2.2s - 3.1s): Settle at 6.15 to frame Page 01 right-hand hero card
      const camZStage1 = 9.2 - choreo.uStage1 * 2.4;
      const camZStage2 = camZStage1 - choreo.uStage2 * 1.55;
      const camZFinal = camZStage2 + choreo.uStage3 * 0.9;

      const parallaxFade = 1 - choreo.uStage3 * 0.7;
      camera.position.set(
        smoothMouseX * 0.65 * parallaxFade,
        smoothMouseY * 0.45 * parallaxFade,
        camZFinal
      );
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      // Dynamically map Page 01 right-hand hero card to 3D world coordinates
      updateHeroTargetWorldCoord();

      // Update GLSL shader uniforms
      particleUniforms.uTime.value = elapsedSec;
      particleUniforms.uStage1.value = choreo.uStage1;
      particleUniforms.uStage2.value = choreo.uStage2;
      particleUniforms.uStage3.value = choreo.uStage3;
      particleUniforms.uShockwave.value = choreo.shockwaveProgress;
      particleUniforms.uFadeOut.value = choreo.overlayOpacity;

      // Update Golden Seismic Shockwave Ring (1.1s - 2.15s)
      if (choreo.shockwaveProgress > 0 && choreo.shockwaveProgress < 1) {
        shockwaveMesh.visible = true;
        const ringScale = 1.0 + choreo.shockwaveProgress * 9.5;
        shockwaveMesh.scale.setScalar(ringScale);
        shockwaveUniforms.uProgress.value = choreo.shockwaveProgress;
        shockwaveUniforms.uOpacity.value =
          Math.sin(choreo.shockwaveProgress * Math.PI) * 0.85;
      } else {
        shockwaveMesh.visible = false;
      }

      // Stage 3 -> 4 (2.4s - 3.2s): Emerge Page 01 glassmorphic story cards & header bar
      // with smooth staggered translateY(18px -> 0) reveal
      const revealY = ((1 - choreo.uiRevealProgress) * 18).toFixed(2);
      const revealAlpha = (0.06 + choreo.uiRevealProgress * 0.94).toFixed(3);
      document.documentElement.style.setProperty('--igloo-reveal-y', `${revealY}px`);
      document.documentElement.style.setProperty('--igloo-reveal-opacity', revealAlpha);

      // Smoothly fade the deep-space backdrop as Page 01 emerges underneath
      if (backdropRef.current) {
        const bgAlpha =
          elapsedSec < 2.15
            ? 0.94
            : Math.max(0, 0.94 * (1 - (elapsedSec - 2.15) / 1.1));
        backdropRef.current.style.opacity = bgAlpha.toFixed(3);
      }

      // Fade out overlay & diegetic HUD during Stage 4 handoff (3.1s - 3.4s)
      if (overlayRef.current) {
        overlayRef.current.style.opacity = choreo.overlayOpacity.toFixed(3);
      }
      if (hudRef.current) {
        const hudAlpha =
          elapsedSec < 2.85 ? 1 : Math.max(0, 1 - (elapsedSec - 2.85) / 0.45);
        hudRef.current.style.opacity = hudAlpha.toFixed(3);
      }

      // Update Diegetic Micro-HUD Telemetry Readout (00.0% -> 100.0%) via DOM ref
      if (telemetryPctRef.current) {
        telemetryPctRef.current.textContent = choreo.telemetryFormatted;
      }
      if (progressBarFillRef.current) {
        progressBarFillRef.current.style.width = `${choreo.telemetryPercent}%`;
      }
      if (telemetryStageRef.current) {
        const currentLang = langRef.current;
        if (choreo.stage === 1) {
          telemetryStageRef.current.textContent =
            currentLang === 'en'
              ? 'STAGE 01 // QUANTUM LIDAR CONVERGENCE'
              : 'GIAI ĐOẠN 01 // HỘI TỤ ĐIỂM ẢNH LIDAR SAO HỎA';
        } else if (choreo.stage === 2) {
          telemetryStageRef.current.textContent =
            currentLang === 'en'
              ? 'STAGE 02 // SEISMIC PULSE & CURL-NOISE VORTEX'
              : 'GIAI ĐOẠN 02 // XUNG ĐỊA CHẤN & XOÁY HẠT KHÔNG GIAN';
        } else if (choreo.stage === 3) {
          telemetryStageRef.current.textContent =
            currentLang === 'en'
              ? 'STAGE 03 // HERO ARCHIVE LOCK-IN (ELYSIUM PLANITIA)'
              : 'GIAI ĐOẠN 03 // KHÓA TỌA ĐỘ ELYSIUM PLANITIA';
        } else {
          telemetryStageRef.current.textContent =
            currentLang === 'en'
              ? 'STAGE 04 // TELEMETRY HANDOFF COMPLETE'
              : 'GIAI ĐOẠN 04 // HOÀN TẤT ĐỒNG BỘ DỮ LIỆU';
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      unmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      window.removeEventListener('resize', onResize);
      document.documentElement.style.setProperty('--igloo-reveal-y', '0px');
      document.documentElement.style.setProperty('--igloo-reveal-opacity', '1');
      // 100% GPU Memory Cleanup
      geometry.dispose();
      particleMaterial.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      renderer.dispose();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      data-testid="nanotech-mars-intro-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="overflow-hidden select-none"
    >
      {/* Deep-Space Atmospheric Canvas Backdrop (fades smoothly during Stage 3 reveal) */}
      <div
        ref={backdropRef}
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(28, 13, 9, 0.94) 0%, rgba(10, 7, 12, 0.96) 58%, rgba(4, 3, 7, 0.98) 100%)',
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Three.js Custom GLSL Particle WebGL Mount */}
      <div
        ref={canvasMountRef}
        data-testid="igloo-glsl-canvas-mount"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* DIEGETIC "IGLOO INC." ARCHITECTURAL MICRO-HUD OVERLAY */}
      <div
        ref={hudRef}
        data-testid="igloo-diegetic-hud"
        className="absolute inset-0 pointer-events-none"
      >
        {/* Ultra-thin Architectural Hairline Grid Lines (1px solid rgba(255, 209, 166, 0.12)) */}
        <div
          style={{ borderRight: '1px solid rgba(255, 209, 166, 0.12)' }}
          className="absolute inset-y-0 left-[12%]"
        />
        <div
          style={{ borderRight: '1px solid rgba(255, 209, 166, 0.07)' }}
          className="absolute inset-y-0 left-1/2"
        />
        <div
          style={{ borderLeft: '1px solid rgba(255, 209, 166, 0.12)' }}
          className="absolute inset-y-0 right-[12%]"
        />
        <div
          style={{ borderBottom: '1px solid rgba(255, 209, 166, 0.12)' }}
          className="absolute inset-x-0 top-[14%]"
        />
        <div
          style={{ borderBottom: '1px solid rgba(255, 209, 166, 0.07)' }}
          className="absolute inset-x-0 top-1/2"
        />
        <div
          style={{ borderTop: '1px solid rgba(255, 209, 166, 0.12)' }}
          className="absolute inset-x-0 bottom-[14%]"
        />

        {/* Four Minimalist Corner Registration Crosshairs (+) */}
        <span
          style={{ top: '14%', left: '12%' }}
          className="-translate-x-1/2 -translate-y-1/2 absolute text-xs font-light text-[#FFD1A6]/65 leading-none"
        >
          +
        </span>
        <span
          style={{ top: '14%', right: '12%' }}
          className="translate-x-1/2 -translate-y-1/2 absolute text-xs font-light text-[#FFD1A6]/65 leading-none"
        >
          +
        </span>
        <span
          style={{ bottom: '14%', left: '12%' }}
          className="-translate-x-1/2 translate-y-1/2 absolute text-xs font-light text-[#FFD1A6]/65 leading-none"
        >
          +
        </span>
        <span
          style={{ bottom: '14%', right: '12%' }}
          className="translate-x-1/2 translate-y-1/2 absolute text-xs font-light text-[#FFD1A6]/65 leading-none"
        >
          +
        </span>

        {/* Sleek Center-Bottom Telemetry Readout Counting Smoothly from 00.0% to 100.0% */}
        <div className="absolute bottom-[4.5%] inset-x-0 flex flex-col items-center justify-center px-4">
          <div
            style={{
              backgroundColor: 'rgba(12, 7, 6, 0.88)',
              border: '1px solid rgba(255, 209, 166, 0.24)',
            }}
            className="w-full max-w-[580px] px-5 py-3 rounded-xl flex flex-col items-center gap-1.5 shadow-2xl"
          >
            <div className="w-full flex items-center justify-between text-[10px] sm:text-[11px] tracking-[0.16em] uppercase font-bold text-[#FFD1A6]">
              <span>INITIALIZING PLANETARY ARCHIVE // NSSDCA: 2018-042A</span>
              <span
                ref={telemetryStageRef}
                className="text-[#64DFDF] hidden sm:inline truncate max-w-[240px]"
              >
                STAGE 01 // QUANTUM LIDAR CONVERGENCE
              </span>
            </div>

            {/* Hairline Progress Bar */}
            <div className="w-full h-[2px] bg-[#FFD1A6]/15 overflow-hidden rounded-full">
              <div
                ref={progressBarFillRef}
                style={{ width: '0%' }}
                className="h-full bg-gradient-to-r from-[#E76F51] via-[#FFD1A6] to-[#64DFDF]"
              />
            </div>

            <div className="w-full flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] tracking-[0.14em] uppercase font-semibold text-[#FFF8F2]/85">
              <span>ELYSIUM PLANITIA TELEMETRY · 4.502°N, 135.623°E</span>
              <span className="text-[#FFD1A6] font-extrabold tabular-nums">
                [ <span ref={telemetryPctRef} data-testid="igloo-telemetry-pct">00.0%</span> ]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
