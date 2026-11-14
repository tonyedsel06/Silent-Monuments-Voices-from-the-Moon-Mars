import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GIS_LANDMARKS, GisLandmark, Language } from '../data/bilingualContent';
import { DIRECT_NASA_PHOTO_URLS, PLANETARY_MOSAIC_URLS } from '../utils/nasaMedia';

interface PlanetaryGisGlobe3DProps {
  lang: Language;
  selectedId: GisLandmark['id'];
  onSelectLandmark: (id: GisLandmark['id']) => void;
  activeBody: 'mars' | 'moon';
  onChangeBody: (body: 'mars' | 'moon') => void;
}

function drawGraticuleOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, body: 'mars' | 'moon') {
  ctx.strokeStyle = body === 'mars' ? 'rgba(255, 220, 185, 0.22)' : 'rgba(148, 235, 235, 0.22)';
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
  ctx.strokeStyle = body === 'mars' ? 'rgba(244, 162, 97, 0.5)' : 'rgba(100, 223, 223, 0.5)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
}

function createPlanetaryTextures(
  body: 'mars' | 'moon',
  onTextureUpdated: () => void
): {
  albedo: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  dataUrl: string;
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
    // Photographic-grade Viking / MOLA albedo base while real NASA mosaic image loads
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#E8C5B0');
    grad.addColorStop(0.08, '#B85D3B');
    grad.addColorStop(0.32, '#D97948');
    grad.addColorStop(0.52, '#C05A34');
    grad.addColorStop(0.75, '#8F3D24');
    grad.addColorStop(0.93, '#A84E30');
    grad.addColorStop(1, '#F2DDD0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, width, height);

    // Major Martian geological provinces (Tharsis, Valles Marineris, Syrtis Major, Hellas, Elysium)
    const regions = [
      { x: 0.72, y: 0.68, rx: 130, ry: 75, color: 'rgba(68, 26, 18, 0.58)', bump: '#353535' },
      { x: 0.87, y: 0.47, rx: 95, ry: 60, color: 'rgba(238, 145, 92, 0.55)', bump: '#C2C2C2' },
      { x: 0.58, y: 0.44, rx: 70, ry: 90, color: 'rgba(62, 25, 20, 0.62)', bump: '#505050' },
      { x: 0.22, y: 0.46, rx: 115, ry: 85, color: 'rgba(245, 158, 108, 0.58)', bump: '#E5E5E5' },
      { x: 0.33, y: 0.54, rx: 110, ry: 22, color: 'rgba(48, 18, 14, 0.72)', bump: '#1F1F1F' },
      { x: 0.48, y: 0.51, rx: 85, ry: 55, color: 'rgba(92, 38, 26, 0.5)', bump: '#686868' },
    ];

    regions.forEach((f) => {
      const rg = ctx.createRadialGradient(
        f.x * width,
        f.y * height,
        8,
        f.x * width,
        f.y * height,
        Math.max(f.rx, f.ry)
      );
      rg.addColorStop(0, f.color);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.ellipse(f.x * width, f.y * height, f.rx, f.ry, 0, 0, Math.PI * 2);
      ctx.fill();

      bCtx.fillStyle = f.bump;
      bCtx.beginPath();
      bCtx.ellipse(f.x * width, f.y * height, f.rx * 0.75, f.ry * 0.75, 0, 0, Math.PI * 2);
      bCtx.fill();
    });

    for (let i = 0; i < 110; i++) {
      const cx = ((i * 173) % 990) + 16;
      const cy = ((i * 97) % 450) + 30;
      const cr = 3 + (i % 19);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 215, 175, 0.26)' : 'rgba(75, 28, 18, 0.28)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.stroke();

      bCtx.strokeStyle = '#D8D8D8';
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.arc(cx, cy, cr, 0, Math.PI * 2);
      bCtx.stroke();
    }
  } else {
    // Lunar LRO high-contrast photographic-grade mare & highlands base
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#CBD5E1');
    grad.addColorStop(0.25, '#94A3B8');
    grad.addColorStop(0.5, '#78879B');
    grad.addColorStop(0.75, '#94A3B8');
    grad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, width, height);

    const maria = [
      { x: 0.565, y: 0.48, r: 72, color: 'rgba(30, 41, 59, 0.78)' }, // Mare Tranquillitatis
      { x: 0.44, y: 0.34, r: 95, color: 'rgba(30, 41, 59, 0.75)' }, // Mare Imbrium
      { x: 0.55, y: 0.36, r: 64, color: 'rgba(30, 41, 59, 0.72)' }, // Mare Serenitatis
      { x: 0.34, y: 0.48, r: 105, color: 'rgba(30, 41, 59, 0.68)' }, // Oceanus Procellarum
      { x: 0.64, y: 0.45, r: 48, color: 'rgba(25, 35, 52, 0.75)' }, // Mare Crisium
    ];

    maria.forEach((m) => {
      const rg = ctx.createRadialGradient(
        m.x * width,
        m.y * height,
        8,
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

    for (let i = 0; i < 140; i++) {
      const cx = ((i * 139) % 990) + 16;
      const cy = ((i * 83) % 460) + 25;
      const cr = 3 + (i % 24);
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.42)';
      ctx.lineWidth = 1.4;
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

  drawGraticuleOverlay(ctx, width, height, body);

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  albedo.colorSpace = THREE.SRGBColorSpace;
  albedo.wrapS = THREE.RepeatWrapping;
  albedo.wrapT = THREE.ClampToEdgeWrapping;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.ClampToEdgeWrapping;

  // Blend CORS-enabled Lunar LRO photographic texture onto the Moon 3D canvas
  if (body === 'moon') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      try {
        ctx.save();
        ctx.globalAlpha = 0.82;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
        drawGraticuleOverlay(ctx, width, height, body);
        albedo.needsUpdate = true;
        onTextureUpdated();
      } catch {
        // Keep high-detail lunar mare & crater map
      }
    };
    img.src = PLANETARY_MOSAIC_URLS.corsWebglMoon;
  }

  return { albedo, bump, dataUrl: albedoCanvas.toDataURL('image/jpeg', 0.88) };
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
  const [mapBgUrls, setMapBgUrls] = useState<{ mars: string; moon: string }>({
    mars: DIRECT_NASA_PHOTO_URLS.PIA04591,
    moon: DIRECT_NASA_PHOTO_URLS.PIA00405,
  });

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
    scene.background = new THREE.Color(0x1b110d);
    scene.fog = new THREE.FogExp2(0x1b110d, 0.05);

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
    renderer.toneMappingExposure = 1.22;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xffe4c4, 2.5);
    keyLight.position.set(5, 3, 5);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xffd1a6, 0x2d1812, 0.85);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x64dfdf, 1.05);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    let requestRenderFn: () => void = () => {};
    const marsTextures = createPlanetaryTextures('mars', () => requestRenderFn());
    const moonTextures = createPlanetaryTextures('moon', () => requestRenderFn());

    setMapBgUrls({
      mars: marsTextures.dataUrl,
      moon: moonTextures.dataUrl,
    });

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    marsTextures.albedo.anisotropy = maxAniso;
    moonTextures.albedo.anisotropy = maxAniso;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const planetGeo = new THREE.SphereGeometry(1.68, 48, 36);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marsTextures.albedo,
      bumpMap: marsTextures.bump,
      bumpScale: 0.045,
      roughness: 0.72,
      metalness: 0.14,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    globeGroup.add(planetMesh);

    const ringGeo = new THREE.TorusGeometry(2.05, 0.009, 12, 96);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.5,
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.rotation.x = Math.PI / 2.2;
    globeGroup.add(orbitalRing);

    const pinMeshes: THREE.Object3D[] = [];
    const pinGroups: Record<string, THREE.Group> = {};

    const pinBaseGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.022, 16);
    const pinStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.24, 12);
    const pinHeadGeo = new THREE.OctahedronGeometry(0.075, 1);

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
        color: 0xfff8f2,
        roughness: 0.4,
        metalness: 0.5,
      });
      const stemMesh = new THREE.Mesh(pinStemGeo, stemMat);
      stemMesh.rotation.x = Math.PI / 2;
      stemMesh.position.z = 0.12;
      pinGroup.add(stemMesh);

      const headMat = new THREE.MeshStandardMaterial({
        color: accentHex,
        emissive: accentHex,
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.3,
      });
      const headMesh = new THREE.Mesh(pinHeadGeo, headMat);
      headMesh.position.z = 0.25;
      headMesh.userData = { landmarkId: lm.id, body: lm.body };
      pinGroup.add(headMesh);

      pinMeshes.push(headMesh);
      pinGroups[lm.id] = pinGroup;
      globeGroup.add(pinGroup);
    });

    const starGeo = new THREE.OctahedronGeometry(0.024, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffeedd });
    const stars = new THREE.InstancedMesh(starGeo, starMat, 42);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 42; i++) {
      const angle = (i / 42) * Math.PI * 2;
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
        scene.background = new THREE.Color(curBody === 'mars' ? 0x1b110d : 0x131b29);
        ringMat.color.setHex(curBody === 'mars' ? 0xf4a261 : 0x64dfdf);
      }

      GIS_LANDMARKS.forEach((lm) => {
        const grp = pinGroups[lm.id];
        if (grp) {
          grp.visible = lm.body === curBody;
          const isSelected = lm.id === stateRef.current.selectedId;
          grp.scale.setScalar(isSelected ? 1.38 : 1.0);
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

    requestRenderFn = requestRender;

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

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [activeBody, selectedId]);

  const activeLandmark = GIS_LANDMARKS.find((l) => l.id === selectedId) ?? GIS_LANDMARKS[0];

  return (
    <div className="rounded-2xl border border-[#F4A261]/25 bg-[#23140F]/95 overflow-hidden shadow-2xl">
      {/* Top GIS Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#F4A261]/20 bg-[#2C1812]">
        <div className="flex items-center gap-1.5 bg-[#1B0E0A] p-1 rounded-xl border border-[#F4A261]/25">
          <button
            type="button"
            onClick={() => {
              onChangeBody('mars');
              if (selectedId === 'apollo11') onSelectLandmark('insight');
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeBody === 'mars'
                ? 'bg-[#F4A261] text-[#1F110C]'
                : 'text-[#F3E5D8] hover:text-white'
            }`}
          >
            {lang === 'en' ? 'Mars MOLA Globe' : 'Sao Hỏa (MOLA)'}
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeBody('moon');
              onSelectLandmark('apollo11');
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeBody === 'moon'
                ? 'bg-[#64DFDF] text-[#111C28]'
                : 'text-[#F3E5D8] hover:text-white'
            }`}
          >
            {lang === 'en' ? 'Moon LRO Globe' : 'Mặt Trăng (LRO)'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1B0E0A] p-1 rounded-xl border border-[#F4A261]/25">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                viewMode === '3d'
                  ? 'bg-[#3D2219] text-[#FFD1A6]'
                  : 'text-[#F3E5D8]/70 hover:text-white'
              }`}
            >
              {lang === 'en' ? '3D Globe' : 'Quả cầu 3D'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                viewMode === '2d'
                  ? 'bg-[#3D2219] text-[#FFD1A6]'
                  : 'text-[#F3E5D8]/70 hover:text-white'
              }`}
            >
              {lang === 'en' ? '2D Equirectangular' : 'Bản đồ Phẳng 2D'}
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D / 2D Stage */}
      <div className="relative w-full h-[380px] sm:h-[430px] bg-[#1B110D]">
        <div
          ref={mountRef}
          data-testid="planetary-gis-globe-canvas"
          className={`w-full h-full cursor-grab active:cursor-grabbing ${
            viewMode === '3d' ? 'block' : 'hidden'
          }`}
        />

        {viewMode === '2d' && (
          <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4 bg-[#18100C] overflow-hidden">
            <div className="relative w-full h-full rounded-xl border border-[#F4A261]/30 overflow-hidden">
              {/* Real NASA Planetary Photographic Mosaic Background */}
              <img
                src={activeBody === 'mars' ? mapBgUrls.mars : mapBgUrls.moon}
                alt={activeBody === 'mars' ? 'Mars Global Mosaic' : 'Moon Global Mosaic'}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Overlaid Real NASA Orbital Photo for Rich Photographic Texture */}
              <img
                src={
                  activeBody === 'mars'
                    ? DIRECT_NASA_PHOTO_URLS.PIA04591
                    : DIRECT_NASA_PHOTO_URLS.PIA00405
                }
                alt=""
                decoding="async"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-55"
              />

              <svg
                viewBox="0 0 720 360"
                className="relative z-10 w-full h-full"
                role="img"
                aria-label="2D Equirectangular Planetary GIS Map"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={`lat-${i}`}
                    x1="0"
                    y1={i * 60}
                    x2="720"
                    y2={i * 60}
                    stroke="#FFF8F2"
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
                    stroke="#FFF8F2"
                    strokeOpacity="0.22"
                  />
                ))}
                <line x1="0" y1="180" x2="720" y2="180" stroke="#FFD1A6" strokeOpacity="0.65" />

                {GIS_LANDMARKS.filter((l) => l.body === activeBody).map((lm) => {
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
                        r={isSelected ? 18 : 11}
                        fill={color}
                        fillOpacity="0.32"
                        stroke={color}
                        strokeWidth="2.5"
                      />
                      <circle cx={cx} cy={cy} r="5.5" fill="#FFF8F2" stroke={color} strokeWidth="2" />
                      <rect
                        x={Math.min(cx + 12, 520)}
                        y={cy - 14}
                        width="190"
                        height="26"
                        rx="6"
                        fill="#1E110C"
                        fillOpacity="0.88"
                        stroke={color}
                        strokeWidth="1"
                      />
                      <text
                        x={Math.min(cx + 20, 528)}
                        y={cy + 3}
                        fill="#FFF8F2"
                        fontSize="11.5"
                        fontWeight="600"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        {lm.name[lang].split(' ')[0]} ({lm.coordsLabel})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Solid bottom HUD bar over WebGL canvas */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-[#23140F] border border-[#F4A261]/30 px-3.5 py-2 rounded-xl shadow-lg">
          <div className="text-xs font-medium text-[#FFF8F2]">
            <span className="text-[#F4A261] font-bold">{activeLandmark.name[lang]}</span>
            <span className="mx-2 text-[#FFD1A6]/50">·</span>
            <span>{activeLandmark.coordsLabel}</span>
            <span className="mx-2 text-[#FFD1A6]/50">·</span>
            <span className="text-[#FFD1A6]">{activeLandmark.elevationLabel}</span>
          </div>
          <span className="text-xs text-[#F3E5D8]/80">
            {lang === 'en'
              ? 'Drag globe to rotate · Click NSSDCA site cards below'
              : 'Kéo để xoay quả cầu 3D · Nhấn chọn thẻ địa điểm bên dưới'}
          </span>
        </div>
      </div>

      {/* Bottom NSSDCA Landmark Selector Cards with Real NASA Hardware Photography */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#F4A261]/20 border-t border-[#F4A261]/20 bg-[#261510]">
        {GIS_LANDMARKS.map((lm) => {
          const isSelected = lm.id === selectedId;
          const photoUrl = DIRECT_NASA_PHOTO_URLS[lm.nasaPhotoId];
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
              className={`p-3.5 text-left transition-colors flex items-center gap-3 ${
                isSelected ? 'bg-[#3B2117]' : 'hover:bg-[#311B13]'
              }`}
            >
              <img
                src={photoUrl}
                alt={lm.name[lang]}
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-lg object-cover border border-[#F4A261]/35 shrink-0 bg-[#180E0A]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 text-xs mb-0.5">
                  <span
                    className={
                      lm.body === 'moon'
                        ? 'text-[#64DFDF] font-bold'
                        : 'text-[#F4A261] font-bold'
                    }
                  >
                    {lm.nssdcaId}
                  </span>
                  <span className="text-[#FFD1A6]/80 text-[11px] truncate">{lm.coordsLabel}</span>
                </div>
                <div className="text-sm font-semibold text-[#FFF8F2] truncate">{lm.name[lang]}</div>
                <div className="text-xs text-[#F3E5D8]/75 truncate">{lm.siteName[lang]}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
