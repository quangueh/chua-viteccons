/**
 * app3d.js — Chùa Viteccons Online 3D (Three.js + GSAP)
 * Góc nhìn thứ nhất ngồi trong đạo tràng: phật tử chibi 3D quỳ hai bên thảm đỏ,
 * khói hương bay, đèn hoa đăng, chuông - mõ - lư hương bấm trực tiếp trong cảnh.
 * State/nghi thức: window.TempleLocal (standalone.js) | Âm thanh: TempleAudioEngine.
 */
import * as THREE from '/vendor/three.module.js';
import { makeDevotee } from './chars3d.js';

(function () {
  const canvas = document.getElementById('templeCanvas3d');
  const wrapper = document.getElementById('stageWrapper');
  const labelsLayer = document.getElementById('labelsLayer');
  if (!canvas || !wrapper) return;

  // ============================================================
  // RENDERER / SCENE / CAMERA
  // ============================================================
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x140503);
  scene.fog = new THREE.Fog(0x1a0704, 20, 60);

  const camera = new THREE.PerspectiveCamera(44, 16 / 9, 0.1, 200);
  const CAM_HOME = new THREE.Vector3(3.3, 3.0, 9.6);
  const CAM_LOOK = new THREE.Vector3(-0.4, 1.8, -12);
  camera.position.copy(CAM_HOME);
  camera.lookAt(CAM_LOOK);

  function resize() {
    const w = wrapper.clientWidth, h = wrapper.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // ============================================================
  // CAMERA TỰ DO: kéo xoay • cuộn zoom • Shift/chuột phải kéo = dời tầm nhìn • đúp = về chỗ cũ
  // ============================================================
  const camTarget = CAM_LOOK.clone();
  const homeTarget = CAM_LOOK.clone();
  const _off = CAM_HOME.clone().sub(CAM_LOOK);
  const HOME = { dist: _off.length(), yaw: Math.atan2(_off.x, _off.z) };
  HOME.pitch = Math.asin(_off.y / HOME.dist);
  let camDist = HOME.dist, camYaw = HOME.yaw, camPitch = HOME.pitch;
  let camDistGoal = HOME.dist;
  const parallax = new THREE.Vector3();
  const parallaxGoal = new THREE.Vector3();
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));

  function updateCamera() {
    // mượt bằng lerp theo frame — không tween trùng nhau gây giật
    parallax.lerp(parallaxGoal, 0.07);
    camDist += (camDistGoal - camDist) * 0.22;
    const cp = Math.cos(camPitch);
    camera.position.set(
      camTarget.x + camDist * Math.sin(camYaw) * cp + parallax.x,
      camTarget.y + camDist * Math.sin(camPitch) + parallax.y,
      camTarget.z + camDist * Math.cos(camYaw) * cp + parallax.z
    );
    camera.position.y = Math.max(0.4, camera.position.y);
    camera.lookAt(camTarget);
  }

  // Parallax nhẹ theo chuột — chỉ trên canvas, tắt khi đang kéo/pinch để không đánh với orbit
  canvas.addEventListener('pointermove', (e) => {
    if (activePtrs.size > 0) return;
    const r = wrapper.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    parallaxGoal.set(nx * 0.9, -ny * 0.5, 0);
  });
  canvas.addEventListener('pointerleave', () => parallaxGoal.set(0, 0, 0));

  // Kéo = xoay, Shift/chuột phải + kéo = dời tầm nhìn, 2 ngón = pinch zoom
  const activePtrs = new Map();
  let dragMoved = 0, pinchDist = 0, panning = false;
  canvas.style.cursor = 'grab';
  canvas.style.touchAction = 'none';
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { }
    activePtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragMoved = 0;
    panning = e.button === 2 || e.shiftKey;
    if (activePtrs.size === 2) {
      const [a, b] = [...activePtrs.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    const prev = activePtrs.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    activePtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragMoved += Math.abs(dx) + Math.abs(dy);
    if (activePtrs.size === 2) {
      const [a, b] = [...activePtrs.values()];
      const nd = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0 && nd > 0) camDist = camDistGoal = clampN(camDist * pinchDist / nd, 1.6, 34);
      pinchDist = nd;
      return;
    }
    if (dragMoved < 4) return;
    canvas.style.cursor = 'grabbing';
    if (panning) {
      const s = camDist * 0.0016;
      camTarget.x = clampN(camTarget.x - dx * s * Math.cos(camYaw), -9, 9);
      camTarget.z = clampN(camTarget.z + dx * s * Math.sin(camYaw), -14, 6);
      camTarget.y = clampN(camTarget.y + dy * s, 0.4, 5);
    } else {
      camYaw -= dx * 0.005;
      camPitch = clampN(camPitch + dy * 0.004, -0.04, 0.62);
    }
  });
  function endPointer(e) {
    activePtrs.delete(e.pointerId);
    if (activePtrs.size < 2) pinchDist = 0;
    canvas.style.cursor = 'grab';
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('dblclick', () => {
    camTarget.copy(homeTarget);
    camDist = camDistGoal = HOME.dist; camYaw = HOME.yaw; camPitch = HOME.pitch;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camDistGoal = clampN(camDistGoal * (e.deltaY > 0 ? 1.09 : 0.92), 1.6, 34);
  }, { passive: false });

  // ============================================================
  // ÁNH SÁNG ẤM CHÁNH ĐIỆN
  // ============================================================
  scene.add(new THREE.HemisphereLight(0xffd9a0, 0x30100a, 0.9));
  const keyLight = new THREE.DirectionalLight(0xffd9a8, 1.6);
  keyLight.position.set(2, 12, -14);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffc890, 0.85);
  fillLight.position.set(3, 5, 10);
  scene.add(fillLight);
  const cameraGlow = new THREE.PointLight(0xffd0a0, 0.7, 22, 1.8);
  cameraGlow.position.set(3.3, 3.4, 9);
  scene.add(cameraGlow);
  const incenseGlow = new THREE.PointLight(0xff9a3c, 1.4, 10, 2);
  incenseGlow.position.set(0, 1.1, -8.2);
  scene.add(incenseGlow);
  const candleL = new THREE.PointLight(0xffb050, 0.8, 9, 2);
  candleL.position.set(-3.4, 1.6, -10);
  const candleR = candleL.clone();
  candleR.position.x = 3.4;
  scene.add(candleL, candleR);

  // ============================================================
  // NỀN CHÁNH ĐIỆN (ảnh) + SÀN + THẢM ĐỎ 3D
  // ============================================================
  const texLoader = new THREE.TextureLoader();
  const bgTex = texLoader.load('/assets/temple_hall_wide.jpg');
  bgTex.colorSpace = THREE.SRGBColorSpace;
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 25.9),
    new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false })
  );
  backdrop.position.set(-1.2, 4.4, -27);
  scene.add(backdrop);

  // fade dưới chân backdrop hòa vào sàn
  const fadeCvs = document.createElement('canvas');
  fadeCvs.width = 4; fadeCvs.height = 128;
  const fg = fadeCvs.getContext('2d');
  const fgrad = fg.createLinearGradient(0, 0, 0, 128);
  fgrad.addColorStop(0, 'rgba(26,7,4,0)');
  fgrad.addColorStop(1, 'rgba(26,7,4,1)');
  fg.fillStyle = fgrad; fg.fillRect(0, 0, 4, 128);
  const fadeTex = new THREE.CanvasTexture(fadeCvs);
  const seamFade = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 7),
    new THREE.MeshBasicMaterial({ map: fadeTex, transparent: true, depthWrite: false })
  );
  seamFade.position.set(-1.2, -5.2, -26.8);
  scene.add(seamFade);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 48),
    new THREE.MeshStandardMaterial({ color: 0x2a0e07, roughness: 0.96 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -10);
  scene.add(floor);

  // thảm đỏ dẫn lên ban thờ
  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 34),
    new THREE.MeshStandardMaterial({ color: 0x8c1c12, roughness: 0.9 })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.012, -8);
  scene.add(carpet);
  for (const sx of [-1, 1]) {
    const edge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.09, 34),
      new THREE.MeshStandardMaterial({ color: 0xd8a03c, roughness: 0.55, metalness: 0.3 })
    );
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(sx * 0.99, 0.014, -8);
    scene.add(edge);
  }

  // ============================================================
  // LƯ HƯƠNG ĐỒNG + NHANH + KHÓI
  // ============================================================
  const burner = new THREE.Group();
  const bronze = new THREE.MeshStandardMaterial({ color: 0x8a5a22, roughness: 0.45, metalness: 0.7 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.30, 0.34, 20), bronze);
  pot.position.y = 0.30;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 24), bronze);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.47;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.12, 16), bronze);
  foot.position.y = 0.08;
  burner.add(pot, rim, foot);
  burner.position.set(0, 0, -8.3);
  scene.add(burner);

  const incenseSticks = new THREE.Group();
  const stickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6);
  const stickMat = new THREE.MeshStandardMaterial({ color: 0x7a2e18, roughness: 0.9 });
  const emberMat = new THREE.MeshBasicMaterial({ color: 0xffa030 });
  burner.add(incenseSticks);
  function renderIncenseSticks(count) {
    const target = Math.max(3, Math.min(21, Number(count) || 9));
    if (incenseSticks.children.length === target) return;
    incenseSticks.clear();
    for (let i = 0; i < target; i++) {
      const s = new THREE.Mesh(stickGeo, stickMat);
      const a = (i / target) * Math.PI * 2;
      const rr = 0.10 + (i % 3) * 0.07;
      s.position.set(Math.cos(a) * rr, 0.62, Math.sin(a) * rr);
      s.rotation.z = (Math.random() - 0.5) * 0.16;
      s.rotation.x = (Math.random() - 0.5) * 0.16;
      const ember = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), emberMat);
      ember.position.y = 0.28;
      s.add(ember);
      incenseSticks.add(s);
    }
  }
  renderIncenseSticks(9);

  // ---- khói hương: điểm mềm bay lên ----
  function softSprite(inner = 'rgba(255,255,255,0.9)', outer = 'rgba(255,255,255,0)') {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    return t;
  }
  const smokeTex = softSprite('rgba(235,225,215,0.55)', 'rgba(235,225,215,0)');

  function makeSmokeEmitter(origin, count = 40, spread = 0.12) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = origin.x + (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = origin.y + Math.random() * 2.4;
      pos[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;
      seed[i * 2] = Math.random() * Math.PI * 2;
      seed[i * 2 + 1] = 0.25 + Math.random() * 0.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      map: smokeTex, size: 0.55, transparent: true, opacity: 0.35,
      depthWrite: false, blending: THREE.NormalBlending
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData = { seed, origin: origin.clone(), spread, count };
    scene.add(pts);
    return pts;
  }
  const emitters = [makeSmokeEmitter(new THREE.Vector3(0, 0.85, -8.3), 70, 0.35)];

  // bụi vàng lơ lửng trong không gian chùa
  function makeDust() {
    const n = 220;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = 0.4 + Math.random() * 9;
      pos[i * 3 + 2] = -22 + Math.random() * 28;
      seed[i * 2] = Math.random() * Math.PI * 2;
      seed[i * 2 + 1] = 0.05 + Math.random() * 0.1;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      map: softSprite('rgba(255,215,140,0.85)', 'rgba(255,215,140,0)'),
      size: 0.09, transparent: true, opacity: 0.6,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const p = new THREE.Points(geo, mat);
    p.userData = { seed, count: n };
    scene.add(p);
    return p;
  }
  const dust = makeDust();

  // ============================================================
  // PHÁP KHÍ 3D: CHUÔNG / MÕ / ỐNG XĂM (bấm trực tiếp trong cảnh)
  // ============================================================
  const clickables = [];

  // Đại hồng chung bên trái
  const bellGroup = new THREE.Group();
  const bellMat = new THREE.MeshStandardMaterial({ color: 0xc8942e, roughness: 0.3, metalness: 0.85 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a1c10, roughness: 0.8 });
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 16, 0, Math.PI * 2, Math.PI * 0.18, Math.PI * 0.72), bellMat);
  bell.scale.set(1, 1.15, 1);
  bell.position.y = 1.85;
  bellGroup.add(bell);
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.6, 10), woodMat);
    post.position.set(sx * 0.85, 1.3, 0);
    bellGroup.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 0.2), woodMat);
  beam.position.y = 2.66;
  bellGroup.add(beam);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), woodMat);
  rope.position.y = 2.52;
  bellGroup.add(rope);
  bellGroup.position.set(-5.4, 0, -8.6);
  bellGroup.rotation.y = 0.3;
  scene.add(bellGroup);
  bellGroup.userData.ritual = 'bell';
  clickables.push(bellGroup);

  // Mõ gỗ bên phải trên bàn nhỏ
  const mokGroup = new THREE.Group();
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.7), woodMat);
  table.position.y = 0.72;
  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), woodMat);
  leg1.position.set(-0.4, 0.36, -0.25);
  const leg2 = leg1.clone(); leg2.position.z = 0.25;
  const leg3 = leg1.clone(); leg3.position.x = 0.4;
  const leg4 = leg2.clone(); leg4.position.x = 0.4;
  const mok = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 14), new THREE.MeshStandardMaterial({ color: 0x6b3416, roughness: 0.6 }));
  mok.scale.set(1, 0.82, 1);
  mok.position.y = 0.97;
  const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.09, 16),
    new THREE.MeshStandardMaterial({ color: 0xa01820, roughness: 0.9 }));
  cushion.position.y = 0.80;
  mokGroup.add(table, leg1, leg2, leg3, leg4, cushion, mok);
  mokGroup.position.set(5.6, 0, -8.4);
  mokGroup.rotation.y = -0.3;
  scene.add(mokGroup);
  mokGroup.userData.ritual = 'mokugyo';
  clickables.push(mokGroup);

  // Ống xăm tre trên bàn mõ
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: 0xc89858, roughness: 0.7 }));
  tube.position.set(0.32, 1.0, 0.05);
  tube.rotation.z = -0.12;
  mokGroup.add(tube);
  const tubeHit = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.6, 8),
    new THREE.MeshBasicMaterial({ visible: false }));
  tubeHit.position.copy(tube.position);
  mokGroup.add(tubeHit);
  tubeHit.userData.ritual = 'fortune';
  clickables.push(tubeHit);

  // Lư hương cũng bấm được -> thắp hương
  burner.userData.ritual = 'incense';
  clickables.push(burner);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  wrapper.addEventListener('pointerup', (e) => {
    if (e.target !== canvas || dragMoved > 6) return; // kéo xoay ≠ bấm pháp khí
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(clickables, true);
    if (!hits.length) return;
    let g = hits[0].object;
    while (g && !g.userData.ritual) g = g.parent;
    if (!g) return;
    const ritual = g.userData.ritual;
    const { user, wish } = getFormInput();
    if (ritual === 'incense') callRpc('temple.burnIncense', { user, count: 3, wish });
    else if (ritual === 'bell') callRpc('temple.ringBell', { user, count: 1, wish, readTts: true });
    else if (ritual === 'mokugyo') callRpc('temple.strikeWoodenFish', { user, count: 1 });
    else if (ritual === 'fortune') callRpc('temple.drawFortune', { user, topic: wish });
  });

  // ============================================================
  // ĐẠO TRÀNG: ĐÚNG 48 CHIẾU — chiếu luôn hiện, người thật ngồi vào mới hiện
  // ============================================================
  const TOTAL_SEATS = 48;
  const SEATS = [];            // vị trí vật lý 48 chiếu
  const seatChars = [];        // { status, devotee?, labelEl?, occupant? }
  const ROW_Z = [-2.6, -4.6, -6.7, -8.8];
  const COL_X = [1.75, 2.95, 4.15, 5.35, 6.55, 7.75];
  for (const side of [0, 1]) {
    for (let r = 0; r < ROW_Z.length; r++) {
      for (let c = 0; c < COL_X.length; c++) {
        SEATS.push({ x: (side === 0 ? -1 : 1) * (COL_X[c] + 0.3), z: ROW_Z[r], row: r, side });
      }
    }
  }
  // chỉ số ghế: side*24 + row*6 + col (trùng TOTAL_SEATS = 48)

  function addSeatLabel(name) {
    const el = document.createElement('div');
    el.className = 'name-label';
    el.textContent = name;
    labelsLayer.appendChild(el);
    return el;
  }

  // chiếu cói trải sẵn 48 chỗ — trông như sơ đồ ghế rạp phim, có số ghế trên chiếu
  const matGeo = new THREE.CylinderGeometry(0.62, 0.68, 0.10, 18);
  const matMatEmpty = new THREE.MeshStandardMaterial({ color: 0x9a7a3a, roughness: 0.9 });
  const matEdge = new THREE.MeshStandardMaterial({ color: 0x6e4f1e, roughness: 0.85 });
  const matEdgeHot = new THREE.MeshStandardMaterial({ color: 0xe8b84a, emissive: 0x8a5a10, roughness: 0.5 });
  SEATS.forEach((seat, i) => {
    const m = new THREE.Mesh(matGeo, matMatEmpty);
    m.position.set(seat.x, 0.05, seat.z);
    scene.add(m);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 22), matEdge);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(seat.x, 0.10, seat.z);
    scene.add(rim);
    // số ghế in lên chiếu (khớp sơ đồ chọn chỗ)
    const nc = document.createElement('canvas');
    nc.width = 128; nc.height = 64;
    const ng = nc.getContext('2d');
    ng.font = '900 44px "Be Vietnam Pro", sans-serif';
    ng.textAlign = 'center'; ng.textBaseline = 'middle';
    ng.fillStyle = 'rgba(58,32,8,0.55)';
    ng.fillText(String(i + 1), 64, 34);
    const numTex = new THREE.CanvasTexture(nc);
    const num = new THREE.Mesh(
      new THREE.PlaneGeometry(0.66, 0.33),
      new THREE.MeshBasicMaterial({ map: numTex, transparent: true, opacity: 0.75, depthWrite: false })
    );
    num.rotation.x = -Math.PI / 2;
    num.position.set(seat.x, 0.115, seat.z + 0.18);
    scene.add(num);
    seat.mat = m; seat.rim = rim;
    seatChars.push({ status: 'empty', devotee: null, labelEl: null, occupant: null, pendingTween: null });
  });
  // hightlight chiếu khi rê chuột trên sơ đồ chọn chỗ
  window.__seatHover = (idx, on) => {
    const seat = SEATS[idx];
    if (!seat || !seat.rim) return;
    seat.rim.material = on ? matEdgeHot : matEdge;
    seat.rim.scale.setScalar(on ? 1.28 : 1);
  };

  // ============================================================
  // NGƯỜI ĐI LẠI — pool nhân vật đứng, bước ra khỏi ghế / vào chùa / ra về
  // ============================================================
  const travelers = [];
  function getTraveler() {
    let t = travelers.find((x) => !x.busy);
    if (!t) {
      t = { char: makeDevotee({ sitting: false }), busy: false, labelEl: addSeatLabel('') };
      t.char.group.visible = false;
      t.labelEl.classList.add('walker-label');
      scene.add(t.char.group);
      travelers.push(t);
    }
    t.busy = true;
    t.char.group.visible = true;
    t.char.hip.rotation.x = 0;
    return t;
  }
  function releaseTraveler(t) {
    t.busy = false;
    t.char.group.visible = false;
    t.labelEl.textContent = '';
  }

  function faceDir(char, dx, dz) {
    char.group.rotation.y = Math.atan2(dx, dz) + Math.PI;
  }

  // Đi theo waypoint: lắc chân + quay mặt theo hướng đi
  function travelPath(t, waypoints, onDone) {
    const G = window.gsap;
    if (!G) {
      const last = waypoints[waypoints.length - 1];
      t.char.group.position.set(last.x, 0, last.z);
      if (onDone) onDone();
      return;
    }
    const tl = G.timeline({ onComplete: onDone });
    for (const wp of waypoints) {
      const p = t.char.group.position;
      const dist = Math.hypot(wp.x - p.x, wp.z - p.z);
      if (dist < 0.05) continue;
      const dur = Math.max(0.4, dist / 2.6);
      tl.call(() => faceDir(t.char, wp.x - p.x, wp.z - p.z));
      tl.to(p, { x: wp.x, z: wp.z, duration: dur, ease: 'none' });
      tl.to(t.char.legs.l.rotation, { x: 0.55, duration: 0.22, repeat: Math.max(1, Math.floor(dur / 0.44)) - 1, yoyo: true, ease: 'sine.inOut' }, '<');
      tl.to(t.char.legs.r.rotation, { x: -0.55, duration: 0.22, repeat: Math.max(1, Math.floor(dur / 0.44)) - 1, yoyo: true, ease: 'sine.inOut' }, '<');
    }
    tl.call(() => {
      t.char.legs.l.rotation.x = 0;
      t.char.legs.r.rotation.x = 0;
    });
  }

  // Lối đi: vào từ cổng thảm → dọc thảm → ngang qua mép → lọt vào chiếu
  function pathToSeat(seat) {
    const aisleX = Math.sign(seat.x) * 1.32;
    const backZ = seat.z + 0.95; // đi phía sau hàng chiếu để không đâm vào người ngồi
    return [
      { x: 0, z: seat.z + (seat.z < -7 ? 0.9 : -0.6) },
      { x: aisleX, z: seat.z + (seat.z < -7 ? 0.9 : -0.6) },
      { x: aisleX, z: backZ },
      { x: seat.x, z: backZ },
      { x: seat.x, z: seat.z }
    ];
  }
  // Lối đi: từ chiếu → ra mép → dọc lối đi → lên trước lư hương
  function pathSeatToAltar(seat) {
    const aisleX = Math.sign(seat.x) * 1.32;
    const backZ = seat.z + 0.95;
    return [
      { x: seat.x, z: backZ },
      { x: aisleX, z: backZ },
      { x: aisleX, z: -6.9 },
      { x: 0, z: -7.0 }
    ];
  }

  // Người mới vào chùa: từ cổng đi tới chiếu rồi ngồi xuống
  function animateSeatArrival(idx, occupant, onDone) {
    const sc = seatChars[idx];
    const seat = SEATS[idx];
    sc.status = 'walking_in';
    sc.occupant = occupant;
    const t = getTraveler();
    t.labelEl.innerHTML = `<b>${escapeHtml(occupant.name)}</b>`;
    t.char.group.position.set(0, 0, 6.4);
    faceDir(t.char, 0, -1);
    const wps = pathToSeat(seat);
    travelPath(t, wps, () => {
      releaseTraveler(t);
      if (sc.status !== 'walking_in') return; // nghi thức/ra về đã chiếm quyền
      // ngồi xuống: đổi sang nhân vật ngồi tại chiếu
      const dev = makeDevotee({ sitting: true });
      dev.group.position.set(seat.x, 0, seat.z);
      scene.add(dev.group);
      sc.devotee = dev;
      sc.status = 'seated';
      sc.labelEl = addSeatLabel(occupant.name);
      if (isMe(occupant)) sc.labelEl.classList.add('me-label');
      // ngồi xuống nhẹ
      if (window.gsap) {
        dev.group.position.y = 0.35;
        gsap.to(dev.group.position, { y: 0, duration: 0.45, ease: 'bounce.out' });
        gsap.from(dev.group.scale, { y: 1.2, duration: 0.4 });
      }
      if (onDone) onDone();
    });
  }

  // Phật tử ra về: đứng dậy đi ra cổng → mất
  function animateSeatDeparture(idx) {
    const sc = seatChars[idx];
    const seat = SEATS[idx];
    const occ = sc.occupant;
    if (sc.devotee) { scene.remove(sc.devotee.group); sc.devotee = null; }
    if (sc.labelEl) { sc.labelEl.remove(); sc.labelEl = null; }
    sc.status = 'leaving';
    const t = getTraveler();
    t.labelEl.innerHTML = occ ? `<b>${escapeHtml(occ.name)}</b>` : '';
    t.char.group.position.set(seat.x, 0, seat.z);
    const aisleX = Math.sign(seat.x) * 1.32;
    const backZ = seat.z + 0.95;
    const wps = [
      { x: seat.x, z: backZ },
      { x: aisleX, z: backZ },
      { x: aisleX, z: 5.9 },
      { x: 0, z: 6.4 }
    ];
    travelPath(t, wps, () => {
      releaseTraveler(t);
      sc.status = 'empty';
      sc.occupant = null;
    });
  }

  // Hàng chờ ở cổng (bên trái phía sau) — người thật đứng chờ ghế trống
  const queueChars = [];
  const QUEUE_BASE = { x: -4.6, z: 5.6 };
  function renderQueue(queue) {
    const q = Array.isArray(queue) ? queue.slice(0, 8) : [];
    while (queueChars.length < q.length) {
      const c = makeDevotee({ sitting: false });
      c.group.scale.setScalar(0.92);
      scene.add(c.group);
      queueChars.push({ char: c, labelEl: addSeatLabel('') });
    }
    while (queueChars.length > q.length) {
      const c = queueChars.pop();
      scene.remove(c.char.group);
      c.labelEl.remove();
    }
    q.forEach((m, i) => {
      const qc = queueChars[i];
      qc.char.group.position.set(QUEUE_BASE.x - i * 1.0, 0, QUEUE_BASE.z - i * 0.14);
      qc.char.group.rotation.y = 0;
      qc.labelEl.textContent = `#${i + 1} ${shortenName(m.name, 10)}`;
      qc.labelEl.classList.add('queue-label');
      qc.labelAnchor = qc.char.head;
    });
    // ẩn nhãn khi trống
    for (let i = q.length; i < queueChars.length; i++) queueChars[i].labelEl.textContent = '';
  }

  // Người dùng hiện tại — định danh = session id trên kênh chung
  function myUniqueId() {
    if (window.TempleNet) return window.TempleNet.sid;
    const n = sessionStorage.getItem('chua_vt_name') || '';
    return n.toLowerCase().replace(/\s+/g, '');
  }
  function isMe(occ) {
    if (!occ) return false;
    const saved = sessionStorage.getItem('chua_vt_name') || '';
    return (occ.uniqueId && occ.uniqueId === myUniqueId()) || (saved && occ.name === saved && !occ.uniqueId);
  }

  // ============================================================
  // LABEL PROJECTION (DOM theo vị trí 3D)
  // ============================================================
  const _v = new THREE.Vector3();
  function projectToScreen(obj3d, out) {
    obj3d.getWorldPosition(_v);
    _v.project(camera);
    out.x = (_v.x * 0.5 + 0.5) * wrapper.clientWidth;
    out.y = (-_v.y * 0.5 + 0.5) * wrapper.clientHeight;
    out.behind = _v.z > 1;
    return out;
  }

  const proj = { x: 0, y: 0, behind: false };
  function updateLabels() {
    for (const sc of seatChars) {
      if (!sc.labelEl || !sc.devotee || sc.status !== 'seated') continue;
      projectToScreen(sc.devotee.head, proj);
      if (proj.behind || proj.y < -40 || proj.y > wrapper.clientHeight + 40) {
        sc.labelEl.style.display = 'none';
        continue;
      }
      sc.labelEl.style.display = '';
      const dist = camera.position.distanceTo(sc.devotee.group.position);
      const s = Math.min(1.15, Math.max(0.55, 14 / dist));
      sc.labelEl.style.transform = `translate(-50%, -100%) translate(${proj.x}px, ${proj.y - 14}px) scale(${s})`;
    }
    for (const t of travelers) {
      if (!t.busy) { t.labelEl.style.display = 'none'; continue; }
      projectToScreen(t.char.head, proj);
      t.labelEl.style.display = proj.behind ? 'none' : '';
      t.labelEl.style.transform = `translate(-50%, -100%) translate(${proj.x}px, ${proj.y - 10}px)`;
    }
    for (const qc of queueChars) {
      projectToScreen(qc.labelAnchor, proj);
      qc.labelEl.style.display = proj.behind ? 'none' : '';
      qc.labelEl.style.transform = `translate(-50%, -100%) translate(${proj.x}px, ${proj.y - 10}px)`;
    }
    // nhãn đèn hoa đăng bám theo quả đèn
    for (const l of lanterns) {
      _v.copy(l.g.position).project(camera);
      if (_v.z > 1) { l.tag.style.display = 'none'; continue; }
      l.tag.style.display = '';
      l.tag.style.transform = `translate(-50%, 0) translate(${(_v.x * 0.5 + 0.5) * wrapper.clientWidth}px, ${(-_v.y * 0.5 + 0.5) * wrapper.clientHeight + 16}px)`;
    }
  }

  // ============================================================
  // HIỆU ỨNG: hoa đăng, sóng chuông, mưa cánh hoa, popup công đức
  // ============================================================
  const lanterns = [];
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xff6a20, emissive: 0xff7a20, emissiveIntensity: 1.4,
    transparent: true, opacity: 0.95
  });
  const lanternGeo = new THREE.SphereGeometry(0.22, 12, 10);

  function spawnLantern(user, wish) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(lanternGeo, lanternMat.clone());
    body.scale.set(1, 1.25, 1);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: softSprite('rgba(255,160,60,0.5)', 'rgba(255,160,60,0)'),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    glow.scale.setScalar(1.4);
    g.add(glow, body);
    g.position.set((Math.random() - 0.5) * 8, 1.2, -6 + Math.random() * 4);
    scene.add(g);

    const tag = document.createElement('div');
    tag.className = 'lantern-tag';
    tag.innerHTML = `<b>🏮 ${escapeHtml(user)}</b><span>“${escapeHtml(wish)}”</span>`;
    labelsLayer.appendChild(tag);
    const entry = { g, tag, t0: performance.now() };
    lanterns.push(entry);

    if (window.gsap) {
      gsap.to(g.position, { y: 9 + Math.random() * 3, duration: 9, ease: 'none' });
      gsap.to(g.position, { x: g.position.x + (Math.random() - 0.5) * 4, z: g.position.z - 6, duration: 9, ease: 'sine.inOut' });
      gsap.to(body.material, { opacity: 0, duration: 1.5, delay: 7.5 });
      gsap.to(glow.material, { opacity: 0, duration: 1.5, delay: 7.5 });
    }
    setTimeout(() => {
      scene.remove(g); tag.remove();
      const i = lanterns.indexOf(entry);
      if (i >= 0) lanterns.splice(i, 1);
    }, 9200);
  }

  // sóng âm chuông vòng tròn lan ra
  const bellWaves = [];
  function spawnBellWave() {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.028, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0xffc850, transparent: true, opacity: 0.6 })
    );
    ring.position.copy(bell.position).applyMatrix4(bellGroup.matrixWorld);
    ring.lookAt(camera.position);
    scene.add(ring);
    bellWaves.push(ring);
    if (window.gsap) {
      gsap.to(ring.scale, { x: 4.5, y: 4.5, z: 4.5, duration: 1.5, ease: 'power1.out' });
      gsap.to(ring.material, { opacity: 0, duration: 1.5, onComplete: () => scene.remove(ring) });
    }
    // rung chuông
    if (window.gsap) {
      gsap.fromTo(bell.rotation, { z: -0.12 }, { z: 0.12, duration: 0.18, repeat: 5, yoyo: true, ease: 'sine.inOut', onComplete: () => gsap.to(bell.rotation, { z: 0, duration: 0.4 }) });
    }
  }

  // mưa cánh hoa + kim tuyến đại lễ
  function spawnPetalRain(sec = 4) {
    const n = 300;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const palette = [new THREE.Color(0xffd166), new THREE.Color(0xff8fa3), new THREE.Color(0xffe89e), new THREE.Color(0xfff6d8)];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = 4 + Math.random() * 10;
      pos[i * 3 + 2] = -16 + Math.random() * 16;
      const c = palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      seed[i] = 0.7 + Math.random() * 0.8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      map: softSprite('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'),
      vertexColors: true, size: 0.22, transparent: true, opacity: 0.95, depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData = { seed, count: n, dieAt: performance.now() + sec * 1000 };
    scene.add(pts);
    emitters.push(pts); // mượn update loop
  }

  // popup "+N Công Đức" tại toạ độ 3D
  function meritPopup(text, pos3d, color = '#ffe082') {
    const el = document.createElement('div');
    el.className = 'merit-pop';
    el.style.color = color;
    el.textContent = text;
    labelsLayer.appendChild(el);
    _v.copy(pos3d).project(camera);
    const x = (_v.x * 0.5 + 0.5) * wrapper.clientWidth;
    const y = (-_v.y * 0.5 + 0.5) * wrapper.clientHeight;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    setTimeout(() => el.remove(), 2600);
  }

  // ============================================================
  // HÀNH LỄ: phật tử BƯỚC RA KHỎI CHIẾU của mình → lên lư hương →
  // đảnh lễ tam bái HƯỚNG VỀ PHẬT → trở về chỗ ngồi
  // ============================================================
  const ALTAR_POS = new THREE.Vector3(0, 0, -7.0);

  function bowSequence(hip, G, onDone) {
    // Đảnh lễ tam bái: hướng về Phật (rotation.x ÂM = cúi về -z)
    const tl = G.timeline({ onComplete: onDone });
    tl.to(hip.rotation, { x: -0.32, duration: 0.4, ease: 'power2.out' })
      .to(hip.rotation, { x: 0, duration: 0.4 });
    for (let i = 0; i < 3; i++) {
      tl.to(hip.rotation, { x: -1.15, duration: 0.55, ease: 'power2.inOut' }, '+=0.15')
        .to(hip.rotation, { x: -1.15, duration: 0.45 })
        .to(hip.rotation, { x: 0, duration: 0.6, ease: 'power2.inOut' });
    }
    tl.to(hip.rotation, { x: -0.3, duration: 0.4 }, '+=0.2')
      .to(hip.rotation, { x: 0, duration: 0.4 });
  }

  const ritualActors = new Set(); // mỗi người chỉ hành lễ 1 lần — tránh nhân đôi nhân vật

  function walkAndBow(user, actionLabel, wish, seatIdx) {
    const hudName = document.getElementById('devoteeNameLine');
    const hudAct = document.getElementById('devoteeActionTag');
    if (hudName) hudName.textContent = user || 'Thí Chủ';
    if (hudAct) hudAct.textContent = actionLabel || 'Dâng hương';
    incenseGlow.intensity = 2.6;
    if (window.gsap) gsap.to(incenseGlow, { intensity: 1.4, duration: 3 });

    const key = String(user || '').toLowerCase();
    if (ritualActors.has(key)) return; // người này đang hành lễ rồi
    ritualActors.add(key);

    const G = window.gsap;
    const sc = (seatIdx >= 0 && seatIdx < TOTAL_SEATS) ? seatChars[seatIdx] : null;
    const seat = sc ? SEATS[seatIdx] : null;

    // Người có ghế: ẩn nhân vật ngồi → đứng dậy đi lên lư hương
    if (sc && (sc.status === 'seated' || sc.status === 'walking_in')) {
      sc.status = 'ritual';
      if (sc.devotee) sc.devotee.group.visible = false;
      if (sc.labelEl) sc.labelEl.style.display = 'none';
    }
    const t = getTraveler();
    t.labelEl.innerHTML = `<b>${escapeHtml(user)}</b><span>${escapeHtml(actionLabel)}</span>`;
    const startPos = seat ? { x: seat.x, z: seat.z } : { x: 0, z: 6.4 };
    t.char.group.position.set(startPos.x, 0, startPos.z);
    faceDir(t.char, 0, -1);

    const goWps = seat ? pathSeatToAltar(seat) : [{ x: 0, z: -7.0 }];
    travelPath(t, goWps, () => {
      faceDir(t.char, 0, -1); // chắc chắn quay mặt về Phật trước khi lạy
      const finish = () => {
        // Quay về chiếu ngồi xuống (hoặc ra cổng nếu không có ghế)
        if (seat && sc.status === 'ritual') {
          const aisleX = Math.sign(seat.x) * 1.32;
          const backZ = seat.z + 0.95;
          const retWps = [
            { x: aisleX, z: -6.9 },
            { x: aisleX, z: backZ },
            { x: seat.x, z: backZ },
            { x: seat.x, z: seat.z }
          ];
          travelPath(t, retWps, () => {
            releaseTraveler(t);
            ritualActors.delete(key);
            if (!sc.devotee) {
              // chưa kịp ngồi (đang walking_in) → tạo nhân vật ngồi luôn
              const dev = makeDevotee({ sitting: true });
              dev.group.position.set(seat.x, 0, seat.z);
              scene.add(dev.group);
              sc.devotee = dev;
              sc.labelEl = addSeatLabel((sc.occupant && sc.occupant.name) || user);
              if (isMe(sc.occupant || { uniqueId: '' })) sc.labelEl.classList.add('me-label');
            }
            sc.devotee.group.visible = true;
            if (sc.labelEl) sc.labelEl.style.display = '';
            sc.status = 'seated';
          });
        } else {
          travelPath(t, [{ x: 0, z: 6.4 }], () => { releaseTraveler(t); ritualActors.delete(key); });
        }
      };
      if (G) bowSequence(t.char.hip, G, finish);
      else finish();
    });
  }

  // đạo tràng vài người lạy theo (mõ/chuông) — chỉ người đang NGỒI
  function pulseHallBowing() {
    const seated = [];
    seatChars.forEach((sc) => { if (sc.status === 'seated' && sc.devotee) seated.push(sc); });
    for (let i = 0; i < seated.length; i++) {
      if (i % 4 !== 0) continue;
      const d = seated[i].devotee;
      if (window.gsap) {
        gsap.timeline({ delay: (i % 4) * 0.08 })
          .to(d.hip.rotation, { x: -1.1, duration: 0.5, ease: 'power2.inOut' })
          .to(d.hip.rotation, { x: -1.1, duration: 0.35 })
          .to(d.hip.rotation, { x: 0, duration: 0.55, ease: 'power2.inOut' });
      }
    }
  }

  // ============================================================
  // WIRING UI — TempleLocal + nút bấm + modal + HUD (giữ nguyên hợp đồng live.js)
  // ============================================================
  const audio = new window.TempleAudioEngine();
  function unlockAudioOnce() {
    audio.ensureContext();
    const btn = document.getElementById('btnUnlockAudio');
    if (btn) {
      btn.textContent = '✅ Âm Thanh Chùa Đã Sẵn Sàng';
      btn.classList.remove('gold');
      btn.classList.add('active-toggle');
    }
  }
  window.addEventListener('pointerdown', unlockAudioOnce, { once: true });

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shortenName(name, maxLen = 13) {
    const str = String(name || '');
    return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
  }

  let lastLbSig = '';
  function updateUIState(st) {
    if (!st) return;
    document.getElementById('statIncense').textContent = Number(st.totalIncense || 0).toLocaleString('vi-VN');
    document.getElementById('statMerit').textContent = Number(st.totalMerit || 0).toLocaleString('vi-VN');
    const wf = document.getElementById('statWoodenFish');
    if (wf) wf.textContent = Number(st.woodenFishHits || 0).toLocaleString('vi-VN');
    renderIncenseSticks(st.activeIncenseSticks || 9);

    const lb = Array.isArray(st.leaderboard) ? st.leaderboard : [];

    // ── Đồng bộ 48 chiếu với người thật đang ngồi ──
    if (Array.isArray(st.seats)) {
      for (let i = 0; i < Math.min(TOTAL_SEATS, st.seats.length); i++) {
        const occ = st.seats[i];
        const sc = seatChars[i];
        if (occ && sc.status === 'empty') {
          animateSeatArrival(i, occ);
        } else if (!occ && (sc.status === 'seated' || sc.status === 'walking_in')) {
          animateSeatDeparture(i);
        } else if (occ && sc.status === 'seated' && sc.occupant && sc.occupant.name !== occ.name) {
          // ghế đã đổi chủ trong lúc hành lễ — cập nhật nhãn
          sc.occupant = occ;
          if (sc.labelEl) sc.labelEl.textContent = occ.name;
        }
      }
    }
    if (Array.isArray(st.queue)) renderQueue(st.queue);
    // sơ đồ chọn chiếu cập nhật trực tiếp khi người khác vào/ra
    if (document.getElementById('seatModal')?.classList.contains('visible')) renderSeatPicker();
    const freeCount = Array.isArray(st.seats) ? st.seats.filter((s) => !s).length : TOTAL_SEATS;
    const seatStat = document.getElementById('statSeats');
    if (seatStat) seatStat.textContent = `${TOTAL_SEATS - freeCount}/${TOTAL_SEATS}`;
    const qStat = document.getElementById('statQueue');
    if (qStat) qStat.textContent = String((st.queue || []).length);
    refreshOnlineCount(st);

    const lbList = document.getElementById('leaderboardList');
    if (lbList) {
      lbList.innerHTML = lb.length
        ? lb.slice(0, 4).map((item) => `
        <div class="leader-item">
          <span class="leader-rank">${item.rank}</span>
          <span class="leader-name">${escapeHtml(shortenName(item.name, 14))}</span>
          <span class="leader-merit">${Number(item.merit).toLocaleString('vi-VN')}</span>
        </div>`).join('')
        : '<div class="event-feed-empty">Chưa có ai dâng lễ — hãy là người đầu tiên 🙏</div>';
    }

    const liveText = document.getElementById('liveStatusText');
    if (liveText) liveText.textContent = 'CHÙA VITECCONS • ĐỨC PHẬT A DI ĐÀ';
    if (st.settings) {
      if (typeof st.settings.musicVolume === 'number') {
        audio.setMusicVolume(st.settings.musicVolume);
        const s = document.getElementById('sliderMusicVol'), v = document.getElementById('valMusicVol');
        const pct = Math.round(st.settings.musicVolume * 100);
        if (s) s.value = String(pct); if (v) v.textContent = `${pct}%`;
      }
      if (typeof st.settings.ttsVolume === 'number') {
        audio.setTtsVolume(st.settings.ttsVolume);
        const s = document.getElementById('sliderTtsVol'), v = document.getElementById('valTtsVol');
        const pct = Math.round(st.settings.ttsVolume * 100);
        if (s) s.value = String(pct); if (v) v.textContent = `${pct}%`;
      }
    }

    const feed = document.getElementById('eventFeed');
    if (feed && Array.isArray(st.recentEvents)) {
      feed.innerHTML = st.recentEvents.length
        ? st.recentEvents.slice(0, 8).map((ev) => `<div class="event-feed-item">${formatEventSummary(ev)}</div>`).join('')
        : '<div class="event-feed-empty">Nhật ký trống — mọi công đức đều do người thật ghi nhận</div>';
    }
  }

  function formatEventSummary(ev) {
    switch (ev.type) {
      case 'burnIncense': return `🔥 <strong>${escapeHtml(ev.user)}</strong> dâng ${ev.count} nén nhang (+${ev.merit} CĐ)`;
      case 'strikeWoodenFish': return `🪵 <strong>${escapeHtml(ev.user)}</strong> gõ mõ ${ev.count} nhịp (+${ev.merit} CĐ)`;
      case 'ringBell': return `🔔 <strong>${escapeHtml(ev.user)}</strong> thỉnh Đại Hồng Chung (+${ev.merit} CĐ)`;
      case 'sendPrayer': return `🏮 <strong>${escapeHtml(ev.user)}</strong> cầu phúc: “${escapeHtml(ev.wish)}”`;
      case 'offerGift':
      case 'grandCeremony': return `🪷 <strong>${escapeHtml(ev.user)}</strong> dâng <em>${escapeHtml(ev.giftName)}</em> (+${ev.merit} CĐ)`;
      case 'drawFortune': return `🎋 <strong>${escapeHtml(ev.user)}</strong> gieo được Quẻ số ${ev.fortune?.number} (${ev.fortune?.rank})`;
      case 'seatTaken': return `🪷 <strong>${escapeHtml(ev.user)}</strong> vào chùa, ngồi chiếu số ${(ev.seatIdx ?? 0) + 1}`;
      case 'seatVacated': return `🚪 <strong>${escapeHtml(ev.user)}</strong> công phu xong, ra về`;
      case 'queued': return `⏳ <strong>${escapeHtml(ev.user)}</strong> xếp hàng chờ (vị trí #${ev.position})`;
      default: return `✨ <strong>${escapeHtml(ev.user || 'Thí chủ')}</strong> tương tác`;
    }
  }

  let fortuneTimer = null;
  let grandTimer = null;

  function showFortuneModal(user, fortune) {
    if (!fortune) return;
    const modal = document.getElementById('fortuneModal');
    document.getElementById('fortuneRankBadge').textContent = fortune.rank.toUpperCase();
    document.getElementById('fortuneTitle').textContent = `Quẻ Số ${fortune.number} — ${fortune.title}`;
    document.getElementById('fortuneDevotee').textContent = `Thí chủ cầu quẻ: ${user}`;
    document.getElementById('fortunePoem').textContent = fortune.poem;
    document.getElementById('fortuneMeaning').textContent = `Lời bàn: ${fortune.meaning}`;
    modal.classList.add('visible');
    clearTimeout(fortuneTimer);
    fortuneTimer = setTimeout(() => modal.classList.remove('visible'), 15000);
  }
  document.getElementById('fortuneModal')?.addEventListener('click', () => {
    document.getElementById('fortuneModal').classList.remove('visible');
  });

  function showGrandCeremonyBanner(user, giftName, merit) {
    const banner = document.getElementById('grandCeremonyBanner');
    document.getElementById('grandTitle').textContent = `🐉 ${giftName.toUpperCase()} 🐉`;
    document.getElementById('grandSub').textContent = `Đại Thí Chủ ${user} • Công Đức Vô Lượng (+${merit} CĐ)`;
    banner.classList.add('visible');
    clearTimeout(grandTimer);
    grandTimer = setTimeout(() => banner.classList.remove('visible'), 6800);
  }

  const BURNER_POS = new THREE.Vector3(0, 1.1, -8.3);
  function triggerRitualVisuals(ev) {
    if (!ev) return;
    if (ev.type === 'seatTaken' && isMe(ev)) {
      toast(`🪷 Đến lượt bạn! ${ev.user} ngồi chiếu số ${ev.seatIdx + 1}`);
      refreshSeatStatus();
    }
    if (ev.type === 'queued' && isMe(ev)) {
      toast(`⏳ Đạo tràng kín — bạn đang xếp hàng vị trí #${ev.position}`);
      refreshSeatStatus();
    }
    if (ev.type === 'seatLost' && isMe(ev)) {
      toast('⚠️ Chiếu vừa có người đến trước — bạn đang xếp hàng, đến lượt sẽ được vào');
      refreshSeatStatus();
    }
    if (ev.ttsText && ev.type !== 'drawFortune') {
      audio.enqueueTts(ev.ttsText, { voice: ev.ttsVoice || 'maichi' });
    }
    switch (ev.type) {
      case 'burnIncense':
        audio.playIncenseChime();
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS.clone().add(new THREE.Vector3(0, 0.8, 0)), '#ffe082');
        walkAndBow(ev.user, `🔥 Dâng ${ev.count} nén hương (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx);
        break;
      case 'strikeWoodenFish':
        audio.playWoodenFish();
        pulseHallBowing();
        meritPopup(`+${ev.merit} Công Đức`, new THREE.Vector3(5.6, 1.6, -8.4), '#ffd54f');
        if (window.gsap) gsap.fromTo(mok.scale, { y: 0.7 }, { y: 0.82, duration: 0.3, ease: 'elastic.out' });
        break;
      case 'ringBell':
        audio.playTempleBell(1.0);
        pulseHallBowing();
        spawnBellWave();
        meritPopup(`+${ev.merit} Công Đức`, new THREE.Vector3(-5.4, 2.6, -8.6), '#fff3b0');
        walkAndBow(ev.user, `🔔 Thỉnh Đại Hồng Chung (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx);
        break;
      case 'sendPrayer':
        audio.playIncenseChime();
        spawnLantern(ev.user, ev.wish);
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS, '#ffb74d');
        walkAndBow(ev.user, `🏮 Cầu phúc (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx);
        break;
      case 'offerGift':
        audio.playIncenseChime();
        audio.playTempleBell(0.85);
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS.clone().add(new THREE.Vector3(0, 0.9, 0)), '#fff3b0');
        walkAndBow(ev.user, `🪷 Dâng ${ev.giftName} (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx);
        break;
      case 'grandCeremony':
        audio.playTempleBell(1.2);
        setTimeout(() => audio.playTempleBell(1.1), 900);
        spawnPetalRain(5);
        pulseHallBowing();
        showGrandCeremonyBanner(ev.user, ev.giftName, ev.merit);
        walkAndBow(ev.user, `🐉 ${ev.giftName} (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx);
        break;
      case 'drawFortune':
        audio.playFortuneShake();
        if (ev.remote || !ev.ttsText) {
          // nghi thức của người khác — không có TTS, hiển thị trực tiếp
          audio.playIncenseChime();
          showFortuneModal(ev.user, ev.fortune);
          walkAndBow(ev.user, `🎋 Quẻ số ${ev.fortune?.number || '?'} (${ev.fortune?.rank || 'Linh Xăm'})`, '', ev.seatIdx);
          clearTimeout(fortuneTimer);
          fortuneTimer = setTimeout(() => document.getElementById('fortuneModal')?.classList.remove('visible'), 6000);
          break;
        }
        audio.enqueueTts(ev.ttsText || '', {
          voice: ev.ttsVoice || 'maichi',
          onStart: () => {
            audio.playIncenseChime();
            showFortuneModal(ev.user, ev.fortune);
            walkAndBow(ev.user, `🎋 Quẻ số ${ev.fortune?.number} (${ev.fortune?.rank})`, ev.fortune?.meaning || '', ev.seatIdx);
          },
          onEnd: () => {
            clearTimeout(fortuneTimer);
            fortuneTimer = setTimeout(() => document.getElementById('fortuneModal')?.classList.remove('visible'), 1800);
          }
        });
        break;
    }
  }

  function getFormInput() {
    const savedName = sessionStorage.getItem('chua_vt_name') || '';
    const savedWish = localStorage.getItem('chua_vt_wish') || '';
    const nameEl = document.getElementById('inputDevoteeName');
    const wishEl = document.getElementById('inputDevoteeWish');
    if (nameEl && savedName && !nameEl.value.trim()) nameEl.value = savedName;
    if (wishEl && savedWish && !wishEl.value.trim()) wishEl.value = savedWish;
    const user = nameEl?.value.trim() || 'Thí Chủ Viteccons';
    const wish = wishEl?.value.trim() || 'Cầu cho gia đình bình an, công trình thuận lợi';
    try {
      sessionStorage.setItem('chua_vt_name', user);
      localStorage.setItem('chua_vt_wish', wish);
    } catch (_) { }
    return { user, wish };
  }

  async function callRpc(method, params = {}) {
    audio.ensureContext();
    const res = window.TempleLocal?.handleRpc(method, params);
    if (res?.state) updateUIState(res.state);
    if (res?.event) triggerRitualVisuals(res.event);
    refreshSeatStatus();
    return res;
  }

  // ============================================================
  // GHI DANH + CHỌN CHIẾU (kiểu ghế rạp phim) + THOÁT WEB MẤT GHẾ
  // ============================================================
  function refreshSeatStatus(st) {
    const el = document.getElementById('seatStatus');
    if (!el) return;
    const state = st || window.TempleLocal?.getState();
    if (!state) return;
    const saved = sessionStorage.getItem('chua_vt_name');
    if (!saved) { el.textContent = 'Chưa ghi danh — để lại pháp danh để chọn chiếu'; return; }
    const uid = myUniqueId();
    const mine = (state.seats || []).find((s) => s && (s.uniqueId === uid || s.name === saved));
    if (mine) {
      el.innerHTML = `🪷 <b>${escapeHtml(saved)}</b> đang ngồi chiếu số <b>${mine.seatIdx + 1}</b>`;
      return;
    }
    const qIdx = (state.queue || []).findIndex((q) => q.uniqueId === uid || q.name === saved);
    if (qIdx >= 0) {
      el.innerHTML = `⏳ <b>${escapeHtml(saved)}</b> đang xếp hàng — vị trí <b>#${qIdx + 1}</b>`;
      return;
    }
    el.innerHTML = `Đã ghi danh <b>${escapeHtml(saved)}</b> — bấm <b>Ghi Danh & Chọn Chiếu</b> để chọn chỗ`;
  }

  function refreshOnlineCount(st) {
    const el = document.getElementById('statOnline');
    if (el) el.textContent = String(st?.onlineCount ?? 1);
  }

  function renderSeatPicker() {
    const state = window.TempleLocal?.getState();
    if (!state || !Array.isArray(state.seats)) return;
    const gridL = document.getElementById('seatGridL');
    const gridR = document.getElementById('seatGridR');
    if (!gridL || !gridR) return;
    gridL.innerHTML = ''; gridR.innerHTML = '';
    // Sơ đồ như rạp phim: bàn thờ trên đỉnh, lối đi giữa.
    // Cánh TRÁI: cột trong sơ đồ đảo ngược để cột sát lối đi nằm bên PHẢI cánh trái (đúng vị trí thật)
    const cells = [[], []];
    for (let i = 0; i < TOTAL_SEATS; i++) {
      const occ = state.seats[i];
      const side = i < 24 ? 0 : 1;                 // 0 = trái, 1 = phải
      const row = Math.floor((i % 24) / 6), col = i % 6;
      const vcol = side === 0 ? 5 - col : col;     // lật gương cột cánh trái
      const btn = document.createElement('button');
      btn.className = 'seat-cell';
      btn.title = `Chiếu số ${i + 1} — hàng ${row + 1}, cột ${col + 1} ${side === 0 ? 'trái' : 'phải'}`;
      btn.addEventListener('mouseenter', () => window.__seatHover?.(i, true));
      btn.addEventListener('mouseleave', () => window.__seatHover?.(i, false));
      if (occ) {
        btn.classList.add(isMe(occ) ? 'mine' : 'taken');
        btn.innerHTML = `<span class="cell-num">${i + 1}</span><span class="cell-name">${escapeHtml(shortenName(occ.name, 8))}</span>`;
        if (isMe(occ)) btn.title += ' — ghế của bạn';
      } else {
        btn.classList.add('free');
        btn.innerHTML = `<span class="cell-num">${i + 1}</span>`;
        btn.addEventListener('click', () => pickSeat(i));
      }
      cells[side][row * 6 + vcol] = btn;
    }
    gridL.append(...cells[0]);
    gridR.append(...cells[1]);
  }

  async function pickSeat(idx) {
    const nameEl = document.getElementById('inputDevoteeName');
    const user = (nameEl?.value.trim()) || sessionStorage.getItem('chua_vt_name') || '';
    if (!user) { toast('Hãy để lại pháp danh trước đã 🙏'); return; }
    try { sessionStorage.setItem('chua_vt_name', user); } catch (_) { }
    const res = await callRpc('temple.pickSeat', { user, seatIdx: idx });
    if (res?.error === 'occupied') {
      toast('Chiếu này vừa có người ngồi — chọn chỗ khác');
      renderSeatPicker();
    } else if (res?.seatIdx !== undefined) {
      document.getElementById('seatModal')?.classList.remove('visible');
      toast(`🪷 ${user} ngồi chiếu số ${res.seatIdx + 1} — Nam mô A Di Đà Phật`);
    }
  }

  async function registerFlow(user) {
    try { sessionStorage.setItem('chua_vt_name', user); } catch (_) { }
    const res = await callRpc('temple.register', { user });
    refreshSeatStatus(res?.state);
    if (res?.seatIdx !== undefined) {
      toast(`🪷 ${user} ngồi chiếu số ${res.seatIdx + 1} — Nam mô A Di Đà Phật`);
    } else if (res?.queued) {
      toast(`Đạo tràng đã kín 48/48 — ${user} đang xếp hàng vị trí #${res.position}`);
    } else {
      const modal = document.getElementById('seatModal');
      if (modal) { renderSeatPicker(); modal.classList.add('visible'); }
    }
  }

  async function doRegister() {
    const nameEl = document.getElementById('inputDevoteeName');
    const user = nameEl?.value.trim() || '';
    if (!user) {
      toast('Người muốn ghi danh phải để lại pháp danh 🙏');
      nameEl?.focus();
      return;
    }
    await registerFlow(user);
  }

  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById('templeToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'templeToast';
      el.className = 'temple-toast';
      wrapper.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3800);
  }

  // Thoát/đóng web → nhả ghế ngay, vào lại phải xếp hàng/chọn lại
  function releaseMySeat() {
    const saved = sessionStorage.getItem('chua_vt_name');
    if (!saved || !window.TempleLocal) return;
    window.TempleLocal.handleRpc('temple.leaveSeat', { user: saved });
  }
  window.addEventListener('pagehide', releaseMySeat);
  window.addEventListener('beforeunload', releaseMySeat);

  // ---- nút HUD + dock ----
  const bind = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
  bind('cardIncense', () => { const { user, wish } = getFormInput(); callRpc('temple.burnIncense', { user, count: 3, wish }); });
  bind('cardBlessing', () => { const { user, wish } = getFormInput(); callRpc('temple.sendPrayer', { user, wish }); });
  bind('cardLotus', () => { const { user, wish } = getFormInput(); callRpc('temple.offerGift', { user, giftType: 'lotus', coins: 20, giftName: 'Đài Hoa Sen Vàng', wish }); });
  bind('btnRpcIncense', () => { const { user, wish } = getFormInput(); callRpc('temple.burnIncense', { user, count: 3, wish }); });
  bind('btnRpcLantern', () => { const { user, wish } = getFormInput(); callRpc('temple.sendPrayer', { user, wish }); });
  bind('btnRpcWoodenFish', () => { const { user } = getFormInput(); callRpc('temple.strikeWoodenFish', { user, count: 5 }); });
  bind('btnRpcBell', () => { const { user, wish } = getFormInput(); callRpc('temple.ringBell', { user, count: 1, wish, readTts: true }); });
  bind('btnRpcFortune', () => { const { user, wish } = getFormInput(); callRpc('temple.drawFortune', { user, topic: wish }); });
  bind('btnRpcGiftLotus', () => { const { user, wish } = getFormInput(); callRpc('temple.offerGift', { user, giftType: 'lotus', coins: 20, giftName: 'Đài Hoa Sen Vàng', wish }); });
  bind('btnRpcGrandCeremony', () => { const { user, wish } = getFormInput(); callRpc('temple.grandCeremony', { user, coins: 299, giftName: 'Đại Lễ Kim Long Chầu Phật', wish }); });
  bind('btnRegister', doRegister);
  bind('btnCloseSeatModal', () => document.getElementById('seatModal')?.classList.remove('visible'));
  // bấm ra ngoài panel cũng đóng
  document.getElementById('seatModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'seatModal') e.currentTarget.classList.remove('visible');
  });

  bind('btnToggleTts', (e) => {
    audio.ttsEnabled = !audio.ttsEnabled;
    e.currentTarget.textContent = `🎙️ Giọng Đọc: ${audio.ttsEnabled ? 'BẬT' : 'TẮT'}`;
    e.currentTarget.classList.toggle('active-toggle', audio.ttsEnabled);
  });
  bind('btnToggleMusic', (e) => {
    audio.bgMusicEnabled = !audio.bgMusicEnabled;
    if (audio.bgMusicEnabled) audio.startZenAmbience(); else audio.stopZenAmbience();
    e.currentTarget.textContent = `🎵 Nhạc Nền: ${audio.bgMusicEnabled ? 'BẬT' : 'TẮT'}`;
    e.currentTarget.classList.toggle('active-toggle', audio.bgMusicEnabled);
  });

  const syncTrackBtns = () => {
    document.getElementById('btnTrackDaibi')?.classList.toggle('active-toggle', audio.bgTrackId === 'daibi');
    document.getElementById('btnTrackZen')?.classList.toggle('active-toggle', audio.bgTrackId === 'zen');
  };
  bind('btnTrackDaibi', () => { audio.ensureContext(); audio.setTrack('daibi'); syncTrackBtns(); });
  bind('btnTrackZen', () => { audio.ensureContext(); audio.setTrack('zen'); syncTrackBtns(); });
  syncTrackBtns();

  // ═══ KHUNG CHAT REALTIME ═══
  const chatPanel = document.getElementById('chatPanel');
  const chatMsgs = document.getElementById('chatMsgs');
  const chatInput = document.getElementById('chatInput');
  const chatBadge = document.getElementById('chatBadge');
  let chatUnread = 0;
  let lastChatSend = 0;
  const chatLoadTs = Date.now(); // tin cũ hơn mốc này là lịch sử — render nhưng không đếm unread
  let chatEmptyEl = chatMsgs?.querySelector('.chat-empty') || null;

  const chatNameColor = (uid) => {
    let h = 0;
    for (let i = 0; i < String(uid || '').length; i++) h = (h * 31 + String(uid).charCodeAt(i)) >>> 0;
    return `hsl(${h % 360}, 72%, 72%)`;
  };
  const chatNearBottom = () => {
    if (!chatMsgs) return true;
    return chatMsgs.scrollHeight - chatMsgs.scrollTop - chatMsgs.clientHeight < 60;
  };
  const bumpUnread = () => {
    if (!chatPanel?.classList.contains('collapsed') || !chatBadge) return;
    chatUnread++;
    chatBadge.textContent = String(chatUnread);
    chatBadge.hidden = false;
  };
  const appendChat = (m) => {
    if (!chatMsgs) return;
    if (chatEmptyEl) { chatEmptyEl.remove(); chatEmptyEl = null; }
    const wasNear = chatNearBottom();
    const row = document.createElement('div');
    const mine = m.uniqueId && m.uniqueId === (window.TempleNet?.sid || '');
    row.className = 'chat-msg' + (mine ? ' mine' : '');
    const d = new Date(m.ts || Date.now());
    const hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    row.innerHTML = `<span class="chat-name" style="color:${chatNameColor(m.uniqueId)}">${escapeHtml(m.user || 'Thí Chủ')}</span><span>${escapeHtml(m.text || '')}</span><span class="chat-time">${hh}</span>`;
    chatMsgs.appendChild(row);
    while (chatMsgs.children.length > 1000) chatMsgs.firstChild.remove(); // trần DOM — lịch sử đầy đủ nằm trong DB
    if (mine || (m.ts && m.ts < chatLoadTs - 5000)) {
      chatMsgs.scrollTop = chatMsgs.scrollHeight; // tin của mình hoặc tin lịch sử — cuộn xuống, không badge
    } else if (wasNear && !chatPanel?.classList.contains('collapsed')) {
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    } else bumpUnread();
  };
  const recentOwn = []; // text vừa gửi — echo Firebase của mình quay về thì bỏ qua (đã render lạc quan)
  const sendChatMsg = () => {
    const text = (chatInput?.value || '').trim();
    if (!text || !window.TempleNet) return;
    const t = Date.now();
    if (t - lastChatSend < 1500) return;
    lastChatSend = t;
    recentOwn.push(text);
    if (recentOwn.length > 10) recentOwn.shift();
    window.TempleNet.sendChat(text);
    appendChat({ user: sessionStorage.getItem('chua_vt_name') || 'Bạn', uniqueId: window.TempleNet.sid, text, ts: t });
    chatInput.value = '';
  };
  if (window.TempleNet) window.TempleNet.onChat = (m) => {
    if (m.uniqueId === window.TempleNet.sid) {
      const i = recentOwn.indexOf(m.text);
      if (i >= 0) { recentOwn.splice(i, 1); return; } // echo tin vừa gửi — đã render
    }
    appendChat(m);
  };
  bind('btnChatSend', sendChatMsg);
  chatInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMsg(); });
  const toggleChat = () => {
    chatPanel?.classList.toggle('collapsed');
    if (!chatPanel?.classList.contains('collapsed') && chatBadge) {
      chatUnread = 0;
      chatBadge.hidden = true;
      if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
  };
  bind('btnChatToggle', toggleChat);
  document.getElementById('chatHead')?.addEventListener('click', (e) => {
    if (e.target.id !== 'btnChatToggle') toggleChat();
  });
  // mặc định thu gọn cho gọn màn — có tin mới sẽ hiện badge
  chatPanel?.classList.add('collapsed');

  // ── Cổng pháp danh: chưa ghi danh → bắt buộc nhập tên trước khi vào chùa ──
  const gateInput = document.getElementById('gateNameInput');
  const enterTemple = () => {
    const user = (gateInput?.value || '').trim();
    if (!user) { gateInput?.focus(); return; }
    document.documentElement.classList.remove('need-name');
    const nameEl = document.getElementById('inputDevoteeName');
    if (nameEl) nameEl.value = user;
    registerFlow(user);
  };
  bind('btnGateEnter', enterTemple);
  gateInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') enterTemple(); });
  if (document.documentElement.classList.contains('need-name')) setTimeout(() => gateInput?.focus(), 350);

  const sMus = document.getElementById('sliderMusicVol');
  if (sMus) {
    sMus.addEventListener('input', (e) => {
      const pct = Number(e.target.value);
      document.getElementById('valMusicVol').textContent = `${pct}%`;
      audio.ensureContext(); audio.setMusicVolume(pct / 100);
    });
    sMus.addEventListener('change', (e) => callRpc('temple.updateSettings', { musicVolume: +(Number(e.target.value) / 100).toFixed(2) }));
  }
  const sTts = document.getElementById('sliderTtsVol');
  if (sTts) {
    sTts.addEventListener('input', (e) => {
      const pct = Number(e.target.value);
      document.getElementById('valTtsVol').textContent = `${pct}%`;
      audio.ensureContext(); audio.setTtsVolume(pct / 100);
    });
    sTts.addEventListener('change', (e) => callRpc('temple.updateSettings', { ttsVolume: +(Number(e.target.value) / 100).toFixed(2) }));
  }

  // ---- kết nối engine local ----
  if (window.TempleLocal) {
    TempleLocal.onEvent = ({ state, event }) => {
      if (state) updateUIState(state);
      if (event) triggerRitualVisuals(event);
      refreshSeatStatus(state);
    };
    updateUIState(TempleLocal.getState());
  }

  // ============================================================
  // RENDER LOOP: thở nhẹ, khói, bụi, labels, camera
  // ============================================================
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // thở nhẹ cho đạo tràng (chỉ người đang ngồi)
    let bi = 0;
    for (const sc of seatChars) {
      if (sc.status !== 'seated' || !sc.devotee) continue;
      sc.devotee.group.scale.y = 1 + Math.sin(t * 1.4 + bi++ * 0.7) * 0.008;
    }

    // khói hương bốc lên + uốn lượn
    for (let e = emitters.length - 1; e >= 0; e--) {
      const em = emitters[e];
      const ud = em.userData;
      const pos = em.geometry.attributes.position.array;
      if (ud.dieAt) {
        // petal rain: rơi xuống
        for (let i = 0; i < ud.count; i++) {
          pos[i * 3 + 1] -= 0.02 * ud.seed[i];
          pos[i * 3] += Math.sin(t * 2 + i) * 0.004;
        }
        em.geometry.attributes.position.needsUpdate = true;
        if (performance.now() > ud.dieAt) { scene.remove(em); emitters.splice(e, 1); }
        continue;
      }
      for (let i = 0; i < ud.count; i++) {
        pos[i * 3 + 1] += 0.012 * ud.seed[i * 2 + 1];
        pos[i * 3] += Math.sin(t * 0.8 + ud.seed[i * 2] + pos[i * 3 + 1] * 1.6) * 0.004;
        if (pos[i * 3 + 1] > ud.origin.y + 2.6) {
          pos[i * 3 + 1] = ud.origin.y;
          pos[i * 3] = ud.origin.x + (Math.random() - 0.5) * ud.spread;
          pos[i * 3 + 2] = ud.origin.z + (Math.random() - 0.5) * ud.spread;
        }
      }
      em.geometry.attributes.position.needsUpdate = true;
    }

    // bụi vàng trôi
    {
      const pos = dust.geometry.attributes.position.array;
      const sd = dust.userData.seed;
      for (let i = 0; i < dust.userData.count; i++) {
        pos[i * 3] += Math.sin(t * 0.3 + sd[i * 2]) * 0.002;
        pos[i * 3 + 1] += Math.cos(t * 0.2 + sd[i * 2]) * 0.0012;
      }
      dust.geometry.attributes.position.needsUpdate = true;
    }

    // nến cháy + khói lư hương lấp lánh
    incenseGlow.intensity = 1.35 + Math.sin(t * 7.3) * 0.18 + Math.sin(t * 13.1) * 0.1;
    candleL.intensity = 0.8 + Math.sin(t * 5.7) * 0.15;
    candleR.intensity = 0.8 + Math.cos(t * 6.3) * 0.15;

    updateLabels();
    updateCamera();
    renderer.render(scene, camera);
  }

  resize();
  animate();
})();
