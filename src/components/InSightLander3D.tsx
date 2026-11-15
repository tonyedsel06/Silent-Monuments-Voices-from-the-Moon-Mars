import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  INSIGHT_SUBSYSTEMS_9,
  InSightSubsystemSpec,
  Language,
} from '../data/bilingualContent';
import { INSIGHT_MEDIA_ASSETS, handleNasaImageError } from '../utils/nasaMedia';

interface InSightLander3DProps {
  lang: Language;
  selectedSubsystemId: InSightSubsystemSpec['id'];
  onSelectSubsystem: (id: InSightSubsystemSpec['id']) => void;
}

// Optimal camera rotation angles (rotY, rotX, zoom) & 3D highlight center for each of the 9 subsystems
const SUBSYSTEM_CAMERA_TARGETS: Record<
  InSightSubsystemSpec['id'],
  { rotY: number; rotX: number; zoom: number; focusPos: [number, number, number]; haloRadius: number }
> = {
  solar: { rotY: -0.18, rotX: 0.36, zoom: 5.55, focusPos: [-1.85, 0.28, -0.18], haloRadius: 1.08 },
  seis: { rotY: -0.34, rotX: 0.28, zoom: 5.15, focusPos: [0.68, -0.45, 1.18], haloRadius: 0.44 },
  hp3: { rotY: 0.32, rotX: 0.28, zoom: 5.15, focusPos: [-0.62, -0.42, 1.24], haloRadius: 0.34 },
  ida: { rotY: 0.24, rotX: 0.29, zoom: 5.2, focusPos: [-0.52, 0.22, 0.62], haloRadius: 0.46 },
  cameras: { rotY: 0.18, rotX: 0.26, zoom: 5.05, focusPos: [-0.58, 0.38, 0.68], haloRadius: 0.25 },
  rise: { rotY: -0.16, rotX: 0.33, zoom: 5.1, focusPos: [-0.46, 0.34, 0.16], haloRadius: 0.26 },
  twins: { rotY: -0.38, rotX: 0.33, zoom: 5.15, focusPos: [0.54, 0.39, -0.18], haloRadius: 0.28 },
  uhf: { rotY: -0.36, rotX: 0.31, zoom: 5.1, focusPos: [0.38, 0.38, 0.12], haloRadius: 0.26 },
  legs_tethers: { rotY: -0.26, rotX: 0.27, zoom: 5.35, focusPos: [0.48, -0.48, 0.96], haloRadius: 0.48 },
};

function createUltraFlexSolarTexture(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.48;

  // Deep specular dark photovoltaic silicon cells
  const baseGrad = ctx.createRadialGradient(cx, cy, 18, cx, cy, maxR);
  baseGrad.addColorStop(0, '#222834');
  baseGrad.addColorStop(0.25, '#131D31');
  baseGrad.addColorStop(0.75, '#0F1829');
  baseGrad.addColorStop(1, '#1A1615');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Concentric golden/silver collector rings across the 20 gores
  for (let ring = 56; ring <= maxR; ring += 22) {
    const isMajor = ring % 66 === 0;
    ctx.strokeStyle = isMajor ? 'rgba(232, 185, 120, 0.78)' : 'rgba(148, 163, 184, 0.34)';
    ctx.lineWidth = isMajor ? 2.8 : 1.2;
    bCtx.strokeStyle = isMajor ? '#ffffff' : '#b8b8b8';
    bCtx.lineWidth = isMajor ? 3 : 1.5;

    ctx.beginPath();
    bCtx.beginPath();
    for (let s = 0; s <= 20; s++) {
      const a = (s / 20) * Math.PI * 2;
      const px = cx + Math.cos(a) * ring;
      const py = cy + Math.sin(a) * ring;
      if (s === 0) {
        ctx.moveTo(px, py);
        bCtx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
        bCtx.lineTo(px, py);
      }
    }
    ctx.stroke();
    bCtx.stroke();
  }

  // 20 Radial Golden Gore Ribs matching NASA UltraFlex decagonal fan geometry
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const isPrimaryRib = i % 2 === 0;
    ctx.strokeStyle = isPrimaryRib ? '#E5A963' : 'rgba(218, 175, 130, 0.58)';
    ctx.lineWidth = isPrimaryRib ? 4.5 : 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
    ctx.stroke();
  }

  // Central deployment hub
  ctx.fillStyle = '#C99E67';
  ctx.beginPath();
  ctx.arc(cx, cy, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#292929';
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  return { colorMap, bumpMap };
}

function createFoilBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 420; i++) {
    const x = (i * 73) % size;
    const y = (i * 137) % size;
    const w = 10 + (i % 18);
    const h = 8 + ((i * 3) % 16);
    const shade = 90 + (i % 130);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(x, y, w, h);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

function createRegolithGroundTexture(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Warm sunlit Martian terracotta & basaltic regolith base disk
  const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size * 0.5);
  grad.addColorStop(0, '#5A2D1C');
  grad.addColorStop(0.55, '#3E1E12');
  grad.addColorStop(0.88, '#26120B');
  grad.addColorStop(1, '#140906');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#707070';
  bCtx.fillRect(0, 0, size, size);

  const fract = (n: number) => n - Math.floor(n);
  for (let i = 0; i < 1400; i++) {
    const x = fract(Math.sin(i * 12.9898 + 1.23) * 43758.5453) * size;
    const y = fract(Math.sin(i * 78.233 + 4.56) * 28461.3219) * size;
    const r = 0.8 + fract(Math.sin(i * 39.41) * 9812.1) * 3.5;
    const tone = 38 + Math.floor(fract(Math.sin(i * 91.7) * 5142.8) * 36);
    ctx.fillStyle = `rgb(${tone + 26}, ${tone + 6}, ${Math.max(8, tone - 6)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    const bTone = 85 + Math.floor(fract(Math.sin(i * 53.1) * 7319.4) * 140);
    bCtx.fillStyle = `rgb(${bTone}, ${bTone}, ${bTone})`;
    bCtx.beginPath();
    bCtx.arc(x, y, r * 1.15, 0, Math.PI * 2);
    bCtx.fill();
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  return { colorMap, bumpMap };
}

export const InSightLander3D: React.FC<InSightLander3DProps> = ({
  lang,
  selectedSubsystemId,
  onSelectSubsystem,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'3d' | 'pia17358' | 'nasa_eyes'>('3d');
  const [isDeployed, setIsDeployed] = useState(true);
  const [nasaEyesReady, setNasaEyesReady] = useState(false);

  const initialTarget = SUBSYSTEM_CAMERA_TARGETS[selectedSubsystemId] || SUBSYSTEM_CAMERA_TARGETS.seis;

  const stateRef = useRef({
    isDeployed: true,
    deployProgress: 1,
    selectedSubsystemId,
    rotY: initialTarget.rotY,
    rotX: initialTarget.rotX,
    targetRotY: initialTarget.rotY,
    targetRotX: initialTarget.rotX,
    zoom: initialTarget.zoom,
    targetZoom: initialTarget.zoom,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    requestRender: () => {},
  });

  // Smoothly rotate toward selected subsystem and trigger 3D highlight update
  useEffect(() => {
    const camTarget = SUBSYSTEM_CAMERA_TARGETS[selectedSubsystemId] || SUBSYSTEM_CAMERA_TARGETS.seis;
    stateRef.current.selectedSubsystemId = selectedSubsystemId;
    stateRef.current.targetRotY = camTarget.rotY;
    stateRef.current.targetRotX = camTarget.rotX;
    stateRef.current.targetZoom = camTarget.zoom;
    stateRef.current.requestRender();
  }, [selectedSubsystemId]);

  useEffect(() => {
    stateRef.current.isDeployed = isDeployed;
    stateRef.current.requestRender();
  }, [isDeployed]);

  useEffect(() => {
    if (activeTab !== '3d') return;
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 440);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.15, 5.2);
    camera.lookAt(0, -0.08, 0.12);

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

    const renderW = isSoftwareGl ? Math.min(width, 680) : width;
    const renderH = isSoftwareGl ? Math.min(height, 420) : height;
    renderer.setSize(renderW, renderH, false);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    let pmremGenerator: THREE.PMREMGenerator | null = null;
    if (!isSoftwareGl) {
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    }

    // Warm Martian sunlight + key/rim lighting
    const ambientLight = new THREE.AmbientLight(0xffe8d6, 0.95);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff3e0, 2.75);
    sunKeyLight.position.set(4.2, 6.5, 4.5);
    scene.add(sunKeyLight);

    const warmRimLight = new THREE.DirectionalLight(0xf4a261, 1.15);
    warmRimLight.position.set(-4.5, 3.2, -3.5);
    scene.add(warmRimLight);

    const bounceLight = new THREE.PointLight(0xffb703, 1.2, 9);
    bounceLight.position.set(0.5, -0.1, 1.5);
    scene.add(bounceLight);

    // =========================================================================
    // CLEAN MARTIAN SURFACE BASE DISK (Pedestal)
    // =========================================================================
    const rootNode = new THREE.Group();
    rootNode.name = 'InSight_Root';
    scene.add(rootNode);

    const { colorMap: groundColor, bumpMap: groundBump } = createRegolithGroundTexture();
    const baseDiskGeo = new THREE.CylinderGeometry(2.55, 2.68, 0.14, 64);
    const baseDiskMat = new THREE.MeshStandardMaterial({
      map: groundColor,
      bumpMap: groundBump,
      bumpScale: 0.045,
      roughness: 0.9,
      metalness: 0.06,
    });
    const baseDisk = new THREE.Mesh(baseDiskGeo, baseDiskMat);
    baseDisk.position.y = -0.59;
    rootNode.add(baseDisk);

    const baseRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.56, 0.022, 12, 64),
      new THREE.MeshStandardMaterial({
        color: 0x8c4f2b,
        metalness: 0.65,
        roughness: 0.35,
      })
    );
    baseRim.rotation.x = Math.PI / 2;
    baseRim.position.y = -0.52;
    rootNode.add(baseRim);

    // Subtle Martian surface rocks on the base disk
    const rockGeo = new THREE.DodecahedronGeometry(0.08, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x3b2116,
      roughness: 0.88,
      metalness: 0.08,
      bumpMap: groundBump,
      bumpScale: 0.03,
    });
    const rockCoords: [number, number, number, number][] = [
      [-1.35, -0.5, 1.15, 1.1],
      [1.42, -0.5, 0.95, 1.25],
      [-1.55, -0.5, -0.65, 0.9],
      [1.25, -0.5, -1.1, 1.15],
      [0.12, -0.51, 1.68, 0.75],
    ];
    rockCoords.forEach(([rx, ry, rz, s], idx) => {
      const rMesh = new THREE.Mesh(rockGeo, rockMat);
      rMesh.position.set(rx, ry, rz);
      rMesh.scale.set(s * 1.2, s * 0.6, s);
      rMesh.rotation.set(idx * 0.5, idx * 1.1, idx * 0.3);
      rootNode.add(rMesh);
    });

    // =========================================================================
    // 3D INSIGHT LANDER RIG WITH PER-SUBSYSTEM DIRECT HIGHLIGHTING
    // =========================================================================
    const proceduralRigGroup = new THREE.Group();
    proceduralRigGroup.position.set(0, 0.04, -0.08);
    rootNode.add(proceduralRigGroup);

    const interactableMeshes: THREE.Mesh[] = [];
    const subsystemMeshes: Record<
      InSightSubsystemSpec['id'],
      Array<{
        mesh: THREE.Mesh;
        baseColor: THREE.Color;
        baseEmissive: THREE.Color;
        baseEmissiveIntensity: number;
      }>
    > = {
      solar: [],
      seis: [],
      hp3: [],
      ida: [],
      cameras: [],
      rise: [],
      twins: [],
      uhf: [],
      legs_tethers: [],
    };

    const registerSubsystemMesh = (
      mesh: THREE.Mesh,
      subsystemId: InSightSubsystemSpec['id']
    ) => {
      // Clone material so each mesh can be independently highlighted or dimmed
      const clonedMat = (mesh.material as THREE.MeshStandardMaterial).clone();
      clonedMat.transparent = true;
      mesh.material = clonedMat;
      mesh.userData = { subsystemId };
      interactableMeshes.push(mesh);
      subsystemMeshes[subsystemId].push({
        mesh,
        baseColor: clonedMat.color.clone(),
        baseEmissive: clonedMat.emissive.clone(),
        baseEmissiveIntensity: clonedMat.emissiveIntensity,
      });
    };

    const foilBump = createFoilBumpTexture();

    // Base PBR Material Templates
    const goldKaptonFoilMat = new THREE.MeshStandardMaterial({
      color: 0xdca144,
      emissive: 0x381d04,
      emissiveIntensity: 0.14,
      metalness: 0.88,
      roughness: 0.26,
      bumpMap: foilBump,
      bumpScale: 0.04,
    });

    const darkScienceDeckMat = new THREE.MeshStandardMaterial({
      color: 0x262930,
      metalness: 0.78,
      roughness: 0.32,
      bumpMap: foilBump,
      bumpScale: 0.02,
    });

    const brushedTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0xd1d9e0,
      metalness: 0.85,
      roughness: 0.25,
    });

    const copperSeisMat = new THREE.MeshStandardMaterial({
      color: 0xd97736,
      emissive: 0x3b1706,
      emissiveIntensity: 0.18,
      metalness: 0.9,
      roughness: 0.18,
    });

    const wtsWhiteGoldDomeMat = new THREE.MeshStandardMaterial({
      color: 0xeae4dc,
      emissive: 0x281e15,
      emissiveIntensity: 0.12,
      metalness: 0.45,
      roughness: 0.28,
    });

    const { colorMap: solarColorMap, bumpMap: solarBumpMap } = createUltraFlexSolarTexture();
    const solarPanelMat = new THREE.MeshStandardMaterial({
      map: solarColorMap,
      bumpMap: solarBumpMap,
      bumpScale: 0.025,
      metalness: 0.55,
      roughness: 0.24,
      side: THREE.DoubleSide,
    });

    // 1. Octagonal Bus with Metallic Gold Kapton Foil & Dark Science Deck
    const deckGroup = new THREE.Group();
    proceduralRigGroup.add(deckGroup);

    const busCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.68, 0.36, 8),
      goldKaptonFoilMat
    );
    busCore.position.y = 0.02;
    registerSubsystemMesh(busCore, 'legs_tethers');
    deckGroup.add(busCore);

    const topScienceDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.84, 0.82, 0.055, 8),
      darkScienceDeckMat
    );
    topScienceDeck.position.y = 0.22;
    registerSubsystemMesh(topScienceDeck, 'legs_tethers');
    deckGroup.add(topScienceDeck);

    // Deck mounting cradle ring where SEIS sat prior to deployment
    const deckCradleRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.215, 0.014, 12, 32),
      brushedTitaniumMat
    );
    deckCradleRing.rotation.x = Math.PI / 2;
    deckCradleRing.position.set(0.14, 0.255, 0.22);
    deckGroup.add(deckCradleRing);

    // Stowed SEIS Copper Sensor on Science Deck (visible when Stowed on Deck)
    const stowedSeisGroup = new THREE.Group();
    stowedSeisGroup.position.set(0.14, 0.26, 0.22);
    const stowedSeisCopper = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.52),
      copperSeisMat
    );
    registerSubsystemMesh(stowedSeisCopper, 'seis');
    stowedSeisGroup.add(stowedSeisCopper);
    deckGroup.add(stowedSeisGroup);

    // 2. Three Telescoping Titanium Landing Legs & Footpads (09. LEGS & TETHERS)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const legGroup = new THREE.Group();
      const footX = Math.cos(angle) * 1.05;
      const footZ = Math.sin(angle) * 1.05;

      const mainStrut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.034, 0.028, 0.86, 12),
        brushedTitaniumMat
      );
      mainStrut.position.set(footX * 0.78, -0.18, footZ * 0.78);
      mainStrut.lookAt(footX, -0.55, footZ);
      mainStrut.rotateX(Math.PI / 2);
      registerSubsystemMesh(mainStrut, 'legs_tethers');
      legGroup.add(mainStrut);

      [-0.22, 0.22].forEach((offsetAngle) => {
        const brace = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, 0.72, 8),
          brushedTitaniumMat
        );
        brace.position.set(
          Math.cos(angle + offsetAngle) * 0.76,
          -0.22,
          Math.sin(angle + offsetAngle) * 0.76
        );
        brace.lookAt(footX, -0.52, footZ);
        brace.rotateX(Math.PI / 2);
        registerSubsystemMesh(brace, 'legs_tethers');
        legGroup.add(brace);
      });

      const footpad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 0.04, 20),
        darkScienceDeckMat
      );
      footpad.position.set(footX, -0.54, footZ);
      registerSubsystemMesh(footpad, 'legs_tethers');
      legGroup.add(footpad);

      proceduralRigGroup.add(legGroup);
    }

    // 3. Left & Right Decagonal UltraFlex Solar Wings (01. SOLAR ARRAYS)
    const buildSolarWing = (side: -1 | 1) => {
      const root = new THREE.Group();
      root.position.set(side * 0.846, 0.31, -0.35);

      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.55, 10),
        brushedTitaniumMat
      );
      rod.rotation.z = Math.PI / 2;
      rod.position.set(side * 0.24, -0.02, 0.14);
      registerSubsystemMesh(rod, 'solar');
      root.add(rod);

      const wingDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(1.06, 1.06, 0.022, 10),
        solarPanelMat
      );
      wingDisc.position.set(side * 1.06, -0.02, 0.18);
      registerSubsystemMesh(wingDisc, 'solar');
      root.add(wingDisc);

      const wingRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.06, 0.018, 8, 10),
        goldKaptonFoilMat
      );
      wingRim.rotation.x = Math.PI / 2;
      wingRim.position.copy(wingDisc.position);
      registerSubsystemMesh(wingRim, 'solar');
      root.add(wingRim);

      return root;
    };

    const leftSolarWing = buildSolarWing(-1);
    const rightSolarWing = buildSolarWing(1);
    proceduralRigGroup.add(leftSolarWing);
    proceduralRigGroup.add(rightSolarWing);

    // 4. Articulated 3-Joint Instrument Deployment Arm & 5-Finger Grapple (04. IDA & GRAPPLE)
    const idaGroup = new THREE.Group();
    proceduralRigGroup.add(idaGroup);

    const shoulderTurret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.09, 0.22, 16),
      brushedTitaniumMat
    );
    shoulderTurret.position.set(-0.08, 0.34, 0.14);
    registerSubsystemMesh(shoulderTurret, 'ida');
    idaGroup.add(shoulderTurret);

    const upperBoom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.026, 0.72, 12),
      brushedTitaniumMat
    );
    upperBoom.position.set(-0.24, 0.56, 0.34);
    upperBoom.rotation.set(0.55, 0.15, 0.48);
    registerSubsystemMesh(upperBoom, 'ida');
    idaGroup.add(upperBoom);

    const forearmBoom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.02, 0.68, 12),
      brushedTitaniumMat
    );
    forearmBoom.position.set(-0.56, 0.32, 0.62);
    forearmBoom.rotation.set(0.85, 0.1, 0.65);
    registerSubsystemMesh(forearmBoom, 'ida');
    idaGroup.add(forearmBoom);

    const wristCable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8),
      goldKaptonFoilMat
    );
    wristCable.position.set(-0.76, -0.02, 0.74);
    registerSubsystemMesh(wristCable, 'ida');
    idaGroup.add(wristCable);

    const grappleHub = new THREE.Group();
    grappleHub.position.set(-0.76, -0.2, 0.74);
    const grappleBell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.045, 0.07, 12),
      goldKaptonFoilMat
    );
    registerSubsystemMesh(grappleBell, 'ida');
    grappleHub.add(grappleBell);

    for (let c = 0; c < 5; c++) {
      const ca = (c / 5) * Math.PI * 2;
      const claw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.004, 0.09, 6),
        brushedTitaniumMat
      );
      claw.position.set(Math.cos(ca) * 0.035, -0.05, Math.sin(ca) * 0.035);
      claw.rotation.z = Math.cos(ca) * 0.28;
      registerSubsystemMesh(claw, 'ida');
      grappleHub.add(claw);
    }
    idaGroup.add(grappleHub);

    // 5. Optical Cameras: IDC on Elbow & ICC Under Deck Edge (05. IDC & ICC)
    const idcCameraBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.095, 0.13),
      darkScienceDeckMat
    );
    idcCameraBox.position.set(-0.58, 0.42, 0.66);
    registerSubsystemMesh(idcCameraBox, 'cameras');
    idaGroup.add(idcCameraBox);

    const idcLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.034, 0.05, 16),
      brushedTitaniumMat
    );
    idcLens.rotation.x = Math.PI / 2;
    idcLens.position.set(-0.58, 0.42, 0.74);
    registerSubsystemMesh(idcLens, 'cameras');
    idaGroup.add(idcLens);

    const iccCameraSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.068, 16, 14),
      brushedTitaniumMat
    );
    iccCameraSphere.position.set(0.04, 0.14, 0.8);
    registerSubsystemMesh(iccCameraSphere, 'cameras');
    proceduralRigGroup.add(iccCameraSphere);

    // 6. RISE X-Band Horn Antennas (06. RISE HORNS)
    [-0.46, 0.44].forEach((rx) => {
      const riseHorn = new THREE.Mesh(
        new THREE.ConeGeometry(0.088, 0.21, 18, 1, false),
        copperSeisMat
      );
      riseHorn.position.set(rx, 0.36, 0.16);
      riseHorn.rotation.set(-0.45, 0, rx < 0 ? 0.35 : -0.35);
      registerSubsystemMesh(riseHorn, 'rise');
      proceduralRigGroup.add(riseHorn);
    });

    // 7. TWINS Weather Booms & APSS Pressure Inlet (07. TWINS & APSS)
    [-0.56, 0.56].forEach((tx) => {
      const twinsMast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.022, 0.38, 10),
        brushedTitaniumMat
      );
      twinsMast.position.set(tx, 0.42, -0.18);
      registerSubsystemMesh(twinsMast, 'twins');
      proceduralRigGroup.add(twinsMast);

      const twinsHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.035, 0.045),
        brushedTitaniumMat
      );
      twinsHead.position.set(tx, 0.61, -0.18);
      registerSubsystemMesh(twinsHead, 'twins');
      proceduralRigGroup.add(twinsHead);
    });

    const apssInlet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.11, 0.12, 20),
      brushedTitaniumMat
    );
    apssInlet.position.set(-0.18, 0.29, -0.12);
    registerSubsystemMesh(apssInlet, 'twins');
    proceduralRigGroup.add(apssInlet);

    // 8. UHF Helical Relay Antenna (08. UHF ANTENNA)
    const uhfCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.125, 0.32, 24),
      darkScienceDeckMat
    );
    uhfCylinder.position.set(0.38, 0.4, 0.12);
    registerSubsystemMesh(uhfCylinder, 'uhf');
    proceduralRigGroup.add(uhfCylinder);

    const uhfCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.03, 24),
      goldKaptonFoilMat
    );
    uhfCap.position.set(0.38, 0.56, 0.12);
    registerSubsystemMesh(uhfCap, 'uhf');
    proceduralRigGroup.add(uhfCap);

    // 9. Deployed Surface Instruments: SEIS/WTS Dome, HP³ Mole & Golden Kapton Tethers
    const deployedSurfaceGroup = new THREE.Group();
    proceduralRigGroup.add(deployedSurfaceGroup);

    // SEIS & WTS Copper-and-White Aerodynamic Dome on Martian Soil (02. SEIS & WTS)
    const seisSurfaceGroup = new THREE.Group();
    seisSurfaceGroup.position.set(0.68, -0.45, 1.18);

    const wtsDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.46),
      wtsWhiteGoldDomeMat
    );
    registerSubsystemMesh(wtsDome, 'seis');
    seisSurfaceGroup.add(wtsDome);

    const seisInnerCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      copperSeisMat
    );
    seisInnerCrown.position.y = 0.15;
    registerSubsystemMesh(seisInnerCrown, 'seis');
    seisSurfaceGroup.add(seisInnerCrown);

    const wtsGoldSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.1, 24),
      goldKaptonFoilMat
    );
    wtsGoldSkirt.position.y = -0.04;
    registerSubsystemMesh(wtsGoldSkirt, 'seis');
    seisSurfaceGroup.add(wtsGoldSkirt);
    deployedSurfaceGroup.add(seisSurfaceGroup);

    // HP³ Heat Flow Probe ("The Mole") on Martian Soil (03. HP³ MOLE)
    const hp3Group = new THREE.Group();
    hp3Group.position.set(-0.62, -0.36, 1.24);

    const hp3Mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.048, 0.44, 16),
      darkScienceDeckMat
    );
    registerSubsystemMesh(hp3Mast, 'hp3');
    hp3Group.add(hp3Mast);

    const hp3CopperSpike = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.018, 0.28, 12),
      copperSeisMat
    );
    hp3CopperSpike.position.y = 0.24;
    registerSubsystemMesh(hp3CopperSpike, 'hp3');
    hp3Group.add(hp3CopperSpike);

    const hp3Foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.065, 0.18),
      brushedTitaniumMat
    );
    hp3Foot.position.y = -0.18;
    registerSubsystemMesh(hp3Foot, 'hp3');
    hp3Group.add(hp3Foot);
    deployedSurfaceGroup.add(hp3Group);

    // Flat Golden Kapton Ribbon Tethers connecting Deck to SEIS and HP³ (09. LEGS & TETHERS)
    const buildKaptonTether = (points: THREE.Vector3[]) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.02, 6, false);
      tubeGeo.scale(1.6, 0.25, 1.0);
      const tetherMesh = new THREE.Mesh(tubeGeo, goldKaptonFoilMat);
      registerSubsystemMesh(tetherMesh, 'legs_tethers');
      return tetherMesh;
    };

    const seisTether = buildKaptonTether([
      new THREE.Vector3(0.18, 0.12, 0.58),
      new THREE.Vector3(0.34, -0.22, 0.78),
      new THREE.Vector3(0.48, -0.49, 0.96),
      new THREE.Vector3(0.66, -0.5, 1.15),
    ]);
    deployedSurfaceGroup.add(seisTether);

    const hp3Tether = buildKaptonTether([
      new THREE.Vector3(-0.18, 0.12, 0.58),
      new THREE.Vector3(-0.32, -0.24, 0.82),
      new THREE.Vector3(-0.48, -0.49, 1.04),
      new THREE.Vector3(-0.6, -0.5, 1.2),
    ]);
    deployedSurfaceGroup.add(hp3Tether);

    // Subtle 3D Selection Halo Ring around the currently selected subsystem
    const selectionRingGeo = new THREE.RingGeometry(0.82, 1.0, 48);
    const selectionRingMat = new THREE.MeshBasicMaterial({
      color: 0xffb703,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.78,
    });
    const selectionRing = new THREE.Mesh(selectionRingGeo, selectionRingMat);
    selectionRing.rotation.x = -Math.PI / 2;
    proceduralRigGroup.add(selectionRing);

    // Silent background GLB check if hosted locally
    let unmounted = false;
    const trySilentGlbLoad = async () => {
      try {
        const headRes = await fetch('/24880_InSight_deployed.glb', { method: 'HEAD' });
        const contentType = headRes.headers.get('content-type') || '';
        if (headRes.ok && !contentType.includes('text/html')) {
          const loader = new GLTFLoader();
          loader.load(
            '/24880_InSight_deployed.glb',
            (gltf) => {
              if (unmounted) return;
              rootNode.add(gltf.scene);
              requestRender();
            },
            undefined,
            () => {}
          );
        }
      } catch {
        // Use built-in procedural PBR lander rig
      }
    };
    trySilentGlbLoad();

    // Apply per-subsystem emissive highlight & subtly dim unselected subsystems
    const applySubsystemHighlight = (activeId: InSightSubsystemSpec['id']) => {
      (Object.keys(subsystemMeshes) as InSightSubsystemSpec['id'][]).forEach((subId) => {
        const isSelected = subId === activeId;
        subsystemMeshes[subId].forEach(({ mesh, baseColor, baseEmissive, baseEmissiveIntensity }) => {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (isSelected) {
            mat.color.copy(baseColor).lerp(new THREE.Color(0xffe8c2), 0.26);
            mat.emissive.setHex(0xff962e);
            mat.emissiveIntensity = 0.62;
            mat.opacity = 1.0;
          } else {
            mat.color.copy(baseColor).multiplyScalar(0.84);
            mat.emissive.copy(baseEmissive);
            mat.emissiveIntensity = baseEmissiveIntensity * 0.5;
            mat.opacity = 0.92;
          }
          mat.needsUpdate = true;
        });
      });

      const targetSpec = SUBSYSTEM_CAMERA_TARGETS[activeId] || SUBSYSTEM_CAMERA_TARGETS.seis;
      selectionRing.position.set(
        targetSpec.focusPos[0],
        Math.max(-0.5, targetSpec.focusPos[1] - 0.05),
        targetSpec.focusPos[2]
      );
      selectionRing.scale.setScalar(targetSpec.haloRadius);
    };

    // Raycasting for direct clicking on 3D lander parts
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      const rect = domEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactableMeshes, false);
      if (hits.length > 0) {
        const subId = hits[0].object.userData.subsystemId as
          | InSightSubsystemSpec['id']
          | undefined;
        if (subId) {
          onSelectSubsystem(subId);
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
      stateRef.current.targetRotY += dx * 0.0085;
      stateRef.current.targetRotX = Math.max(
        0.08,
        Math.min(0.68, stateRef.current.targetRotX + dy * 0.0065)
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
    let lastHighlightedId: InSightSubsystemSpec['id'] | null = null;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 70);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 70);
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

      if (lastHighlightedId !== st.selectedSubsystemId) {
        lastHighlightedId = st.selectedSubsystemId;
        applySubsystemHighlight(st.selectedSubsystemId);
      }

      const targetDeploy = st.isDeployed ? 1 : 0;

      if (isSoftwareGl) {
        st.rotY = st.targetRotY;
        st.rotX = st.targetRotX;
        st.zoom = st.targetZoom;
        st.deployProgress = targetDeploy;
      } else {
        st.rotY += (st.targetRotY - st.rotY) * 0.18;
        st.rotX += (st.targetRotX - st.rotX) * 0.18;
        st.zoom += (st.targetZoom - st.zoom) * 0.18;
        st.deployProgress += (targetDeploy - st.deployProgress) * 0.18;
      }

      const dp = st.deployProgress;

      leftSolarWing.scale.set(0.32 + dp * 0.68, 1, 0.32 + dp * 0.68);
      rightSolarWing.scale.set(0.32 + dp * 0.68, 1, 0.32 + dp * 0.68);
      deployedSurfaceGroup.visible = dp > 0.35;
      stowedSeisGroup.visible = dp <= 0.35;

      rootNode.rotation.y = st.rotY;
      camera.position.set(
        0,
        Math.sin(st.rotX) * st.zoom + 0.55,
        Math.cos(st.rotX) * st.zoom
      );
      camera.lookAt(0, -0.08, 0.12);

      renderer.render(scene, camera);

      const stillMoving =
        !isSoftwareGl &&
        (Math.abs(st.targetRotY - st.rotY) > 0.002 ||
          Math.abs(st.targetRotX - st.rotX) > 0.002 ||
          Math.abs(st.targetZoom - st.zoom) > 0.002 ||
          Math.abs(targetDeploy - st.deployProgress) > 0.005);

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

    const onResize = () => {
      if (!container || unmounted) return;
      const nw = Math.max(container.clientWidth, 320);
      const nh = Math.max(container.clientHeight, 440);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(
        isSoftwareGl ? Math.min(nw, 680) : nw,
        isSoftwareGl ? Math.min(nh, 420) : nh,
        false
      );
      requestRender();
    };
    window.addEventListener('resize', onResize);

    return () => {
      unmounted = true;
      window.clearTimeout(frameId);
      cancelAnimationFrame(frameId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      pmremGenerator?.dispose();
      renderer.dispose();
    };
  }, [activeTab]);

  const activeSub =
    INSIGHT_SUBSYSTEMS_9.find((s) => s.id === selectedSubsystemId) || INSIGHT_SUBSYSTEMS_9[1];

  return (
    <div data-no-swipe="true" className="space-y-4">
      {/* Top Bar of Card: View Switcher Pills on Left + Stow SEIS on Deck Toggle on Right */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="tab-3d-rig"
            onClick={() => setActiveTab('3d')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === '3d'
                ? 'bg-[#F4A261] text-[#1D0F0A] shadow-md'
                : 'bg-[#1D110E] text-[#F3E5D8] border border-[#F4A261]/30 hover:text-white'
            }`}
          >
            {lang === 'en' ? '1A. Interactive 3D Lander' : '1A. Mô hình 3D tương tác'}
          </button>

          <button
            type="button"
            data-testid="tab-pia17358-diagram"
            onClick={() => setActiveTab('pia17358')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'pia17358'
                ? 'bg-[#F4A261] text-[#1D0F0A] shadow-md'
                : 'bg-[#1D110E] text-[#F3E5D8] border border-[#F4A261]/30 hover:text-white'
            }`}
          >
            {lang === 'en'
              ? '1B. Official PIA17358 Blueprint'
              : '1B. Sơ đồ gốc PIA17358'}
          </button>

          <button
            type="button"
            data-testid="tab-nasa-eyes"
            onClick={() => {
              setActiveTab('nasa_eyes');
              setNasaEyesReady(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'nasa_eyes'
                ? 'bg-[#64DFDF] text-[#09151B] shadow-md'
                : 'bg-[#1D110E] text-[#64DFDF] border border-[#64DFDF]/45 hover:bg-[#13262F]'
            }`}
          >
            {lang === 'en'
              ? '2. Official NASA Eyes 3D Live View'
              : '2. NASA Eyes 3D trực tuyến'}
          </button>
        </div>

        {activeTab === '3d' && (
          <button
            type="button"
            data-testid="toggle-deploy-state-btn"
            onClick={() => setIsDeployed((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl bg-[#27150F] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6] hover:bg-[#3A2017] transition-colors cursor-pointer"
          >
            {isDeployed
              ? lang === 'en'
                ? 'Stow SEIS on Deck'
                : 'Thu SEIS lên boong tàu'
              : lang === 'en'
                ? 'Deploy SEIS to Soil'
                : 'Hạ đặt SEIS xuống đất'}
          </button>
        )}
      </div>

      {/* CLEAN 2-COLUMN SPLIT LAYOUT: Left Column (52%) 3D Viewport | Right Column (48%) 3x3 Grid + Spec Card */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* LEFT COLUMN (52% Width): 3D InSight Lander Viewport with Single Bottom-Center Pill */}
        <div className="w-full lg:w-[52%] flex flex-col">
          {activeTab === '3d' && (
            <div className="relative w-full h-[430px] sm:h-[490px] rounded-2xl border border-[#F4A261]/35 bg-gradient-to-b from-[#160B09] via-[#1E0F0B] to-[#120806] overflow-hidden shadow-2xl select-none">
              <div
                ref={mountRef}
                data-testid="insight-3d-canvas-container"
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />

              {/* Single Clean Pill Label at Bottom-Center Showing Currently Selected Part */}
              <div
                data-testid="insight-3d-selected-pill"
                className="pointer-events-none absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 max-w-[92%] px-4 py-1.5 rounded-full bg-[#180C08]/92 border border-[#F4A261]/55 text-center shadow-lg"
              >
                <span className="text-xs font-bold text-[#FFD1A6] whitespace-nowrap overflow-hidden text-ellipsis block">
                  {activeSub.number} · {activeSub.piaLabel} — {activeSub.title[lang]}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'pia17358' && (
            <div className="relative w-full h-[430px] sm:h-[490px] rounded-2xl border border-[#F4A261]/35 bg-[#120906] overflow-hidden shadow-2xl">
              <img
                src={INSIGHT_MEDIA_ASSETS.PIA17358_LOCAL}
                onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.PIA17358_NASA)}
                alt="NASA PIA17358 Annotated InSight Lander Diagram"
                className="w-full h-full object-contain"
              />
              {INSIGHT_SUBSYSTEMS_9.map((sub) => {
                const active = sub.id === selectedSubsystemId;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSelectSubsystem(sub.id)}
                    style={{ left: `${sub.diagramCoord.x}%`, top: `${sub.diagramCoord.y}%` }}
                    className={`-translate-x-1/2 -translate-y-1/2 absolute px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all shadow-lg cursor-pointer ${
                      active
                        ? 'bg-[#F4A261] text-[#1D0F0A] scale-110 ring-2 ring-white z-20'
                        : 'bg-[#1A0D09]/90 text-[#FFD1A6] border border-[#F4A261]/60 hover:bg-[#F4A261] hover:text-[#1A0D09] z-10'
                    }`}
                  >
                    {sub.number}. {sub.shortLabel}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'nasa_eyes' && (
            <div className="relative w-full h-[430px] sm:h-[490px] rounded-2xl border border-[#64DFDF]/45 bg-[#090D16] overflow-hidden shadow-2xl">
              {nasaEyesReady && (
                <iframe
                  title="NASA Eyes on the Solar System — InSight Mars Lander"
                  src="https://eyes.nasa.gov/apps/solar-system/#/sc_insight"
                  className="w-full h-full border-0"
                  allow="fullscreen"
                />
              )}
              <div className="absolute bottom-3 left-3 right-3 px-3.5 py-2 rounded-xl bg-[#0D161E]/92 border border-[#64DFDF]/35 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-200 font-medium">
                  {lang === 'en'
                    ? 'Official NASA JPL Eyes on the Solar System Live Telemetry Stream'
                    : 'Luồng 3D thời gian thực chính thức từ NASA JPL Eyes on the Solar System'}
                </span>
                <a
                  href="https://eyes.nasa.gov/apps/solar-system/#/sc_insight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#64DFDF] font-bold hover:underline"
                >
                  eyes.nasa.gov ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (48% Width): 3x3 Grid of 9 Numbered Hardware Buttons + Detailed Specification Card */}
        <div className="w-full lg:w-[48%] flex flex-col justify-between space-y-4">
          {/* 3x3 Grid of 9 Numbered Hardware Buttons */}
          <div
            data-testid="subsystem-3x3-grid"
            className="grid grid-cols-3 gap-2"
          >
            {INSIGHT_SUBSYSTEMS_9.map((sub) => {
              const isSelected = sub.id === selectedSubsystemId;
              return (
                <button
                  key={sub.id}
                  type="button"
                  data-testid={`subsystem-btn-${sub.id}`}
                  onClick={() => onSelectSubsystem(sub.id)}
                  className={`px-2.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F4A261] text-[#1D0F0A] border-[#FFF8F2] shadow-md font-extrabold'
                      : 'bg-[#1C0F0B]/90 text-[#F3E5D8] border-[#F4A261]/30 hover:border-[#F4A261]/70 hover:bg-[#2B1710]'
                  }`}
                >
                  <div className="text-[11px] sm:text-xs font-extrabold leading-tight truncate">
                    {sub.number}. {sub.shortLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Specification Card Directly Below 3x3 Grid */}
          <div
            data-testid="insight-subsystem-spec-card"
            className="flex-1 rounded-2xl border border-[#F4A261]/40 bg-[#1B0E0A]/92 p-4 sm:p-5 space-y-3.5 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-[#361C13] border border-[#F4A261]/45 text-xs font-bold text-[#FFD1A6]">
                  #{activeSub.number} · {activeSub.piaLabel}
                </span>
                <span className="text-xs font-bold text-[#64DFDF]">
                  NSSDCA: 2018-042A
                </span>
              </div>

              <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#FFF8F2] leading-snug">
                {activeSub.title[lang]}
              </h3>

              <div className="p-3 rounded-xl bg-[#130906] border border-[#F4A261]/25 text-xs font-bold text-[#FFD1A6]">
                {activeSub.specBadge[lang]}
              </div>

              <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
                {activeSub.description[lang]}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#28150E] to-[#180C08] border border-[#64DFDF]/35 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64DFDF]">
                {lang === 'en'
                  ? 'JPL Engineering & Science Takeaway'
                  : 'Bài Học Kỹ Thuật & Khoa Học Từ JPL'}
              </div>
              <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">
                {activeSub.engineeringLesson[lang]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
