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

  // Pháp danh: localStorage = nguồn chính (sống qua F5/đóng mở/in-app webview),
  // sessionStorage giữ tương thích bản cũ — đọc cả hai, ghi cả hai.
  function vtName() {
    try {
      return sessionStorage.getItem('chua_vt_name') || localStorage.getItem('chua_vt_name') || '';
    } catch (_) { return ''; }
  }
  function vtSaveName(n) {
    const v = String(n || '').slice(0, 40);
    if (!v) return;
    try { sessionStorage.setItem('chua_vt_name', v); } catch (_) { }
    try { localStorage.setItem('chua_vt_name', v); } catch (_) { }
  }

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
  // KIẾN TRÚC 3D THẬT — cột gỗ + xà ngang + tường bên tạo chiều sâu
  // khi camera xoay (ảnh nền chỉ là "chánh điện xa", đây là hiên chùa gần)
  // ============================================================
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x4a2412, roughness: 0.8 });
  const woodRed = new THREE.MeshStandardMaterial({ color: 0x6e2a18, roughness: 0.75 });
  const goldTrim = new THREE.MeshStandardMaterial({ color: 0xd8a03c, roughness: 0.4, metalness: 0.55 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a1208, roughness: 0.92 });

  // cột hai bên — hàng dọc theo lối đi, đế + đầu cột viền vàng
  for (const sx of [-1, 1]) {
    for (const z of [-1.5, -5.5, -9.5, -13.5, -17.5]) {
      const col = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 7.4, 14), woodRed);
      shaft.position.y = 3.7;
      shaft.castShadow = true;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.4, 14), woodDark);
      base.position.y = 0.2;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.36, 0.32, 14), goldTrim);
      cap.position.y = 7.35;
      col.add(shaft, base, cap);
      col.position.set(sx * 8.6, 0, z);
      scene.add(col);
    }
    // tường bên lửng — panel tối giữa các cột, viền gỗ
    for (const z of [-3.5, -7.5, -11.5, -15.5]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.6, 3.6), wallMat);
      panel.position.set(sx * 9.6, 3.0, z);
      scene.add(panel);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 3.8), woodDark);
      rail.position.set(sx * 9.6, 6.05, z);
      scene.add(rail);
    }
  }
  // xà ngang trên đỉnh cột — chạy dọc chiều sâu
  for (const sx of [-1, 1]) {
    for (const z of [-1.5, -5.5, -9.5, -13.5, -17.5]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 3.6), woodDark);
      beam.position.set(sx * 8.6, 7.55, z);
      scene.add(beam);
    }
  }
  // xà dọc hai bên + mái hiên phía trước (phía camera)
  for (const sx of [-1, 1]) {
    const longBeam = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 18), woodDark);
    longBeam.position.set(sx * 8.6, 7.9, -9.5);
    scene.add(longBeam);
    // mái hiên che nắng — tấm dốc phía trước
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(19, 0.18, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x3d1c0e, roughness: 0.9, side: THREE.DoubleSide })
    );
    awning.position.set(0, 7.2, 1.2);
    awning.rotation.x = 0.28;
    scene.add(awning);
    // đuôi mái trang trí cong nhẹ 2 đầu
    for (const ex of [-1, 1]) {
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 4), goldTrim);
      tip.position.set(ex * 9.4, 6.7, 3.2);
      tip.rotation.x = Math.PI / 2 + 0.4;
      scene.add(tip);
    }
  }
  // đèn lồng giấy treo dưới xà — ấm, lung lay trong animate()
  const paperLanterns = [];
  const lanternPaper = new THREE.MeshStandardMaterial({
    color: 0xffc070, emissive: 0xff8a30, emissiveIntensity: 0.9,
    transparent: true, opacity: 0.92, roughness: 0.7
  });
  for (const z of [-2.5, -6.5, -10.5, -14.5]) {
    for (const sx of [-1, 1]) {
      const lg = new THREE.Group();
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 4), woodDark);
      cord.position.y = 0.45;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.62, 12), lanternPaper.clone());
      const capT = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.16, 10), woodRed);
      capT.position.y = 0.39;
      const capB = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 10), woodRed);
      capB.position.y = -0.39;
      capB.rotation.x = Math.PI;
      lg.add(cord, body, capT, capB);
      lg.position.set(sx * 6.4, 6.6, z);
      scene.add(lg);
      paperLanterns.push({ g: lg, phase: z * 1.3 + sx });
    }
  }
  // 2 đèn lồng lớn treo giữa lối đi
  for (const z of [-5, -11]) {
    const big = new THREE.Group();
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 4), woodDark);
    cord.position.y = 0.8;
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), lanternPaper.clone());
    body.scale.y = 1.25;
    const capT = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.26, 10), woodRed);
    capT.position.y = 0.85;
    const capB = capT.clone(); capB.position.y = -0.85; capB.rotation.x = Math.PI;
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xc01828, roughness: 0.8 }));
    tassel.position.y = -1.15;
    big.add(cord, body, capT, capB, tassel);
    big.position.set(0, 6.3, z);
    scene.add(big);
    paperLanterns.push({ g: big, phase: z });
  }

  // ============================================================
  // BÀN THỜ PHỤ hai bên + mâm quả + bình hoa + nến
  // ============================================================
  const sideAltarSmoke = [];
  const altarWood = new THREE.MeshStandardMaterial({ color: 0x3d1e0e, roughness: 0.6 });
  const altarBronze = new THREE.MeshStandardMaterial({ color: 0x8a5a22, roughness: 0.45, metalness: 0.7 });
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.35 });
  const fruitMat = new THREE.MeshStandardMaterial({ color: 0xe08a20, roughness: 0.55 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e5a1e, roughness: 0.8 });
  for (const sx of [-1, 1]) {
    const alt = new THREE.Group();
    // thân bàn + mặt bàn
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 0.9), altarWood);
    body.position.y = 0.55;
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x5a2c12, roughness: 0.45 }));
    top.position.y = 1.03;
    alt.add(body, top);
    // chân bàn hơi ló ra
    for (const lx of [-0.85, 0.85]) for (const lz of [-0.32, 0.32]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), altarWood);
      leg.position.set(lx, 0.25, lz);
      alt.add(leg);
    }
    // mâm đồng 5 quả
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.07, 18), altarBronze);
    tray.position.set(-0.45, 1.13, 0.05);
    alt.add(tray);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), fruitMat);
      f.position.set(-0.45 + Math.cos(a) * 0.2, 1.24, 0.05 + Math.sin(a) * 0.14);
      f.scale.y = 0.85;
      alt.add(f);
    }
    // bình hoa sứ + cành lá
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.42, 12), porcelain);
    vase.position.set(0.55, 1.3, 0);
    alt.add(vase);
    for (let i = 0; i < 3; i++) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 5), leafMat);
      stem.position.set(0.55 + (i - 1) * 0.09, 1.65, (i - 1) * 0.05);
      stem.rotation.z = (i - 1) * 0.22;
      alt.add(stem);
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6),
        new THREE.MeshStandardMaterial({ color: i === 1 ? 0xe03040 : 0xf0d040, roughness: 0.6 }));
      bloom.position.set(0.55 + (i - 1) * 0.17, 1.95, (i - 1) * 0.11);
      alt.add(bloom);
    }
    // 2 nến nhỏ
    for (const cx of [0.1, 0.95]) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0xf5eeda, roughness: 0.7 }));
      stick.position.set(cx, 1.25, -0.15);
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xffc860 }));
      flame.position.set(cx, 1.45, -0.15);
      alt.add(stick, flame);
    }
    // lư hương nhỏ trên bàn
    const miniPot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.12, 10), altarBronze);
    miniPot.position.set(-0.1, 1.15, -0.2);
    alt.add(miniPot);
    alt.position.set(sx * 6.6, 0, -11.2);
    alt.rotation.y = sx * -0.18;
    scene.add(alt);
    // khói phụ từ lư hương bàn — push sau khi emitters được khai báo
    sideAltarSmoke.push(new THREE.Vector3(sx * 6.5, 1.3, -11.35));
  }

  // ============================================================
  // ĐÈN ĐÁ (toro) hai bên lối đi + chậu cây cảnh
  // ============================================================
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 0.95 });
  const stoneGlow = new THREE.MeshStandardMaterial({
    color: 0xffd890, emissive: 0xff9a40, emissiveIntensity: 0.55, roughness: 0.8
  });
  for (const sx of [-1, 1]) {
    for (const z of [-4.5, -10.5, -14.5]) {
      const toro = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.25, 6), stoneMat);
      base.position.y = 0.12;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.85, 6), stoneMat);
      shaft.position.y = 0.68;
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.42), stoneMat);
      box.position.y = 1.28;
      // cửa sổ lửa phát sáng 4 mặt
      for (let f = 0; f < 4; f++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.2), stoneGlow);
        const a = (f / 4) * Math.PI * 2;
        win.position.set(Math.sin(a) * 0.215, 1.28, Math.cos(a) * 0.215);
        win.rotation.y = a;
        toro.add(win);
      }
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.3, 4), stoneMat);
      roof.position.y = 1.62;
      roof.rotation.y = Math.PI / 4;
      const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), stoneMat);
      jewel.position.y = 1.85;
      toro.add(base, shaft, box, roof, jewel);
      toro.position.set(sx * 2.5, 0, z);
      scene.add(toro);
    }
    // chậu cây cảnh dọc tường
    for (const z of [-3, -7.5, -12, -16.5]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.5, 10),
        new THREE.MeshStandardMaterial({ color: 0x7a4020, roughness: 0.8 }));
      pot.position.set(sx * 9.2, 0.25, z);
      scene.add(pot);
      // tán cây: 3 khối cầu lệch nhau
      const greens = [0x2e5a1e, 0x3a6e26, 0x27511a];
      for (let i = 0; i < 3; i++) {
        const blob = new THREE.Mesh(new THREE.SphereGeometry(0.5 - i * 0.1, 10, 8),
          new THREE.MeshStandardMaterial({ color: greens[i], roughness: 0.9 }));
        blob.position.set(sx * 9.2 + (i - 1) * 0.25 * sx, 0.95 + i * 0.38, z + (i % 2) * 0.2);
        blob.scale.y = 0.8;
        scene.add(blob);
      }
      // thân cây
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.9, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a2c14, roughness: 0.9 }));
      trunk.position.set(sx * 9.2, 0.85, z);
      scene.add(trunk);
    }
  }

  // ============================================================
  // BẬC THỀM + CUỐN THƯ treo cột (decor không chữ — vải màu + viền)
  // ============================================================
  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(7 - s * 0.8, 0.14, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x8a8078, roughness: 0.9 })
    );
    step.position.set(0, 0.07 + s * 0.14, -9.7 - s * 0.45);
    scene.add(step);
  }
  // cuốn thư đỏ treo trên cột — xen kẽ vàng
  const scrollColors = [0xa01820, 0xc89828];
  let sci = 0;
  for (const sx of [-1, 1]) {
    for (const z of [-1.5, -5.5, -9.5, -13.5, -17.5]) {
      const sc2 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 2.2),
        new THREE.MeshStandardMaterial({
          color: scrollColors[sci % 2], roughness: 0.85, side: THREE.DoubleSide,
          emissive: scrollColors[sci % 2], emissiveIntensity: 0.08
        })
      );
      sc2.position.set(sx * 8.25, 5.4, z);
      sc2.rotation.y = sx * Math.PI / 2;
      scene.add(sc2);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 6), woodDark);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(sx * 8.25, 6.55, z);
      scene.add(rod);
      sci++;
    }
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
  for (const p of sideAltarSmoke) emitters.push(makeSmokeEmitter(p, 22, 0.1));

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

  // que xăm nhô ra khỏi ống khi gieo — ẩn sẵn, animate theo sequence
  const fortuneStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.02, 0.4, 6),
    new THREE.MeshStandardMaterial({ color: 0xead9b0, roughness: 0.85 })
  );
  fortuneStick.position.set(0.32, 1.3, 0.05);
  fortuneStick.visible = false;
  mokGroup.add(fortuneStick);

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
    const n = vtName() || '';
    return n.toLowerCase().replace(/\s+/g, '');
  }
  function isMe(occ) {
    if (!occ) return false;
    const saved = vtName() || '';
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

  // Tìm đúng chiếu của người hành lễ: ưu tiên khớp sid/tên occupant,
  // fallback seatIdx từ event — tránh 1 người vừa ngồi vừa đứng dậy lạy
  function findRitualSeat(user, sid, seatIdx) {
    const uname = String(user || '').toLowerCase();
    for (let i = 0; i < TOTAL_SEATS; i++) {
      const o = seatChars[i].occupant;
      if (!o) continue;
      if ((sid && (o.uniqueId === sid || o.sid === sid)) ||
        (uname && String(o.name || '').toLowerCase() === uname)) return i;
    }
    if (Number.isInteger(seatIdx) && seatIdx >= 0 && seatIdx < TOTAL_SEATS) {
      const o = seatChars[seatIdx].occupant;
      if (!o || !uname || String(o.name || '').toLowerCase() === uname ||
        (sid && (o.uniqueId === sid || o.sid === sid))) return seatIdx;
    }
    return -1;
  }

  function walkAndBow(user, actionLabel, wish, seatIdx, sid) {
    const hudName = document.getElementById('devoteeNameLine');
    const hudAct = document.getElementById('devoteeActionTag');
    if (hudName) hudName.textContent = user || 'Thí Chủ';
    if (hudAct) hudAct.textContent = actionLabel || 'Dâng hương';
    incenseGlow.intensity = 2.6;
    if (window.gsap) gsap.to(incenseGlow, { intensity: 1.4, duration: 3 });

    const key = String(sid || user || '').toLowerCase();
    if (ritualActors.has(key)) return; // người này đang hành lễ rồi
    ritualActors.add(key);

    const G = window.gsap;
    const seatNum = findRitualSeat(user, sid, seatIdx);
    const sc = seatNum >= 0 ? seatChars[seatNum] : null;
    const seat = sc ? SEATS[seatNum] : null;

    // Có chiếu (kể cả đang đi vào/chưa kịp ngồi): chiếm quyền ghế → ẩn mọi hình tại chiếu
    if (sc) {
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
              if (!sc.occupant) {
                // ghế thật sự trống (seatIdx cũ) → trả về empty, không tạo người ngồi ma
                sc.status = 'empty';
                return;
              }
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
      case 'bondFormed': return `💞 <strong>${escapeHtml(ev.user)}</strong> và <strong>${escapeHtml(ev.partner || 'Đạo Hữu')}</strong> kết duyên`;
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
    const card = modal?.querySelector('.fortune-scroll-card');
    card?.classList.remove('flip-in');
    if (card) void card.offsetWidth; // restart animation
    card?.classList.add('flip-in');
    const numEl = document.getElementById('fortuneNumber');
    if (numEl) numEl.textContent = fortune.number ?? '—';
    document.getElementById('fortuneRankBadge').textContent = fortune.rank.toUpperCase();
    document.getElementById('fortuneTitle').textContent = `Quẻ Số ${fortune.number} — ${fortune.title}`;
    document.getElementById('fortuneDevotee').textContent = `Thí chủ cầu quẻ: ${user}`;
    // từng câu thơ hiện lần lượt — nhịp như đọc kinh
    const poemEl = document.getElementById('fortunePoem');
    if (poemEl) {
      poemEl.innerHTML = String(fortune.poem || '')
        .split('\n').filter((l) => l.trim())
        .map((l, i) => `<span class="poem-line" style="animation-delay:${0.2 + i * 0.3}s">${escapeHtml(l)}</span>`)
        .join('');
    }
    document.getElementById('fortuneMeaning').textContent = `Lời bàn: ${fortune.meaning}`;
    // theme màu theo hạng quẻ
    const rk = String(fortune.rank || '');
    modal.dataset.rank = /thượng|thuong/i.test(rk) ? 'top' : /hạ|ha/i.test(rk) ? 'low' : 'mid';
    modal.classList.add('visible');
    clearTimeout(fortuneTimer);
    fortuneTimer = setTimeout(() => modal.classList.remove('visible'), 15000);
  }
  document.getElementById('fortuneModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'fortuneModal' || e.target.id === 'btnFortuneClose')
      document.getElementById('fortuneModal').classList.remove('visible');
  });
  document.getElementById('btnFortuneClose')?.addEventListener('click', () =>
    document.getElementById('fortuneModal')?.classList.remove('visible'));

  // ── Nghi thức gieo quẻ: lắc ống → que nhô lên → lật quẻ ──
  function playFortuneDraw(user, fortune) {
    const G = window.gsap;
    audio.playFortuneShake();
    const resetTube = () => {
      if (!G) return;
      G.killTweensOf([tube.rotation, tube.position, mokGroup.rotation, mokGroup.position]);
      tube.rotation.z = -0.12; tube.position.y = 1.0;
      mokGroup.rotation.y = -0.3; mokGroup.position.y = 0;
    };
    if (G) {
      // lắc mạnh ống xăm ~2.1s
      G.fromTo(tube.rotation, { z: -0.12 }, { z: 0.4, duration: 0.085, yoyo: true, repeat: 24, ease: 'sine.inOut' });
      G.fromTo(tube.position, { y: 1.0 }, { y: 1.07, duration: 0.11, yoyo: true, repeat: 19, ease: 'sine.inOut' });
      G.fromTo(mokGroup.rotation, { y: -0.3 }, { y: -0.1, duration: 0.13, yoyo: true, repeat: 16, ease: 'sine.inOut' });
      G.fromTo(mokGroup.position, { y: 0 }, { y: 0.03, duration: 0.1, yoyo: true, repeat: 20, ease: 'sine.inOut' });
    }
    // que nhô lên khỏi miệng ống
    setTimeout(() => {
      resetTube();
      fortuneStick.visible = true;
      fortuneStick.position.set(0.32, 1.3, 0.05);
      fortuneStick.rotation.set(0, 0, 0);
      if (G) {
        G.to(fortuneStick.position, { y: 1.66, duration: 0.6, ease: 'back.out(1.7)' });
        G.to(fortuneStick.rotation, { z: 0.55, x: 0.15, duration: 0.6 });
      }
      audio.playIncenseChime();
    }, 2150);
    // lật quẻ — que bay nhẹ rồi modal hiện
    setTimeout(() => {
      if (G) G.to(fortuneStick.position, { y: 1.95, duration: 0.45, ease: 'power1.in' });
      setTimeout(() => { fortuneStick.visible = false; }, 900);
      showFortuneModal(user, fortune);
      clearTimeout(fortuneTimer);
      fortuneTimer = setTimeout(() => document.getElementById('fortuneModal')?.classList.remove('visible'), 12000);
    }, 3000);
  }

  function showGrandCeremonyBanner(user, giftName, merit) {
    const banner = document.getElementById('grandCeremonyBanner');
    document.getElementById('grandTitle').textContent = `🐉 ${giftName.toUpperCase()} 🐉`;
    document.getElementById('grandSub').textContent = `Đại Thí Chủ ${user} • Công Đức Vô Lượng (+${merit} CĐ)`;
    banner.classList.add('visible');
    clearTimeout(grandTimer);
    grandTimer = setTimeout(() => banner.classList.remove('visible'), 6800);
  }

  // ── Màn chúc mừng kết duyên: confetti + chuông + cánh hoa — mọi người cùng mừng ──
  let lastBondKey = '', lastBondTs = 0;
  function celebrateBond(nameA, nameB) {
    const ov = document.getElementById('bondCelebration');
    if (!ov) return;
    // dedup: 2 người trong đôi nhận cả onBond lẫn event bondFormed — chỉ mừng 1 lần
    const key = [nameA, nameB].map((s) => String(s || '').toLowerCase()).sort().join('|');
    const t = Date.now();
    if (key === lastBondKey && t - lastBondTs < 15000) return;
    lastBondKey = key; lastBondTs = t;

    document.getElementById('bondNameA').textContent = nameA || 'Đạo Hữu';
    document.getElementById('bondNameB').textContent = nameB || 'Đạo Hữu';
    const layer = ov.querySelector('.bond-confetti');
    if (layer) {
      layer.innerHTML = '';
      const colors = ['#ffd766', '#e8a52c', '#ff5a5a', '#fff3d6', '#f4c76a', '#ffffff', '#ff9ab0'];
      for (let i = 0; i < 90; i++) {
        const p = document.createElement('i');
        p.style.left = (Math.random() * 100) + '%';
        p.style.background = colors[i % colors.length];
        p.style.animationDelay = (Math.random() * 1.8) + 's';
        p.style.animationDuration = (2.4 + Math.random() * 2.4) + 's';
        p.style.width = (6 + Math.random() * 7) + 'px';
        p.style.height = (10 + Math.random() * 9) + 'px';
        layer.appendChild(p);
      }
    }
    ov.classList.add('visible');
    audio.playTempleBell(0.9);
    setTimeout(() => audio.playTempleBell(0.7), 650);
    if (typeof spawnPetalRain === 'function') spawnPetalRain(10);
    clearTimeout(ov._t);
    ov._t = setTimeout(() => ov.classList.remove('visible'), 7000);
    ov.onclick = () => { ov.classList.remove('visible'); clearTimeout(ov._t); };
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
        walkAndBow(ev.user, `🔥 Dâng ${ev.count} nén hương (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx, ev.uniqueId);
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
        walkAndBow(ev.user, `🔔 Thỉnh Đại Hồng Chung (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx, ev.uniqueId);
        break;
      case 'sendPrayer':
        audio.playIncenseChime();
        spawnLantern(ev.user, ev.wish);
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS, '#ffb74d');
        walkAndBow(ev.user, `🏮 Cầu phúc (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx, ev.uniqueId);
        break;
      case 'offerGift':
        audio.playIncenseChime();
        audio.playTempleBell(0.85);
        meritPopup(`+${ev.merit} Công Đức`, BURNER_POS.clone().add(new THREE.Vector3(0, 0.9, 0)), '#fff3b0');
        walkAndBow(ev.user, `🪷 Dâng ${ev.giftName} (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx, ev.uniqueId);
        break;
      case 'grandCeremony':
        audio.playTempleBell(1.2);
        setTimeout(() => audio.playTempleBell(1.1), 900);
        spawnPetalRain(5);
        pulseHallBowing();
        showGrandCeremonyBanner(ev.user, ev.giftName, ev.merit);
        walkAndBow(ev.user, `🐉 ${ev.giftName} (+${ev.merit} CĐ)`, ev.wish, ev.seatIdx, ev.uniqueId);
        break;
      case 'drawFortune':
        // nghi thức gieo quẻ: lắc ống → que nhô → lật quẻ (chung cho mọi người xem)
        playFortuneDraw(ev.user, ev.fortune);
        walkAndBow(ev.user, `🎋 Quẻ số ${ev.fortune?.number || '?'} (${ev.fortune?.rank || 'Linh Xăm'})`, '', ev.seatIdx, ev.uniqueId);
        if (!ev.remote && ev.ttsText) {
          // TTS đọc quẻ sau khi thẻ lật
          setTimeout(() => audio.enqueueTts(ev.ttsText || '', {
            voice: ev.ttsVoice || 'maichi',
            onStart: () => audio.playIncenseChime()
          }), 3100);
        }
        break;
      case 'bondFormed':
        // mọi người cùng chúc mừng đôi kết duyên
        celebrateBond(ev.partner || 'Đạo Hữu', ev.user || 'Đạo Hữu');
        break;
    }
  }

  function getFormInput() {
    const savedName = vtName() || '';
    const savedWish = localStorage.getItem('chua_vt_wish') || '';
    const nameEl = document.getElementById('inputDevoteeName');
    const wishEl = document.getElementById('inputDevoteeWish');
    if (nameEl && savedName && !nameEl.value.trim()) nameEl.value = savedName;
    if (wishEl && savedWish && !wishEl.value.trim()) wishEl.value = savedWish;
    const user = nameEl?.value.trim() || savedName;
    const wish = wishEl?.value.trim() || 'Cầu cho gia đình bình an, công trình thuận lợi';
    try { localStorage.setItem('chua_vt_wish', wish); } catch (_) { }
    return { user, wish };
  }

  async function callRpc(method, params = {}) {
    audio.ensureContext();
    // nghi lễ/tác vụ có danh tính → bắt buộc pháp danh thật, không cấp tên mặc định
    if ('user' in params && !params.user) {
      toast('Người muốn làm lễ phải ghi danh pháp danh trước đã 🙏');
      document.documentElement.classList.add('need-name');
      return { error: 'noname' };
    }
    const res = window.TempleLocal?.handleRpc(method, params);
    if (res?.error === 'cooldown') toast('Từ từ thôi đạo hữu 🙏 thành tâm không cần vội');
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
    const saved = vtName();
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
    // đã ghi danh nhưng không chiếu/hàng chờ (F5/reload giữ tên, mất ghế) → tự mở lại luồng chọn chiếu
    if (!reopenTried) {
      reopenTried = true;
      setTimeout(() => registerFlow(saved), 500);
    }
    el.innerHTML = `Đã ghi danh <b>${escapeHtml(saved)}</b> — bấm <b>Ghi Danh & Chọn Chiếu</b> để chọn chỗ`;
  }
  let reopenTried = false;

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
    const user = (nameEl?.value.trim()) || vtName() || '';
    if (!user) { toast('Hãy để lại pháp danh trước đã 🙏'); return; }
    try { vtSaveName(user); } catch (_) { }
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
    try { vtSaveName(user); } catch (_) { }
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
    const saved = vtName();
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
  const publicTabBadge = document.getElementById('publicTabBadge');
  let publicUnread = 0;
  let lastChatSend = 0;
  const chatLoadTs = Date.now(); // tin cũ hơn mốc này là lịch sử — render nhưng không đếm unread
  let chatEmptyEl = chatMsgs?.querySelector('.chat-empty') || null;
  const fmtBadge = (n) => (n > 99 ? '99+' : String(n));

  const chatNameColor = (uid) => {
    let h = 0;
    for (let i = 0; i < String(uid || '').length; i++) h = (h * 31 + String(uid).charCodeAt(i)) >>> 0;
    return `hsl(${h % 360}, 72%, 72%)`;
  };
  const chatNearBottom = () => {
    if (!chatMsgs) return true;
    return chatMsgs.scrollHeight - chatMsgs.scrollTop - chatMsgs.clientHeight < 60;
  };
  // Badge thống nhất: collapsed → đầu panel = tổng; đang mở → badge theo tab
  // chưa xem + đầu panel báo tin dưới fold của tab đang xem
  const refreshBadges = () => {
    const collapsed = !!chatPanel?.classList.contains('collapsed');
    const viewingPublic = !collapsed && !dmTab;
    const viewingDm = !collapsed && dmTab;
    const total = publicUnread + dmUnread;
    if (chatBadge) {
      const n = collapsed ? total : (viewingPublic ? publicUnread : 0);
      chatBadge.textContent = fmtBadge(n);
      chatBadge.hidden = n === 0;
    }
    if (publicTabBadge) {
      publicTabBadge.textContent = fmtBadge(publicUnread);
      publicTabBadge.hidden = !(publicUnread > 0 && viewingDm);
    }
    if (dmBadge) {
      dmBadge.textContent = fmtBadge(dmUnread);
      dmBadge.hidden = !(dmUnread > 0 && viewingPublic);
    }
  };
  const bumpUnread = () => {
    publicUnread++;
    refreshBadges();
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
    if (typeof dmTab !== 'undefined' && dmTab) { // tab Riêng: chat riêng qua kênh duyên
      const bond = window.TempleNet.bond || null;
      if (!bond) return;
      window.TempleNet.sendDm(text);
      if (typeof appendDm === 'function') appendDm({ user: vtName() || 'Bạn', uniqueId: window.TempleNet.sid, text, ts: t });
      chatInput.value = '';
      return;
    }
    recentOwn.push(text);
    if (recentOwn.length > 10) recentOwn.shift();
    window.TempleNet.sendChat(text);
    appendChat({ user: vtName() || 'Bạn', uniqueId: window.TempleNet.sid, text, ts: t });
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
  // emoji nhanh — bấm là gửi luôn (kênh đang mở: Chung hoặc Riêng)
  document.querySelectorAll('.chat-quick').forEach((b) => {
    b.addEventListener('click', () => {
      if (chatInput) chatInput.value = b.dataset.emoji || '';
      sendChatMsg();
    });
  });

  // ── Nhập bằng giọng nói (Web Speech API, tiếng Việt) ──
  function bindVoice(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const inp = document.getElementById(inputId);
    if (!btn || !inp) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { btn.style.display = 'none'; return; } // trình duyệt không hỗ trợ → ẩn nút
    let rec = null, on = false;
    btn.addEventListener('click', () => {
      if (on) { try { rec?.stop(); } catch (_) { } return; }
      try {
        rec = new SR();
        rec.lang = 'vi-VN';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (e) => {
          const text = e.results?.[0]?.[0]?.transcript || '';
          if (text) inp.value = (inp.value ? inp.value + ' ' : '') + text;
          inp.focus();
        };
        rec.onend = () => { on = false; btn.classList.remove('listening'); };
        rec.onerror = () => { on = false; btn.classList.remove('listening'); };
        rec.start();
        on = true;
        btn.classList.add('listening');
        toast('🎤 Đang nghe... nói xong tự điền vào ô');
      } catch (_) { on = false; btn.classList.remove('listening'); }
    });
  }
  bindVoice('btnChatMic', 'chatInput');
  bindVoice('btnWishMic', 'inputDevoteeWish');
  const toggleChat = () => {
    chatPanel?.classList.toggle('collapsed');
    if (!chatPanel?.classList.contains('collapsed')) {
      // mở panel → xóa unread của tab đang xem, tab kia giữ badge
      if (dmTab) dmUnread = 0; else publicUnread = 0;
      refreshBadges();
      if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;
      if (dmMsgs) dmMsgs.scrollTop = dmMsgs.scrollHeight;
    } else refreshBadges();
  };
  bind('btnChatToggle', toggleChat);
  document.getElementById('chatHead')?.addEventListener('click', (e) => {
    if (e.target.id !== 'btnChatToggle') toggleChat();
  });
  // mặc định thu gọn cho gọn màn — có tin mới sẽ hiện badge
  chatPanel?.classList.add('collapsed');

  // nút 🏆 trên điện thoại: bật/tắt bảng công đức dạng overlay nổi
  bind('btnLbToggle', () => {
    document.getElementById('hudLeaderboard')?.classList.toggle('lb-open');
  });

  // ── CẦU DUYÊN — trao duyên → chat riêng (F5 mất sạch phía client) ──
  const tabPublic = document.getElementById('tabChatPublic');
  const tabDmBtn = document.getElementById('tabChatDm');
  const dmMsgs = document.getElementById('dmMsgs');
  const dmBadge = document.getElementById('dmBadge');
  const dmPartnerLine = document.getElementById('dmPartnerLine');
  const dmPartnerName = document.getElementById('dmPartnerName');
  const duyenModal = document.getElementById('duyenModal');
  const duyenList = document.getElementById('duyenList');
  const duyenReqBox = document.getElementById('duyenReqBox');
  const duyenReqList = document.getElementById('duyenReqList');
  const duyenBondBox = document.getElementById('duyenBondBox');
  const duyenBondName = document.getElementById('duyenBondName');
  let dmUnread = 0;
  let dmTab = false;
  let duyenReqs = [];

  const bumpDmUnread = () => {
    dmUnread++;
    refreshBadges();
  };
  const appendDm = (m) => {
    if (!dmMsgs) return;
    const row = document.createElement('div');
    const mine = m.uniqueId && m.uniqueId === (window.TempleNet?.sid || '');
    row.className = 'chat-msg' + (mine ? ' mine' : '');
    const d = new Date(m.ts || Date.now());
    const hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    row.innerHTML = `<span class="chat-name" style="color:${chatNameColor(m.uniqueId)}">${escapeHtml(m.user || 'Đạo Hữu')}</span><span>${escapeHtml(m.text || '')}</span><span class="chat-time">${hh}</span>`;
    dmMsgs.appendChild(row);
    if (mine || (dmTab && !chatPanel?.classList.contains('collapsed'))) {
      dmMsgs.scrollTop = dmMsgs.scrollHeight;
    } else bumpDmUnread();
  };
  const currentBond = () => window.TempleNet?.bond || null;
  const setChatTab = (dm) => {
    dmTab = dm;
    tabPublic?.classList.toggle('active', !dm);
    tabDmBtn?.classList.toggle('active', dm);
    if (chatMsgs) chatMsgs.hidden = dm;
    if (dmMsgs) dmMsgs.hidden = !dm;
    const bond = currentBond();
    if (dmPartnerLine) dmPartnerLine.hidden = !(dm && bond);
    if (chatInput) chatInput.placeholder = dm
      ? (bond ? `Nhắn riêng với ${bond.name || 'Đạo Hữu'}...` : 'Chưa có duyên — bấm 💞 trước')
      : 'Nhắn gì đó...';
    if (dm) {
      dmUnread = 0;
      renderDmEmpty();
      if (dmMsgs) dmMsgs.scrollTop = dmMsgs.scrollHeight;
    } else {
      publicUnread = 0;
      if (chatMsgs) chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
    refreshBadges();
  };
  const renderDmEmpty = () => {
    if (!dmMsgs) return;
    if (!currentBond() && !dmMsgs.querySelector('.chat-msg')) {
      dmMsgs.innerHTML = `<div class="chat-empty">Chưa kết duyên — bấm 💞 để trao duyên với đạo hữu đang trong chùa</div>`;
    }
  };
  bind('tabChatPublic', () => setChatTab(false));
  bind('tabChatDm', () => setChatTab(true));

  // modal cầu duyên: danh sách đạo hữu online + lời trao duyên đến
  const renderDuyenModal = () => {
    const bond = currentBond();
    if (duyenBondBox) duyenBondBox.hidden = !bond;
    if (duyenBondName && bond) duyenBondName.textContent = bond.name || 'Đạo Hữu';
    if (duyenReqBox) duyenReqBox.hidden = duyenReqs.length === 0;
    if (duyenReqList) {
      duyenReqList.innerHTML = '';
      duyenReqs.forEach((r) => {
        const row = document.createElement('div');
        row.className = 'duyen-row';
        row.innerHTML = `<span class="duyen-name">${escapeHtml(r.name || 'Thí Chủ')}</span>`;
        const ok = document.createElement('button');
        ok.className = 'duyen-btn accept';
        ok.textContent = 'Đồng Ý';
        ok.onclick = () => { window.TempleNet?.respondDuyen(r.sid, true); };
        const no = document.createElement('button');
        no.className = 'duyen-btn decline';
        no.textContent = 'Từ Chối';
        no.onclick = () => { window.TempleNet?.respondDuyen(r.sid, false); };
        row.appendChild(ok);
        row.appendChild(no);
        duyenReqList.appendChild(row);
      });
    }
    if (duyenList) {
      duyenList.innerHTML = '';
      const others = (window.TempleNet?.roster()?.people || []).filter(
        (p) => p.sid !== window.TempleNet?.sid && p.name);
      if (others.length === 0) {
        duyenList.innerHTML = `<div class="duyen-empty">Chưa có ai khác trong chùa</div>`;
      } else {
        others.forEach((p) => {
          const row = document.createElement('div');
          row.className = 'duyen-row';
          row.innerHTML = `<span class="duyen-name">${escapeHtml(p.name)}</span><span class="duyen-seat">${p.seat >= 0 ? 'chiếu ' + (p.seat + 1) : 'đứng'}</span>`;
          const btn = document.createElement('button');
          btn.className = 'duyen-btn';
          btn.textContent = bond ? 'Đã có duyên' : 'Trao Duyên';
          btn.disabled = !!bond;
          btn.onclick = () => {
            window.TempleNet?.requestDuyen(p.sid);
            btn.textContent = 'Đang chờ…';
            btn.disabled = true;
          };
          row.appendChild(btn);
          duyenList.appendChild(row);
        });
      }
    }
  };
  const openDuyen = () => {
    if (!vtName()) { toast('Ghi danh pháp danh trước đã đạo hữu 🙏'); return; }
    renderDuyenModal();
    if (duyenModal) duyenModal.hidden = false;
  };
  bind('btnDuyen', openDuyen);
  bind('cardDuyen', openDuyen);
  bind('btnCloseDuyen', () => { if (duyenModal) duyenModal.hidden = true; });

  // 🎲 Quay số duyên — slot-machine chạy tên rồi "trời định" 1 người, tự trao duyên
  bind('btnDuyenRandom', () => {
    const net = window.TempleNet;
    if (!net) return;
    if (net.bond) { toast('Đã có duyên rồi đạo hữu 💞'); return; }
    const others = (net.roster()?.people || []).filter(
      (p) => p.sid !== net.sid && p.name && p.sid !== net.bond?.sid);
    if (!others.length) { toast('Chùa chưa có ai khác — đợi thêm đạo hữu 🙏'); return; }
    const btn = document.getElementById('btnDuyenRandom');
    const names = others.map((p) => p.name);
    let i = 0, ticks = 0;
    const orig = btn.textContent;
    btn.disabled = true;
    const spin = setInterval(() => {
      btn.textContent = '🎲 ' + names[i++ % names.length];
      if (++ticks > 16) {
        clearInterval(spin);
        const pick = others[Math.floor(Math.random() * others.length)];
        btn.textContent = `🎲 Trời định: ${pick.name}`;
        net.requestDuyen(pick.sid);
        toast(`💞 Đã trao duyên cho ${pick.name} — chờ họ đồng ý!`);
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3200);
      }
    }, 85);
  });
  const endDuyen = () => { window.TempleNet?.endDuyen(); };
  bind('btnEndDuyen', endDuyen);
  bind('btnEndDuyen2', endDuyen);

  if (window.TempleNet) {
    window.TempleNet.onDuyenReq = (reqs) => {
      duyenReqs = reqs || [];
      document.getElementById('btnDuyen')?.classList.toggle('has-req', duyenReqs.length > 0);
      document.getElementById('cardDuyen')?.classList.toggle('has-req', duyenReqs.length > 0);
      if (duyenModal && !duyenModal.hidden) renderDuyenModal();
    };
    window.TempleNet.onBond = (b) => {
      if (b) {
        if (dmPartnerName) dmPartnerName.textContent = b.name || 'Đạo Hữu';
        celebrateBond(vtName() || 'Bạn', b.name || 'Đạo Hữu');
        setChatTab(true);
      } else {
        setChatTab(false);
        renderDmEmpty();
      }
      if (duyenModal && !duyenModal.hidden) renderDuyenModal();
      if (dmPartnerLine) dmPartnerLine.hidden = !(dmTab && b);
    };
    window.TempleNet.onDm = (m) => appendDm(m);
  }
  renderDmEmpty();

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
  // canh chừng: giữa session mà mất pháp danh (storage bị xóa, tab để mở từ bản cũ) → cổng hiện lại
  setInterval(() => {
    if (!vtName()) {
      document.documentElement.classList.add('need-name');
    }
  }, 4000);

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

    // đèn lồng giấy lung lay nhẹ
    for (const pl of paperLanterns) {
      pl.g.rotation.z = Math.sin(t * 0.9 + pl.phase) * 0.05;
      pl.g.rotation.x = Math.cos(t * 0.7 + pl.phase * 1.3) * 0.04;
    }

    updateLabels();
    updateCamera();
    renderer.render(scene, camera);
  }

  resize();
  animate();

  // ============================================================
  // TỬ VI & HOÀNG ĐẠO — can-chi thật qua ChuaFortune (fortune.js)
  // ============================================================
  (() => {
    const F = window.ChuaFortune;
    const zenModal = document.getElementById('zenModal');
    const zenBody = document.getElementById('zenBody');
    const zenBirth = document.getElementById('zenBirth');
    if (!F || !zenModal || !zenBody) return;

    const zenHour = document.getElementById('zenHour');
    const zenGender = document.getElementById('zenGender');
    const ZW = window.Ziwei;

    /* birth: {d:'YYYY-MM-DD', h:0-23, g:'male'|'female'} — migrate từ key cũ */
    const getBirthObj = () => {
      try {
        const b = JSON.parse(localStorage.getItem('chua_vt_birth') || 'null');
        if (b && /^\d{4}-\d{2}-\d{2}$/.test(b.d || '')) return b;
      } catch (e) { /* ignore */ }
      const old = localStorage.getItem('chua_vt_birthday') || '';
      return /^\d{4}-\d{2}-\d{2}$/.test(old) ? { d: old, h: 12, g: 'male' } : null;
    };
    const getBirth = () => (zenBirth && zenBirth.value) || (getBirthObj() || {}).d || '';
    const saveBirth = () => {
      const v = zenBirth?.value || '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        localStorage.setItem('chua_vt_birth', JSON.stringify({
          d: v, h: parseInt(zenHour?.value || '12', 10), g: zenGender?.value || 'male'
        }));
        zwChart = null; buildZw();
        toast('🔮 Đã lập lá số tử vi — xem cung mệnh và hạn vận nào');
      }
      renderZen(zenTab);
    };

    let zwChart = null;
    let zwRefDate = null; // ngày đang xem lưu nhật (null = hôm nay)
    function buildZw() {
      const b = getBirthObj();
      if (b && ZW && ZW.available()) {
        const [y, m, d] = b.d.split('-').map(Number);
        try { zwChart = ZW.buildChart({ year: y, month: m, day: d, hour: b.h || 12, gender: b.g || 'male' }); } catch (e) { zwChart = null; }
      } else zwChart = null;
      return zwChart;
    }

    let zenTab = 'today';
    const scoreColor = (s) => s >= 8 ? '#8fe0a0' : s >= 5 ? '#ffd98a' : '#ff9a9a';

    function renderZen(tab) {
      const birth = getBirth();
      if (zenBirth && birth) zenBirth.value = birth;
      let html = '';
      if (tab === 'today') {
        const t = F.today(birth);
        html += `<h4>🌅 Hôm nay — ${t.dayLabel} (hành ${t.dayEl})</h4>`;
        html += `<div><span class="zen-score" style="color:${scoreColor(t.score)}">${t.score}</span><span style="color:var(--muted-gold)">/10 vận hạn</span></div>`;
        html += `<p style="margin:8px 0">${escapeHtml(t.relText)}</p>`;
        html += `<p style="color:var(--muted-gold)">${escapeHtml(t.advice)}</p>`;
        if (t.lucky) {
          const li = t.lucky;
          html += `<div class="zen-lucky">
            <span>Màu may mắn: <b style="color:${li.color}">${li.uni}</b></span>
            <span>Hướng: <b>${li.dir}</b></span>
            <span>Số: <b>${li.num}</b></span>
            <span>Vật: <b>${li.item}</b></span>
          </div>`;
        }
      } else if (tab === 'hours') {
        const h = F.auspiciousHours();
        html += `<h4>🕐 Giờ đẹp hôm nay — ngày ${h.dayLabel}</h4>`;
        html += `<p style="color:var(--muted-gold);font-size:12.5px;margin-bottom:8px">Chấm theo sinh/khắc/hợp/xung ngũ hành giữa giờ canh và ngày — giờ điểm cao càng tốt.</p>`;
        h.good.forEach((g) => {
          const cls = g.score >= 4 ? 'good' : g.score >= 2 ? 'mid' : 'bad';
          html += `<div class="zen-day-row">
            <span class="d-can">${g.name} <small style="color:var(--muted-gold)">${g.label}</small></span>
            <span class="zen-pill ${cls}">${g.score >= 4 ? 'Đại cát' : g.score >= 2 ? 'Bình hòa' : 'Tránh'}</span>
            <span class="d-why">${escapeHtml(g.why || 'trung tính')}</span>
          </div>`;
        });
      } else if (tab === 'days') {
        const days = F.goodDays(birth, 30);
        html += `<h4>📅 Ngày đẹp 30 ngày tới${birth ? '' : ' (chưa có lá số — xếp theo can-chi đồng hành)'}</h4>`;
        days.forEach((d) => {
          const cls = d.score >= 8 ? 'good' : d.score >= 5 ? 'mid' : 'bad';
          const dow = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.date.getDay()];
          html += `<div class="zen-day-row">
            <span class="d-date">${dow} ${String(d.date.getDate()).padStart(2, '0')}/${String(d.date.getMonth() + 1).padStart(2, '0')}</span>
            <span class="d-can">${d.label}</span>
            <span class="zen-pill ${cls}">${d.score}/10</span>
            <span class="d-why">${escapeHtml(d.why)}</span>
          </div>`;
        });
      } else if (tab === 'chart') {
        // ── Lá số TỬ VI ĐẨU SỐ thật (iztro engine) ──
        const b = getBirthObj();
        if (!b) {
          html = `<h4>📜 Lá số Tử Vi</h4><p style="color:var(--muted-gold)">Nhập ngày sinh + giờ sinh + giới tính ở trên rồi bấm "Lập lá số".</p>`;
        } else if (!ZW || !ZW.available()) {
          html = `<h4>📜 Lá số Tử Vi</h4><p style="color:var(--muted-gold)">Engine tử vi chưa sẵn sàng — thử tải lại trang.</p>`;
        } else {
          if (!zwChart) buildZw();
          if (!zwChart) {
            html = `<h4>📜 Lá số Tử Vi</h4><p style="color:var(--muted-gold)">Không lập được lá số — kiểm tra lại ngày/giờ sinh.</p>`;
          } else {
            html += renderZwChart(zwChart);
          }
        }
      } else if (tab === 'han') {
        // ── HẠN VẬN: đại hạn / lưu niên / lưu nguyệt / lưu nhật + 12 tháng tới ──
        const b = getBirthObj();
        if (!b) {
          html = `<h4>🔮 Hạn vận</h4><p style="color:var(--muted-gold)">Nhập đầy đủ ngày + giờ sinh + giới tính rồi bấm "Lập lá số".</p>`;
        } else if (!zwChart) {
          if (!ZW || !ZW.available()) { html = `<h4>🔮 Hạn vận</h4><p style="color:var(--muted-gold)">Engine chưa sẵn sàng.</p>`; }
          else { buildZw(); html = zwChart ? renderZwHan(zwChart) : `<h4>🔮 Hạn vận</h4><p style="color:var(--muted-gold)">Không lập được lá số.</p>`; }
        } else {
          html += renderZwHan(zwChart);
        }
      }
      html += `<div class="zen-note">* Can-chi tính theo lịch thật; nội dung chỉ mang tính tham khảo tu tập, không thay thế nhân quả.</div>`;
      zenBody.innerHTML = html;
    }

    /* ---------- render lá số tử vi 4×4 ---------- */
    const MAJORS = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh', 'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'];
    function starHtml(s) {
      const isMaj = MAJORS.indexOf(s.name) >= 0;
      const el = (ZW.STAR_EL || {})[s.name] || '';
      const elCls = el === 'Mộc' ? ' el-moc' : el === 'Hỏa' ? ' el-hoa' : el === 'Thổ' ? ' el-tho' : el === 'Kim' ? ' el-kim' : el === 'Thủy' ? ' el-thuy' : '';
      const brCls = s.brightness === 'Miếu' || s.brightness === 'Vượng' ? ' br-tot' : (s.brightness === 'Hãm' || s.brightness === 'Bất' ? ' br-xau' : '');
      const sihua = s.sihua ? `<em class="zw-sihua">${s.sihua.replace('Hóa ', '')}</em>` : '';
      const br = s.brightness && s.brightness !== 'Bình' ? `<i>${s.brightness}</i>` : '';
      return `<span class="zw-star${isMaj ? ' maj' : ''}${elCls}${brCls}${s.sihua ? ' has-sihua' : ''}" title="${escapeHtml(s.name)} — ${el}">${escapeHtml(s.name)}${sihua}${br}</span>`;
    }
    function renderZwChart(c) {
      // đảo GRID_POS: [row,col] → palace
      const byPos = {};
      c.palaces.forEach((p) => { const pos = ZW.GRID_POS[p.branchIdx]; if (pos) byPos[pos[0] + ',' + pos[1]] = p; });
      const ming = c.palaces.filter((p) => p.isMing)[0];
      const shen = c.palaces.filter((p) => p.isShen || p.isBody)[0];
      let html = `<div class="zw-head-info">
        <div><b>${escapeHtml(c.chineseDate || '')}</b> · ${escapeHtml(c.lunarDate || '')}</div>
        <div>Cục: <b>${escapeHtml(c.juName)}</b> · Tuổi ${escapeHtml(c.zodiac)} · ${escapeHtml(c.sign)}</div>
        <div>Mệnh cung tại <b>${ming ? escapeHtml(ming.branch) + ' (' + escapeHtml(ming.name) + ')' : '?'}</b>${shen && shen !== ming ? ` · Thân cư <b>${escapeHtml(shen.name)}</b>` : ''}</div>
      </div>`;
      html += `<div class="zw-grid">`;
      for (let r = 0; r < 4; r++) {
        for (let col = 0; col < 4; col++) {
          const p = byPos[r + ',' + col];
          if (!p) {
            // ô trung cung — hiển thị thông tin tóm tắt
            if (r >= 1 && r <= 2 && col >= 1 && col <= 2) {
              const cellIdx = (r - 1) * 2 + (col - 1);
              const sums = [
                ming ? `Mệnh: ${ZW.majorsOf(ming).map((s) => s.name).join(', ') || 'không chính tinh'}` : '',
                c.juInfo ? `${c.juInfo.name}: ${c.juInfo.kw}` : '',
                shen && shen !== ming ? `Thân cư ${shen.name} cung` : 'Thân cư Mệnh',
                'Bấm vào cung để xem luận giải'
              ];
              html += `<div class="zw-cell center"><div class="zw-center-txt">${escapeHtml(sums[cellIdx] || '')}</div></div>`;
            } else {
              html += `<div class="zw-cell empty"></div>`;
            }
            continue;
          }
          const majors = ZW.majorsOf(p);
          const cat = (ZW.PALACE_CAT || {})[p.name] || '';
          const cls = [cat ? 'pc-' + cat : '', p.isMing ? 'is-ming' : '', p.isShen || p.isBody ? 'is-shen' : '', p.empty ? 'is-empty' : ''].join(' ');
          const starsSorted = p.stars.slice().sort((a, b) => (MAJORS.indexOf(b.name) >= 0 ? 1 : 0) - (MAJORS.indexOf(a.name) >= 0 ? 1 : 0));
          html += `<div class="zw-cell ${cls}" data-zw-branch="${p.branchIdx}" data-zw-palace="${c.palaces.indexOf(p)}">
            <div class="zw-cname">${escapeHtml(p.name)}</div>
            <div class="zw-cgz">${escapeHtml(p.stem)} ${escapeHtml(typeof p.branch === 'string' ? p.branch : '')}</div>
            <div class="zw-stars">${starsSorted.map(starHtml).join('')}</div>
            ${p.decadal ? `<div class="zw-dx">Đại hạn ${p.decadal[0]}–${p.decadal[1]}t</div>` : ''}
          </div>`;
        }
      }
      html += `</div><div class="zw-detail" id="zwDetail"><i>Bấm vào một cung để xem luận giải chi tiết.</i></div>`;
      return html;
    }

    /* ---------- render hạn vận ---------- */
    function fmtHoroLevel(lv, label) {
      if (!lv) return '';
      const target = (lv.palaceNames || [])[0] || '';
      let s = `<div class="zw-horo-row"><b>${label}:</b> ${escapeHtml(lv.name || '')} ${escapeHtml(lv.stem)} ${escapeHtml(lv.branch)}`;
      if (target) s += ` — nhập cung <b>${escapeHtml(target)}</b>`;
      s += `</div>`;
      if (lv.mutagen && lv.mutagen.length) {
        const muts = lv.mutagen.map((m) => `${m.label}→${escapeHtml(m.star)}`).join(' · ');
        s += `<div class="zw-horo-mut">Tứ hóa: ${muts}</div>`;
      }
      if (lv.stars && lv.stars.length) {
        const names = lv.stars.map((x) => escapeHtml(x.name)).filter(Boolean).slice(0, 10);
        if (names.length) s += `<div class="zw-horo-stars">Sao lưu: ${names.join(', ')}</div>`;
      }
      return s;
    }
    function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function renderZwHan(c) {
      const ref = zwRefDate ? new Date(zwRefDate + 'T12:00:00') : new Date();
      const refOk = isNaN(ref.getTime()) ? new Date() : ref;
      let html = `<h4>🔮 Hạn vận — đại hạn · lưu niên · lưu nguyệt · lưu nhật</h4>`;
      html += `<div class="zw-datepick">Xem lưu nhật ngày: <input type="date" id="zwDatePick" value="${isoLocal(refOk)}"> <button class="zen-btn" id="zwDateGo" type="button">Xem</button>${zwRefDate ? ' <button class="zen-btn zw-reset" id="zwDateReset" type="button">Hôm nay</button>' : ''}</div>`;
      const h = ZW.horoscope(c, isoLocal(refOk));
      if (!h) return html + `<p style="color:var(--muted-gold)">Không đọc được hạn vận.</p>`;
      html += `<div class="zw-horo">`;
      html += fmtHoroLevel(h.decadal, 'Đại hạn');
      html += fmtHoroLevel(h.year, 'Lưu niên ' + refOk.getFullYear());
      html += fmtHoroLevel(h.month, 'Lưu nguyệt ' + (refOk.getMonth() + 1) + '/' + refOk.getFullYear());
      html += fmtHoroLevel(h.day, 'Lưu nhật ' + isoLocal(refOk));
      html += `</div>`;
      // 12 tháng tới (tính từ tháng đang xem)
      html += `<h4 style="margin-top:14px">🗓 Lưu nguyệt 12 tháng tới</h4>`;
      const now = refOk;
      const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 15);
        const iso = d.getFullYear() + '-' + (d.getMonth() + 1) + '-15';
        const hm = ZW.horoscope(c, iso);
        if (!hm || !hm.month) continue;
        const lv = hm.month;
        const palace = (lv.palaceNames || [])[0] || '';
        const palaceInfo = palace ? (ZW.PALACE_INFO[palace] || {}) : {};
        html += `<div class="zen-day-row">
          <span class="d-date">${months[d.getMonth()]} ${d.getFullYear()}</span>
          <span class="d-can">${escapeHtml(lv.stem)} ${escapeHtml(lv.branch)}</span>
          <span class="d-why">${escapeHtml(palace)}${palaceInfo.kw ? ' — ' + escapeHtml(palaceInfo.kw.split('—')[0].trim()) : ''}</span>
        </div>`;
      }
      html += `<div class="zen-note">* Hạn vận theo lá số thật (engine iztro); chỉ mang tính tham khảo.</div>`;
      return html;
    }

    /* click nút chọn ngày lưu nhật */
    zenBody.addEventListener('click', (e) => {
      if (e.target.id === 'zwDateGo') {
        const inp = document.getElementById('zwDatePick');
        if (inp && inp.value) { zwRefDate = inp.value; renderZen('han'); }
        return;
      }
      if (e.target.id === 'zwDateReset') { zwRefDate = null; renderZen('han'); return; }
      const cell = e.target.closest('.zw-cell[data-zw-branch]');
      if (!cell || !zwChart) return;
      const idx = parseInt(cell.dataset.zwPalace, 10);
      const p = zwChart.palaces[idx];
      const det = document.getElementById('zwDetail');
      if (!p || !det) return;
      const tip = ZW.palaceDetail ? ZW.palaceDetail(zwChart, p, zwChart.palaces) : ZW.palaceTip(p);
      let s = `<div class="zw-detail-title">${escapeHtml(tip.title)}</div>`;
      (tip.sections || [{ h: '', body: tip.body }]).forEach((sec) => {
        if (sec.sub) {
          if (sec.h) s += `<details class="zw-sub"><summary>${escapeHtml(sec.h)}</summary><div class="zw-sec-b">${escapeHtml(sec.body).replace(/\n/g, '<br>')}</div></details>`;
          else s += `<div class="zw-sec-b">${escapeHtml(sec.body).replace(/\n/g, '<br>')}</div>`;
        } else {
          if (sec.h) s += `<div class="zw-sec-h">${escapeHtml(sec.h)}</div>`;
          if (sec.body) s += `<div class="zw-sec-b">${escapeHtml(sec.body).replace(/\n/g, '<br>')}</div>`;
        }
      });
      det.innerHTML = s;
      det.scrollTop = 0;
    });

    bind('btnZenOpen', () => {
      const b = getBirthObj();
      if (zenBirth) zenBirth.value = b ? b.d : '';
      if (zenHour && b) zenHour.value = String(b.h != null ? b.h : 12);
      if (zenGender && b) zenGender.value = b.g || 'male';
      buildZw();
      zenModal.classList.add('visible');
      renderZen(zenTab);
    });
    bind('btnZenClose', () => zenModal.classList.remove('visible'));
    zenModal?.addEventListener('click', (e) => { if (e.target === zenModal) zenModal.classList.remove('visible'); });
    bind('btnZenSave', saveBirth);
    document.querySelectorAll('.zen-tab').forEach((b) => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.zen-tab').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        zenTab = b.dataset.zt;
        renderZen(zenTab);
      });
    });
    if (zenBirth) zenBirth.addEventListener('change', saveBirth);
  })();
})();
