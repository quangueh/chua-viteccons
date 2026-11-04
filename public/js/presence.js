/**
 * TempleNet — Lớp realtime chùa dùng chung (không server riêng).
 * Mọi trình duyệt nói chuyện qua HAI kênh công cộng song song: ntfy.sh
 * (SSE → WS → polling dự phòng) và MQTT public broker (EMQ X qua WSS).
 * Máy chỉ tới được một trong hai kênh vẫn tham gia bình thường:
 * heartbeat 5s mang theo tên + chiếu + công đức; claim chiếu/hàng chờ theo
 * luật "claim sớm nhất thắng, đầu hàng được vào trước" — mọi client áp cùng
 * luật nên hội tụ về cùng một sơ đồ 48 chiếu. Thoát web gửi 'bye' tức thì
 * (sendBeacon) → nhả ghế ngay; chỉ khi treo/mất mạng mới chờ stale 90s —
 * đủ rộng để tab chạy nền bị Chrome throttle timer vẫn không bị "bay màu".
 * Mất kết nối → chạy một mình như cũ.
 */
const MeshNet = function () {
  const TOPIC = 'cvtc-hall-8f3k2qz';
  const BASE = 'https://ntfy.sh';
  const HEARTBEAT_MS = 8000;
  const STALE_MS = 90000; // tab ẩn bị throttle ~60s vẫn còn sống; thoát thật báo 'bye' ngay
  const TOTAL_SEATS = 48;

  // sid tồn tại theo tab — reload giữ, đóng tab mất (khớp "thoát web mất ghế")
  let sid = sessionStorage.getItem('cvtc_sid');
  if (!sid) {
    sid = 's' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('cvtc_sid', sid);
  }

  const me = {
    sid,
    name: '',          // pháp danh đã ghi danh ('' = chưa)
    seat: -1,          // chiếu đang claim (-1 = chưa)
    claimTs: 0,        // mốc claim của mình (để phân thắng)
    enqTs: 0,          // mốc vào hàng chờ (0 = không xếp hàng)
    merit: 0
  };

  // sid -> { name, seat, claimTs, enqTs, merit, lastSeen }
  const peers = new Map();
  const recentRits = [];   // sự kiện nghi thức (local + remote) cho nhật ký
  const seenRits = new Set();
  let onChangeCb = null;
  let onRitualCb = null;
  let onSeatLostCb = null;
  let ws = null;
  let hbTimer = null;
  let pruneTimer = null;
  let retryMs = 3000;
  let started = false;
  let dirty = false;

  function now() { return Date.now(); }

  function markDirty() {
    if (dirty) return;
    dirty = true;
    setTimeout(flush, 60);
  }

  function flush() {
    dirty = false;
    // Claim của mình thua người đến trước? → nhả chiếu, quay về hàng chờ
    if (me.seat >= 0) {
      const r = roster();
      const w = r.seats[me.seat];
      if (w && w.uniqueId !== sid) {
        const lost = me.seat;
        me.seat = -1; me.claimTs = 0; me.enqTs = now();
        pub({ t: 'enq', ts: me.enqTs, name: me.name });
        heartbeat();
        if (typeof onSeatLostCb === 'function') onSeatLostCb(lost);
      }
    } else {
      maybePromoteMyself();
    }
    if (typeof onChangeCb === 'function') onChangeCb();
  }

  // ── publish / subscribe: phát trên MỌI kênh đang sống (ntfy + MQTT) ─────
  let mqttClient = null;
  let midCounter = 0;
  const seenMids = new Set(); // dedupe: cùng 1 tin đi 2 kênh → chỉ xử lý 1 lần

  function pub(obj) {
    try {
      obj.app = 'cv1';
      obj.sid = sid;
      obj.mid = sid + ':' + (midCounter++) + ':' + now();
      const body = JSON.stringify(obj);
      // kênh 1: ntfy.sh
      const sendNtfy = () => fetch(`${BASE}/${TOPIC}`, {
        method: 'POST',
        body,
        keepalive: true
      });
      sendNtfy().catch(() => { setTimeout(() => sendNtfy().catch(() => { }), 2500); });
      // kênh 2: MQTT public broker (EMQ X) — sống độc lập, cứu khi ntfy bị chặn
      try {
        if (mqttClient && mqttClient.connected) mqttClient.publish(TOPIC, body, { qos: 0 });
      } catch (_) { }
    } catch (_) { }
  }

  function connectMqtt() {
    if (!window.mqtt || !window.mqtt.connect) { setTimeout(connectMqtt, 3000); return; }
    try {
      mqttClient = window.mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: 'cvtc_' + sid,
        keepalive: 20,
        reconnectPeriod: 5000,
        connectTimeout: 12000,
        clean: true,
        // broker tự báo 'bye' cho mọi người nếu mình rớt mạng/tắt máy đột ngột
        will: { topic: TOPIC, payload: JSON.stringify({ app: 'cv1', t: 'bye', sid }), qos: 0 }
      });
    } catch (_) { setTimeout(connectMqtt, 8000); return; }
    mqttClient.on('connect', () => {
      try {
        mqttClient.subscribe(TOPIC, { qos: 0 });
        heartbeat();
      } catch (_) { }
    });
    mqttClient.on('message', (topic, payload) => {
      try { handleMessage(payload.toString()); } catch (_) { }
    });
    mqttClient.on('error', () => { });
    mqttClient.on('close', () => { });
  }

  // feed nhật ký: ai vào chiếu / ra về / xếp hàng — đồng bộ qua kênh chung
  function pushFeed(ev) {
    ev.remote = true;
    recentRits.unshift(ev);
    if (recentRits.length > 30) recentRits.length = 30;
  }
  function noteSeatChange(p, newSeat, ts) {
    const old = p.seat;
    if (old === newSeat) return;
    p.seat = newSeat;
    if (newSeat < 0) p.claimTs = 0;
    if (old < 0 && newSeat >= 0) {
      pushFeed({ type: 'seatTaken', user: p.name || 'Thí Chủ', uniqueId: p.sid, seatIdx: newSeat, ts });
    } else if (old >= 0 && newSeat < 0) {
      pushFeed({ type: 'seatVacated', user: p.name || 'Thí Chủ', uniqueId: p.sid, seatIdx: old, ts });
    }
  }

  function handleMessage(raw) {
    let m;
    try { m = JSON.parse(raw); } catch (_) { return; }
    if (!m || m.app !== 'cv1' || !m.sid || m.sid === sid) return;
    if (m.mid) {
      if (seenMids.has(m.mid)) return;
      seenMids.add(m.mid);
      if (seenMids.size > 1200) seenMids.clear();
    }
    const t = now();
    let p = peers.get(m.sid);
    if (!p) {
      p = { sid: m.sid, name: '', seat: -1, claimTs: 0, enqTs: 0, merit: 0, lastSeen: 0 };
      peers.set(m.sid, p);
    }
    p.lastSeen = t;
    if (typeof m.name === 'string' && m.name) p.name = m.name.slice(0, 40);
    switch (m.t) {
      case 'pres': {
        const seat = Number.isInteger(m.seat) ? m.seat : -1;
        noteSeatChange(p, seat, t);
        if (m.claimTs) p.claimTs = m.claimTs;
        p.enqTs = m.enqTs || 0;
        p.merit = Math.max(0, m.merit | 0);
        markDirty();
        break;
      }
      case 'claim': {
        const seat = Number.isInteger(m.seat) ? m.seat : -1;
        if (seat >= 0 && seat < TOTAL_SEATS) {
          // chỉ nhận claim sớm hơn claim đã biết của sid đó cho chiếu này
          if (!p.claimTs || m.ts < p.claimTs || p.seat !== seat) {
            noteSeatChange(p, seat, m.ts || t);
            p.claimTs = m.ts || t;
          }
          p.enqTs = 0; // đã có chiếu thì khỏi hàng chờ
          markDirty();
        }
        break;
      }
      case 'vacate': {
        if (Number.isInteger(m.seat) && p.seat === m.seat) {
          noteSeatChange(p, -1, t);
        }
        break;
      }
      case 'enq': {
        if (m.ts && (!p.enqTs || m.ts < p.enqTs)) {
          p.enqTs = m.ts;
          pushFeed({ type: 'queued', user: p.name || 'Thí Chủ', uniqueId: m.sid, position: 0, ts: m.ts });
        }
        markDirty();
        break;
      }
      case 'deq': {
        p.enqTs = 0;
        markDirty();
        break;
      }
      case 'rit': {
        const key = m.sid + ':' + m.ts + ':' + m.kind;
        if (seenRits.has(key)) break;
        seenRits.add(key);
        if (seenRits.size > 600) seenRits.clear();
        const ev = {
          type: m.kind || 'burnIncense',
          user: p.name || m.name || 'Thí Chủ',
          uniqueId: m.sid,
          wish: String(m.wish || '').slice(0, 140),
          merit: Math.max(0, m.merit | 0),
          count: m.count || 0,
          giftName: m.giftName || '',
          fortune: m.fno ? { number: m.fno, rank: m.frank || '', title: m.ftitle || '' } : null,
          seatIdx: Number.isInteger(m.seat) ? m.seat : -1,
          ts: m.ts || t,
          remote: true
        };
        recentRits.unshift(ev);
        if (recentRits.length > 30) recentRits.length = 30;
        if (typeof onRitualCb === 'function') onRitualCb(ev);
        markDirty();
        break;
      }
      case 'merit': {
        p.merit = Math.max(0, m.merit | 0);
        markDirty();
        break;
      }
      case 'bye': {
        // người đó thoát web thật → xóa ngay khỏi sơ đồ, nhả chiếu tức thì
        noteSeatChange(p, -1, t);
        peers.delete(m.sid);
        markDirty();
        break;
      }
    }
  }

  // ── kênh nhận: SSE trước (qua proxy tốt hơn WS) → WS → polling dự phòng ──
  let es = null;
  let pollTimer = null;
  let connecting = false;

  function dispatchOuter(data) {
    try {
      const outer = JSON.parse(data);
      if (outer.event === 'message') handleMessage(outer.message);
    } catch (_) { }
  }

  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }
  function pollOnce() {
    fetch(`${BASE}/${TOPIC}/json?poll=1&since=120s`)
      .then((r) => r.text())
      .then((txt) => {
        txt.split('\n').forEach((line) => { if (line.trim()) dispatchOuter(line); });
        markDirty();
      })
      .catch(() => { });
  }
  function startPoll() {
    if (pollTimer) return;
    pollOnce();
    pollTimer = setInterval(pollOnce, 6000);
  }

  function connect() {
    if (connecting) return;
    connecting = true;
    connectSSE();
  }

  function connectSSE() {
    try { es = new EventSource(`${BASE}/${TOPIC}/sse`); }
    catch (_) { connecting = false; connectWs(); return; }
    const openTimer = setTimeout(() => {
      if (!es || es.readyState !== EventSource.OPEN) {
        try { es && es.close(); } catch (_) { }
        es = null; connecting = false; connectWs();
      }
    }, 9000);
    es.onopen = () => {
      clearTimeout(openTimer); connecting = false;
      stopPoll(); retryMs = 3000; heartbeat();
    };
    es.onmessage = (e) => dispatchOuter(e.data);
    es.onerror = () => {
      // EventSource tự reconnect khi readyState=CONNECTING; CLOSED = chết hẳn → WS
      if (!es || es.readyState === EventSource.CLOSED) {
        clearTimeout(openTimer);
        try { es && es.close(); } catch (_) { }
        es = null; connecting = false; connectWs();
      }
    };
  }

  function connectWs() {
    try { ws = new WebSocket(`wss://ntfy.sh/${TOPIC}/ws`); }
    catch (_) { startPoll(); scheduleReconnect(); return; }
    const openTimer = setTimeout(() => {
      if (ws && ws.readyState !== WebSocket.OPEN) { try { ws.close(); } catch (_) { } }
    }, 9000);
    ws.onmessage = (e) => dispatchOuter(e.data);
    ws.onopen = () => {
      clearTimeout(openTimer);
      stopPoll(); retryMs = 3000; heartbeat();
    };
    ws.onclose = () => {
      clearTimeout(openTimer);
      startPoll();           // không nhận trực tiếp được thì vẫn polling để thấy người khác
      scheduleReconnect();   // nền vẫn thử SSE lại để thoát chế độ polling
    };
    ws.onerror = () => { try { ws.close(); } catch (_) { } };
  }
  function scheduleReconnect() {
    setTimeout(connect, retryMs);
    retryMs = Math.min(30000, retryMs * 2);
  }

  function heartbeat() {
    pub({
      t: 'pres',
      name: me.name,
      seat: me.seat,
      claimTs: me.seat >= 0 ? me.claimTs : 0,
      enqTs: me.seat < 0 ? me.enqTs : 0,
      merit: me.merit
    });
  }

  function prune() {
    const t = now();
    let changed = false;
    for (const [k, p] of peers) {
      if (t - p.lastSeen > STALE_MS) { peers.delete(k); changed = true; }
    }
    if (changed) markDirty();
  }

  // Người đang xếp hàng tự xét: nếu vị trí của mình <= số ghế trống → claim ghế
  function maybePromoteMyself() {
    if (me.seat >= 0 || !me.enqTs) return;
    const r = roster();
    const aliveQueued = r.queue.filter((q) => q.sid !== sid);
    const ahead = aliveQueued.filter((q) => q.enqTs < me.enqTs || (q.enqTs === me.enqTs && q.sid < sid)).length;
    const freeIdxs = r.freeSeats;
    if (ahead < freeIdxs.length) {
      claimSeat(freeIdxs[ahead]);
    }
  }

  // ── sơ đồ dùng chung: ai cũng tính ra cùng một kết quả ──────────────────
  function roster() {
    const t = now();
    const seats = new Array(TOTAL_SEATS).fill(null);
    const queue = [];
    const people = [];
    const all = new Map(peers);
    all.set(sid, { ...me, lastSeen: t }); // luôn đếm cả mình (kể cả khách chưa ghi danh)

    // gom các sid đang sống theo chiếu họ claim
    const claimers = new Map(); // seat -> [{sid,name,claimTs}]
    for (const p of all.values()) {
      const alive = p.sid === sid || (t - p.lastSeen <= STALE_MS);
      if (!alive) continue;
      people.push({ sid: p.sid, name: p.name || '', merit: p.merit || 0, seat: p.seat, enqTs: p.enqTs });
      if (Number.isInteger(p.seat) && p.seat >= 0 && p.seat < TOTAL_SEATS) {
        if (!claimers.has(p.seat)) claimers.set(p.seat, []);
        claimers.get(p.seat).push({ sid: p.sid, name: p.name, claimTs: p.claimTs || t });
      } else if (p.enqTs) {
        queue.push({ sid: p.sid, name: p.name, enqTs: p.enqTs });
      }
    }
    // mỗi chiếu: claim sớm nhất (tie → sid nhỏ nhất) thắng
    for (const [seat, list] of claimers) {
      list.sort((a, b) => a.claimTs - b.claimTs || (a.sid < b.sid ? -1 : 1));
      const w = list[0];
      seats[seat] = { seatIdx: seat, name: w.name, uniqueId: w.sid, isSim: false };
    }
    queue.sort((a, b) => a.enqTs - b.enqTs || (a.sid < b.sid ? -1 : 1));
    const freeSeats = [];
    for (let i = 0; i < TOTAL_SEATS; i++) if (!seats[i]) freeSeats.push(i);
    return { seats, queue, people, freeSeats };
  }

  // ── API cho standalone/app3d ────────────────────────────────────────────
  function setIdentity(name) {
    me.name = String(name || '').slice(0, 40);
    heartbeat();
  }
  function claimSeat(seatIdx) {
    const r = roster();
    if (seatIdx < 0 || seatIdx >= TOTAL_SEATS) return { error: 'invalid' };
    if (r.seats[seatIdx] && r.seats[seatIdx].uniqueId !== sid) return { error: 'occupied' };
    me.seat = seatIdx;
    me.claimTs = now();
    me.enqTs = 0;
    pub({ t: 'claim', seat: seatIdx, ts: me.claimTs, name: me.name });
    heartbeat();
    markDirty();
    return { seatIdx };
  }
  function leave() {
    if (me.seat >= 0) pub({ t: 'vacate', seat: me.seat });
    if (me.enqTs) pub({ t: 'deq' });
    me.seat = -1; me.claimTs = 0; me.enqTs = 0;
    heartbeat();
    markDirty();
  }
  function enqueue() {
    if (!me.enqTs) {
      me.enqTs = now();
      pub({ t: 'enq', ts: me.enqTs, name: me.name });
      heartbeat();
      markDirty();
    }
    return me.enqTs;
  }
  function sendRitual(evt) {
    pub({
      t: 'rit', kind: evt.type, name: me.name, wish: evt.wish || evt.giftName || '',
      merit: evt.merit || 0, count: evt.count || 0, giftName: evt.giftName || '',
      fno: evt.fortune?.number || 0, frank: evt.fortune?.rank || '', ftitle: evt.fortune?.title || '',
      seat: me.seat, ts: now()
    });
  }
  function setMerit(m) {
    if (m !== me.merit) { me.merit = m; pub({ t: 'merit', merit: m }); }
  }

  function start() {
    if (started) return;
    started = true;
    // khôi phục pháp danh theo phiên tab (reload giữ, đóng tab mất)
    me.name = sessionStorage.getItem('chua_vt_name') || '';
    // snapshot: tin nhắn cache gần đây → thấy ngay ai đang trong chùa
    fetch(`${BASE}/${TOPIC}/json?poll=1&since=45s`)
      .then((r) => r.text())
      .then((txt) => {
        txt.split('\n').forEach((line) => {
          if (!line.trim()) return;
          try {
            const outer = JSON.parse(line);
            if (outer.event === 'message') handleMessage(outer.message);
          } catch (_) { }
        });
        markDirty();
      })
      .catch(() => { });
    connect();
    connectMqtt();
    hbTimer = setInterval(() => { heartbeat(); maybePromoteMyself(); }, HEARTBEAT_MS);
    pruneTimer = setInterval(prune, 3000);
    // Thoát/đóng/reload → báo 'bye' ngay bằng sendBeacon (sống sót qua unload),
    // kèm vacate/deq để ghế trả về tức thì thay vì chờ timeout
    const sayBye = () => {
      try {
        const payload = JSON.stringify({ app: 'cv1', t: 'bye', sid });
        if (!navigator.sendBeacon(`${BASE}/${TOPIC}`, payload)) pub({ t: 'bye' });
      } catch (_) { try { pub({ t: 'bye' }); } catch (_) { } }
      leave();
    };
    window.addEventListener('pagehide', sayBye);
    // Tab bật lại sau khi ẩn (hoặc restore từ bfcache) → heartbeat ngay để không bị prune
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { heartbeat(); maybePromoteMyself(); }
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) heartbeat(); });
  }

  return {
    start,
    sid,
    me,
    roster,
    setIdentity,
    claimSeat,
    leave,
    enqueue,
    sendRitual,
    setMerit,
    recentRits,
    set onChange(cb) { onChangeCb = cb; },
    set onRitual(cb) { onRitualCb = cb; },
    set onSeatLost(cb) { onSeatLostCb = cb; }
  };
};

/* ═══════════════════════════════════════════════════════════════════
 * FirebaseNet — engine chính khi có FIREBASE_CONFIG.
 * Realtime Database: onDisconnect() tự xóa người + nhả ghế khi mất kết nối
 * (không cần heartbeat), transaction claim ghế phân thắng ở server.
 * ═══════════════════════════════════════════════════════════════════ */
const FirebaseNet = function () {
  const TOTAL_SEATS = 48;

  let sid = sessionStorage.getItem('cvtc_sid');
  if (!sid) {
    sid = 's' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('cvtc_sid', sid);
  }

  const me = { sid, name: '', seat: -1, claimTs: 0, enqTs: 0, merit: 0 };
  const startTs = Date.now();     // moc mo trang — event cu hon moc nay khong animate lai
  const peers = new Map();        // sid -> {name, seat, enqTs, merit}
  let seatMap = {};               // idx -> {sid, name}
  const recentRits = [];
  const seenRits = new Set();
  let onChangeCb = null, onRitualCb = null, onSeatLostCb = null;
  let db = null, myRef = null, seatsRef = null, eventsRef = null;
  let started = false, dead = false, up = false;

  function now() { return Date.now(); }
  function markDirty() {
    setTimeout(() => { if (typeof onChangeCb === 'function') onChangeCb(); }, 30);
  }

  function writeMe() {
    if (!myRef || dead) return;
    try {
      myRef.set({
        name: me.name, seat: me.seat, enqTs: me.seat < 0 ? me.enqTs : 0,
        merit: me.merit, ts: firebase.database.ServerValue.TIMESTAMP
      });
    } catch (_) { }
  }

  // ── sơ đồ: ghế lấy từ node seats/ (authoritative), queue từ peers ──────
  function roster() {
    const seats = new Array(TOTAL_SEATS).fill(null);
    const queue = [];
    const people = [];
    for (const [k, p] of peers) {
      if (k === sid) continue; // record của mình đã được đếm riêng bên dưới — tránh đếm đôi
      people.push({ sid: k, name: p.name || '', merit: p.merit || 0, seat: p.seat, enqTs: p.enqTs });
      if (p.enqTs && !(Number.isInteger(p.seat) && p.seat >= 0)) queue.push({ sid: k, name: p.name, enqTs: p.enqTs });
    }
    people.push({ sid, name: me.name || '', merit: me.merit, seat: me.seat, enqTs: me.enqTs });
    if (me.enqTs && me.seat < 0) queue.push({ sid, name: me.name, enqTs: me.enqTs });
    for (const [k, v] of Object.entries(seatMap || {})) {
      const i = +k;
      if (i >= 0 && i < TOTAL_SEATS && v && v.sid) {
        seats[i] = { seatIdx: i, name: v.name || '', uniqueId: v.sid, isSim: false };
      }
    }
    // chỉ giữ claim của người còn sống (phòng trường hợp hiếm: seat record sót lại)
    for (let i = 0; i < TOTAL_SEATS; i++) {
      const s = seats[i];
      if (s && s.uniqueId !== sid && !peers.has(s.uniqueId)) seats[i] = null;
    }
    queue.sort((a, b) => a.enqTs - b.enqTs || (a.sid < b.sid ? -1 : 1));
    const freeSeats = [];
    for (let i = 0; i < TOTAL_SEATS; i++) if (!seats[i]) freeSeats.push(i);
    return { seats, queue, people, freeSeats };
  }

  // đến lượt mình trong hàng chờ + còn ghế trống → transaction claim
  function maybePromoteMyself() {
    if (me.seat >= 0 || !me.enqTs || !seatsRef || dead) return;
    const r = roster();
    const ahead = r.queue.filter((q) => q.sid !== sid &&
      (q.enqTs < me.enqTs || (q.enqTs === me.enqTs && q.sid < sid))).length;
    if (ahead < r.freeSeats.length) claimSeat(r.freeSeats[ahead]);
  }

  function claimSeat(seatIdx) {
    if (seatIdx < 0 || seatIdx >= TOTAL_SEATS || dead) return { error: 'invalid' };
    const holder = seatMap && seatMap[seatIdx];
    if (holder && holder.sid && holder.sid !== sid) return { error: 'occupied' };
    if (!seatsRef) { // chưa kết nối → claim lạc quan, hội tụ sau
      me.seat = seatIdx; me.claimTs = now(); me.enqTs = 0;
      markDirty();
      return { seatIdx };
    }
    seatsRef.child(seatIdx).transaction(
      (cur) => (cur === null ? { sid, name: me.name, ts: firebase.database.ServerValue.TIMESTAMP } : undefined),
      (err, committed, snap) => {
        if (err || !committed || (snap && snap.val() && snap.val().sid !== sid)) {
          if (me.seat === seatIdx) { me.seat = -1; me.claimTs = 0; }
          me.enqTs = me.enqTs || now();
          writeMe();
          if (typeof onSeatLostCb === 'function') onSeatLostCb(seatIdx);
          return;
        }
        me.seat = seatIdx; me.claimTs = now(); me.enqTs = 0;
        try { seatsRef.child(seatIdx).onDisconnect().remove(); } catch (_) { }
        writeMe();
        markDirty();
      },
      false
    );
    // lạc quan: cho nhân vật đi vào chiếu ngay, thua thì callback trên nhả lại
    me.seat = seatIdx; me.claimTs = now(); me.enqTs = 0;
    markDirty();
    return { seatIdx };
  }

  function leave() {
    const hadSeat = me.seat;
    me.seat = -1; me.claimTs = 0; me.enqTs = 0;
    try {
      if (hadSeat >= 0 && seatsRef) seatsRef.child(hadSeat).remove();
      writeMe();
    } catch (_) { }
    markDirty();
  }

  function enqueue() {
    if (!me.enqTs) { me.enqTs = now(); writeMe(); markDirty(); }
    setTimeout(maybePromoteMyself, 400);
    return me.enqTs;
  }

  function setIdentity(name) { me.name = String(name || '').slice(0, 40); writeMe(); }

  function setMerit(m) { if (m !== me.merit) { me.merit = m; writeMe(); } }

  function sendRitual(evt) {
    if (!eventsRef || dead) return;
    try {
      eventsRef.push({
        app: 'cv1', kind: evt.type, sid, name: me.name,
        wish: String(evt.wish || evt.giftName || '').slice(0, 140),
        merit: evt.merit || 0, count: evt.count || 0, giftName: evt.giftName || '',
        fno: evt.fortune?.number || 0, frank: evt.fortune?.rank || '', ftitle: evt.fortune?.title || '',
        seat: me.seat, ts: firebase.database.ServerValue.TIMESTAMP
      });
    } catch (_) { }
  }

  function start() {
    if (started) return;
    started = true;
    me.name = sessionStorage.getItem('chua_vt_name') || '';
    const cfg = window.FIREBASE_CONFIG;
    try {
      if (!cfg || !cfg.databaseURL || !window.firebase) { dead = true; return; }
      firebase.initializeApp(cfg);
      db = firebase.database();
      myRef = db.ref('temple/users/' + sid);
      seatsRef = db.ref('temple/seats');
      eventsRef = db.ref('temple/events');

      db.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true && !dead) {
          up = true;
          try {
            myRef.onDisconnect().remove();           // server tự xóa mình khi rớt mạng
          } catch (_) { }
          // claim lúc chưa kết nối → giờ đăng ký thật bằng transaction
          if (me.seat >= 0) {
            const want = me.seat;
            me.seat = -1; me.claimTs = 0;
            claimSeat(want);
          }
          writeMe();
          markDirty();
        }
      });
      db.ref('temple/users').on('value', (snap) => {
        peers.clear();
        snap.forEach((c) => { const v = c.val(); if (v) peers.set(c.key, v); });
        maybePromoteMyself();
        markDirty();
      });
      seatsRef.on('value', (snap) => {
        seatMap = snap.val() || {};
        maybePromoteMyself();
        markDirty();
      });
      // feed nhật ký: người khác vào chiếu / ra về (bỏ qua chiếu đã có người từ trước lúc mở trang)
      seatsRef.on('child_added', (snap) => {
        const v = snap.val();
        if (!v || !v.sid || v.sid === sid) return;
        if (v.ts && v.ts < startTs - 30000) return;
        recentRits.unshift({ type: 'seatTaken', user: v.name || 'Thí Chủ', uniqueId: v.sid, seatIdx: +snap.key, ts: now(), remote: true });
        if (recentRits.length > 30) recentRits.length = 30;
      });
      seatsRef.on('child_removed', (snap) => {
        const v = snap.val();
        if (!v || !v.sid || v.sid === sid) return;
        recentRits.unshift({ type: 'seatVacated', user: v.name || 'Thí Chủ', uniqueId: v.sid, seatIdx: +snap.key, ts: now(), remote: true });
        if (recentRits.length > 30) recentRits.length = 30;
      });
      // feed: người khác mới vào hàng chờ
      let prevEnq = {};
      db.ref('temple/users').on('child_added', (snap) => {
        const v = snap.val();
        if (v && v.enqTs) prevEnq[snap.key] = v.enqTs;
      });
      db.ref('temple/users').on('child_changed', (snap) => {
        const v = snap.val();
        if (!v) return;
        const was = prevEnq[snap.key] || 0;
        if (v.enqTs && !was && snap.key !== sid) {
          recentRits.unshift({ type: 'queued', user: v.name || 'Thí Chủ', uniqueId: snap.key, position: 0, ts: now(), remote: true });
          if (recentRits.length > 30) recentRits.length = 30;
          markDirty();
        }
        prevEnq[snap.key] = v.enqTs || 0;
      });
      eventsRef.limitToLast(30).on('child_added', (snap) => {
        const m = snap.val();
        if (!m || m.app !== 'cv1' || !m.sid || m.sid === sid) return;
        const key = snap.key || (m.sid + ':' + m.ts);
        if (seenRits.has(key)) return;
        seenRits.add(key);
        const ev = {
          type: m.kind || 'burnIncense', user: m.name || 'Thí Chủ', uniqueId: m.sid,
          wish: m.wish || '', merit: m.merit || 0, count: m.count || 0, giftName: m.giftName || '',
          fortune: m.fno ? { number: m.fno, rank: m.frank || '', title: m.ftitle || '' } : null,
          seatIdx: Number.isInteger(m.seat) ? m.seat : -1, ts: m.ts || now(), remote: true
        };
        recentRits.unshift(ev);
        if (recentRits.length > 30) recentRits.length = 30;
        // event cu (truoc luc mo trang) chi vao feed, khong animate lai
        if (ev.ts >= startTs - 30000 && typeof onRitualCb === 'function') onRitualCb(ev);
        markDirty();
      });
      window.addEventListener('pagehide', () => leave());
    } catch (_) { dead = true; }
  }

  return {
    start,
    sid,
    me,
    get dead() { return dead; },
    get up() { return up; },
    roster,
    setIdentity,
    claimSeat,
    leave,
    enqueue,
    sendRitual,
    setMerit,
    recentRits,
    set onChange(cb) { onChangeCb = cb; },
    set onRitual(cb) { onRitualCb = cb; },
    set onSeatLost(cb) { onSeatLostCb = cb; }
  };
};

/* Chọn engine: Firebase nếu có config + kết nối được, ngược lại mesh dự phòng.
 * Mọi client cùng ưu tiên Firebase → hội tụ một phòng; ai chặn được FB thì
 * rớt xuống mesh và vẫn thấy các máy mesh khác. */
window.TempleNet = (function () {
  const mesh = MeshNet();
  let fb = null;
  if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.databaseURL && window.firebase) {
    try { fb = FirebaseNet(); } catch (_) { fb = null; }
  }
  let eng = fb || mesh;
  // FB không kết nối được trong 10s → chuyển hẳn sang mesh
  let fbTimer = null;
  const cbs = { onChange: null, onRitual: null, onSeatLost: null };
  function bind(e) {
    e.onChange = () => { if (eng === e && cbs.onChange) cbs.onChange(); };
    e.onRitual = (ev) => { if (eng === e && cbs.onRitual) cbs.onRitual(ev); };
    e.onSeatLost = (s) => { if (eng === e && cbs.onSeatLost) cbs.onSeatLost(s); };
  }
  bind(eng);
  function start() {
    if (fb) {
      fb.start();
      fbTimer = setTimeout(() => {
        if ((fb.dead || !fb.up) && eng === fb) {
          eng = mesh; bind(mesh); mesh.start();
          if (cbs.onChange) cbs.onChange();
        }
      }, 10000);
    } else {
      mesh.start();
    }
  }
  const call = (fn, ...a) => (eng[fn] ? eng[fn](...a) : undefined);
  return {
    start,
    get sid() { return eng.sid; },
    get me() { return eng.me; },
    get recentRits() { return eng.recentRits; },
    roster: () => eng.roster(),
    setIdentity: (n) => call('setIdentity', n),
    claimSeat: (i) => call('claimSeat', i),
    leave: () => call('leave'),
    enqueue: () => call('enqueue'),
    sendRitual: (e) => call('sendRitual', e),
    setMerit: (m) => call('setMerit', m),
    set onChange(cb) { cbs.onChange = cb; },
    set onRitual(cb) { cbs.onRitual = cb; },
    set onSeatLost(cb) { cbs.onSeatLost = cb; }
  };
})();
