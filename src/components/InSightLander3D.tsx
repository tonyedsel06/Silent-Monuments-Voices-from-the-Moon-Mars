import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HardwareHotspot, INSIGHT_HOTSPOTS, Language } from '../data/bilingualContent';

interface InSightLander3DProps {
  lang: Language;
  selectedHotspotId: HardwareHotspot['id'];
  onSelectHotspot: (id: HardwareHotspot['id']) => void;
  dustFactor?: number; // 0 to 0.9
}

function createSolarWingTextures(): { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
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

  // Deep gallium-arsenide photovoltaic cell substrate gradient
  const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 490);
  grad.addColorStop(0, '#13294B');
  grad.addColorStop(0.65, '#0F2240');
  grad.addColorStop(1, '#091528');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Fine orthogonal photovoltaic wafer sub-cell grid lines across the entire array
  const cellStep = 24;
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.34)';
  ctx.lineWidth = 1.25;
  bCtx.strokeStyle = '#303030';
  bCtx.lineWidth = 1.5;

  for (let x = 0; x <= size; x += cellStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(x, 0);
    bCtx.lineTo(x, size);
    bCtx.stroke();
  }

  for (let y = 0; y <= size; y += cellStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(size, y);
    bCtx.stroke();
  }

  // Secondary micro-busbars inside each solar cell wafer
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
  ctx.lineWidth = 0.75;
  for (let x = cellStep / 2; x < size; x += cellStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  // Concentric UltraFlex structural collector rings (14 rings)
  for (let r = 64; r <= 488; r += 32) {
    const isMajor = r % 96 === 0;
    ctx.strokeStyle = isMajor ? 'rgba(226, 232, 240, 0.75)' : 'rgba(148, 163, 184, 0.48)';
    ctx.lineWidth = isMajor ? 3.0 : 1.75;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    bCtx.strokeStyle = isMajor ? '#ffffff' : '#b8b8b8';
    bCtx.lineWidth = isMajor ? 3.2 : 1.8;
    bCtx.beginPath();
    bCtx.arc(cx, cy, r, 0, Math.PI * 2);
    bCtx.stroke();
  }

  // 10 primary decagonal gore radial ribs + 20 sub-gore string dividers
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const isPrimaryGore = i % 3 === 0;
    ctx.strokeStyle = isPrimaryGore ? '#F4A261' : 'rgba(148, 197, 255, 0.42)';
    ctx.lineWidth = isPrimaryGore ? 5.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 48, cy + Math.sin(angle) * 48);
    ctx.lineTo(cx + Math.cos(angle) * 500, cy + Math.sin(angle) * 500);
    ctx.stroke();

    bCtx.strokeStyle = isPrimaryGore ? '#ffffff' : '#a8a8a8';
    bCtx.lineWidth = isPrimaryGore ? 6.0 : 1.5;
    bCtx.beginPath();
    bCtx.moveTo(cx + Math.cos(angle) * 48, cy + Math.sin(angle) * 48);
    bCtx.lineTo(cx + Math.cos(angle) * 500, cy + Math.sin(angle) * 500);
    bCtx.stroke();
  }

  // Central motorized deployment hub ring
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);

  return { colorMap, bumpMap };
}

function createCopperThermalTextures(): { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Rich burnished metallic copper base gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#E07A3C');
  grad.addColorStop(0.35, '#C85A28');
  grad.addColorStop(0.7, '#F0985B');
  grad.addColorStop(1, '#A9461B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Hexagonal / quilted copper foil thermal blanket pattern
  const step = 28;
  ctx.strokeStyle = 'rgba(255, 224, 186, 0.35)';
  ctx.lineWidth = 1.4;
  bCtx.strokeStyle = '#c8c8c8';
  bCtx.lineWidth = 2.0;

  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(size, y);
    bCtx.stroke();
  }

  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    bCtx.beginPath();
    bCtx.moveTo(x, 0);
    bCtx.lineTo(x, size);
    bCtx.stroke();
  }

  // Diagonal foil quilt seams
  ctx.strokeStyle = 'rgba(120, 42, 12, 0.35)';
  ctx.lineWidth = 1.0;
  for (let d = -size; d <= size; d += step * 2) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + size, size);
    ctx.stroke();
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(2, 1);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 1);

  return { colorMap, bumpMap };
}

function createCopperDomeShaderMaterial(
  colorMap: THREE.CanvasTexture,
  bumpMap: THREE.CanvasTexture,
  baseHex = 0xd97236
): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    color: baseHex,
    map: colorMap,
    bumpMap,
    bumpScale: 0.018,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 0.65,
    clearcoatRoughness: 0.16,
    reflectivity: 1.0,
  });

  // Enhance with custom GLSL metallic copper anisotropic + rose-gold Fresnel sheen shader
  mat.customProgramCacheKey = () => 'insight-copper-dome-shader-v1';
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <output_fragment>',
      `
      vec3 viewDirCopper = normalize(vViewPosition);
      vec3 normCopper = normalize(normal);
      float fresnelCopper = pow(1.0 - abs(dot(viewDirCopper, normCopper)), 2.4);
      float anisoBand = 0.5 + 0.5 * sin(normCopper.y * 28.0 + normCopper.x * 12.0);
      vec3 copperSheen = mix(vec3(0.88, 0.42, 0.18), vec3(1.0, 0.76, 0.48), anisoBand);
      outgoingLight += copperSheen * (fresnelCopper * 0.42 + anisoBand * 0.08);
      #include <output_fragment>
      `
    );
  };

  return mat;
}

export const InSightLander3D: React.FC<InSightLander3DProps> = ({
  lang,
  selectedHotspotId,
  onSelectHotspot,
  dustFactor = 0.08,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isDeployed, setIsDeployed] = useState(true);
  const [showNasaEyesInline, setShowNasaEyesInline] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(false);

  const stateRef = useRef({
    selectedHotspotId,
    isDeployed: true,
    deployProgress: 1, // 0 = stowed on deck, 1 = deployed on ground
    dustFactor,
    rotY: 0.45,
    rotX: 0.18,
    isDragging: false,
    prevX: 0,
    prevY: 0,
  });

  useEffect(() => {
    stateRef.current.selectedHotspotId = selectedHotspotId;
    stateRef.current.isDeployed = isDeployed;
    stateRef.current.dustFactor = dustFactor;
    window.dispatchEvent(new Event('resize'));
  }, [selectedHotspotId, isDeployed, dustFactor]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 680;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b101d);
    scene.fog = new THREE.FogExp2(0x0b101d, 0.055);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.35, 6.1);
    camera.lookAt(0, -0.42, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-point warm/cool lighting
    const keyLight = new THREE.DirectionalLight(0xffd2a6, 2.6);
    keyLight.position.set(5, 7, 4);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x88b4e6, 0x5c2c1e, 0.9);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x64dfdf, 1.15);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    rootGroup.position.y = 0.32;
    scene.add(rootGroup);

    // 1. Martian Elysium Planitia Ground Terrain Patch + Contact Shadow Disc
    const groundGeo = new THREE.CylinderGeometry(3.8, 4.0, 0.18, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x7c3926,
      roughness: 0.92,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.82;
    rootGroup.add(groundMesh);

    const shadowGeo = new THREE.CircleGeometry(2.3, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x05070c,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.715;
    rootGroup.add(contactShadow);

    // 2. Central Octagonal Lander Deck & Gold Kapton Thermal Enclosure
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0xd98a3c,
      roughness: 0.35,
      metalness: 0.78,
    });
    const deckTopMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.55,
      metalness: 0.45,
    });

    const deckBody = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 0.42, 8), deckMat);
    deckBody.position.y = 0.05;
    rootGroup.add(deckBody);

    const deckPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.05, 8), deckTopMat);
    deckPlate.position.y = 0.28;
    rootGroup.add(deckPlate);

    // 3. Three Shock-Absorbing Landing Legs & Circular Footpads
    const legMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.4,
      metalness: 0.65,
    });
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
      metalness: 0.3,
    });

    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
      const legGroup = new THREE.Group();
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 1.05, 12), legMat);
      strut.position.set(Math.cos(angle) * 0.95, -0.32, Math.sin(angle) * 0.95);
      strut.rotation.z = Math.cos(angle) * 0.42;
      strut.rotation.x = -Math.sin(angle) * 0.42;
      legGroup.add(strut);

      const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 16), padMat);
      footpad.position.set(Math.cos(angle) * 1.18, -0.7, Math.sin(angle) * 1.18);
      legGroup.add(footpad);
      rootGroup.add(legGroup);
    });

    // 4. Twin Decagonal UltraFlex Solar Array Wings (-X and +X) with Detailed Grid Lines & 3D Ribs
    const { colorMap: solarTex, bumpMap: solarBump } = createSolarWingTextures();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    solarTex.anisotropy = maxAniso;
    solarBump.anisotropy = maxAniso;

    const solarWingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: solarTex,
      bumpMap: solarBump,
      bumpScale: 0.015,
      roughness: 0.26,
      metalness: 0.42,
    });
    const boomMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      roughness: 0.35,
      metalness: 0.72,
    });
    const ribGridMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.8,
    });

    [-1, 1].forEach((dir) => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(dir * 2.18, 0.25, 0);
      rootGroup.add(wingGroup);

      const boom = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.12), boomMat);
      boom.position.set(dir * 1.12, 0.24, 0);
      rootGroup.add(boom);

      const wing = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 0.036, 10),
        solarWingMat
      );
      wingGroup.add(wing);

      // 10 physical 3D radial gore ribs & concentric collector ring accents on top of each solar wing
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(1.06, 0.012, 0.018),
          i % 2 === 0 ? boomMat : ribGridMat
        );
        rib.position.set(Math.cos(angle) * 0.53, 0.022, Math.sin(angle) * 0.53);
        rib.rotation.y = -angle;
        wingGroup.add(rib);
      }

      // Concentric silver busbar rings on the solar array surface
      [0.42, 0.76, 1.05].forEach((radius) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(radius - 0.012, radius, 10),
          ribGridMat
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.021;
        wingGroup.add(ring);
      });

      const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.055, 10), boomMat);
      hubCap.position.y = 0.015;
      wingGroup.add(hubCap);
    });

    // 5. 1.8m Instrument Deployment Arm (IDA) + Elbow Camera (IDC) + Grapple
    const armGroup = new THREE.Group();
    armGroup.position.set(0.38, 0.32, 0.42);
    rootGroup.add(armGroup);

    const armTubeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.48,
      metalness: 0.52,
    });

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.95, 12), armTubeMat);
    upperArm.position.set(0.22, 0.38, 0.15);
    upperArm.rotation.z = -0.55;
    upperArm.rotation.x = 0.32;
    armGroup.add(upperArm);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.9, 12), armTubeMat);
    forearm.position.set(0.68, 0.32, 0.38);
    forearm.rotation.z = -1.25;
    forearm.rotation.y = -0.35;
    armGroup.add(forearm);

    const grappleHook = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.16, 8), boomMat);
    grappleHook.position.set(1.02, -0.02, 0.48);
    grappleHook.rotation.x = Math.PI;
    armGroup.add(grappleHook);

    // 6. SEIS Seismometer (Metallic Copper Hexagonal Body + Copper Sensor Dome)
    const { colorMap: copperTex, bumpMap: copperBump } = createCopperThermalTextures();
    const seisCopperShaderMat = createCopperDomeShaderMaterial(copperTex, copperBump, 0xd96b2b);
    const wtsCopperDomeShaderMat = createCopperDomeShaderMaterial(copperTex, copperBump, 0xe78a4e);

    const seisGroup = new THREE.Group();
    const seisBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.27, 0.18, 6),
      seisCopperShaderMat
    );
    seisGroup.add(seisBody);

    const seisUpperDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.235, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
      seisCopperShaderMat
    );
    seisUpperDome.position.y = 0.08;
    seisGroup.add(seisUpperDome);

    const seisGrapplePin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12),
      boomMat
    );
    seisGrapplePin.position.y = 0.22;
    seisGroup.add(seisGrapplePin);
    rootGroup.add(seisGroup);

    // 7. Wind and Thermal Shield (WTS Metallic Copper & Gold Thermal Dome over SEIS)
    const wtsGroup = new THREE.Group();
    const wtsSkirtMat = new THREE.MeshStandardMaterial({
      color: 0xd99b4e,
      roughness: 0.25,
      metalness: 0.88,
    });

    const wtsBaseWall = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.41, 0.16, 24),
      wtsCopperDomeShaderMat
    );
    wtsBaseWall.position.y = 0.03;
    wtsGroup.add(wtsBaseWall);

    const wtsSphericalDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.48),
      wtsCopperDomeShaderMat
    );
    wtsSphericalDome.position.y = 0.09;
    wtsGroup.add(wtsSphericalDome);

    const wtsGrappleRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.015, 12, 24),
      wtsSkirtMat
    );
    wtsGrappleRing.position.y = 0.34;
    wtsGroup.add(wtsGrappleRing);

    const wtsSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.41, 0.46, 0.1, 24),
      wtsSkirtMat
    );
    wtsSkirt.position.y = -0.08;
    wtsGroup.add(wtsSkirt);
    rootGroup.add(wtsGroup);

    // 8. HP3 "The Mole" Heat Flow Probe Housing on Ground (-X/+Z)
    const hp3Group = new THREE.Group();
    hp3Group.position.set(-0.85, -0.52, 1.05);
    const hp3Mat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.42,
      metalness: 0.68,
    });
    const hp3Mast = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.48, 12), hp3Mat);
    hp3Group.add(hp3Mast);
    const hp3Foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.28), deckMat);
    hp3Foot.position.y = -0.18;
    hp3Group.add(hp3Foot);
    rootGroup.add(hp3Group);

    // 9. UHF Helical Antenna & RISE X-band Horns on Upper Deck
    const uhfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.45, 16), armTubeMat);
    uhfMesh.position.set(-0.55, 0.52, -0.45);
    rootGroup.add(uhfMesh);

    const riseHorn = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 16), boomMat);
    riseHorn.position.set(0.45, 0.44, -0.48);
    riseHorn.rotation.z = -0.35;
    rootGroup.add(riseHorn);

    // 10. Interactive Hotspot Beacon Spheres for Raycasting
    const hotspotMeshes: THREE.Mesh[] = [];
    const hotspotGeo = new THREE.SphereGeometry(0.14, 16, 16);

    INSIGHT_HOTSPOTS.forEach((hs) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf4a261,
        emissive: 0xf4a261,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.88,
      });
      const marker = new THREE.Mesh(hotspotGeo, mat);
      marker.position.set(...hs.position3D);
      marker.userData = { hotspotId: hs.id };
      rootGroup.add(marker);
      hotspotMeshes.push(marker);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevX = e.clientX;
      stateRef.current.prevY = e.clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hotspotMeshes, false);
      if (hits.length > 0) {
        const hid = hits[0].object.userData?.hotspotId as HardwareHotspot['id'] | undefined;
        if (hid) {
          onSelectHotspot(hid);
        }
      }
      requestRender();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.prevX;
      const dy = e.clientY - stateRef.current.prevY;
      stateRef.current.prevX = e.clientX;
      stateRef.current.prevY = e.clientY;
      stateRef.current.rotY += dx * 0.008;
      stateRef.current.rotX = THREE.MathUtils.clamp(
        stateRef.current.rotX + dy * 0.006,
        -0.35,
        0.65
      );
      requestRender();
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 680;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let unmounted = false;

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

    function stepScene() {
      const targetDeploy = stateRef.current.isDeployed ? 1 : 0;
      const dp = stateRef.current.deployProgress + (targetDeploy - stateRef.current.deployProgress) * 0.12;
      stateRef.current.deployProgress = dp;

      // Interpolate SEIS and WTS between Lander Deck (0) and Martian Soil (1)
      seisGroup.position.set(
        THREE.MathUtils.lerp(0.15, 1.45, dp),
        THREE.MathUtils.lerp(0.42, -0.62, dp),
        THREE.MathUtils.lerp(0.12, 0.9, dp)
      );

      wtsGroup.position.set(
        THREE.MathUtils.lerp(-0.25, 1.45, dp),
        THREE.MathUtils.lerp(0.45, -0.52, dp),
        THREE.MathUtils.lerp(-0.15, 0.9, dp)
      );

      armGroup.rotation.y = THREE.MathUtils.lerp(0.4, -0.15, dp);

      // Tint solar arrays with Martian iron-oxide dust according to dustFactor
      const cleanColor = new THREE.Color(0xffffff);
      const dustyColor = new THREE.Color(0x9e5134);
      solarWingMat.color.copy(cleanColor).lerp(dustyColor, stateRef.current.dustFactor);

      // Highlight selected hotspot
      hotspotMeshes.forEach((m) => {
        const isSel = m.userData.hotspotId === stateRef.current.selectedHotspotId;
        m.scale.setScalar(isSel ? 1.35 : 0.85);
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.color.setHex(isSel ? 0x64dfdf : 0xf4a261);
        mat.emissive.setHex(isSel ? 0x64dfdf : 0xf4a261);
      });

      rootGroup.rotation.y += (stateRef.current.rotY - rootGroup.rotation.y) * 0.16;
      rootGroup.rotation.x += (stateRef.current.rotX - rootGroup.rotation.x) * 0.16;

      const moving =
        Math.abs(targetDeploy - dp) > 0.005 ||
        Math.abs(stateRef.current.rotY - rootGroup.rotation.y) > 0.002 ||
        Math.abs(stateRef.current.rotX - rootGroup.rotation.x) > 0.002;

      renderer.render(scene, camera);
      return moving;
    }

    function requestRender() {
      if (unmounted) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (unmounted) return;
        renderDirty = false;
        const needsMore = stepScene();
        const done = () => {
          renderBusy = false;
          if (renderDirty || needsMore) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    requestRender();

    return () => {
      unmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      solarTex.dispose();
      solarBump.dispose();
      copperTex.dispose();
      copperBump.dispose();
      renderer.dispose();
    };
  }, [onSelectHotspot]);

  const currentHotspot =
    INSIGHT_HOTSPOTS.find((h) => h.id === selectedHotspotId) ?? INSIGHT_HOTSPOTS[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0B1220] overflow-hidden">
      {/* Top Bar of 3D Lander Viewport */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-[#0E1729]">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#64DFDF] font-semibold">
            {showNasaEyesInline
              ? lang === 'en'
                ? '[OFFICIAL NASA EYES 3D TELEMETRY VIEW]'
                : '[MÔ HÌNH 3D NASA EYES CHÍNH THỨC]'
              : lang === 'en'
                ? '[EDUCATIONAL SIMULATION · NOT TO SCALE]'
                : '[MÔ PHỎNG GIÁO DỤC · KHÔNG THEO TỶ LỆ THỰC]'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">
            {showNasaEyesInline
              ? 'eyes.nasa.gov/apps/solar-system/#/sc_insight'
              : lang === 'en'
                ? '360° Interactive InSight Rig · Copper SEIS Shader'
                : 'Mô hình 3D InSight Xoay 360° · Vòm SEIS Đồng Kim loại'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!showNasaEyesInline && (
            <button
              type="button"
              onClick={() => setIsDeployed((prev) => !prev)}
              className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[#16233B] text-[#FFD1A6] border border-[#F4A261]/50 hover:bg-[#1E3050] transition-colors whitespace-nowrap shrink-0"
            >
              {isDeployed
                ? lang === 'en'
                  ? 'Stow SEIS on Deck'
                  : 'Thu SEIS lên mặt boong'
                : lang === 'en'
                  ? 'Deploy SEIS & Wind Shield to Soil'
                  : 'Hạ SEIS & Lồng chắn xuống đất'}
            </button>
          )}

          <button
            type="button"
            data-testid="header-toggle-nasa-eyes-btn"
            onClick={() => setShowNasaEyesInline((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              showNasaEyesInline
                ? 'bg-[#64DFDF] text-[#070B14] hover:bg-[#99F6E4]'
                : 'bg-[#F4A261] text-[#070B14] hover:bg-[#FFD1A6]'
            }`}
          >
            {showNasaEyesInline
              ? lang === 'en'
                ? 'Return to 3D InSight Rig'
                : 'Quay lại Mô hình 3D Three.js'
              : lang === 'en'
                ? 'Toggle Official NASA Eyes 3D Live View'
                : 'Bật Mô hình 3D NASA Eyes Chính thức'}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport with Direct In-Viewport NASA Eyes 3D Iframe Toggle */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#0B101D]">
        {/* Three.js Interactive 3D Lander Canvas */}
        <div
          ref={mountRef}
          data-testid="insight-3d-lander-canvas"
          className={`w-full h-full cursor-grab active:cursor-grabbing ${
            showNasaEyesInline ? ' invisible pointer-events-none' : ''
          }`}
        />

        {/* In-Viewport Top-Right Floating Toggle Button for Official NASA Eyes 3D Iframe */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            type="button"
            data-testid="viewport-toggle-nasa-eyes-btn"
            onClick={() => setShowNasaEyesInline((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[#0B1220] text-[#F4A261] border border-[#F4A261]/60 hover:bg-[#16233B] hover:text-[#FFD1A6] shadow-lg transition-colors"
          >
            {showNasaEyesInline
              ? lang === 'en'
                ? '← Back to Three.js 3D Lander'
                : '← Về Mô hình Three.js 3D'
              : lang === 'en'
                ? '🛰 NASA Eyes 3D Live Iframe'
                : '🛰 Khung 3D NASA Eyes Trực tiếp'}
          </button>
        </div>

        {/* Official NASA Eyes 3D Iframe Rendered Directly Inside the 3D Viewport */}
        {showNasaEyesInline && (
          <div
            data-testid="nasa-eyes-inline-viewport"
            className="absolute inset-0 z-10 flex flex-col bg-[#070B14]"
          >
            <iframe
              src="https://eyes.nasa.gov/apps/solar-system/#/sc_insight"
              title="NASA Eyes on the Solar System — InSight 3D"
              className="w-full flex-1 border-0"
              loading="lazy"
              allowFullScreen
            />
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0D1526] border-t border-slate-800 text-xs text-slate-300">
              <span>
                {lang === 'en'
                  ? 'Official NASA/JPL-Caltech 3D Spacecraft Telemetry (sc_insight). Toggle back anytime for offline Three.js inspection.'
                  : 'Dữ liệu 3D tàu vũ trụ chính thức của NASA/JPL-Caltech (sc_insight). Chuyển lại bất cứ lúc nào để xem ngoại tuyến.'}
              </span>
              <a
                href="https://eyes.nasa.gov/apps/solar-system/#/sc_insight"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#F4A261] hover:text-[#FFD1A6] underline"
              >
                https://eyes.nasa.gov/apps/solar-system/#/sc_insight ↗
              </a>
            </div>
          </div>
        )}

        {/* Collapsible Bottom Control Dock (Zero side-panel occlusion, no backdrop-filter over WebGL) */}
        {!showNasaEyesInline && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[860px] z-10">
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={() => setHudCollapsed((c) => !c)}
                className="px-2.5 py-1 text-[11px] font-mono bg-[#0B1220] text-slate-300 border border-slate-700 rounded-t-md hover:text-white"
              >
                {hudCollapsed
                  ? lang === 'en'
                    ? '▴ Show Hardware Hotspots'
                    : '▴ Hiện các bộ phận 3D'
                  : lang === 'en'
                    ? '▾ Hide Controls'
                    : '▾ Ẩn bảng điều khiển'}
              </button>
            </div>

            {!hudCollapsed && (
              <div className="bg-[#0B1220] border border-slate-700 rounded-lg p-3 shadow-xl">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {INSIGHT_HOTSPOTS.map((hs) => {
                    const active = hs.id === selectedHotspotId;
                    return (
                      <button
                        key={hs.id}
                        type="button"
                        onClick={() => onSelectHotspot(hs.id)}
                        className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#64DFDF] text-[#070B14] font-semibold'
                            : 'bg-[#121C2E] text-slate-300 hover:text-white border border-slate-800'
                        }`}
                      >
                        {hs.code.split(' · ')[0]}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-t border-slate-800 pt-2">
                  <div>
                    <span className="text-xs font-mono text-[#F4A261] mr-2">
                      {currentHotspot.code}
                    </span>
                    <strong className="text-sm text-white">{currentHotspot.title[lang]}</strong>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {currentHotspot.specs[lang]}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentHotspot.description[lang]}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

