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
  facePlane: new THREE.PlaneGeometry(0.30, 0.26)
};

// ---- face texture: vẽ mặt chibi trên canvas (mắt to, mũi nhỏ, miệng, má hồng)
const faceTexCache = new Map();
function getFaceTexture(variant = 0) {
  const key = 'f' + variant;
  if (faceTexCache.has(key)) return faceTexCache.get(key);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 220;
  const g = c.getContext('2d');
  const eye = (cx, flip) => {
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(cx, 88, 26, 34, 0, 0, 7); g.fill();
    g.fillStyle = '#241812'; g.beginPath(); g.ellipse(cx + (flip ? -4 : 4), 92, 15, 21, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(cx + (flip ? -9 : 9), 84, 5, 7, 0, 0, 7); g.fill();
  };
  eye(78, true); eye(178, false);
  // lông mày
  g.strokeStyle = '#3a2418'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(54, 52); g.quadraticCurveTo(78, 40, 102, 50); g.stroke();
  g.beginPath(); g.moveTo(154, 50); g.quadraticCurveTo(178, 40, 202, 52); g.stroke();
  if (variant === 1) { // nữ: lông mi
    g.lineWidth = 4;
    for (const sx of [-1, 1]) {
      g.beginPath(); g.moveTo(78 + sx * 26, 76); g.lineTo(78 + sx * 34, 70); g.stroke();
      g.beginPath(); g.moveTo(178 + sx * 26, 76); g.lineTo(178 + sx * 34, 70); g.stroke();
    }
  }
  // mũi nhỏ
  g.strokeStyle = '#c78a5e'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(128, 118); g.quadraticCurveTo(124, 126, 128, 130); g.stroke();
  // miệng
  g.strokeStyle = '#8a3a28'; g.lineWidth = 6;
  g.beginPath();
  if (variant === 2) g.moveTo(112, 148), g.quadraticCurveTo(128, 164, 144, 148); // cười to
  else if (variant === 1) g.moveTo(114, 152), g.quadraticCurveTo(128, 160, 142, 152); // mỉm
  else g.moveTo(116, 152), g.quadraticCurveTo(128, 158, 140, 152);
  g.stroke();
  // má hồng
  g.fillStyle = 'rgba(240,120,90,.5)';
  g.beginPath(); g.ellipse(52, 132, 17, 11, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(204, 132, 17, 11, 0, 0, 7); g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  faceTexCache.set(key, tex);
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
  shoulders.position.y = 0.45;
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

  // đầu = da mặt; tóc là khối riêng đẩy lùi ra sau (mặt trốn trước lộ ra)
  const faceV = face >= 0 ? face : Math.floor(Math.random() * 3);
  const skinHead = new THREE.Mesh(GEO.head, M(COL.skin, { roughness: 0.6 }));
  skinHead.scale.set(0.98, 0.95, 0.98);
  const hair = new THREE.Mesh(GEO.head, M(COL.hair));
  hair.scale.set(1.02, 0.98, 1.02);
  hair.position.set(0, 0.045, 0.045); // tóc đẩy về phía sau → mặt trước lộ da
  const hairHi = new THREE.Mesh(GEO.hairTop, M(0x3e2c22));
  hairHi.scale.set(0.85, 0.8, 0.85);
  hairHi.position.set(-0.05, 0.06, 0.07);
  head.add(skinHead, hair, hairHi);
  // bím/tóc nữ (variant 1)
  if (faceV === 1) {
    const bun = new THREE.Mesh(GEO.ear, M(COL.hair));
    bun.scale.set(2.6, 3.6, 2.4);
    bun.position.set(0, -0.22, 0.24);
    head.add(bun);
  }
  // mặt: plane texture chibi ở phía trước đầu (-z, hướng Phật)
  const faceMesh = new THREE.Mesh(GEO.facePlane, new THREE.MeshBasicMaterial({
    map: getFaceTexture(faceV), transparent: true, depthWrite: false
  }));
  faceMesh.position.set(0, -0.045, -0.232);
  faceMesh.rotation.x = 0.06;
  head.add(faceMesh);
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(GEO.ear, M(COL.skin));
    ear.position.set(sx * 0.245, -0.02, 0.02);
    head.add(ear);
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
  return { group, hip, head, arms, legs };
}

/** Lạy: tween xoay hip về góc gập (rad) — đảnh lễ tam bái */
export function bowTo(devotee, angle, dur = 0.5, ease = 'power2.inOut') {
  if (window.gsap) {
    window.gsap.to(devotee.hip.rotation, { x: angle, duration: dur, ease });
  } else {
    devotee.hip.rotation.x = angle;
  }
}
