import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GIS_LANDMARKS, GisLandmark, Language } from '../data/bilingualContent';

interface PlanetaryGisGlobe3DProps {
  lang: Language;
  selectedId: GisLandmark['id'];
  onSelectLandmark: (id: GisLandmark['id']) => void;
  activeBody: 'mars' | 'moon';
  onChangeBody: (body: 'mars' | 'moon') => void;
}

function createPlanetaryTextures(body: 'mars' | 'moon'): {
  albedo: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
} {
  const width = 1024;
  const height = 512;

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = width;
  albedoCanvas.height = height;
  const ctx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;

  if (body === 'mars') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#D9A07E'); // North polar cap rim
    grad.addColorStop(0.12, '#8F3F29');
    grad.addColorStop(0.45, '#C8643B');
    grad.addColorStop(0.58, '#9E4328');
    grad.addColorStop(0.88, '#7A3321');
    grad.addColorStop(1, '#E2B89B'); // South polar cap
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, width, height);

    // Deterministic MOLA basins, volcanic provinces & craters
    const features = [
      { x: 0.72, y: 0.65, r: 95, color: 'rgba(72, 28, 22, 0.55)', bump: '#404040' }, // Hellas Basin
      { x: 0.87, y: 0.47, r: 65, color: 'rgba(218, 118, 74, 0.5)', bump: '#B8B8B8' }, // Elysium Planitia
      { x: 0.48, y: 0.52, r: 78, color: 'rgba(90, 35, 25, 0.48)', bump: '#606060' }, // Meridiani / Arabia
      { x: 0.22, y: 0.44, r: 85, color: 'rgba(235, 135, 88, 0.52)', bump: '#DFDFDF' }, // Tharsis Montes
      { x: 0.31, y: 0.54, r: 55, color: 'rgba(58, 22, 18, 0.65)', bump: '#252525' }, // Valles Marineris
    ];

    features.forEach((f) => {
      const rg = ctx.createRadialGradient(
        f.x * width,
        f.y * height,
        4,
        f.x * width,
        f.y * height,
        f.r
      );
      rg.addColorStop(0, f.color);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(f.x * width, f.y * height, f.r, 0, Math.PI * 2);
      ctx.fill();

      bCtx.fillStyle = f.bump;
      bCtx.beginPath();
      bCtx.arc(f.x * width, f.y * height, f.r * 0.7, 0, Math.PI * 2);
      bCtx.fill();
    });

    // Craters
    for (let i = 0; i < 65; i++) {
      const cx = ((i * 173) % 990) + 16;
      const cy = ((i * 97) % 440) + 36;
      const cr = 5 + (i % 18);
      ctx.strokeStyle = 'rgba(255, 195, 145, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.stroke();

      bCtx.strokeStyle = '#D0D0D0';
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.arc(cx, cy, cr, 0, Math.PI * 2);
      bCtx.stroke();
    }
  } else {
    // Lunar LRO grayscale regolith & dark basaltic maria
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#94A3B8');
    grad.addColorStop(0.5, '#64748B');
    grad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, width, height);

    // Lunar Maria (Sea of Tranquility, Imbrium, Serenitatis, Procellarum)
    const maria = [
      { x: 0.565, y: 0.48, r: 64, color: 'rgba(30, 41, 59, 0.75)' }, // Mare Tranquillitatis
      { x: 0.44, y: 0.34, r: 85, color: 'rgba(30, 41, 59, 0.7)' }, // Mare Imbrium
      { x: 0.55, y: 0.36, r: 58, color: 'rgba(30, 41, 59, 0.68)' }, // Mare Serenitatis
      { x: 0.34, y: 0.48, r: 95, color: 'rgba(30, 41, 59, 0.65)' }, // Oceanus Procellarum
    ];

    maria.forEach((m) => {
      const rg = ctx.createRadialGradient(
        m.x * width,
        m.y * height,
        6,
        m.x * width,
        m.y * height,
        m.r
      );
      rg.addColorStop(0, m.color);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(m.x * width, m.y * height, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < 95; i++) {
      const cx = ((i * 139) % 990) + 16;
      const cy = ((i * 83) % 450) + 30;
      const cr = 4 + (i % 22);
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.38)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.stroke();

      bCtx.strokeStyle = '#E2E8F0';
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.arc(cx, cy, cr, 0, Math.PI * 2);
      bCtx.stroke();
    }
  }

  // Draw planetary GIS Latitude/Longitude Graticule Grid (every 30 deg)
  ctx.strokeStyle = body === 'mars' ? 'rgba(255, 209, 166, 0.18)' : 'rgba(100, 223, 223, 0.20)';
  ctx.lineWidth = 1;
  for (let lon = 0; lon <= 12; lon++) {
    const x = (lon / 12) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let lat = 1; lat < 6; lat++) {
    const y = (lat / 6) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  // Equator highlight
  ctx.strokeStyle = body === 'mars' ? 'rgba(244, 162, 97, 0.45)' : 'rgba(100, 223, 223, 0.48)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.wrapS = THREE.RepeatWrapping;
  albedo.wrapT = THREE.ClampToEdgeWrapping;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.ClampToEdgeWrapping;

  return { albedo, bump };
}

function latLonToVector3(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const PlanetaryGisGlobe3D: React.FC<PlanetaryGisGlobe3DProps> = ({
  lang,
  selectedId,
  onSelectLandmark,
  activeBody,
  onChangeBody,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Mutable ref state so Three.js loop reads fresh props without recreating WebGLRenderer
  const stateRef = useRef({
    activeBody,
    selectedId,
    targetRotationY: -2.1,
    targetRotationX: 0.12,
    isDragging: false,
    prevX: 0,
    prevY: 0,
  });

  useEffect(() => {
    stateRef.current.activeBody = activeBody;
    stateRef.current.selectedId = selectedId;

    const lm = GIS_LANDMARKS.find((item) => item.id === selectedId);
    if (lm) {
      // Align camera front (+Z) with the landmark longitude
      const theta = (lm.lon + 180) * (Math.PI / 180);
      stateRef.current.targetRotationY = theta - Math.PI / 2;
      stateRef.current.targetRotationX = THREE.MathUtils.degToRad(lm.lat * 0.6);
    }
  }, [activeBody, selectedId]);

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

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.06);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);
    camera.lookAt(0, 0, 0);

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
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Warm key light + cool HemisphereLight fill
    const keyLight = new THREE.DirectionalLight(0xffdcb8, 2.2);
    keyLight.position.set(5, 3, 5);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x64dfdf, 0x241418, 0.65);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x64dfdf, 0.9);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Pre-generate textures for Mars and Moon
    const marsTextures = createPlanetaryTextures('mars');
    const moonTextures = createPlanetaryTextures('moon');
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    marsTextures.albedo.anisotropy = maxAniso;
    moonTextures.albedo.anisotropy = maxAniso;

    // Planetary Group (Composite 3D model: Globe + Orbital Graticule Ring + Atmospheric Halo + 3 Multi-part NSSDCA Beacons)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const planetGeo = new THREE.SphereGeometry(1.68, 48, 36);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marsTextures.albedo,
      bumpMap: marsTextures.bump,
      bumpScale: 0.04,
      roughness: 0.78,
      metalness: 0.12,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    globeGroup.add(planetMesh);

    // Subtle atmosphere / orbital telemetry ring
    const ringGeo = new THREE.TorusGeometry(2.05, 0.008, 12, 96);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.45,
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 2.2;
    globeGroup.add(orbitalRing);

    // Build 3 composite NSSDCA beacon pins on the sphere
    const pinMeshes: THREE.Object3D[] = [];
    const pinGroups: Record<string, THREE.Group> = {};

    const pinBaseGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
    const pinStemGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.22, 12);
    const pinHeadGeo = new THREE.OctahedronGeometry(0.068, 1);

    GIS_LANDMARKS.forEach((lm) => {
      const pinGroup = new THREE.Group();
      const surfacePos = latLonToVector3(lm.lat, lm.lon, 1.68);
      pinGroup.position.copy(surfacePos);
      pinGroup.lookAt(surfacePos.clone().multiplyScalar(2));

      const isMoon = lm.body === 'moon';
      const accentHex = isMoon ? 0x64dfdf : 0xf4a261;

      const baseMat = new THREE.MeshStandardMaterial({
        color: accentHex,
        roughness: 0.25,
        metalness: 0.7,
      });
      const baseMesh = new THREE.Mesh(pinBaseGeo, baseMat);
      baseMesh.rotation.x = Math.PI / 2;
      pinGroup.add(baseMesh);

      const stemMat = new THREE.MeshStandardMaterial({
        color: 0xf8f9fa,
        roughness: 0.5,
        metalness: 0.4,
      });
      const stemMesh = new THREE.Mesh(pinStemGeo, stemMat);
      stemMesh.rotation.x = Math.PI / 2;
      stemMesh.position.z = 0.11;
      pinGroup.add(stemMesh);

      const headMat = new THREE.MeshStandardMaterial({
        color: accentHex,
        emissive: accentHex,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.3,
      });
      const headMesh = new THREE.Mesh(pinHeadGeo, headMat);
      headMesh.position.z = 0.24;
      headMesh.userData = { landmarkId: lm.id, body: lm.body };
      pinGroup.add(headMesh);

      pinMeshes.push(headMesh);
      pinGroups[lm.id] = pinGroup;
      globeGroup.add(pinGroup);
    });

    // Starfield InstancedMesh (40 stars)
    const starGeo = new THREE.OctahedronGeometry(0.022, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const stars = new THREE.InstancedMesh(starGeo, starMat, 40);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const r = 6 + (i % 5) * 1.2;
      dummy.position.set(
        Math.cos(angle) * r,
        ((i % 9) - 4) * 0.9,
        -4 - (i % 4) * 1.5
      );
      dummy.scale.setScalar(0.6 + (i % 3) * 0.35);
      dummy.updateMatrix();
      stars.setMatrixAt(i, dummy.matrix);
    }
    stars.instanceMatrix.needsUpdate = true;
    stars.computeBoundingSphere();
    scene.add(stars);

    let lastRenderedBody: 'mars' | 'moon' = 'mars';
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
      const hits = raycaster.intersectObjects(pinMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData?.landmarkId as GisLandmark['id'] | undefined;
        if (hitId) {
          onSelectLandmark(hitId);
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
      stateRef.current.targetRotationY += dx * 0.008;
      stateRef.current.targetRotationX = THREE.MathUtils.clamp(
        stateRef.current.targetRotationX + dy * 0.006,
        -0.8,
        0.8
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
      const w = container.clientWidth || 640;
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
      const curBody = stateRef.current.activeBody;
      if (curBody !== lastRenderedBody) {
        lastRenderedBody = curBody;
        const tex = curBody === 'mars' ? marsTextures : moonTextures;
        planetMat.map = tex.albedo;
        planetMat.bumpMap = tex.bump;
        planetMat.needsUpdate = true;
        ringMat.color.setHex(curBody === 'mars' ? 0xf4a261 : 0x64dfdf);
      }

      // Show only pins belonging to active planetary body
      GIS_LANDMARKS.forEach((lm) => {
        const grp = pinGroups[lm.id];
        if (grp) {
          grp.visible = lm.body === curBody;
          const isSelected = lm.id === stateRef.current.selectedId;
          grp.scale.setScalar(isSelected ? 1.32 : 1.0);
        }
      });

      const dy = stateRef.current.targetRotationY - globeGroup.rotation.y;
      const dx = stateRef.current.targetRotationX - globeGroup.rotation.x;
      globeGroup.rotation.y += dy * 0.14;
      globeGroup.rotation.x += dx * 0.14;

      const stillMoving = Math.abs(dy) > 0.002 || Math.abs(dx) > 0.002;
      renderer.render(scene, camera);
      return stillMoving;
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
      marsTextures.albedo.dispose();
      marsTextures.bump.dispose();
      moonTextures.albedo.dispose();
      moonTextures.bump.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      renderer.dispose();
    };
  }, [onSelectLandmark]);

  // Trigger render when props change
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [activeBody, selectedId]);

  const activeLandmark = GIS_LANDMARKS.find((l) => l.id === selectedId) ?? GIS_LANDMARKS[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0B1220] overflow-hidden">
      {/* Top GIS Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-[#0E1729]">
        <div className="flex items-center gap-1.5 bg-[#070B14] p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              onChangeBody('mars');
              if (selectedId === 'apollo11') onSelectLandmark('insight');
            }}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeBody === 'mars'
                ? 'bg-[#F4A261] text-[#070B14]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'MARS MOLA GIS' : 'GIS SAO HỎA (MOLA)'}
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeBody('moon');
              onSelectLandmark('apollo11');
            }}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeBody === 'moon'
                ? 'bg-[#64DFDF] text-[#070B14]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {lang === 'en' ? 'MOON LRO GIS' : 'GIS MẶT TRĂNG (LRO)'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            {lang === 'en'
              ? '[VERIFIED NASA/NSSDCA DATA]'
              : '[DỮ LIỆU ĐÃ XÁC MINH NASA/NSSDCA]'}
          </span>
          <div className="flex items-center gap-1 bg-[#070B14] p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                viewMode === '3d' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? '3D Globe' : 'Quả cầu 3D'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                viewMode === '2d' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? '2D Equirectangular' : 'Bản đồ Phẳng 2D'}
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D / 2D Stage */}
      <div className="relative w-full h-[380px] sm:h-[430px] bg-[#070B14]">
        <div
          ref={mountRef}
          data-testid="planetary-gis-globe-canvas"
          className={`w-full h-full cursor-grab active:cursor-grabbing ${
            viewMode === '3d' ? 'block' : 'hidden'
          }`}
        />

        {viewMode === '2d' && (
          <div className="w-full h-full flex items-center justify-center p-4 bg-[#070B14]">
            <svg
              viewBox="0 0 720 360"
              className="w-full h-full rounded-lg border border-slate-800"
              role="img"
              aria-label="2D Equirectangular Planetary GIS Map"
            >
              <rect
                width="720"
                height="360"
                fill={activeBody === 'mars' ? '#431D16' : '#1E293B'}
              />
              {/* Topographic contours */}
              <ellipse
                cx="510"
                cy="240"
                rx="110"
                ry="65"
                fill={activeBody === 'mars' ? '#2A100C' : '#0F172A'}
                opacity="0.65"
              />
              <ellipse
                cx="180"
                cy="155"
                rx="95"
                ry="55"
                fill={activeBody === 'mars' ? '#7C3926' : '#334155'}
                opacity="0.55"
              />
              {/* Graticule grid */}
              {[1, 2, 3, 4, 5].map((i) => (
                <line
                  key={`lat-${i}`}
                  x1="0"
                  y1={i * 60}
                  x2="720"
                  y2={i * 60}
                  stroke="#94A3B8"
                  strokeOpacity="0.22"
                />
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                <line
                  key={`lon-${i}`}
                  x1={i * 60}
                  y1="0"
                  x2={i * 60}
                  y2="360"
                  stroke="#94A3B8"
                  strokeOpacity="0.22"
                />
              ))}
              <line x1="0" y1="180" x2="720" y2="180" stroke="#F4A261" strokeOpacity="0.55" />

              {GIS_LANDMARKS.filter((l) => l.body === activeBody).map((lm) => {
                // Convert lat/lon to 720x360 equirectangular
                const normLon = lm.lon > 180 ? lm.lon - 360 : lm.lon;
                const cx = ((normLon + 180) / 360) * 720;
                const cy = ((90 - lm.lat) / 180) * 360;
                const isSelected = lm.id === selectedId;
                const color = lm.body === 'moon' ? '#64DFDF' : '#F4A261';
                return (
                  <g
                    key={lm.id}
                    onClick={() => onSelectLandmark(lm.id)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 16 : 10}
                      fill={color}
                      fillOpacity="0.25"
                      stroke={color}
                      strokeWidth="2"
                    />
                    <circle cx={cx} cy={cy} r="5" fill={color} />
                    <text
                      x={cx + 14}
                      y={cy + 4}
                      fill="#F8F9FA"
                      fontSize="12"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {lm.nssdcaId} ({lm.coordsLabel})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Solid (non-blur) bottom HUD bar over WebGL canvas */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-[#0B1220] border border-slate-800 px-3.5 py-2 rounded-lg">
          <div className="text-xs font-mono text-slate-300">
            <span className="text-[#F4A261] font-semibold">{activeLandmark.nssdcaId}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span>{activeLandmark.coordsLabel}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className="text-slate-400">{activeLandmark.elevationLabel}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {lang === 'en'
              ? 'Drag globe to rotate · Click NSSDCA markers below'
              : 'Kéo để xoay quả cầu 3D · Nhấn chọn tọa độ NSSDCA bên dưới'}
          </span>
        </div>
      </div>

      {/* Bottom NSSDCA Landmark Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 border-t border-slate-800 bg-[#0D1526]">
        {GIS_LANDMARKS.map((lm) => {
          const isSelected = lm.id === selectedId;
          return (
            <button
              key={lm.id}
              type="button"
              onClick={() => {
                if (lm.body !== activeBody) {
                  onChangeBody(lm.body);
                }
                onSelectLandmark(lm.id);
              }}
              className={`p-3.5 text-left transition-colors ${
                isSelected ? 'bg-[#16233B]' : 'hover:bg-[#121D31]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-mono mb-1">
                <span
                  className={
                    lm.body === 'moon' ? 'text-[#64DFDF] font-semibold' : 'text-[#F4A261] font-semibold'
                  }
                >
                  {lm.nssdcaId}
                </span>
                <span className="text-slate-400">{lm.coordsLabel}</span>
              </div>
              <div className="text-sm font-semibold text-white truncate">{lm.name[lang]}</div>
              <div className="text-xs text-slate-400 truncate mt-0.5">{lm.siteName[lang]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
