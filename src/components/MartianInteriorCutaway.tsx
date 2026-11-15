import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Language,
  MARTIAN_INTERIOR_LAYERS,
  MartianLayerSpec,
} from '../data/bilingualContent';
import { INSIGHT_MEDIA_ASSETS, handleNasaImageError } from '../utils/nasaMedia';

interface MartianInteriorCutawayProps {
  lang: Language;
}

function createPhotorealisticMarsTextures(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = w;
  bCanvas.height = h;
  const bCtx = bCanvas.getContext('2d')!;

  // Rich Martian iron-oxide terracotta gradient from polar regions to equatorial highlands
  const latGrad = ctx.createLinearGradient(0, 0, 0, h);
  latGrad.addColorStop(0, '#F5EDE6');
  latGrad.addColorStop(0.06, '#C96A42');
  latGrad.addColorStop(0.28, '#D97245');
  latGrad.addColorStop(0.5, '#BA4E28');
  latGrad.addColorStop(0.74, '#9E3E1E');
  latGrad.addColorStop(0.94, '#7E2F16');
  latGrad.addColorStop(1, '#E8DDD5');
  ctx.fillStyle = latGrad;
  ctx.fillRect(0, 0, w, h);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);

  // Dark basaltic albedo regions & Valles Marineris canyon system
  for (let i = 0; i < 420; i++) {
    const x = (i * 173 + 29) % w;
    const y = 36 + ((i * 113 + 47) % (h - 72));
    const rx = 14 + (i % 55);
    const ry = 6 + ((i * 7) % 28);
    const isDarkBasalt = i % 3 === 0;
    ctx.fillStyle = isDarkBasalt
      ? 'rgba(62, 24, 14, 0.22)'
      : 'rgba(238, 148, 96, 0.18)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (i % 6) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Valles Marineris grand canyon scar across the equatorial face
  ctx.strokeStyle = 'rgba(46, 15, 8, 0.72)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(w * 0.18, h * 0.52);
  ctx.bezierCurveTo(w * 0.3, h * 0.55, w * 0.42, h * 0.51, w * 0.54, h * 0.54);
  ctx.stroke();

  bCtx.strokeStyle = '#181818';
  bCtx.lineWidth = 12;
  bCtx.beginPath();
  bCtx.moveTo(w * 0.18, h * 0.52);
  bCtx.bezierCurveTo(w * 0.3, h * 0.55, w * 0.42, h * 0.51, w * 0.54, h * 0.54);
  bCtx.stroke();

  // Impact craters & Tharsis volcanic shields
  for (let c = 0; c < 180; c++) {
    const cx = (c * 199 + 41) % w;
    const cy = 28 + ((c * 137 + 19) % (h - 56));
    const cr = 3 + (c % 16);

    ctx.strokeStyle = 'rgba(255, 195, 145, 0.24)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();

    bCtx.strokeStyle = '#d8d8d8';
    bCtx.lineWidth = 2;
    bCtx.beginPath();
    bCtx.arc(cx, cy, cr, 0, Math.PI * 2);
    bCtx.stroke();

    bCtx.fillStyle = '#484848';
    bCtx.beginPath();
    bCtx.arc(cx, cy, Math.max(1, cr - 1.5), 0, Math.PI * 2);
    bCtx.fill();
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bCanvas);
  return { colorMap, bumpMap };
}

function createVolcanicMantleRockTexture(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const radGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, size * 0.5);
  radGrad.addColorStop(0, '#8C3B16');
  radGrad.addColorStop(0.32, '#542615');
  radGrad.addColorStop(0.68, '#3B1E14');
  radGrad.addColorStop(0.92, '#2B1711');
  radGrad.addColorStop(1, '#4A2C21');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const fract = (n: number) => n - Math.floor(n);
  for (let i = 0; i < 950; i++) {
    const x = fract(Math.sin(i * 12.9898 + 2.1) * 43758.5453) * size;
    const y = fract(Math.sin(i * 78.233 + 5.4) * 28461.3219) * size;
    const r = 1.5 + fract(Math.sin(i * 41.2) * 9182.3) * 6.5;
    const isPore = i % 2 === 0;
    ctx.fillStyle = isPore
      ? 'rgba(20, 10, 8, 0.42)'
      : 'rgba(130, 82, 56, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    bCtx.fillStyle = isPore ? '#303030' : '#c8c8c8';
    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bCanvas);
  return { colorMap, bumpMap };
}

function createVolumetricMoltenCoreMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uHighlight: { value: 1.0 },
      uOpacity: { value: 1.0 },
    },
    transparent: true,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uHighlight;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewDir;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = p * 2.05 + vec3(0.15, -0.12, 0.21);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        float viewDot = clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0);
        vec3 p = vPosition * 2.8 + vec3(uTime * 0.22, -uTime * 0.18, uTime * 0.15);
        float n = fbm(p);
        float n2 = fbm(p * 1.9 - vec3(uTime * 0.3));
        float magmaPattern = clamp(n * 0.65 + n2 * 0.45, 0.0, 1.0);

        vec3 deepCrimson = vec3(0.75, 0.14, 0.02);
        vec3 fieryOrange = vec3(1.0, 0.46, 0.04);
        vec3 solarGold   = vec3(1.0, 0.84, 0.28);
        vec3 whiteHot    = vec3(1.0, 0.99, 0.90);

        vec3 col = mix(deepCrimson, fieryOrange, smoothstep(0.15, 0.52, magmaPattern));
        col = mix(col, solarGold, smoothstep(0.45, 0.78, magmaPattern + viewDot * 0.25));
        float innerCoreFactor = smoothstep(0.58, 0.92, viewDot * 0.85 + magmaPattern * 0.35);
        col = mix(col, whiteHot, innerCoreFactor);

        gl_FragColor = vec4(col * uHighlight, uOpacity);
      }
    `,
  });
}

export const MartianInteriorCutaway: React.FC<MartianInteriorCutawayProps> = ({ lang }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<MartianLayerSpec['id']>('core');
  const [showNasaCutawayPhoto, setShowNasaCutawayPhoto] = useState(false);
  const [seismicPulseProgress, setSeismicPulseProgress] = useState<number>(100);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    rotY: -0.76,
    rotX: 0.22,
    targetRotY: -0.76,
    targetRotX: 0.22,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    selectedLayerId: 'core' as MartianLayerSpec['id'],
    pulseProgress: 100,
    requestRender: () => {},
  });

  useEffect(() => {
    if (!isPulsing) return;
    let progress = 0;
    const interval = window.setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        setSeismicPulseProgress(100);
        stateRef.current.pulseProgress = 100;
        setIsPulsing(false);
        stateRef.current.requestRender();
        window.clearInterval(interval);
      } else {
        setSeismicPulseProgress(progress);
        stateRef.current.pulseProgress = progress;
        stateRef.current.requestRender();
      }
    }, 35);
    return () => window.clearInterval(interval);
  }, [isPulsing]);

  useEffect(() => {
    stateRef.current.selectedLayerId = selectedLayerId;
    // Rotate slightly to showcase the selected layer clearly inside the 90-degree wedge
    if (selectedLayerId === 'crust') {
      stateRef.current.targetRotY = -0.86;
      stateRef.current.targetRotX = 0.24;
    } else if (selectedLayerId === 'mantle') {
      stateRef.current.targetRotY = -0.74;
      stateRef.current.targetRotX = 0.21;
    } else {
      stateRef.current.targetRotY = -0.76;
      stateRef.current.targetRotX = 0.22;
    }
    stateRef.current.requestRender();
  }, [selectedLayerId]);

  // Interactive 3D Cutaway Sphere of Mars with Direct 3D Layer Highlighting
  useEffect(() => {
    if (showNasaCutawayPhoto) return;
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 390);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.22, 6.1);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const glCtx = renderer.getContext();
    const debugRenderer = glCtx?.getExtension('WEBGL_debug_renderer_info');
    const rendererName = debugRenderer
      ? String(glCtx?.getParameter(debugRenderer.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const isSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software/i.test(rendererName) ||
      (typeof navigator !== 'undefined' && navigator.webdriver === true);

    const renderW = isSoftwareGl ? Math.min(width, 640) : width;
    const renderH = isSoftwareGl ? Math.min(height, 400) : height;
    renderer.setSize(renderW, renderH, false);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    let pmremGenerator: THREE.PMREMGenerator | null = null;
    if (!isSoftwareGl) {
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    }

    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.92);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.35);
    sunLight.position.set(-4.5, 4.2, 5.5);
    scene.add(sunLight);

    const corePointLight = new THREE.PointLight(0xff7b00, 3.8, 7.5);
    corePointLight.position.set(0.35, 0.25, 0.45);
    scene.add(corePointLight);

    const planetGroup = new THREE.Group();
    planetGroup.position.set(0, 0.02, 0);
    scene.add(planetGroup);

    const interactables: THREE.Object3D[] = [];

    // 1. OUTER MARS CRUST (24–72 km) + Atmospheric Fresnel Halo
    const { colorMap: marsSurfaceTex, bumpMap: marsBumpTex } = createPhotorealisticMarsTextures();

    const crustMat = new THREE.MeshStandardMaterial({
      map: marsSurfaceTex,
      bumpMap: marsBumpTex,
      bumpScale: 0.045,
      roughness: 0.68,
      metalness: 0.08,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const crustShell = new THREE.Mesh(
      new THREE.SphereGeometry(2.04, 56, 40, Math.PI, Math.PI * 1.5, 0, Math.PI),
      crustMat
    );
    crustShell.userData = { layerId: 'crust' };
    planetGroup.add(crustShell);
    interactables.push(crustShell);

    const atmosMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = 1.0 - clamp(dot(vNormal, -vViewDir), 0.0, 1.0);
          float glow = pow(rim, 3.2) * 0.65;
          vec3 col = mix(vec3(0.95, 0.55, 0.32), vec3(0.75, 0.88, 1.0), rim);
          gl_FragColor = vec4(col, glow);
        }
      `,
    });
    const atmosHalo = new THREE.Mesh(new THREE.SphereGeometry(2.14, 48, 32), atmosMat);
    planetGroup.add(atmosHalo);

    // 2. ROCKY SILICATE MANTLE CROSS-SECTION WALLS (1,550 km) + CRUST RIM BAND
    const { colorMap: mantleTex, bumpMap: mantleBump } = createVolcanicMantleRockTexture();

    const wedgeMat = new THREE.MeshStandardMaterial({
      map: mantleTex,
      bumpMap: mantleBump,
      bumpScale: 0.065,
      roughness: 0.84,
      metalness: 0.12,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const wedgeShape = new THREE.Shape();
    wedgeShape.absarc(0, 0, 1.95, -Math.PI * 0.5, Math.PI * 0.5, false);
    wedgeShape.absarc(0, 0, 1.06, Math.PI * 0.5, -Math.PI * 0.5, true);
    wedgeShape.closePath();
    const wedgeGeo = new THREE.ShapeGeometry(wedgeShape, 40);

    const uvAttr = wedgeGeo.attributes.uv;
    const posAttr = wedgeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      uvAttr.setXY(i, vx / 4.0 + 0.5, vy / 4.0 + 0.5);
    }

    const wedgeFaceZ = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeFaceZ.userData = { layerId: 'mantle' };
    planetGroup.add(wedgeFaceZ);
    interactables.push(wedgeFaceZ);

    const wedgeFaceX = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeFaceX.rotation.y = -Math.PI * 0.5;
    wedgeFaceX.userData = { layerId: 'mantle' };
    planetGroup.add(wedgeFaceX);
    interactables.push(wedgeFaceX);

    // Outer Distinct Crust Rim Band (24–72 km) along the cutaway edge
    const crustRimShape = new THREE.Shape();
    crustRimShape.absarc(0, 0, 2.04, -Math.PI * 0.5, Math.PI * 0.5, false);
    crustRimShape.absarc(0, 0, 1.95, Math.PI * 0.5, -Math.PI * 0.5, true);
    crustRimShape.closePath();
    const crustRimGeo = new THREE.ShapeGeometry(crustRimShape, 40);
    const crustRimMat = new THREE.MeshStandardMaterial({
      color: 0x8c5238,
      bumpMap: mantleBump,
      bumpScale: 0.04,
      roughness: 0.72,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const crustRimZ = new THREE.Mesh(crustRimGeo, crustRimMat);
    crustRimZ.position.z = 0.004;
    crustRimZ.userData = { layerId: 'crust' };
    planetGroup.add(crustRimZ);
    interactables.push(crustRimZ);

    const crustRimX = new THREE.Mesh(crustRimGeo, crustRimMat);
    crustRimX.rotation.y = -Math.PI * 0.5;
    crustRimX.position.x = 0.004;
    crustRimX.userData = { layerId: 'crust' };
    planetGroup.add(crustRimX);
    interactables.push(crustRimX);

    // 3. 3D EMBEDDED ASTEROID FRAGMENTS (4.5-Ga Impact Debris in Mantle)
    const lumpGroup = new THREE.Group();
    const lumpGeo = new THREE.DodecahedronGeometry(0.095, 1);
    const lumpMat = new THREE.MeshStandardMaterial({
      color: 0xa68368,
      emissive: 0x452212,
      emissiveIntensity: 0.35,
      bumpMap: mantleBump,
      bumpScale: 0.04,
      roughness: 0.68,
      metalness: 0.18,
      transparent: true,
    });

    const lumpCoords: [number, number, number, number][] = [
      [1.26, 0.76, 0.03, 1.15],
      [1.46, 0.22, 0.04, 1.45],
      [1.18, -0.45, 0.03, 0.95],
      [1.56, -0.68, 0.03, 1.1],
      [0.88, 1.18, 0.03, 1.05],
      [0.65, 1.48, 0.03, 0.85],
      [0.82, -1.24, 0.03, 0.92],
      [0.03, 0.92, 1.24, 1.2],
      [0.04, 0.25, 1.46, 1.35],
      [0.03, -0.52, 1.32, 1.0],
      [0.03, -1.12, 1.06, 0.88],
      [0.03, 1.38, 0.72, 0.9],
    ];

    lumpCoords.forEach(([x, y, z, scale], idx) => {
      const m = new THREE.Mesh(lumpGeo, lumpMat);
      m.position.set(x, y, z);
      m.scale.set(scale * 1.2, scale * 0.85, scale);
      m.rotation.set(idx * 0.7, idx * 1.1, idx * 0.4);
      m.userData = { layerId: 'mantle' };
      lumpGroup.add(m);
      interactables.push(m);
    });
    planetGroup.add(lumpGroup);

    // 4. RADIANT MOLTEN CORE (R ≈ 1,830 km) with 90-degree inner cutaway wedge & glowing cross-section faces
    const moltenShaderMat = createVolumetricMoltenCoreMaterial();
    moltenShaderMat.side = THREE.DoubleSide;

    const coreSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 48, 36, Math.PI, Math.PI * 1.5, 0, Math.PI),
      moltenShaderMat
    );
    coreSphere.userData = { layerId: 'core' };
    planetGroup.add(coreSphere);
    interactables.push(coreSphere);

    const coreWedgeShape = new THREE.Shape();
    coreWedgeShape.moveTo(0, -1.06);
    coreWedgeShape.absarc(0, 0, 1.06, -Math.PI * 0.5, Math.PI * 0.5, false);
    coreWedgeShape.lineTo(0, -1.06);
    const coreWedgeGeo = new THREE.ShapeGeometry(coreWedgeShape, 36);

    const coreFaceZ = new THREE.Mesh(coreWedgeGeo, moltenShaderMat);
    coreFaceZ.position.z = 0.002;
    coreFaceZ.userData = { layerId: 'core' };
    planetGroup.add(coreFaceZ);
    interactables.push(coreFaceZ);

    const coreFaceX = new THREE.Mesh(coreWedgeGeo, moltenShaderMat);
    coreFaceX.rotation.y = -Math.PI * 0.5;
    coreFaceX.position.x = 0.002;
    coreFaceX.userData = { layerId: 'core' };
    planetGroup.add(coreFaceX);
    interactables.push(coreFaceX);

    // Glowing White-Hot Inner Core Center Sphere
    const innerHotCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfff5cc,
      transparent: true,
      opacity: 0.92,
    });
    const innerHotCore = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 20), innerHotCoreMat);
    innerHotCore.userData = { layerId: 'core' };
    planetGroup.add(innerHotCore);
    interactables.push(innerHotCore);

    const coreBloomMat = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreBloom = new THREE.Mesh(new THREE.SphereGeometry(1.12, 32, 24), coreBloomMat);
    planetGroup.add(coreBloom);

    // 5. 3D Seismic Wave Paths Engraved on the Cutaway Cross-Section Walls:
    // Cyan P-Wave (Refracting Through Liquid Core) & Amber S-Wave (Stopped at Core Shadow Zone)
    const seismicRayGroup = new THREE.Group();

    const pWaveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.18, 2.0, 0.032),
      new THREE.Vector3(0.68, 1.38, 0.035),
      new THREE.Vector3(0.56, 0.35, 0.038),
      new THREE.Vector3(0.48, -0.58, 0.038),
      new THREE.Vector3(0.95, -1.78, 0.032),
    ]);
    const pWaveMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });
    const pWaveTube = new THREE.Mesh(
      new THREE.TubeGeometry(pWaveCurve, 32, 0.022, 8, false),
      pWaveMat
    );
    seismicRayGroup.add(pWaveTube);

    const sWaveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.032, 2.0, 0.18),
      new THREE.Vector3(0.035, 1.52, 0.72),
      new THREE.Vector3(0.038, 0.92, 0.96),
      new THREE.Vector3(0.035, 1.18, 1.45),
      new THREE.Vector3(0.032, 1.36, 1.88),
    ]);
    const sWaveMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xf4a261,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });
    const sWaveTube = new THREE.Mesh(
      new THREE.TubeGeometry(sWaveCurve, 28, 0.022, 8, false),
      sWaveMat
    );
    seismicRayGroup.add(sWaveTube);

    planetGroup.add(seismicRayGroup);

    // Apply accurate 3D layer illumination & dimming based on selectedLayerId
    const applyLayerHighlight = (layerId: MartianLayerSpec['id']) => {
      if (layerId === 'crust') {
        crustMat.color.setHex(0xffffff);
        crustMat.emissive.setHex(0xff7b29);
        crustMat.emissiveIntensity = 0.42;
        crustMat.opacity = 1.0;

        crustRimMat.color.setHex(0xffb703);
        crustRimMat.emissive.setHex(0xff8c24);
        crustRimMat.emissiveIntensity = 0.72;
        crustRimMat.opacity = 1.0;

        wedgeMat.color.setHex(0x888888);
        wedgeMat.emissive.setHex(0x000000);
        wedgeMat.emissiveIntensity = 0.0;
        wedgeMat.opacity = 0.55;

        lumpMat.emissiveIntensity = 0.1;
        lumpMat.opacity = 0.55;

        moltenShaderMat.uniforms.uHighlight.value = 0.65;
        moltenShaderMat.uniforms.uOpacity.value = 0.65;
        coreBloomMat.opacity = 0.12;
      } else if (layerId === 'mantle') {
        crustMat.color.setHex(0x999999);
        crustMat.emissive.setHex(0x000000);
        crustMat.emissiveIntensity = 0.0;
        crustMat.opacity = 0.58;

        crustRimMat.color.setHex(0x6b4230);
        crustRimMat.emissive.setHex(0x000000);
        crustRimMat.emissiveIntensity = 0.0;
        crustRimMat.opacity = 0.58;

        wedgeMat.color.setHex(0xffffff);
        wedgeMat.emissive.setHex(0xd95f18);
        wedgeMat.emissiveIntensity = 0.38;
        wedgeMat.opacity = 1.0;

        lumpMat.color.setHex(0xffd1a6);
        lumpMat.emissive.setHex(0xff8c24);
        lumpMat.emissiveIntensity = 0.78;
        lumpMat.opacity = 1.0;

        moltenShaderMat.uniforms.uHighlight.value = 0.7;
        moltenShaderMat.uniforms.uOpacity.value = 0.72;
        coreBloomMat.opacity = 0.14;
      } else {
        // 'core' selected
        crustMat.color.setHex(0xb8b8b8);
        crustMat.emissive.setHex(0x000000);
        crustMat.emissiveIntensity = 0.0;
        crustMat.opacity = 0.72;

        crustRimMat.color.setHex(0x7c4a33);
        crustRimMat.emissive.setHex(0x000000);
        crustRimMat.emissiveIntensity = 0.05;
        crustRimMat.opacity = 0.72;

        wedgeMat.color.setHex(0xb0b0b0);
        wedgeMat.emissive.setHex(0x1f0a04);
        wedgeMat.emissiveIntensity = 0.12;
        wedgeMat.opacity = 0.75;

        lumpMat.color.setHex(0xa68368);
        lumpMat.emissive.setHex(0x452212);
        lumpMat.emissiveIntensity = 0.28;
        lumpMat.opacity = 0.8;

        moltenShaderMat.uniforms.uHighlight.value = 1.32;
        moltenShaderMat.uniforms.uOpacity.value = 1.0;
        coreBloomMat.opacity = 0.42;
      }
      crustMat.needsUpdate = true;
      crustRimMat.needsUpdate = true;
      wedgeMat.needsUpdate = true;
      lumpMat.needsUpdate = true;
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      const rect = domEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        const hitLayer = hits[0].object.userData.layerId as MartianLayerSpec['id'] | undefined;
        if (hitLayer) {
          setSelectedLayerId(hitLayer);
        }
      }

      stateRef.current.isDragging = true;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.lastX;
      const dy = e.clientY - stateRef.current.lastY;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;
      stateRef.current.targetRotY += dx * 0.009;
      stateRef.current.targetRotX = Math.max(
        -0.45,
        Math.min(0.68, stateRef.current.targetRotX + dy * 0.007)
      );
      requestRender();
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let unmounted = false;
    let shaderClock = 0;
    let lastLayerId: MartianLayerSpec['id'] | null = null;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (unmounted) return;
        const status = gl.clientWaitSync(sync, 0, 0);
        if (status === gl.TIMEOUT_EXPIRED) {
          frameId = window.setTimeout(poll, 16);
          return;
        }
        gl.deleteSync(sync);
        cb();
      };
      frameId = window.setTimeout(poll, 0);
    }

    const drawScene = () => {
      if (unmounted) return;
      const st = stateRef.current;

      if (lastLayerId !== st.selectedLayerId) {
        lastLayerId = st.selectedLayerId;
        applyLayerHighlight(st.selectedLayerId);
      }

      if (isSoftwareGl) {
        st.rotY = st.targetRotY;
        st.rotX = st.targetRotX;
      } else {
        st.rotY += (st.targetRotY - st.rotY) * 0.16;
        st.rotX += (st.targetRotX - st.rotX) * 0.16;
      }
      planetGroup.rotation.y = st.rotY;
      planetGroup.rotation.x = st.rotX;

      shaderClock += 0.035;
      moltenShaderMat.uniforms.uTime.value = shaderClock;

      const scaleFactor = Math.max(0.05, st.pulseProgress / 100);
      seismicRayGroup.scale.set(1, scaleFactor, 1);

      renderer.render(scene, camera);

      const stillMoving =
        !isSoftwareGl &&
        (Math.abs(st.targetRotY - st.rotY) > 0.001 ||
          Math.abs(st.targetRotX - st.rotX) > 0.001);
      if (stillMoving) {
        renderDirty = true;
      }
    };

    function requestRender() {
      if (unmounted) return;
      if (isSoftwareGl) {
        if (renderBusy) {
          renderDirty = true;
          return;
        }
        renderBusy = true;
        drawScene();
        afterDraw(() => {
          renderBusy = false;
          if (renderDirty) {
            renderDirty = false;
            requestRender();
          }
        });
      } else {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          drawScene();
          if (renderDirty) {
            renderDirty = false;
            requestRender();
          }
        });
      }
    }

    stateRef.current.requestRender = requestRender;
    requestRender();

    const magmaTimer = isSoftwareGl
      ? 0
      : window.setInterval(() => {
          requestRender();
        }, 75);

    const onResize = () => {
      if (!container || unmounted) return;
      const nw = Math.max(container.clientWidth, 300);
      const nh = Math.max(container.clientHeight, 390);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    return () => {
      unmounted = true;
      if (magmaTimer) window.clearInterval(magmaTimer);
      window.clearTimeout(frameId);
      cancelAnimationFrame(frameId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      pmremGenerator?.dispose();
      renderer.dispose();
    };
  }, [showNasaCutawayPhoto]);

  const activeLayer =
    MARTIAN_INTERIOR_LAYERS.find((l) => l.id === selectedLayerId) || MARTIAN_INTERIOR_LAYERS[2];

  const layerTabButtons: Array<{
    id: MartianLayerSpec['id'];
    labelEn: string;
    labelVi: string;
    subEn: string;
    subVi: string;
  }> = [
    {
      id: 'crust',
      labelEn: '1. Crust',
      labelVi: '1. Lớp Vỏ',
      subEn: '24–72 km',
      subVi: '24–72 km',
    },
    {
      id: 'mantle',
      labelEn: '2. Mantle',
      labelVi: '2. Lớp Phủ',
      subEn: '1,550 km · Lumpy',
      subVi: '1.550 km · Lổn nhổn',
    },
    {
      id: 'core',
      labelEn: '3. Liquid Core',
      labelVi: '3. Lõi Lỏng',
      subEn: 'R ≈ 1,830 km',
      subVi: 'R ≈ 1.830 km',
    },
  ];

  return (
    <div
      data-no-swipe="true"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mobile-single-col-lock"
    >
      {/* LEFT COLUMN (7 Cols): Clean 3D Mars Cutaway Sphere + Single Compact Legend Bar at Bottom */}
      <div className="lg:col-span-7 rounded-2xl border border-[#F4A261]/35 bg-[#120908]/95 p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00F5D4] block">
              {lang === 'en'
                ? 'Interactive 3D Martian Interior Cutaway'
                : 'Mô Hình Mặt Cắt 3D Nội Tâm Sao Hỏa'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#FFF8F2]">
              {lang === 'en'
                ? 'Drag to Rotate Mars · Click Any Layer to Highlight'
                : 'Kéo để xoay Sao Hỏa · Chạm vào từng lớp để chiếu sáng'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="send-seismic-pulse-btn"
              onClick={() => {
                setSeismicPulseProgress(5);
                stateRef.current.pulseProgress = 5;
                setIsPulsing(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F4A261] text-[#1F110C] text-xs font-bold hover:bg-[#FFD1A6] transition-colors shadow-md cursor-pointer"
            >
              {lang === 'en' ? '⚡ Send Seismic Pulse' : '⚡ Phát xung địa chấn'}
            </button>

            <button
              type="button"
              data-testid="toggle-pia26636-artwork-btn"
              onClick={() => setShowNasaCutawayPhoto((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-[#27150F] text-[#FFD1A6] border border-[#F4A261]/40 text-xs font-semibold hover:bg-[#3A2017] transition-colors cursor-pointer"
            >
              {showNasaCutawayPhoto
                ? lang === 'en'
                  ? 'Return to 3D Globe'
                  : 'Quay lại quả cầu 3D'
                : lang === 'en'
                  ? 'Show NASA Artwork (PIA26636)'
                  : 'Xem ảnh gốc NASA (PIA26636)'}
            </button>
          </div>
        </div>

        {/* Clean 3D Cutaway Viewport (Zero Floating Tag Boxes or Overlapping White Lines) */}
        {!showNasaCutawayPhoto ? (
          <div
            data-testid="martian-3d-cutaway-canvas"
            className="relative w-full h-[380px] sm:h-[420px] rounded-2xl bg-gradient-to-b from-[#070810] via-[#0E0B14] to-[#170C0A] border border-[#F4A261]/25 overflow-hidden select-none"
          >
            <div
              ref={mountRef}
              className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
            />

            <button
              type="button"
              onClick={() => {
                stateRef.current.targetRotY = -0.76;
                stateRef.current.targetRotX = 0.22;
                stateRef.current.requestRender();
              }}
              className="absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-[#160C08]/90 text-[#FFD1A6] border border-[#F4A261]/35 text-[11px] font-semibold hover:text-white cursor-pointer"
            >
              {lang === 'en' ? 'Reset 3D Angle' : 'Đặt lại góc 3D'}
            </button>
          </div>
        ) : (
          <div className="relative w-full h-[380px] sm:h-[420px] rounded-2xl bg-[#0D0705] border border-[#F4A261]/30 overflow-hidden flex flex-col items-center justify-center p-2">
            <img
              src={INSIGHT_MEDIA_ASSETS.PIA26636_LOCAL}
              onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.PIA26636_NASA)}
              alt="NASA PIA26636 Martian Interior Cutaway Showing Asteroid Debris in Mantle"
              className="max-h-[340px] w-auto object-contain rounded-xl"
            />
            <p className="mt-2 text-xs text-[#FFD1A6] text-center">
              {lang === 'en'
                ? 'Official NASA/JPL-Caltech Cutaway Illustration (PIA26636)'
                : ' Minh họa mặt cắt chính thức từ NASA/JPL-Caltech (PIA26636)'}
            </p>
          </div>
        )}

        {/* Single Compact Legend Bar at the Bottom of the Left Column */}
        <div
          data-testid="martian-cutaway-legend-bar"
          className="px-3.5 py-2.5 rounded-xl bg-[#1A0E0A] border border-[#F4A261]/25 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#F3E5D8]"
        >
          <span className="inline-flex items-center gap-1.5 text-[#FFD1A6]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D49B6A] inline-block" />
            {lang === 'en'
              ? '• Ancient 4.5-Ga Mantle Fragments'
              : '• Mảnh vỡ nguyên thủy 4,5 tỷ năm'}
          </span>
          <span className="inline-flex items-center gap-3">
            <span className="text-[#00F5D4] font-bold">
              {lang === 'en' ? '— Cyan: P-Wave' : '— Xanh: Sóng P'}
            </span>
            <span className="text-[#F4A261] font-bold">
              {lang === 'en' ? '— Amber: S-Wave' : '— Vàng: Sóng S'}
            </span>
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN (5 Cols): 3 Horizontal Layer Tab Buttons at Top + Detailed Geological Explanation Card Below */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
        {/* 3 Horizontal Layer Tab Buttons at the Top */}
        <div
          data-testid="martian-layer-tabs"
          className="grid grid-cols-3 gap-2"
        >
          {layerTabButtons.map((tab) => {
            const active = tab.id === selectedLayerId;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`layer-tab-${tab.id}`}
                onClick={() => setSelectedLayerId(tab.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-[#F4A261] text-[#1D0F0A] border-[#FFF8F2] shadow-lg font-extrabold'
                    : 'bg-[#1D100C]/90 text-[#F3E5D8] border-[#F4A261]/30 hover:border-[#F4A261]/70 hover:bg-[#2B1710]'
                }`}
              >
                <div className="text-xs sm:text-sm font-extrabold leading-tight">
                  {lang === 'en' ? tab.labelEn : tab.labelVi}
                </div>
                <div
                  className={`text-[11px] mt-0.5 font-semibold ${
                    active ? 'text-[#2D160E]' : 'text-[#FFD1A6]/80'
                  }`}
                >
                  {lang === 'en' ? tab.subEn : tab.subVi}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Geological Explanation Card Directly Below the 3 Tab Buttons */}
        <div
          data-testid="martian-layer-detail-card"
          className="flex-1 rounded-2xl border border-[#F4A261]/40 bg-[#1B0E0B]/92 p-5 sm:p-6 space-y-4 shadow-2xl flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-[#3A1F16] border border-[#F4A261]/40 text-xs font-bold text-[#FFD1A6]">
                {activeLayer.depthRange[lang]}
              </span>
              <span className="text-xs font-semibold text-[#00F5D4]">
                {activeLayer.temperature[lang]}
              </span>
            </div>

            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#FFF8F2]">
              {activeLayer.name[lang]}
            </h3>

            <div className="p-3.5 rounded-xl bg-[#130906] border border-[#F4A261]/25">
              <div className="text-xs font-bold uppercase tracking-wider text-[#F4A261] mb-1">
                {lang === 'en' ? 'Composition & State' : 'Thành Phần & Trạng Thái Vật Lý'}
              </div>
              <p className="text-xs sm:text-sm text-[#FFF8F2] font-medium">
                {activeLayer.composition[lang]}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#00F5D4]">
                {lang === 'en'
                  ? 'How InSight Proved This (2018–2026)'
                  : 'Cách InSight Chứng Minh (2018–2026)'}
              </div>
              <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
                {activeLayer.seismicProof[lang]}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#2B150E] to-[#1A0D09] border border-[#00F5D4]/35">
            <div className="text-xs font-bold uppercase tracking-wider text-[#FFD1A6] mb-1">
              {lang === 'en' ? 'Planetary Science Summary' : 'Tóm Tắt Khoa Học Hành Tinh'}
            </div>
            <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
              {activeLayer.summary[lang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
