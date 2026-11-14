import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HardwareHotspot, INSIGHT_HOTSPOTS, Language } from '../data/bilingualContent';

interface InSightLander3DProps {
  lang: Language;
  selectedHotspotId: HardwareHotspot['id'];
  onSelectHotspot: (id: HardwareHotspot['id']) => void;
  dustFactor?: number;
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

  const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 490);
  grad.addColorStop(0, '#16325C');
  grad.addColorStop(0.65, '#102546');
  grad.addColorStop(1, '#0A172E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  const cellStep = 24;
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.36)';
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
    ctx.lineTo(x, size);
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

  ctx.strokeStyle = 'rgba(226, 232, 240, 0.24)';
  ctx.lineWidth = 0.75;
  for (let x = cellStep / 2; x < size; x += cellStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  for (let r = 64; r <= 488; r += 32) {
    const isMajor = r % 96 === 0;
    ctx.strokeStyle = isMajor ? 'rgba(226, 232, 240, 0.78)' : 'rgba(148, 163, 184, 0.5)';
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

  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const isPrimaryGore = i % 3 === 0;
    ctx.strokeStyle = isPrimaryGore ? '#F4A261' : 'rgba(148, 197, 255, 0.44)';
    ctx.lineWidth = isPrimaryGore ? 5.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 48, cy + Math.sin(angle) * 48);
    ctx.lineTo(cx + Math.cos(angle) * 500, cy + Math.sin(angle) * 500);
    ctx.stroke();

    bCtx.strokeStyle = isPrimaryGore ? '#ffffff' : '#a8a8a8';
    bCtx.lineWidth = isPrimaryGore ? 6.0 : 1.5;
    bCtx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 48, cy + Math.sin(angle) * 48);
    bCtx.lineTo(cx + Math.cos(angle) * 500, cy + Math.sin(angle) * 500);
    bCtx.stroke();
  }

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

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#E07A3C');
  grad.addColorStop(0.35, '#C85A28');
  grad.addColorStop(0.7, '#F0985B');
  grad.addColorStop(1, '#A9461B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

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
  const calloutLineRef = useRef<SVGLineElement | null>(null);
  const calloutDotRef = useRef<SVGCircleElement | null>(null);
  const calloutBoxRef = useRef<HTMLDivElement | null>(null);

  const [isDeployed, setIsDeployed] = useState(true);
  const [showNasaEyesInline, setShowNasaEyesInline] = useState(false);
  const [nasaEyesReady, setNasaEyesReady] = useState(false);

  const stateRef = useRef({
    selectedHotspotId,
    isDeployed: true,
    deployProgress: 1,
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
    scene.background = new THREE.Color(0x1f120d);
    scene.fog = new THREE.FogExp2(0x1f120d, 0.05);

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
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xffd8b0, 2.65);
    keyLight.position.set(5, 7, 4);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xffd1a6, 0x5c2c1e, 0.95);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x64dfdf, 1.15);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    rootGroup.position.y = 0.32;
    scene.add(rootGroup);

    // 1. Martian Elysium Planitia Ground Terrain Patch
    const groundGeo = new THREE.CylinderGeometry(3.8, 4.0, 0.18, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86402b,
      roughness: 0.9,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.82;
    rootGroup.add(groundMesh);

    const shadowGeo = new THREE.CircleGeometry(2.3, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0b0604,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.715;
    rootGroup.add(contactShadow);

    // 2. Central Octagonal Lander Deck
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0xd98a3c,
      roughness: 0.35,
      metalness: 0.78,
    });
    const deckTopMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.5,
      metalness: 0.45,
    });

    const deckBody = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 0.42, 8), deckMat);
    deckBody.position.y = 0.05;
    rootGroup.add(deckBody);

    const deckPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.05, 8), deckTopMat);
    deckPlate.position.y = 0.28;
    rootGroup.add(deckPlate);

    // 3. Three Shock-Absorbing Landing Legs
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

    // 4. Twin Decagonal UltraFlex Solar Array Wings with Detailed Grid Lines & 3D Ribs
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

    // 5. 1.8m Instrument Deployment Arm (IDA)
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

    // 6. SEIS Seismometer + 7. Wind and Thermal Shield (Metallic Copper Shader Dome)
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
    rootGroup.add(seisGroup);

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

    // 8. HP3 "The Mole" Heat Flow Probe Housing on Ground
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

    // 9. TWINS Weather Booms & RISE / UHF Antennas on Upper Deck
    const uhfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.45, 16), armTubeMat);
    uhfMesh.position.set(-0.55, 0.52, -0.45);
    rootGroup.add(uhfMesh);

    const riseHorn = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 16), boomMat);
    riseHorn.position.set(0.45, 0.44, -0.48);
    riseHorn.rotation.z = -0.35;
    rootGroup.add(riseHorn);

    // 10. Subtle Glowing Interactive Hotspot Dots (Raycasting Targets)
    const hotspotMeshes: THREE.Mesh[] = [];
    const hotspotGeo = new THREE.SphereGeometry(0.11, 16, 16);

    INSIGHT_HOTSPOTS.forEach((hs) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf4a261,
        emissive: 0xf4a261,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      const marker = new THREE.Mesh(hotspotGeo, mat);
      marker.position.set(...hs.position3D);
      marker.userData = { hotspotId: hs.id };
      rootGroup.add(marker);
      hotspotMeshes.push(marker);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const projVec = new THREE.Vector3();

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

    function updateSingleActiveCallout() {
      const activeMesh = hotspotMeshes.find(
        (m) => m.userData.hotspotId === stateRef.current.selectedHotspotId
      );
      if (!activeMesh || !container) return;

      const w = container.clientWidth || 680;
      const h = container.clientHeight || 460;

      activeMesh.getWorldPosition(projVec);
      projVec.project(camera);

      const sx = ((projVec.x + 1) / 2) * w;
      const sy = ((-projVec.y + 1) / 2) * h;

      // Anchor floating label offset cleanly toward upper-left or upper-right
      const offsetX = sx > w * 0.55 ? -135 : 65;
      const offsetY = sy > h * 0.55 ? -65 : -45;
      const lx = THREE.MathUtils.clamp(sx + offsetX, 24, w - 180);
      const ly = THREE.MathUtils.clamp(sy + offsetY, 24, h - 75);

      if (calloutLineRef.current) {
        calloutLineRef.current.setAttribute('x1', String(sx));
        calloutLineRef.current.setAttribute('y1', String(sy));
        calloutLineRef.current.setAttribute('x2', String(lx + 40));
        calloutLineRef.current.setAttribute('y2', String(ly + 18));
      }
      if (calloutDotRef.current) {
        calloutDotRef.current.setAttribute('cx', String(sx));
        calloutDotRef.current.setAttribute('cy', String(sy));
      }
      if (calloutBoxRef.current) {
        calloutBoxRef.current.style.transform = `translate3d(${Math.round(lx)}px, ${Math.round(ly)}px, 0)`;
      }
    }

    function stepScene() {
      const targetDeploy = stateRef.current.isDeployed ? 1 : 0;
      const dp =
        stateRef.current.deployProgress + (targetDeploy - stateRef.current.deployProgress) * 0.12;
      stateRef.current.deployProgress = dp;

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

      // Sync SEIS hotspot dot with deployed/stowed position
      const seisMarker = hotspotMeshes.find((m) => m.userData.hotspotId === 'seis');
      if (seisMarker) {
        seisMarker.position.set(
          THREE.MathUtils.lerp(-0.1, 1.45, dp),
          THREE.MathUtils.lerp(0.55, -0.35, dp),
          THREE.MathUtils.lerp(0.0, 0.9, dp)
        );
      }

      armGroup.rotation.y = THREE.MathUtils.lerp(0.4, -0.15, dp);

      const cleanColor = new THREE.Color(0xffffff);
      const dustyColor = new THREE.Color(0x9e5134);
      solarWingMat.color.copy(cleanColor).lerp(dustyColor, stateRef.current.dustFactor);

      hotspotMeshes.forEach((m) => {
        const isSel = m.userData.hotspotId === stateRef.current.selectedHotspotId;
        m.scale.setScalar(isSel ? 1.35 : 0.72);
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.color.setHex(isSel ? 0x64dfdf : 0xf4a261);
        mat.emissive.setHex(isSel ? 0x64dfdf : 0xf4a261);
        mat.opacity = isSel ? 0.98 : 0.65;
      });

      rootGroup.rotation.y += (stateRef.current.rotY - rootGroup.rotation.y) * 0.16;
      rootGroup.rotation.x += (stateRef.current.rotX - rootGroup.rotation.x) * 0.16;

      scene.updateMatrixWorld();
      updateSingleActiveCallout();

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
    <div className="rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 overflow-hidden shadow-2xl">
      {/* Top Bar of 3D Lander Viewport */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#F4A261]/20 bg-[#2C1812]">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#64DFDF]">
            {showNasaEyesInline
              ? lang === 'en'
                ? 'Official NASA Eyes 3D Live Telemetry'
                : 'Mô hình 3D NASA Eyes Chính thức'
              : lang === 'en'
                ? 'Interactive 3D InSight Rig · Copper SEIS Shader'
                : 'Mô hình 3D InSight · Vòm SEIS Đồng Kim loại'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!showNasaEyesInline && (
            <button
              type="button"
              onClick={() => setIsDeployed((prev) => !prev)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#382017] text-[#FFD1A6] border border-[#F4A261]/45 hover:bg-[#4A2A1E] transition-colors whitespace-nowrap shrink-0"
            >
              {isDeployed
                ? lang === 'en'
                  ? 'Stow SEIS on Deck'
                  : 'Thu SEIS lên mặt boong'
                : lang === 'en'
                  ? 'Deploy SEIS & Wind Shield'
                  : 'Hạ SEIS & Lồng chắn xuống đất'}
            </button>
          )}

          <button
            type="button"
            data-testid="header-toggle-nasa-eyes-btn"
            onClick={() => setShowNasaEyesInline((prev) => !prev)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              showNasaEyesInline
                ? 'bg-[#64DFDF] text-[#111C28] hover:bg-[#99F6E4]'
                : 'bg-[#F4A261] text-[#1F110C] hover:bg-[#FFD1A6]'
            }`}
          >
            {showNasaEyesInline
              ? lang === 'en'
                ? '← Return to 3D InSight Rig'
                : '← Quay lại Mô hình 3D Three.js'
              : lang === 'en'
                ? 'Launch Official NASA Eyes 3D Live View'
                : 'Mở Mô hình 3D NASA Eyes Chính thức'}
          </button>
        </div>
      </div>

      {/* Split Layout: Left 3D Stage with Single Active Callout Line + Right Subsystem Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 8 Cols: 3D Viewport + Pre-Warmed NASA Eyes Iframe */}
        <div className="lg:col-span-8 relative w-full h-[380px] sm:h-[450px] bg-[#1F120D] overflow-hidden">
          <div
            ref={mountRef}
            data-testid="insight-3d-lander-canvas"
            className={`w-full h-full cursor-grab active:cursor-grabbing ${
              showNasaEyesInline ? 'invisible pointer-events-none' : ''
            }`}
          />

          {/* Single Clean Animated Callout Leader Line & Floating Label for Active Hotspot Only */}
          {!showNasaEyesInline && (
            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              <svg className="w-full h-full">
                <line
                  ref={calloutLineRef}
                  x1="320"
                  y1="220"
                  x2="240"
                  y2="140"
                  stroke="#64DFDF"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />
                <circle
                  ref={calloutDotRef}
                  cx="320"
                  cy="220"
                  r="5"
                  fill="#64DFDF"
                  stroke="#FFF8F2"
                  strokeWidth="1.5"
                />
              </svg>
              <div
                ref={calloutBoxRef}
                style={{ transform: 'translate3d(40px, 40px, 0)' }}
                className="absolute top-0 left-0 px-3 py-1.5 rounded-xl bg-[#23140F] border border-[#64DFDF]/75 shadow-xl transition-transform duration-75"
              >
                <div className="text-[11px] font-bold text-[#64DFDF] uppercase tracking-wider">
                  {currentHotspot.shortLabel}
                </div>
                <div className="text-xs font-semibold text-[#FFF8F2] whitespace-nowrap">
                  {currentHotspot.title[lang]}
                </div>
              </div>
            </div>
          )}

          {/* PRE-WARMED Official NASA Eyes 3D Iframe (Mounted in background so it opens instantaneously) */}
          <div
            data-testid="nasa-eyes-inline-viewport"
            aria-hidden={!showNasaEyesInline}
            className={`absolute inset-0 flex flex-col bg-[#120B08] transition-opacity duration-300 ${
              showNasaEyesInline
                ? 'opacity-100 pointer-events-auto z-30'
                : 'opacity-0 pointer-events-none -z-10'
            }`}
          >
            {!nasaEyesReady && showNasaEyesInline && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1A100C]/90 text-center p-4">
                <div className="w-44 h-1.5 rounded-full bg-[#3A2218] overflow-hidden mb-2">
                  <div className="w-2/3 h-full animate-horizon-glow rounded-full" />
                </div>
                <span className="text-xs font-medium text-[#FFD1A6]">
                  {lang === 'en'
                    ? 'Connecting to NASA Eyes 3D Telemetry (sc_insight)...'
                    : 'Đang kết nối dữ liệu 3D NASA Eyes (sc_insight)...'}
                </span>
              </div>
            )}

            <iframe
              src="https://eyes.nasa.gov/apps/solar-system/#/sc_insight"
              title="NASA Eyes on the Solar System — InSight 3D"
              onLoad={() => setNasaEyesReady(true)}
              className="w-full flex-1 border-0"
              allowFullScreen
            />

            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#23140F] border-t border-[#F4A261]/25 text-xs text-[#F3E5D8]">
              <span>
                {lang === 'en'
                  ? 'Official NASA/JPL 3D Spacecraft View (sc_insight).'
                  : 'Mô hình 3D tàu vũ trụ chính thức của NASA/JPL (sc_insight).'}
              </span>
              <a
                href="https://eyes.nasa.gov/apps/solar-system/#/sc_insight"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#F4A261] hover:text-[#FFD1A6] underline"
              >
                {lang === 'en' ? 'Open NASA Eyes in New Tab ↗' : 'Mở NASA Eyes ở Thẻ mới ↗'}
              </a>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Hardware Subsystem Selector & Synced Detail Card */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#F4A261]/20 bg-[#281610] p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-[#FFD1A6] uppercase tracking-wider">
              {lang === 'en'
                ? 'Select Hardware Subsystem (7)'
                : 'Chọn Bộ phận Phần cứng (7)'}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {INSIGHT_HOTSPOTS.map((hs) => {
                const active = hs.id === selectedHotspotId;
                return (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => onSelectHotspot(hs.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#64DFDF] text-[#111C28] shadow-md'
                        : 'bg-[#1D100C] text-[#F3E5D8] hover:text-white border border-[#F4A261]/25'
                    }`}
                  >
                    {hs.shortLabel}
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-[#1D100C] border border-[#F4A261]/25 space-y-2">
              <div className="text-xs font-bold text-[#F4A261]">{currentHotspot.code}</div>
              <h3 className="text-base font-bold text-[#FFF8F2]">{currentHotspot.title[lang]}</h3>
              <div className="text-xs font-medium text-[#64DFDF]">{currentHotspot.specs[lang]}</div>
              <p className="text-xs text-[#F3E5D8]/90 leading-relaxed pt-1 border-t border-[#F4A261]/15">
                {currentHotspot.description[lang]}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#F3E5D8]/75 pt-2 border-t border-[#F4A261]/15">
            <span>
              {lang === 'en'
                ? 'Drag 3D model to orbit 360° · Click any glowing dot'
                : 'Kéo mô hình 3D để xoay 360° · Nhấn vào điểm sáng'}
            </span>
            <a
              href="https://science.nasa.gov/mission/insight/science-instruments/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFD1A6] hover:underline font-semibold shrink-0 ml-2"
            >
              {lang === 'en' ? 'Source: NASA ↗' : 'Nguồn: NASA ↗'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
