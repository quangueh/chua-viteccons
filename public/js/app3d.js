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

  // Parallax nhẹ theo chuột
  wrapper.addEventListener('pointermove', (e) => {
    const r = wrapper.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    if (window.gsap) {
      window.gsap.to(camera.position, {
        x: CAM_HOME.x + nx * 0.9,
        y: CAM_HOME.y - ny * 0.5,
        duration: 1.2, ease: 'power2.out'
      });
    }
  });

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
  wrapper.addEventListener('pointerdown', (e) => {
    if (e.target !== canvas) return;
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
  // ĐẠO TRÀNG: CHIBI NGỒI HAI BÊN THẢM + NHÃN TÊN DOM
  // ============================================================
  const HALL_NAME_POOL = [
    'Thích Trúng Thầu', 'Thích Trộn Hồ', 'Thích Đổ Bê Tông', 'Thích Nghiệm Thu',
    'Thích Đóng Dấu', 'Thích Vẽ Bản Vẽ', 'Thích An Toàn', 'Thích Thường',
    'Thích Giám Sát', 'Thích Khoán Gọn', 'Thích Đấu Giá', 'Thích Hiệp Đồng',
    'Thích Cốp Pha', 'Thích Cốt Thép', 'Thích Chống Đỡ', 'Thích San Lấp',
    'Thích Đào Móng', 'Thích Dựng Lắp', 'Thích Hoàn Thiện', 'Thích Bàn Giao',
    'Thích Quyết Toán', 'Thích Khảo Sát', 'Thích Định Mức', 'Thích Dự Toán',
    'Thích Kiểm Định', 'Thích Vật Tư', 'Thích Cẩu Tháp', 'Thích Xây Dựng',
    'Thích Tiến Độ', 'Thích An Hòa', 'Thích Phước Lành', 'Thích Tâm Tịnh'
  ];

  const seats = [];      // { devotee, seat, labelEl }
  const SEATS = [];
  const ROW_Z = [-2.6, -4.6, -6.7, -8.8];
  const COL_X = [1.75, 2.95, 4.15, 5.35, 6.55];
  for (let r = 0; r < ROW_Z.length; r++) {
    const z = ROW_Z[r];
    for (const x of COL_X) {
      SEATS.push({ x: -x - 0.3, z, row: r, side: 'L' });
      SEATS.push({ x: x + 0.3, z, row: r, side: 'R' });
    }
  }

  function addSeatLabel(name) {
    const el = document.createElement('div');
    el.className = 'name-label';
    el.textContent = name;
    labelsLayer.appendChild(el);
    return el;
  }

  SEATS.forEach((seat, i) => {
    const devotee = makeDevotee({ hat: i % 9 === 4 ? 'green' : 'white', sitting: true });
    devotee.group.position.set(seat.x, 0, seat.z);
    devotee.group.rotation.y = (Math.random() - 0.5) * 0.1;
    scene.add(devotee.group);
    const labelEl = addSeatLabel(HALL_NAME_POOL[i % HALL_NAME_POOL.length]);
    seats.push({ devotee, seat, labelEl, viewer: null, labelAnchor: devotee.head, baseScale: 1 });
  });

  // 2 ghế VIP gần ban thờ nhất (top công đức 1-6)
  const VIP_SEATS = [
    { x: -1.55, z: -10.6 }, { x: -2.8, z: -10.6 }, { x: -4.05, z: -10.6 },
    { x: 1.55, z: -10.6 }, { x: 2.8, z: -10.6 }, { x: 4.05, z: -10.6 }
  ];
  const vipSeats = [];
  VIP_SEATS.forEach((s) => {
    const devotee = makeDevotee({ sitting: true });
    devotee.group.position.set(s.x, 0, s.z);
    scene.add(devotee.group);
    const labelEl = addSeatLabel('');
    labelEl.classList.add('vip-label');
    vipSeats.push({ devotee, seat: s, labelEl, labelAnchor: devotee.head });
  });

  // "Bạn" + 1 người bạn ngồi cạnh — sát camera tạo cảm giác góc nhìn thứ nhất
  const meDevotee = makeDevotee({ sitting: true });
  meDevotee.group.position.set(4.3, 0, 6.6);
  meDevotee.group.scale.setScalar(1.35);
  meDevotee.group.rotation.y = -0.1;
  scene.add(meDevotee.group);
  const meLabel = addSeatLabel('Bạn');
  meLabel.classList.add('me-label');
  seats.push({ devotee: meDevotee, seat: { x: 4.3, z: 6.6, row: 9 }, labelEl: meLabel, labelAnchor: meDevotee.head, baseScale: 1.35 });

  const buddyDevotee = makeDevotee({ sitting: true });
  buddyDevotee.group.position.set(-4.0, 0, 7.0);
  buddyDevotee.group.scale.setScalar(1.4);
  buddyDevotee.group.rotation.y = 0.12;
  scene.add(buddyDevotee.group);
  const buddyLabel = addSeatLabel('');
  buddyLabel.classList.add('me-label');
  seats.push({ devotee: buddyDevotee, seat: { x: -4.0, z: 7.0, row: 8 }, labelEl: buddyLabel, labelAnchor: buddyDevotee.head, baseScale: 1.4 });

  // Chủ lễ đi dâng hương (nhân vật đứng/di bộ trên thảm)
  const walker = makeDevotee({ sitting: false });
  walker.group.position.set(0, 0, 6.5);
  walker.group.visible = false;
  scene.add(walker.group);
  const walkerLabel = addSeatLabel('');
  walkerLabel.classList.add('walker-label');
  window.__dbg = { walker, scene, camera };

  let walkerBusy = false;

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
    for (const s of seats) {
      if (!s.labelEl) continue;
      projectToScreen(s.labelAnchor, proj);
      if (proj.behind || proj.y < -40 || proj.y > wrapper.clientHeight + 40) {
        s.labelEl.style.display = 'none';
        continue;
      }
      s.labelEl.style.display = '';
      const dist = camera.position.distanceTo(s.devotee.group.position);
      const sc = Math.min(1.15, Math.max(0.55, 14 / dist));
      s.labelEl.style.transform = `translate(-50%, -100%) translate(${proj.x}px, ${proj.y - 14}px) scale(${sc})`;
    }
    if (walker.group.visible) {
      projectToScreen(walker.head, proj);
      walkerLabel.style.display = proj.behind ? 'none' : '';
      walkerLabel.style.transform = `translate(-50%, -100%) translate(${proj.x}px, ${proj.y - 10}px)`;
    } else {
      walkerLabel.style.display = 'none';
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
  // HÀNH LỄ: chủ lễ đi lên thảm -> quỳ -> đảnh lễ tam bái
  // ============================================================
  function walkAndBow(user, actionLabel, wish) {
    walkerLabel.innerHTML = `<b>${escapeHtml(user)}</b><span>${escapeHtml(actionLabel)}</span>`;
    const hudName = document.getElementById('devoteeNameLine');
    const hudAct = document.getElementById('devoteeActionTag');
    if (hudName) hudName.textContent = user || 'Thí Chủ';
    if (hudAct) hudAct.textContent = actionLabel || 'Dâng hương';

    if (walkerBusy) { gsap.killTweensOf(walker.group.position); gsap.killTweensOf(walker.hip.rotation); }
    walkerBusy = true;
    walker.group.visible = true;
    walker.group.position.set((Math.random() - 0.5) * 0.4, 0, 6.5);
    walker.hip.rotation.x = 0;

    const G = window.gsap;
    const arriveZ = -6.9;
    if (G) {
      // di bộ: lắc lư + chân đánh (mô phỏng bước)
      const walkDur = 2.6;
      G.to(walker.group.position, { z: arriveZ, duration: walkDur, ease: 'power1.inOut' });
      G.to(walker.legs.l.rotation, { x: 0.55, duration: 0.28, repeat: Math.floor(walkDur / 0.56), yoyo: true, ease: 'sine.inOut' });
      G.to(walker.legs.r.rotation, { x: -0.55, duration: 0.28, repeat: Math.floor(walkDur / 0.56), yoyo: true, ease: 'sine.inOut' });
      G.to(walker.group.position, {
        y: 0.05, duration: 0.28, repeat: Math.floor(walkDur / 0.56), yoyo: true, ease: 'sine.inOut'
      });
      G.delayedCall(walkDur + 0.1, () => {
        G.to([walker.legs.l.rotation, walker.legs.r.rotation], { x: 0, duration: 0.3 });
        // đảnh lễ tam bái: x3 nhịp (chắp tay ngẩng -> gập sâu)
        const tl = G.timeline({ onComplete: () => { walkerBusy = false; } });
        tl.to(walker.hip.rotation, { x: 0.35, duration: 0.4, ease: 'power2.out' })
          .to(walker.hip.rotation, { x: 0, duration: 0.4 });
        for (let i = 0; i < 3; i++) {
          tl.to(walker.hip.rotation, { x: 1.15, duration: 0.55, ease: 'power2.inOut' }, '+=0.15')
            .to(walker.hip.rotation, { x: 1.15, duration: 0.45 })
            .to(walker.hip.rotation, { x: 0, duration: 0.6, ease: 'power2.inOut' });
        }
        tl.to(walker.hip.rotation, { x: 0.3, duration: 0.4 }, '+=0.2')
          .to(walker.hip.rotation, { x: 0, duration: 0.4 });
      });
    }
    // hào quang + khói bùng
    incenseGlow.intensity = 2.6;
    if (window.gsap) gsap.to(incenseGlow, { intensity: 1.4, duration: 3 });
  }

  // đạo tràng vài người lạy theo (mõ/chuông)
  function pulseHallBowing() {
    const picks = seats.filter((s) => s.seat.row < 4);
    for (let i = 0; i < picks.length; i++) {
      if (i % 4 !== 0) continue;
      const d = picks[i].devotee;
      const delay = (i % 4) * 0.08;
      if (window.gsap) {
        gsap.timeline({ delay })
          .to(d.hip.rotation, { x: 1.1, duration: 0.5, ease: 'power2.inOut' })
          .to(d.hip.rotation, { x: 1.1, duration: 0.35 })
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
    const sig = JSON.stringify(lb.map((d) => `${d.name}:${d.merit}`).slice(0, 46));
    if (sig !== lastLbSig) {
      lastLbSig = sig;
      // VIP top 6
      vipSeats.forEach((vs, i) => {
        const dev = lb[i];
        vs.labelEl.textContent = dev ? `❶${i + 1} ${shortenName(dev.name, 11)}`.replace('❶', ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'][i]) : '';
      });
      // Đạo tràng: gán tên thật từ leaderboard (hạng 7+), còn lại pháp danh
      const hallViewers = lb.slice(6);
      seats.forEach((s, i) => {
        if (s.seat.row === 9) { // "Bạn"
          const saved = localStorage.getItem('chua_vt_name');
          s.labelEl.textContent = saved ? `🙏 ${shortenName(saved, 12)}` : '🙏 Bạn';
          return;
        }
        const viewer = hallViewers[i];
        s.labelEl.textContent = shortenName(viewer ? viewer.name : HALL_NAME_POOL[i % HALL_NAME_POOL.length], 14);
      });
    }

    const lbList = document.getElementById('leaderboardList');
    if (lbList) {
      lbList.innerHTML = lb.slice(0, 4).map((item) => `
        <div class="leader-item">
          <span class="leader-rank">${item.rank}</span>
          <span class="leader-name">${escapeHtml(shortenName(item.name, 14))}</span>
          <span class="leader-merit">${Number(item.merit).toLocaleString('vi-VN')}</span>
        </div>`).join('');
    }

    const liveText = document.getElementById('liveStatusText');
    if (liveText) {
      liveText.textContent = st.settings?.autoSim
        ? 'CHÙA VITECCONS • ĐẠO TRÀNG ĐANG TỤNG KINH'
        : 'CHÙA VITECCONS • ĐỨC PHẬT A DI ĐÀ';
    }
    const btnAutoSim = document.getElementById('btnToggleAutoSim');
    if (btnAutoSim && st.settings) {
      btnAutoSim.textContent = st.settings.autoSim ? '🏮 Đạo Tràng Tự Đi Chùa: ĐANG BẬT' : '🏮 Đạo Tràng Tự Đi Chùa: TẮT';
      btnAutoSim.classList.toggle('active-toggle', Boolean(st.settings.autoSim));
    }
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
      feed.innerHTML = st.recentEvents.slice(0, 8).map((ev) => `<div class="event-feed-item">${formatEventSummary(ev)}</div>`).join('');
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
    if (ev.ttsText && ev.type !== 'drawFortune') {
      audio.enqueueTts(ev.ttsText, { voice: ev.ttsVoice || 'maichi' });
    }
    switch (ev.type) {
      case 'burnIncense':
        audio.playIncenseChime();
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS.clone().add(new THREE.Vector3(0, 0.8, 0)), '#ffe082');
        walkAndBow(ev.user, `🔥 Dâng ${ev.count} nén hương (+${ev.merit} CĐ)`, ev.wish);
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
        walkAndBow(ev.user, `🔔 Thỉnh Đại Hồng Chung (+${ev.merit} CĐ)`, ev.wish);
        break;
      case 'sendPrayer':
        audio.playIncenseChime();
        spawnLantern(ev.user, ev.wish);
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS, '#ffb74d');
        walkAndBow(ev.user, `🏮 Cầu phúc (+${ev.merit} CĐ)`, ev.wish);
        break;
      case 'offerGift':
        audio.playIncenseChime();
        audio.playTempleBell(0.85);
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS.clone().add(new THREE.Vector3(0, 0.9, 0)), '#fff3b0');
        walkAndBow(ev.user, `🪷 Dâng ${ev.giftName} (+${ev.merit} CĐ)`, ev.wish);
        break;
      case 'grandCeremony':
        audio.playTempleBell(1.2);
        setTimeout(() => audio.playTempleBell(1.1), 900);
        spawnPetalRain(5);
        pulseHallBowing();
        showGrandCeremonyBanner(ev.user, ev.giftName, ev.merit);
        walkAndBow(ev.user, `🐉 ${ev.giftName} (+${ev.merit} CĐ)`, ev.wish);
        break;
      case 'drawFortune':
        audio.playFortuneShake();
        audio.enqueueTts(ev.ttsText || '', {
          voice: ev.ttsVoice || 'maichi',
          onStart: () => {
            audio.playIncenseChime();
            showFortuneModal(ev.user, ev.fortune);
            walkAndBow(ev.user, `🎋 Quẻ số ${ev.fortune?.number} (${ev.fortune?.rank})`, ev.fortune?.meaning || '');
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
    const savedName = localStorage.getItem('chua_vt_name') || '';
    const savedWish = localStorage.getItem('chua_vt_wish') || '';
    const nameEl = document.getElementById('inputDevoteeName');
    const wishEl = document.getElementById('inputDevoteeWish');
    if (nameEl && savedName && !nameEl.value.trim()) nameEl.value = savedName;
    if (wishEl && savedWish && !wishEl.value.trim()) wishEl.value = savedWish;
    const user = nameEl?.value.trim() || 'Thí Chủ Viteccons';
    const wish = wishEl?.value.trim() || 'Cầu cho gia đình bình an, công trình thuận lợi';
    try {
      localStorage.setItem('chua_vt_name', user);
      localStorage.setItem('chua_vt_wish', wish);
    } catch (_) { }
    return { user, wish };
  }

  async function callRpc(method, params = {}) {
    audio.ensureContext();
    const res = window.TempleLocal?.handleRpc(method, params);
    if (res?.state) updateUIState(res.state);
    if (res?.event) triggerRitualVisuals(res.event);
    return res;
  }

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

  let autoSimState = true;
  bind('btnToggleAutoSim', () => {
    autoSimState = !autoSimState;
    callRpc('live.setAutoSim', { enabled: autoSimState });
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

    // thở nhẹ cho đạo tràng
    for (let i = 0; i < seats.length; i++) {
      const d = seats[i].devotee;
      d.group.scale.y = (seats[i].baseScale || 1) * (1 + Math.sin(t * 1.4 + i * 0.7) * 0.008);
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
    camera.lookAt(CAM_LOOK);
    renderer.render(scene, camera);
  }

  resize();
  animate();
})();
