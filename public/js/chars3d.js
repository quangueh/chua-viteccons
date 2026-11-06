/**
 * chars3d.js — Nhân vật chibi kỹ sư/phật tử Viteccons dựng bằng Three.js primitives.
 * Quay lưng về phía camera: đầu cầu tóc đen + mũ bảo hộ trắng bóng (hoặc xanh),
 * áo trắng + giáp phản quang đỏ-cam, logo VITECCONS dán lưng, ngồi bắt chéo trên chiếu cói.
 *
 * makeDevotee({ hat:'white'|'green', sitting:true|false, vest:true })
 *   -> { group, hip, head, legs:{l,r}, bow(t), breathe(t) }
 *   hip: group pivot tại khớp hông — xoay hip.rotation.x để đảnh lễ.
 */
import * as THREE from '/vendor/three.module.js';

const COL = {
  shirt: 0xf8f5ee,
  shirtShade: 0xe0dacc,
  red: 0xd22e1e,
  orange: 0xec6810,
  reflect: 0xe9e6d6,
  pants: 0x2a3250,
  hair: 0x18100d,
  skin: 0xf0c498,
  hatWhite: 0xfdfcf9,
  hatGreen: 0x38aa54,
  band: 0x2b5ea7,
  mat: 0xd6a860,
  matEdge: 0x7a2c18,
  shoe: 0x16100c
};

// ---- shared material cache ------------------------------------------------
const matCache = new Map();
function M(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.85,
      metalness: opts.metalness ?? 0.0,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0
    }));
  }
  return matCache.get(key);
}

const GEO = {
  head: new THREE.SphereGeometry(0.24, 28, 20),
  ear: new THREE.SphereGeometry(0.045, 10, 8),
  hairTop: new THREE.SphereGeometry(0.245, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.62),
  hatDome: new THREE.SphereGeometry(0.295, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.52),
  hatBrim: new THREE.TorusGeometry(0.30, 0.032, 10, 32),
  hatBand: new THREE.TorusGeometry(0.285, 0.018, 8, 32),
  hatRidge: new THREE.BoxGeometry(0.045, 0.02, 0.34),
  torso: new THREE.CylinderGeometry(0.235, 0.30, 0.42, 20),
  shoulderCap: new THREE.SphereGeometry(0.235, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
  vestBand: new THREE.CylinderGeometry(0.30, 0.315, 0.055, 20, 1, true),
  vestBand2: new THREE.CylinderGeometry(0.305, 0.32, 0.11, 20, 1, true),
  vestBand3: new THREE.CylinderGeometry(0.315, 0.325, 0.09, 20, 1, true),
  arm: new THREE.CapsuleGeometry(0.055, 0.30, 6, 12),
  hand: new THREE.SphereGeometry(0.055, 10, 8),
  legSit: new THREE.SphereGeometry(0.155, 16, 12),
  legStand: new THREE.CapsuleGeometry(0.085, 0.42, 6, 12),
  shoe: new THREE.SphereGeometry(0.10, 12, 8),
  mat: new THREE.BoxGeometry(1.15, 0.055, 0.82),
  matTrim: new THREE.BoxGeometry(1.21, 0.04, 0.88),
  logoPlane: new THREE.PlaneGeometry(0.34, 0.20),
  neck: new THREE.CylinderGeometry(0.075, 0.095, 0.16, 12),
  jaw: new THREE.SphereGeometry(0.155, 18, 14),
  noseTip: new THREE.SphereGeometry(0.019, 10, 8),
  faceShell: new THREE.SphereGeometry(0.242, 40, 32, Math.PI * 1.5 - 1.15, 2.3, 0.55, 1.85),
  fringe: new THREE.SphereGeometry(0.212, 26, 12, 0, Math.PI * 2, Math.PI * 0.30, Math.PI * 0.30),
  sideHair: new THREE.CapsuleGeometry(0.030, 0.11, 4, 8)
};

// ---- vẽ khuôn mặt trên canvas: mắt hạnh nhân có tròng/lông mi,
// mày cong, mũi nhỏ, môi đỏ — phong cách semi-real dễ nhìn ----
const faceCache = new Map();
function getFaceTexture(variant, closed) {
  const key = `${variant}|${closed ? 1 : 0}`;
  if (faceCache.has(key)) return faceCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const eyeY = 236, eyeDX = 92, eyeW = 46, eyeH = 34;
  for (const s of [-1, 1]) {
    const cx = 256 + s * eyeDX;
    if (closed) {
      // mắt nhắm: đường mi cong xuống + lông mi
      g.strokeStyle = '#3a2018'; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx - eyeW * 0.9, eyeY - 4);
      g.quadraticCurveTo(cx, eyeY + 16, cx + eyeW * 0.9, eyeY - 4); g.stroke();
      g.lineWidth = 4;
      for (const fx of [-0.5, 0, 0.5]) {
        g.beginPath(); g.moveTo(cx + fx * eyeW, eyeY + 7);
        g.lineTo(cx + fx * eyeW, eyeY + 14); g.stroke();
      }
      continue;
    }
    // tròng trắng hình hạnh nhân
    g.fillStyle = '#fdfdfd';
    g.beginPath();
    g.moveTo(cx - eyeW, eyeY);
    g.quadraticCurveTo(cx - eyeW * 0.5, eyeY - eyeH, cx, eyeY - eyeH);
    g.quadraticCurveTo(cx + eyeW * 0.6, eyeY - eyeH, cx + eyeW, eyeY);
    g.quadraticCurveTo(cx + eyeW * 0.5, eyeY + eyeH * 0.75, cx, eyeY + eyeH * 0.75);
    g.quadraticCurveTo(cx - eyeW * 0.6, eyeY + eyeH * 0.75, cx - eyeW, eyeY);
    g.fill();
    // mống mắt nâu gradient
    const ig = g.createRadialGradient(cx, eyeY - 4, 2, cx, eyeY - 4, eyeW * 0.62);
    ig.addColorStop(0, '#c8842a'); ig.addColorStop(0.55, '#7a4a1e'); ig.addColorStop(1, '#3a2010');
    g.fillStyle = ig;
    g.beginPath(); g.ellipse(cx, eyeY - 2, eyeW * 0.58, eyeH * 0.78, 0, 0, 7); g.fill();
    g.fillStyle = '#160c08';
    g.beginPath(); g.ellipse(cx, eyeY - 2, eyeW * 0.24, eyeH * 0.36, 0, 0, 7); g.fill();
    // điểm sáng
    g.fillStyle = 'rgba(255,255,255,.95)';
    g.beginPath(); g.ellipse(cx - eyeW * 0.18, eyeY - eyeH * 0.4, eyeW * 0.16, eyeH * 0.18, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.beginPath(); g.ellipse(cx + eyeW * 0.2, eyeY + eyeH * 0.28, eyeW * 0.09, eyeH * 0.1, 0, 0, 7); g.fill();
    // mi trên dày, hơi xếch ngoài
    g.strokeStyle = '#241008'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - eyeW * 0.95, eyeY + 2);
    g.quadraticCurveTo(cx - eyeW * 0.4, eyeY - eyeH - 6, cx, eyeY - eyeH - 4);
    g.quadraticCurveTo(cx + eyeW * 0.7, eyeY - eyeH - 6, cx + eyeW * 1.08, eyeY - 8); g.stroke();
    if (variant === 1) { // nữ: lông mi xoè
      g.lineWidth = 5;
      for (const f of [0, 1, 2]) {
        g.beginPath();
        g.moveTo(cx + s * eyeW * (0.7 + f * 0.18), eyeY - 8 + f * 3);
        g.lineTo(cx + s * eyeW * (1.05 + f * 0.22), eyeY - 16 + f * 4); g.stroke();
      }
    }
    // mi dưới mỏng
    g.strokeStyle = 'rgba(60,30,16,.7)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx - eyeW * 0.6, eyeY + eyeH * 0.72);
    g.quadraticCurveTo(cx, eyeY + eyeH * 0.95, cx + eyeW * 0.6, eyeY + eyeH * 0.72); g.stroke();
    // nếp mí
    g.strokeStyle = 'rgba(120,70,40,.45)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(cx - eyeW * 0.8, eyeY - eyeH - 14);
    g.quadraticCurveTo(cx, eyeY - eyeH - 24, cx + eyeW * 0.8, eyeY - eyeH - 14); g.stroke();
  }
  // lông mày cong
  for (const s of [-1, 1]) {
    const bx = 256 + s * 95;
    g.strokeStyle = variant === 1 ? '#4a2c1a' : '#2e1a10';
    g.lineWidth = variant === 1 ? 8 : 11;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(bx - s * 38, 186);
    g.quadraticCurveTo(bx - s * 8, 168, bx + s * 40, 176);
    g.stroke();
  }
  // mũi: bóng sống + cánh nhỏ + điểm sáng chóp
  g.strokeStyle = 'rgba(150,85,50,.5)'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(256, 268); g.quadraticCurveTo(252, 288, 250, 296); g.stroke();
  g.beginPath(); g.moveTo(247, 300); g.quadraticCurveTo(256, 304, 265, 300); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.4)';
  g.beginPath(); g.ellipse(256, 296, 7, 4, 0, 0, 7); g.fill();
  // môi
  const lipY = 352;
  if (variant === 2) { // cười mở
    g.fillStyle = '#7a2e22';
    g.beginPath();
    g.moveTo(256 - 34, lipY - 4);
    g.quadraticCurveTo(256, lipY + 30, 256 + 34, lipY - 4);
    g.quadraticCurveTo(256, lipY + 12, 256 - 34, lipY - 4);
    g.fill();
    g.strokeStyle = '#8a3226'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(256 - 34, lipY - 4);
    g.quadraticCurveTo(256, lipY + 12, 256 + 34, lipY - 4); g.stroke();
  } else {
    const lg = g.createLinearGradient(0, lipY - 10, 0, lipY + 26);
    lg.addColorStop(0, '#c85a48'); lg.addColorStop(1, '#e8907a');
    g.fillStyle = lg;
    g.beginPath();
    g.moveTo(256 - 30, lipY);
    g.quadraticCurveTo(256, lipY + 8, 256 + 30, lipY);
    g.quadraticCurveTo(256, lipY + 34, 256 - 30, lipY);
    g.fill();
    g.strokeStyle = '#8a3226'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(256 - 30, lipY);
    g.quadraticCurveTo(256, lipY + 8, 256 + 30, lipY); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)';
    g.beginPath(); g.ellipse(256, lipY + 16, 12, 4, 0, 0, 7); g.fill();
  }
  // má hồng mờ
  for (const s of [-1, 1]) {
    const bg = g.createRadialGradient(256 + s * 140, 305, 4, 256 + s * 140, 305, 40);
    bg.addColorStop(0, 'rgba(240,110,90,.4)'); bg.addColorStop(1, 'rgba(240,110,90,0)');
    g.fillStyle = bg;
    g.beginPath(); g.ellipse(256 + s * 140, 305, 42, 26, 0, 0, 7); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  faceCache.set(key, tex);
  return tex;
}

let logoTex = null;
function getLogoTexture() {
  if (!logoTex) {
    logoTex = new THREE.TextureLoader().load('/assets/viteccons_logo.png');
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = 4;
  }
  return logoTex;
}

let shadowTex = null;
function getShadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.7, 'rgba(0,0,0,0.28)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}

function blobShadow(radius = 0.62, opacity = 0.5) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    new THREE.MeshBasicMaterial({
      map: getShadowTexture(), transparent: true, opacity,
      depthWrite: false
    })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.012;
  return m;
}

/**
 * Nhân vật chibi quay lưng. Gốc group đặt tại mặt đất (y=0).
 * sitting=true: ngồi bắt chéo; false: đứng (đi bộ).
 */
export function makeDevotee({ hat = 'white', sitting = true, face = -1 } = {}) {
  const group = new THREE.Group();
  const hatCol = hat === 'green' ? COL.hatGreen : COL.hatWhite;
  const hatMat = M(hatCol, { roughness: 0.22, metalness: 0.06 });

  // ---- khớp hông: xoay để lạy ----
  const hip = new THREE.Group();
  hip.position.y = sitting ? 0.20 : 0.66;
  group.add(hip);

  // ---- chân ----
  const legs = { l: null, r: null };
  if (sitting) {
    const legGeo = GEO.legSit;
    const ll = new THREE.Mesh(legGeo, M(COL.pants));
    ll.scale.set(1.5, 0.55, 1.1);
    ll.position.set(-0.19, 0.13, 0.04);
    ll.rotation.y = 0.5;
    const rl = ll.clone();
    rl.position.x = 0.19;
    rl.rotation.y = -0.5;
    group.add(ll, rl);
    legs.l = ll; legs.r = rl;
  } else {
    const mkLeg = (sx) => {
      const g = new THREE.Group();
      g.position.set(sx * 0.13, 0.66, 0);
      const leg = new THREE.Mesh(GEO.legStand, M(COL.pants));
      leg.position.y = -0.32;
      const shoe = new THREE.Mesh(GEO.shoe, M(COL.shoe));
      shoe.scale.set(1.1, 0.55, 1.6);
      shoe.position.set(0, -0.60, -0.06);
      g.add(leg, shoe);
      group.add(g);
      return g;
    };
    legs.l = mkLeg(-1);
    legs.r = mkLeg(1);
  }

  // ---- thân (con của hip để lạy cùng) ----
  const torso = new THREE.Mesh(GEO.torso, M(COL.shirt));
  torso.position.y = 0.24;
  const shoulders = new THREE.Mesh(GEO.shoulderCap, M(COL.shirt));
  shoulders.position.y = 0.40;
  shoulders.scale.set(1.0, 0.82, 0.88);
  hip.add(torso, shoulders);

  // giáp: 3 band (phản quang / đỏ / cam)
  const b1 = new THREE.Mesh(GEO.vestBand, M(COL.reflect));
  b1.position.y = 0.30;
  const b2 = new THREE.Mesh(GEO.vestBand2, M(COL.red));
  b2.position.y = 0.21;
  const b3 = new THREE.Mesh(GEO.vestBand3, M(COL.orange));
  b3.position.y = 0.11;
  hip.add(b1, b2, b3);

  // logo VITECCONS trên lưng (phía +z = quay về camera)
  const logo = new THREE.Mesh(GEO.logoPlane, new THREE.MeshBasicMaterial({
    map: getLogoTexture(), transparent: true, opacity: 0.97
  }));
  logo.position.set(0, 0.37, 0.252);
  logo.rotation.x = -0.09;
  hip.add(logo);

  // ---- tay: từ vai xuống đùi ----
  const arms = { l: null, r: null };
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(GEO.arm, M(COL.shirt));
    const hand = new THREE.Mesh(GEO.hand, M(COL.skin));
    arm.position.set(sx * 0.315, 0.26, 0.06);
    arm.rotation.z = sx * 0.28;
    arm.rotation.x = -0.18;
    hand.position.set(sx * 0.36, 0.10, 0.10);
    hip.add(arm, hand);
    arms[sx < 0 ? 'l' : 'r'] = { arm, hand };
  }

  // ---- đầu + mũ (con của hip) ----
  const head = new THREE.Group();
  head.position.y = 0.66;
  hip.add(head);

  // đầu người: sọ dài + hàm/cằm riêng + cổ — mặt ở -z (hướng Phật)
  const faceV = face >= 0 ? face : Math.floor(Math.random() * 3);
  const skin = M(COL.skin, { roughness: 0.62 });
  const skull = new THREE.Mesh(GEO.head, skin);
  skull.scale.set(0.94, 1.0, 0.94);            // hẹp ngang, cao hơn → sọ người
  const jaw = new THREE.Mesh(GEO.jaw, skin);
  jaw.scale.set(0.88, 0.58, 0.82);             // cằm nhỏ gọn dưới mặt
  jaw.position.set(0, -0.175, 0.015);
  const neck = new THREE.Mesh(GEO.neck, skin);
  neck.position.y = -0.26;
  head.add(skull, jaw, neck);

  // tóc: mái phía trước trán + phủ đỉnh/sau + 2 bên tai
  const hairMat = M(COL.hair);
  const fringe = new THREE.Mesh(GEO.fringe, hairMat);
  fringe.position.set(0, 0.10, -0.02);
  fringe.rotation.x = -0.12;
  const hairBack = new THREE.Mesh(GEO.head, hairMat);
  hairBack.scale.set(0.97, 1.0, 0.97);
  hairBack.position.set(0, 0.03, 0.035);
  const hairHi = new THREE.Mesh(GEO.hairTop, M(0x3e2c22));
  hairHi.scale.set(0.82, 0.78, 0.82);
  hairHi.position.set(-0.05, 0.05, 0.06);
  head.add(fringe, hairBack, hairHi);
  for (const sx of [-1, 1]) {                  // tóc mai 2 bên
    const lock = new THREE.Mesh(GEO.sideHair, hairMat);
    lock.position.set(sx * 0.215, -0.02, -0.045);
    lock.rotation.z = sx * 0.15;
    head.add(lock);
  }
  if (faceV === 1) {                            // nữ: búi tóc + tóc dài vai
    const bun = new THREE.Mesh(GEO.ear, hairMat);
    bun.scale.set(2.6, 3.6, 2.4);
    bun.position.set(0, -0.22, 0.24);
    head.add(bun);
    for (const sx of [-1, 1]) {
      const long = new THREE.Mesh(GEO.sideHair, hairMat);
      long.scale.set(1.15, 2.1, 1.0);
      long.position.set(sx * 0.225, -0.14, 0.02);
      head.add(long);
    }
  }

  // vo mat cong om theo so + texture ve
  const faceMat = new THREE.MeshStandardMaterial({
    map: getFaceTexture(faceV, false),
    transparent: true, roughness: 0.55, depthWrite: false
  });
  const shell = new THREE.Mesh(GEO.faceShell, faceMat);
  shell.scale.set(0.97, 1.02, 0.96);
  head.add(shell);
  const faceParts = {
    mat: faceMat,
    open: getFaceTexture(faceV, false),
    closed: getFaceTexture(faceV, true)
  };
  const noseTip = new THREE.Mesh(GEO.noseTip, skin);
  noseTip.scale.set(0.9, 0.6, 0.6);
  noseTip.position.set(0, -0.02, -0.242);
  head.add(noseTip);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(GEO.ear, skin);
    ear.scale.set(0.8, 1.1, 0.55);
    ear.position.set(sx * 0.232, -0.03, -0.01);
    head.add(ear);
    const earIn = new THREE.Mesh(GEO.ear, M(0xd89a70));
    earIn.scale.set(0.45, 0.65, 0.3);
    earIn.position.set(sx * 0.236, -0.03, -0.028);
    head.add(earIn);
  }
  const dome = new THREE.Mesh(GEO.hatDome, hatMat);
  dome.position.y = 0.10;
  head.add(dome);
  const brim = new THREE.Mesh(GEO.hatBrim, hatMat);
  brim.rotation.x = Math.PI / 2;
  brim.position.y = 0.115;
  head.add(brim);
  const band = new THREE.Mesh(GEO.hatBand, M(COL.band, { roughness: 0.4 }));
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.135;
  head.add(band);
  const ridge = new THREE.Mesh(GEO.hatRidge, hatMat);
  ridge.position.y = 0.375;
  ridge.rotation.x = 0.06;
  head.add(ridge);

  // ---- chiếu cói + bóng ----
  if (sitting) {
    const trim = new THREE.Mesh(GEO.matTrim, M(COL.matEdge));
    trim.position.y = 0.028;
    const mat = new THREE.Mesh(GEO.mat, M(COL.mat));
    mat.position.y = 0.055;
    group.add(trim, mat);
  }
  group.add(blobShadow(sitting ? 0.66 : 0.42));

  group.traverse((o) => { if (o.isMesh) o.matrixAutoUpdate = true; });
  return { group, hip, head, arms, legs, faceParts };
}

/** Lạy: tween xoay hip về góc gập (rad) — đảnh lễ tam bái */
export function bowTo(devotee, angle, dur = 0.5, ease = 'power2.inOut') {
  if (window.gsap) {
    window.gsap.to(devotee.hip.rotation, { x: angle, duration: dur, ease });
  } else {
    devotee.hip.rotation.x = angle;
  }
}
