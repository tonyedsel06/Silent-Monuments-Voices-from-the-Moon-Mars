import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  INSIGHT_SUBSYSTEMS_9,
  InSightSubsystemSpec,
  Language,
} from '../data/bilingualContent';
import { INSIGHT_MEDIA_ASSETS } from '../utils/nasaMedia';

interface InSightLander3DProps {
  lang: Language;
  selectedSubsystemId: InSightSubsystemSpec['id'];
  onSelectSubsystem: (id: InSightSubsystemSpec['id']) => void;
}

const HOTSPOT_3D_COORDS: Record<InSightSubsystemSpec['id'], [number, number, number]> = {
  solar: [-2.15, 0.28, 0.0],
  seis: [1.45, -0.35, 0.9],
  hp3: [-0.85, -0.45, 1.15],
  ida: [0.68, 0.72, 0.55],
  cameras: [0.55, 0.52, 0.48],
  rise: [-0.55, 0.55, 0.35],
  twins: [0.65, 0.52, -0.45],
  uhf: [-0.42, 0.62, -0.32],
  legs_tethers: [0.95, -0.42, 0.65],
};

function createSolarWingTextures(): {
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

  const baseGrad = ctx.createRadialGradient(cx, cy, 24, cx, cy, maxR);
  baseGrad.addColorStop(0, '#162944');
  baseGrad.addColorStop(0.55, '#0F2038');
  baseGrad.addColorStop(1, '#091526');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#909090';
  bCtx.fillRect(0, 0, size, size);

  for (let ring = 70; ring <= maxR; ring += 32) {
    ctx.strokeStyle =
      ring % 64 === 0 ? 'rgba(244, 162, 97, 0.58)' : 'rgba(125, 211, 252, 0.32)';
    ctx.lineWidth = ring % 64 === 0 ? 3 : 1.5;
    ctx.beginPath();
    for (let s = 0; s <= 10; s++) {
      const a = (s / 10) * Math.PI * 2;
      const px = cx + Math.cos(a) * ring;
      const py = cy + Math.sin(a) * ring;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.strokeStyle = '#F4A261';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
    ctx.stroke();
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  return { colorMap, bumpMap };
}

function createCopperDomeShaderMaterial(baseHex: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: baseHex,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 0.72,
    clearcoatRoughness: 0.16,
    reflectivity: 1.0,
  });
}

export const InSightLander3D: React.FC<InSightLander3DProps> = ({
  lang,
  selectedSubsystemId,
  onSelectSubsystem,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const calloutLineRef = useRef<SVGLineElement | null>(null);
  const calloutDotRef = useRef<SVGCircleElement | null>(null);
  const calloutBoxRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<'3d' | 'pia17358' | 'nasa_eyes'>('3d');
  const [isDeployed, setIsDeployed] = useState(true);
  const [nasaEyesReady, setNasaEyesReady] = useState(false);
  // Mobile 3D touch lock state: false = scroll page freely (pan-y), true = drag to rotate 3D
  const [mobileTouchInteractive, setMobileTouchInteractive] = useState(false);

  const stateRef = useRef({
    isDeployed: true,
    deployProgress: 1,
    selectedSubsystemId,
    rotY: -0.45,
    rotX: 0.24,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    mobileTouchInteractive: false,
  });

  useEffect(() => {
    stateRef.current.isDeployed = isDeployed;
    stateRef.current.selectedSubsystemId = selectedSubsystemId;
    stateRef.current.mobileTouchInteractive = mobileTouchInteractive;
    window.dispatchEvent(new Event('resize'));
  }, [isDeployed, selectedSubsystemId, mobileTouchInteractive, activeTab]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1f120d);

    const camera = new THREE.PerspectiveCamera(
      40,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 2.35, 5.75);
    camera.lookAt(0, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;

    const glCtx = renderer.getContext();
    const debugInfo = glCtx.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo
      ? glCtx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software/i.test(rendererStr);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffe4c4, 0x3b1f14, 1.3));
    const sunLight = new THREE.DirectionalLight(0xfff3e0, 2.5);
    sunLight.position.set(5, 8, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x64dfdf, 0.9);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Martian Regolith Base
    const groundMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.7, 0.22, 48),
      new THREE.MeshStandardMaterial({
        color: 0x9b4b2c,
        roughness: 0.92,
        metalness: 0.06,
      })
    );
    groundMesh.position.y = -0.82;
    rootGroup.add(groundMesh);

    // Octagonal Deck & Gold Kapton Thermal Belly
    const deckGroup = new THREE.Group();
    deckGroup.position.y = 0.1;
    rootGroup.add(deckGroup);

    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xe9a94b,
      roughness: 0.28,
      metalness: 0.85,
    });
    const deckTopMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.42,
      metalness: 0.55,
    });

    deckGroup.add(
      new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.78, 0.48, 8), goldFoilMat)
    );
    const topPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.02, 1.02, 0.08, 8),
      deckTopMat
    );
    topPlate.position.y = 0.26;
    deckGroup.add(topPlate);

    // 3 Landing Legs
    const legMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.4,
      metalness: 0.78,
    });
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.65,
      metalness: 0.5,
    });

    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 1.05, 12), legMat);
      strut.position.set(Math.cos(angle) * 0.95, -0.32, Math.sin(angle) * 0.95);
      strut.rotation.z = Math.cos(angle) * 0.42;
      strut.rotation.x = -Math.sin(angle) * 0.42;
      rootGroup.add(strut);

      const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.06, 16), padMat);
      footpad.position.set(Math.cos(angle) * 1.18, -0.7, Math.sin(angle) * 1.18);
      rootGroup.add(footpad);
    });

    // Twin Decagonal Solar Arrays
    const { colorMap: solarTex, bumpMap: solarBump } = createSolarWingTextures();
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
    });

    // 1.8m Instrument Deployment Arm (IDA), IDC Camera & Grapple
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

    const idcBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.12), boomMat);
    idcBox.position.set(0.5, 0.42, 0.32);
    armGroup.add(idcBox);

    const grappleHook = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.16, 8), boomMat);
    grappleHook.position.set(1.02, -0.02, 0.48);
    grappleHook.rotation.x = Math.PI;
    armGroup.add(grappleHook);

    // SEIS & WTS Copper Shader Dome + Gold Tether
    const seisCopperShaderMat = createCopperDomeShaderMaterial(0xd96b2b);
    const wtsCopperDomeShaderMat = createCopperDomeShaderMaterial(0xe78a4e);

    const seisGroup = new THREE.Group();
    seisGroup.add(
      new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.18, 6), seisCopperShaderMat)
    );
    rootGroup.add(seisGroup);

    const wtsGroup = new THREE.Group();
    const wtsDomeCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      wtsCopperDomeShaderMat
    );
    wtsDomeCap.position.y = 0.07;
    wtsGroup.add(wtsDomeCap);

    const wtsSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.39, 0.46, 0.09, 24),
      goldFoilMat
    );
    wtsSkirt.position.y = -0.05;
    wtsGroup.add(wtsSkirt);
    rootGroup.add(wtsGroup);

    // Flat Kapton Science Tethers on ground
    const tetherMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.015, 0.08),
      goldFoilMat
    );
    tetherMesh.position.set(0.75, -0.69, 0.58);
    tetherMesh.rotation.y = -0.52;
    rootGroup.add(tetherMesh);

    // HP³ Mole Housing
    const hp3Group = new THREE.Group();
    hp3Group.position.set(-0.85, -0.52, 1.15);
    const hp3Tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.055, 0.48, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 })
    );
    hp3Tower.position.y = 0.08;
    hp3Group.add(hp3Tower);
    rootGroup.add(hp3Group);

    // RISE Horns, TWINS Booms & UHF Helical Antenna on Deck
    const riseHorn1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 16), goldFoilMat);
    riseHorn1.position.set(-0.55, 0.48, 0.35);
    riseHorn1.rotation.z = 0.42;
    rootGroup.add(riseHorn1);

    const uhfDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.28, 18), armTubeMat);
    uhfDrum.position.set(-0.42, 0.52, -0.32);
    rootGroup.add(uhfDrum);

    const twinsBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.42, 8), armTubeMat);
    twinsBoom.position.set(0.65, 0.46, -0.45);
    twinsBoom.rotation.z = -0.35;
    rootGroup.add(twinsBoom);

    // 9 Clickable Hotspot Orbs
    const hotspotMeshes: THREE.Mesh[] = [];
    INSIGHT_SUBSYSTEMS_9.forEach((h) => {
      const coords = HOTSPOT_3D_COORDS[h.id];
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xf4a261,
          emissive: 0xf4a261,
          emissiveIntensity: 0.75,
          roughness: 0.2,
          transparent: true,
          opacity: 0.9,
        })
      );
      marker.position.set(coords[0], coords[1], coords[2]);
      marker.userData = { subsystemId: h.id };
      rootGroup.add(marker);
      hotspotMeshes.push(marker);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;

    const isMobileViewport = () => window.innerWidth <= 900;

    const onPointerDown = (e: PointerEvent) => {
      // On mobile screens, if 3D touch rotation is locked for smooth page scrolling, only allow tapping hotspots
      const rect = domEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hotspotMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.subsystemId as InSightSubsystemSpec['id'];
        if (hitId) {
          onSelectSubsystem(hitId);
          requestRender();
          return;
        }
      }

      if (isMobileViewport() && !stateRef.current.mobileTouchInteractive && e.pointerType === 'touch') {
        return;
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
      stateRef.current.rotY += dx * 0.008;
      stateRef.current.rotX = Math.max(-0.1, Math.min(0.85, stateRef.current.rotX + dy * 0.006));
      requestRender();
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container || container.clientWidth === 0) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
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

    const projVec = new THREE.Vector3();

    function updateSingleActiveCallout() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      const activeMesh = hotspotMeshes.find(
        (m) => m.userData.subsystemId === stateRef.current.selectedSubsystemId
      );
      if (!activeMesh) return;

      activeMesh.getWorldPosition(projVec);
      projVec.project(camera);

      const sx = Math.max(24, Math.min(w - 24, (projVec.x * 0.5 + 0.5) * w));
      const sy = Math.max(24, Math.min(h - 24, (-projVec.y * 0.5 + 0.5) * h));

      const lx = Math.max(14, Math.min(w - 235, sx > w * 0.52 ? sx - 215 : sx + 34));
      const ly = Math.max(48, Math.min(h - 68, sy > h * 0.55 ? sy - 58 : sy + 24));

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
        stateRef.current.deployProgress + (targetDeploy - stateRef.current.deployProgress) * 0.14;
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

      hotspotMeshes.forEach((m) => {
        const isSel = m.userData.subsystemId === stateRef.current.selectedSubsystemId;
        m.scale.setScalar(isSel ? 1.38 : 0.72);
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
      renderer.dispose();
    };
  }, [onSelectSubsystem]);

  const currentSubsystem =
    INSIGHT_SUBSYSTEMS_9.find((s) => s.id === selectedSubsystemId) ?? INSIGHT_SUBSYSTEMS_9[0];

  return (
    <div className="rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass overflow-hidden shadow-2xl">
      {/* Top Dual-View Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#F4A261]/25 bg-[#2A1610]/90">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid="view-tab-3d-rig"
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === '3d'
                ? 'bg-[#F4A261] text-[#1D0F0A]'
                : 'bg-[#1D0F0A] text-[#F3E5D8] border border-[#F4A261]/30 hover:text-white'
            }`}
          >
            {lang === 'en' ? '1A. 3D Lander Rig (Three.js)' : '1A. Mô Hình 3D Tương Tác'}
          </button>

          <button
            type="button"
            data-testid="view-tab-pia17358"
            onClick={() => setActiveTab('pia17358')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pia17358'
                ? 'bg-[#F4A261] text-[#1D0F0A]'
                : 'bg-[#1D0F0A] text-[#F3E5D8] border border-[#F4A261]/30 hover:text-white'
            }`}
          >
            {lang === 'en' ? '1B. Official PIA17358 Blueprint' : '1B. Sơ Đồ PIA17358 Gốc'}
          </button>

          <button
            type="button"
            data-testid="header-toggle-nasa-eyes-btn"
            onClick={() => setActiveTab((prev) => (prev === 'nasa_eyes' ? '3d' : 'nasa_eyes'))}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'nasa_eyes'
                ? 'bg-[#64DFDF] text-[#101C26]'
                : 'bg-[#3A1E14] text-[#64DFDF] border border-[#64DFDF]/45 hover:bg-[#4B281B]'
            }`}
          >
            {activeTab === 'nasa_eyes'
              ? lang === 'en'
                ? '← Back to 9-Subsystem Explorer'
                : '← Quay Lại Khám Phá 9 Thiết Bị'
              : lang === 'en'
                ? '2. Official NASA Eyes 3D Live View'
                : '2. Mở NASA Eyes 3D Trực Tiếp'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === '3d' && (
            <button
              type="button"
              onClick={() => setIsDeployed((prev) => !prev)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#382017] text-[#FFD1A6] border border-[#F4A261]/45 hover:bg-[#4A2A1E] transition-colors whitespace-nowrap shrink-0"
            >
              {isDeployed
                ? lang === 'en'
                  ? 'Stow SEIS on Deck'
                  : 'Thu SEIS Lên Boong'
                : lang === 'en'
                  ? 'Deploy SEIS to Soil'
                  : 'Hạ SEIS Xuống Đất'}
            </button>
          )}
        </div>
      </div>

      {/* Main Split Grid: Left Viewport (8 cols) + Right 9-Subsystem Selector & Detail Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 mobile-single-col-lock">
        {/* Left 8 Cols: 3D Viewport / PIA17358 Diagram / Pre-Warmed NASA Eyes Iframe */}
        <div
          className={`lg:col-span-7 relative w-full h-[360px] sm:h-[460px] bg-[#1D100B] overflow-hidden ${
            activeTab === '3d' && !mobileTouchInteractive ? 'touch-pan-y' : ''
          }`}
        >
          {/* VIEW 1A: Three.js 3D Lander Rig */}
          <div
            ref={mountRef}
            data-testid="insight-3d-lander-canvas"
            className={`w-full h-full ${
              activeTab === '3d'
                ? 'block cursor-grab active:cursor-grabbing'
                : 'invisible pointer-events-none'
            }`}
          />

          {/* Mobile 3D Touch Protection Button (Visible on <=900px screens when in 3D view) */}
          {activeTab === '3d' && (
            <div className="lg:hidden absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
              <button
                type="button"
                data-testid="mobile-3d-touch-lock-btn"
                onClick={() => setMobileTouchInteractive((v) => !v)}
                className={`pointer-events-auto px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg border transition-colors ${
                  mobileTouchInteractive
                    ? 'bg-[#64DFDF] text-[#101C26] border-[#64DFDF]'
                    : 'bg-[#22120C]/95 text-[#FFD1A6] border-[#F4A261]/60'
                }`}
              >
                {mobileTouchInteractive
                  ? lang === 'en'
                    ? '🔒 3D Orbit Active · Tap to Unlock Page Scroll'
                    : '🔒 Đang Xoay 3D · Chạm Để Mở Khóa Cuộn Trang'
                  : lang === 'en'
                    ? '👆 Tap to Rotate 3D / Lock Page Scroll'
                    : '👆 Chạm Để Xoay 3D / Khóa Cuộn Trang'}
              </button>
            </div>
          )}

          {/* Single Clean Animated Callout Leader Line & Floating Label for Active Subsystem Only */}
          {activeTab === '3d' && (
            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              <svg className="w-full h-full">
                <line
                  ref={calloutLineRef}
                  x1="300"
                  y1="210"
                  x2="220"
                  y2="130"
                  stroke="#64DFDF"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <circle
                  ref={calloutDotRef}
                  cx="300"
                  cy="210"
                  r="5.5"
                  fill="#64DFDF"
                  stroke="#FFF8F2"
                  strokeWidth="1.5"
                />
              </svg>
              <div
                ref={calloutBoxRef}
                style={{ transform: 'translate3d(32px, 52px, 0)' }}
                className="absolute top-0 left-0 px-3 py-1.5 rounded-xl bg-[#22120C]/95 border border-[#64DFDF] shadow-xl transition-transform duration-75 max-w-[225px]"
              >
                <div className="text-[10px] font-bold text-[#64DFDF] uppercase tracking-wider">
                  {currentSubsystem.number} · {currentSubsystem.piaLabel}
                </div>
                <div className="text-xs font-bold text-[#FFF8F2] truncate">
                  {currentSubsystem.title[lang]}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 1B: Official Annotated Technical Blueprint (PIA17358) with Single Active Callout Pin */}
          {activeTab === 'pia17358' && (
            <div
              data-testid="pia17358-blueprint-view"
              className="absolute inset-0 z-20 bg-[#140B08] flex items-center justify-center p-2 sm:p-4"
            >
              <div className="relative w-full h-full max-w-[680px] rounded-xl overflow-hidden border border-[#F4A261]/35 bg-[#0E0705]">
                <img
                  src={INSIGHT_MEDIA_ASSETS.PIA17358_LOCAL}
                  onError={(e) => {
                    e.currentTarget.src = INSIGHT_MEDIA_ASSETS.PIA17358_NASA;
                  }}
                  alt="NASA PIA17358 Annotated InSight Instruments Diagram"
                  className="w-full h-full object-contain"
                />

                {/* 9 Subtle Interactive Dots on PIA17358 + Single Active Callout */}
                {INSIGHT_SUBSYSTEMS_9.map((sub) => {
                  const isSel = sub.id === selectedSubsystemId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => onSelectSubsystem(sub.id)}
                      style={{
                        left: `${sub.diagramCoord.x}%`,
                        top: `${sub.diagramCoord.y}%`,
                      }}
                      aria-label={`Inspect ${sub.shortLabel}`}
                      className={`-translate-x-1/2 -translate-y-1/2 absolute rounded-full transition-all ${
                        isSel
                          ? 'w-6 h-6 bg-[#64DFDF] text-[#101C26] ring-4 ring-[#64DFDF]/40 font-extrabold text-[11px] z-20 flex items-center justify-center'
                          : 'w-4 h-4 bg-[#F4A261]/90 text-[#1D0F0A] hover:scale-125 text-[9px] font-bold z-10 flex items-center justify-center border border-white/60'
                      }`}
                    >
                      {sub.number}
                    </button>
                  );
                })}

                <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-xl bg-[#1D0F0A]/95 border border-[#64DFDF]/50 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[#64DFDF]">
                      {currentSubsystem.number}. {currentSubsystem.piaLabel}:
                    </span>{' '}
                    <span className="text-[#FFF8F2] font-semibold">
                      {currentSubsystem.title[lang]}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#FFD1A6] shrink-0">PIA17358</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: Official NASA Eyes 3D Live Embed */}
          {activeTab === 'nasa_eyes' && (
            <div
              data-testid="nasa-eyes-inline-viewport"
              className="absolute inset-0 z-30 flex flex-col bg-[#120B08]"
            >
              {!nasaEyesReady && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1A100C]/90 text-center p-4">
                  <div className="w-44 h-1.5 rounded-full bg-[#3A2218] overflow-hidden mb-2">
                    <div className="w-2/3 h-full animate-horizon-glow rounded-full" />
                  </div>
                  <p className="text-xs font-semibold text-[#FFD1A6]">
                    {lang === 'en'
                      ? 'Connecting to NASA JPL Eyes on the Solar System (sc_insight)...'
                      : 'Đang kết nối mô hình 3D trực tiếp từ NASA JPL Eyes (sc_insight)...'}
                  </p>
                </div>
              )}
              <iframe
                src="https://eyes.nasa.gov/apps/solar-system/#/sc_insight"
                title="Official NASA Eyes 3D InSight Lander"
                className="w-full flex-1 border-0"
                onLoad={() => setNasaEyesReady(true)}
                allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              />
            </div>
          )}
        </div>

        {/* Right 5 Cols: 9 Clickable Hardware Subsystems & Focused Detail Card */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-[#25130D]/95 border-t lg:border-t-0 lg:border-l border-[#F4A261]/25 flex flex-col justify-between space-y-3.5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD1A6]">
                {lang === 'en'
                  ? '9 Hardware Subsystems (PIA17358)'
                  : '9 Hệ Thống Thiết Bị (Sơ Đồ PIA17358)'}
              </span>
              <span className="text-[11px] text-[#64DFDF] font-semibold">
                {currentSubsystem.number} / 09
              </span>
            </div>

            {/* 9 Quick-Select Subsystem Pill Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {INSIGHT_SUBSYSTEMS_9.map((sub) => {
                const active = sub.id === selectedSubsystemId;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    data-testid={`subsystem-btn-${sub.id}`}
                    onClick={() => onSelectSubsystem(sub.id)}
                    className={`px-2 py-1.5 text-[11px] font-bold rounded-lg transition-colors text-left truncate ${
                      active
                        ? 'bg-[#64DFDF] text-[#101C26] shadow-md'
                        : 'bg-[#341C14] text-[#F3E5D8] border border-[#F4A261]/25 hover:bg-[#48271C]'
                    }`}
                  >
                    {sub.number}. {sub.shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Selected Subsystem Detail Card */}
            <div className="p-3.5 rounded-xl bg-[#1A0E0A] border border-[#F4A261]/35 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#F4A261]">
                  {currentSubsystem.number} · {currentSubsystem.piaLabel}
                </span>
              </div>
              <h4 className="text-base font-bold text-[#FFF8F2] leading-snug">
                {currentSubsystem.title[lang]}
              </h4>
              <div className="text-xs font-semibold text-[#64DFDF]">
                {currentSubsystem.specBadge[lang]}
              </div>
              <p className="text-xs text-[#F3E5D8]/90 leading-relaxed">
                {currentSubsystem.description[lang]}
              </p>
              <div className="pt-2 border-t border-[#F4A261]/20 text-[11px] text-[#FFD1A6]/95 leading-relaxed">
                <strong className="text-[#64DFDF]">
                  {lang === 'en' ? 'Engineering Insight: ' : 'Bài học kỹ thuật: '}
                </strong>
                {currentSubsystem.engineeringLesson[lang]}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F4A261]/20 flex items-center justify-between text-[11px] text-[#F3E5D8]/75">
            <span>
              {lang === 'en'
                ? 'Only the selected subsystem callout is shown for visual clarity.'
                : 'Chỉ hiển thị đường chỉ dẫn của thiết bị đang chọn để tránh rối mắt.'}
            </span>
            <a
              href="https://science.nasa.gov/mission/insight/science-instruments/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FFD1A6] hover:underline font-semibold shrink-0 ml-2"
            >
              Verify at NASA/JPL ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
