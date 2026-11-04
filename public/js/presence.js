/**
 * TempleNet — Lớp realtime chùa dùng chung (không server riêng).
 * Mọi trình duyệt nói chuyện qua một kênh pub/sub công cộng (ntfy.sh):
 * heartbeat 5s mang theo tên + chiếu + công đức; claim chiếu/hàng chờ theo
 * luật "claim sớm nhất thắng, đầu hàng được vào trước" — mọi client áp cùng
 * luật nên hội tụ về cùng một sơ đồ 48 chiếu. Ngừng heartbeat 15s = mất ghế.
 * Mất kết nối → chạy một mình như cũ.
 */
window.TempleNet = (function () {
  const TOPIC = 'cvtc-hall-8f3k2qz';
  const BASE = 'https://ntfy.sh';
  const HEARTBEAT_MS = 8000;
  const STALE_MS = 24000;
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

  // ── publish / subscribe ─────────────────────────────────────────────────
  function pub(obj) {
    try {
      obj.app = 'cv1';
      obj.sid = sid;
      fetch(`${BASE}/${TOPIC}`, {
        method: 'POST',
        body: JSON.stringify(obj),
        keepalive: true
      }).catch(() => { });
    } catch (_) { }
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
    }
  }

  function connectWs() {
    try {
      ws = new WebSocket(`wss://ntfy.sh/${TOPIC}/ws`);
    } catch (_) { scheduleReconnect(); return; }
    ws.onmessage = (e) => {
      try {
        const outer = JSON.parse(e.data);
        if (outer.event === 'message') handleMessage(outer.message);
      } catch (_) { }
    };
    ws.onopen = () => { retryMs = 3000; heartbeat(); };
    ws.onclose = () => scheduleReconnect();
    ws.onerror = () => { try { ws.close(); } catch (_) { } };
  }
  function scheduleReconnect() {
    setTimeout(connectWs, retryMs);
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
    connectWs();
    hbTimer = setInterval(() => { heartbeat(); maybePromoteMyself(); }, HEARTBEAT_MS);
    pruneTimer = setInterval(prune, 3000);
    const leaveNow = () => leave();
    window.addEventListener('pagehide', leaveNow);
    window.addEventListener('beforeunload', leaveNow);
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
})();
