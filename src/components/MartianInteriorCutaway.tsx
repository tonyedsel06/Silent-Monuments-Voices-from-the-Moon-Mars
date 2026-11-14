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

function createProceduralMarsSurfaceTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#A84824');
  grad.addColorStop(0.3, '#C85A32');
  grad.addColorStop(0.5, '#B24C28');
  grad.addColorStop(0.75, '#8F381B');
  grad.addColorStop(1, '#6E2912');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Albedo regions (Elysium Planitia, Tharsis, Valles Marineris bands)
  for (let i = 0; i < 95; i++) {
    const x = ((i * 173) % w);
    const y = ((i * 97) % h);
    const rx = 24 + (i % 5) * 26;
    const ry = 12 + (i % 4) * 16;
    ctx.fillStyle =
      i % 3 === 0
        ? 'rgba(65, 22, 10, 0.24)'
        : i % 2 === 0
          ? 'rgba(244, 162, 97, 0.18)'
          : 'rgba(180, 72, 34, 0.22)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (i % 6) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle impact craters
  for (let i = 0; i < 48; i++) {
    const cx = ((i * 211) % (w - 40)) + 20;
    const cy = ((i * 131) % (h - 40)) + 20;
    const r = 5 + (i % 5) * 4.5;
    ctx.strokeStyle = 'rgba(255, 209, 166, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createMoltenCoreTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 18, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#FFF7AE');
  grad.addColorStop(0.45, '#F59E0B');
  grad.addColorStop(0.85, '#EA580C');
  grad.addColorStop(1, '#991B1B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 60; i++) {
    const x = (i * 89) % size;
    const y = (i * 137) % size;
    const r = 10 + (i % 5) * 9;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.35)' : 'rgba(185, 28, 28, 0.28)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const MartianInteriorCutaway: React.FC<MartianInteriorCutawayProps> = ({ lang }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<MartianLayerSpec['id']>('core');
  const [showNasaCutawayPhoto, setShowNasaCutawayPhoto] = useState(false);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    selectedLayerId: 'core' as MartianLayerSpec['id'],
    rotY: -0.68,
    rotX: 0.24,
    targetRotY: -0.68,
    targetRotX: 0.24,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    pulsePhase: 0,
  });

  useEffect(() => {
    stateRef.current.selectedLayerId = selectedLayerId;
    if (selectedLayerId === 'crust') {
      stateRef.current.targetRotY = -0.45;
      stateRef.current.targetRotX = 0.38;
    } else if (selectedLayerId === 'mantle') {
      stateRef.current.targetRotY = -0.78;
      stateRef.current.targetRotX = 0.22;
    } else {
      stateRef.current.targetRotY = -0.65;
      stateRef.current.targetRotX = 0.16;
    }
    window.dispatchEvent(new Event('mars-cutaway-update'));
  }, [selectedLayerId, showNasaCutawayPhoto]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const glProbe = document.createElement('canvas').getContext('webgl2');
    let isSoftwareGl = true;
    if (glProbe) {
      const ext = glProbe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : glProbe.RENDERER;
      const gpu = String(glProbe.getParameter(param));
      glProbe.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x160b08);
    scene.fog = new THREE.FogExp2(0x160b08, 0.065);

    const camera = new THREE.PerspectiveCamera(
      38,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      50
    );
    camera.position.set(0, 0.65, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight));

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffe4c4, 0x2b120a, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff0d4, 2.4);
    keyLight.position.set(5, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x64dfdf, 1.0);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    const corePointLight = new THREE.PointLight(0xffb703, 2.6, 5.5);
    corePointLight.position.set(0.25, 0.1, 0.35);
    scene.add(corePointLight);

    const planetGroup = new THREE.Group();
    planetGroup.rotation.y = stateRef.current.rotY;
    planetGroup.rotation.x = stateRef.current.rotX;
    scene.add(planetGroup);

    const interactables: THREE.Object3D[] = [];

    // 1. OUTER CRUST SHELL (24–72 km, 270-degree cutaway sphere)
    const marsSurfaceTex = createProceduralMarsSurfaceTexture();
    marsSurfaceTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const crustOuterMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marsSurfaceTex,
      roughness: 0.72,
      metalness: 0.12,
      side: THREE.DoubleSide,
    });

    const crustShell = new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 44, 32, Math.PI * 0.5, Math.PI * 1.5, 0, Math.PI),
      crustOuterMat
    );
    crustShell.userData = { layerId: 'crust' };
    planetGroup.add(crustShell);
    interactables.push(crustShell);

    // Crust Highlight Rim Ring
    const crustRimMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      emissive: 0xf4a261,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.7,
    });
    const crustRimArc = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.024, 12, 48, Math.PI),
      crustRimMat
    );
    crustRimArc.rotation.z = -Math.PI * 0.5;
    planetGroup.add(crustRimArc);

    // Miniature 3D InSight Lander perched at the top of the Crust
    const miniLander = new THREE.Group();
    miniLander.position.set(0, 2.09, 0);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      roughness: 0.25,
      metalness: 0.85,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      roughness: 0.3,
      metalness: 0.6,
    });
    const deckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.06, 8), goldMat);
    miniLander.add(deckMesh);

    [-0.22, 0.22].forEach((wx) => {
      const wing = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.012, 10), wingMat);
      wing.position.set(wx, 0.01, 0);
      miniLander.add(wing);
    });

    const miniSeis = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      goldMat
    );
    miniSeis.position.set(0.18, -0.03, 0.12);
    miniLander.add(miniSeis);
    planetGroup.add(miniLander);

    // 2. LUMPY SILICATE MANTLE (1,550 km, cutaway wedge + 3D ancient impact fragments)
    const mantleMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      emissive: 0x451405,
      emissiveIntensity: 0.45,
      roughness: 0.58,
      metalness: 0.18,
      side: THREE.DoubleSide,
    });

    const mantleShell = new THREE.Mesh(
      new THREE.SphereGeometry(1.86, 40, 28, Math.PI * 0.5, Math.PI * 1.5, 0, Math.PI),
      mantleMat
    );
    mantleShell.userData = { layerId: 'mantle' };
    planetGroup.add(mantleShell);
    interactables.push(mantleShell);

    // Two Cross-Section Wedge Planes showing Crust & Mantle Cutaway Faces
    const wedgeShape = new THREE.Shape();
    wedgeShape.absarc(0, 0, 1.86, -Math.PI * 0.5, Math.PI * 0.5, false);
    wedgeShape.absarc(0, 0, 1.04, Math.PI * 0.5, -Math.PI * 0.5, true);
    wedgeShape.closePath();

    const wedgeGeo = new THREE.ShapeGeometry(wedgeShape, 32);
    const wedgeMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: 0x7c2d12,
      emissiveIntensity: 0.38,
      roughness: 0.52,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });

    const wedgeFaceZ = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeFaceZ.userData = { layerId: 'mantle' };
    planetGroup.add(wedgeFaceZ);
    interactables.push(wedgeFaceZ);

    const wedgeFaceX = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeFaceX.rotation.y = -Math.PI * 0.5;
    wedgeFaceX.userData = { layerId: 'mantle' };
    planetGroup.add(wedgeFaceX);
    interactables.push(wedgeFaceX);

    // 3D Embedded Primordial Impact Fragments ("Lumpy" Mantle Discovery — Aug 2025)
    const lumpGroup = new THREE.Group();
    const lumpGeo = new THREE.DodecahedronGeometry(0.085, 0);
    const lumpMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.65,
      roughness: 0.35,
      metalness: 0.3,
    });

    const lumpCoords: [number, number, number, number][] = [
      [1.25, 0.65, 0.04, 1.1],
      [1.42, 0.15, 0.05, 0.9],
      [1.18, -0.58, 0.04, 1.2],
      [0.85, 1.12, 0.05, 0.85],
      [0.92, -1.05, 0.04, 1.0],
      [0.04, 0.85, 1.18, 1.15],
      [0.05, 0.25, 1.45, 0.95],
      [0.04, -0.52, 1.32, 1.25],
      [0.05, -1.12, 0.88, 0.9],
      [0.04, 1.28, 0.72, 1.05],
      [0.78, 0.55, 0.88, 0.95],
      [0.95, -0.35, 0.95, 1.1],
    ];

    lumpCoords.forEach(([lx, ly, lz, scale], idx) => {
      const lump = new THREE.Mesh(lumpGeo, lumpMat);
      lump.position.set(lx, ly, lz);
      lump.scale.setScalar(scale);
      lump.rotation.set(idx * 0.7, idx * 1.1, idx * 0.5);
      lump.userData = { layerId: 'mantle' };
      lumpGroup.add(lump);
      interactables.push(lump);
    });
    planetGroup.add(lumpGroup);

    // 3. MOLTEN LIQUID IRON-ALLOY CORE (R ≈ 1,830 km)
    const coreTex = createMoltenCoreTexture();
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: coreTex,
      emissive: 0xf59e0b,
      emissiveMap: coreTex,
      emissiveIntensity: 0.85,
      roughness: 0.22,
      metalness: 0.25,
      clearcoat: 0.6,
    });

    const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(1.04, 36, 28), coreMat);
    coreSphere.userData = { layerId: 'core' };
    planetGroup.add(coreSphere);
    interactables.push(coreSphere);

    // 4. 3D SEISMIC WAVE RAYS (Cyan P-Wave refracting through Core + Amber S-Wave blocked at Core)
    const seismicRayGroup = new THREE.Group();
    const pWaveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 2.02, 0.02),
      new THREE.Vector3(0.45, 1.35, 0.25),
      new THREE.Vector3(0.55, 0.35, 0.38),
      new THREE.Vector3(0.42, -0.55, 0.32),
      new THREE.Vector3(0.85, -1.45, 0.65),
    ]);
    const pWaveMat = new THREE.MeshStandardMaterial({
      color: 0x64dfdf,
      emissive: 0x64dfdf,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const pWaveTube = new THREE.Mesh(
      new THREE.TubeGeometry(pWaveCurve, 32, 0.024, 8, false),
      pWaveMat
    );
    seismicRayGroup.add(pWaveTube);

    const sWaveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 2.02, 0.02),
      new THREE.Vector3(0.82, 1.48, 0.12),
      new THREE.Vector3(1.18, 0.58, 0.16),
      new THREE.Vector3(1.06, 0.08, 0.14), // Stops / reflects at Liquid Core boundary
    ]);
    const sWaveMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      emissive: 0xf4a261,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const sWaveTube = new THREE.Mesh(
      new THREE.TubeGeometry(sWaveCurve, 24, 0.022, 8, false),
      sWaveMat
    );
    seismicRayGroup.add(sWaveTube);
    planetGroup.add(seismicRayGroup);

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
        -0.55,
        Math.min(0.75, stateRef.current.targetRotX + dy * 0.007)
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

    function stepScene(): boolean {
      const st = stateRef.current;
      st.rotY += (st.targetRotY - st.rotY) * 0.16;
      st.rotX += (st.targetRotX - st.rotX) * 0.16;
      planetGroup.rotation.y = st.rotY;
      planetGroup.rotation.x = st.rotX;

      const active = st.selectedLayerId;
      // Highlight the selected 3D layer clearly
      crustOuterMat.emissive = new THREE.Color(active === 'crust' ? 0x64dfdf : 0x220a04);
      crustOuterMat.emissiveIntensity = active === 'crust' ? 0.28 : 0.06;

      mantleMat.emissiveIntensity = active === 'mantle' ? 0.72 : 0.35;
      wedgeMat.emissiveIntensity = active === 'mantle' ? 0.68 : 0.32;
      lumpMat.emissiveIntensity = active === 'mantle' ? 1.15 : 0.55;

      const coreScale = active === 'core' ? 1.04 : 1.0;
      coreSphere.scale.lerp(new THREE.Vector3(coreScale, coreScale, coreScale), 0.2);
      coreMat.emissiveIntensity = active === 'core' ? 1.15 : 0.78;

      const moving =
        Math.abs(st.targetRotY - st.rotY) > 0.002 ||
        Math.abs(st.targetRotX - st.rotX) > 0.002;

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

    const onResize = () => {
      if (!container || container.clientWidth === 0) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      requestRender();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mars-cutaway-update', requestRender);

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
      window.removeEventListener('mars-cutaway-update', requestRender);
      marsSurfaceTex.dispose();
      coreTex.dispose();
      renderer.dispose();
    };
  }, []);

  const activeLayer =
    MARTIAN_INTERIOR_LAYERS.find((l) => l.id === selectedLayerId) ?? MARTIAN_INTERIOR_LAYERS[2];

  return (
    <div className="rounded-2xl border border-[#F4A261]/30 nasa-basalt-glass p-4 sm:p-6 space-y-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4A261]/20 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-[#382017] border border-[#F4A261]/40 text-xs font-bold text-[#FFD1A6]">
            {lang === 'en'
              ? 'Interactive 3D Planetary Cutaway · Not to scale'
              : 'Mô hình 3D mặt cắt hành tinh · Không theo tỷ lệ thực'}
          </span>
          <span className="text-xs text-[#64DFDF] font-semibold">
            {lang === 'en'
              ? 'Drag to rotate 3D sphere or tap a layer'
              : 'Kéo để xoay quả cầu 3D hoặc chọn từng lớp'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNasaCutawayPhoto((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-[#341C14] border border-[#F4A261]/40 text-xs font-bold text-[#FFD1A6] hover:bg-[#48271C] transition-colors"
          >
            {showNasaCutawayPhoto
              ? lang === 'en'
                ? 'Show Interactive 3D Cutaway'
                : 'Hiện Mô Hình Mặt Cắt 3D'
              : lang === 'en'
                ? 'View NASA PIA26636 Illustration'
                : 'Xem Ảnh Minh Họa NASA PIA26636'}
          </button>
          <a
            href="https://science.nasa.gov/mission/insight/science-highlights/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#1D0F0A] border border-[#F4A261]/30 text-xs font-semibold text-[#FFD1A6] hover:text-white transition-colors"
          >
            Verify at NASA/JPL ↗
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mobile-single-col-lock">
        {/* Left 6 Cols: Interactive 3D Cutaway Sphere of Mars or NASA PIA26636 Illustration */}
        <div
          data-no-swipe="true"
          className="lg:col-span-6 relative flex flex-col items-center justify-center bg-[#160B08] rounded-2xl border border-[#F4A261]/25 overflow-hidden h-[340px] sm:h-[380px]"
        >
          <div
            ref={mountRef}
            data-testid="martian-interior-3d-canvas"
            className={`w-full h-full cursor-grab active:cursor-grabbing ${
              showNasaCutawayPhoto ? 'invisible pointer-events-none' : 'block'
            }`}
          />

          {!showNasaCutawayPhoto && (
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-[#180C08]/92 border border-[#F4A261]/35 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
              <span className="text-[#FFD1A6]">
                {lang === 'en'
                  ? '● Gold Chunks: 4.5B-Yr Mantle Debris'
                  : '● Khối vàng: Mảnh vỡ 4,5 tỷ năm'}
              </span>
              <span className="text-[#64DFDF]">
                {lang === 'en'
                  ? '━ Cyan: P-Wave · ━ Amber: S-Wave'
                  : '━ Xanh: Sóng P · ━ Cam: Sóng S'}
              </span>
            </div>
          )}

          {showNasaCutawayPhoto && (
            <div className="absolute inset-0 z-10 bg-[#160B08] p-4 flex flex-col items-center justify-center space-y-2 text-center">
              <img
                src={INSIGHT_MEDIA_ASSETS.PIA26636_LOCAL}
                onError={(e) => handleNasaImageError(e, INSIGHT_MEDIA_ASSETS.PIA26636_NASA)}
                alt="NASA PIA26636 Cutaway of Mars Lumpy Mantle and Molten Core"
                className="w-full max-h-[290px] object-contain rounded-xl"
              />
              <p className="text-[11px] text-[#F3E5D8]/85">
                {lang === 'en'
                  ? 'Official NASA/JPL-Caltech illustration (PIA26636) showing seismic waves passing through ancient asteroid debris in Mars’ mantle above the glowing liquid core.'
                  : 'Ảnh minh họa chính thức của NASA/JPL-Caltech (PIA26636) mô tả sóng địa chấn truyền qua các mảnh vỡ thiên thạch cổ đại trong lớp phủ phía trên lõi lỏng.'}
              </p>
            </div>
          )}
        </div>

        {/* Right 6 Cols: 3 Layer Selector Buttons & Active Layer Telemetry Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {MARTIAN_INTERIOR_LAYERS.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <button
                  key={layer.id}
                  type="button"
                  data-testid={`interior-layer-btn-${layer.id}`}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-[#F4A261] text-[#1D0F0A] shadow-lg'
                      : 'bg-[#2C1710] text-[#F3E5D8] border border-[#F4A261]/30 hover:bg-[#3D2016]'
                  }`}
                >
                  {layer.id === 'crust'
                    ? lang === 'en'
                      ? '1. Crust'
                      : '1. Lớp Vỏ'
                    : layer.id === 'mantle'
                      ? lang === 'en'
                        ? '2. Mantle'
                        : '2. Lớp Phủ'
                      : lang === 'en'
                        ? '3. Liquid Core'
                        : '3. Lõi Lỏng'}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#1B0E0A] border border-[#F4A261]/35 space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-[#FFF8F2]">
              {activeLayer.name[lang]}
            </h4>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#2D1811] text-[#FFD1A6] font-semibold">
                {activeLayer.depthRange[lang]}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#2D1811] text-[#64DFDF] font-semibold">
                {activeLayer.temperature[lang]}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#F3E5D8]/90 leading-relaxed">
              {activeLayer.summary[lang]}
            </p>

            <div className="p-3 rounded-xl bg-[#26140E] border border-[#64DFDF]/30 text-xs text-[#F3E5D8] space-y-1">
              <div className="font-bold text-[#64DFDF]">
                {lang === 'en'
                  ? 'Composition & Seismic Proof:'
                  : 'Thành phần & bằng chứng địa chấn:'}
              </div>
              <p className="text-[#FFD1A6]/95">{activeLayer.composition[lang]}</p>
              <p className="text-[#F3E5D8]/85">{activeLayer.seismicProof[lang]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
