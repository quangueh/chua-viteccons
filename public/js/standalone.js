/**
 * TempleLocal — Engine chùa online chạy hoàn toàn phía client (bản tĩnh, không server).
 * Mô phỏng lại logic Rituals của server.js: state, bảng công đức, quẻ xăm.
 * live.js gọi window.TempleLocal.handleRpc(...) và nhận state/event y hệt server thật.
 */
window.TEMPLE_STATIC = true;
window.TempleLocal = (function () {
  const STORAGE_KEY = 'chua_viteccons_state_v3';
  const TOTAL_SEATS = 48;

  // BỘ QUẺ LINH XĂM (bê nguyên từ server.js)
  const FORTUNE_DECK = [
    {
      number: 1, rank: 'Thượng Thượng Cát', title: 'Nhật Xuất Đông Phương — Mặt Trời Mọc Phương Đông',
      poem: 'Đông phương nhật xuất chiếu Càn Khôn\nHoa nở đầy cành rạng sắc xuân\nCông danh tài lộc đều viên mãn\nGia đạo bình an phúc lộc tồn.',
      meaning: 'Mọi sự mưu cầu đều đại cát đại lợi. Công việc hanh thông, quý nhân phù trợ, gia đình hòa thuận ấm êm.',
      ttsSummary: 'Quẻ số 1, Thượng Thượng Cát, Nhật Xuất Đông Phương. Mọi sự mưu cầu đều đại cát đại lợi, công danh tài lộc viên mãn, quý nhân phù trợ.'
    },
    {
      number: 8, rank: 'Thượng Cát', title: 'Kim Liên Khai Nở — Sen Vàng Tỏa Ngát',
      poem: 'Sen vàng nở rộ giữa hồ trong\nHương thơm lan tỏa khắp non sông\nLòng thành thắp nén nhang cầu nguyện\nTrời Phật chứng tri thỏa ước mong.',
      meaning: 'Tâm thiện lành ắt gặp phước báu. Cầu tài đắc tài, cầu bình an đắc bình an, bệnh tật tiêu trừ.',
      ttsSummary: 'Quẻ số 8, Thượng Cát, Kim Liên Khai Nở. Tâm thiện lành ắt gặp phước báu, cầu tài đắc tài, cầu bình an đắc bình an.'
    },
    {
      number: 12, rank: 'Đại Cát', title: 'Long Vân Tương Hội — Rồng Mây Gặp Gỡ',
      poem: 'Rồng thiêng gặp hội tầng mây xanh\nVượt Vũ Môn Quan rạng rỡ danh\nThí chủ kiên tâm hành thiện đạo\nPhúc dày lộc vượng khắp gia đình.',
      meaning: 'Thời vận đang lên mạnh mẽ. Thi cử đỗ đạt, kinh doanh phát đạt, gặp cơ hội lớn đổi đời.',
      ttsSummary: 'Quẻ số 12, Đại Cát, Long Vân Tương Hội. Thời vận đang lên mạnh mẽ, thi cử đỗ đạt, kinh doanh phát đạt.'
    },
    {
      number: 18, rank: 'Thượng Cát', title: 'Xuân Phong Đắc Ý — Gió Xuân Thuận Buồm',
      poem: 'Thuận buồm xuôi gió vượt trùng khơi\nBến giác bình yên nắng rạng ngời\nTài lộc dồi dào nhân duyên tốt\nBốn mùa hưng thịnh rộn niềm vui.',
      meaning: 'Đi xa gặp may, buôn bán thuận lợi, tình duyên êm đẹp, người thân mạnh khỏe.',
      ttsSummary: 'Quẻ số 18, Thượng Cát, Xuân Phong Đắc Ý. Thuận buồm xuôi gió, tài lộc dồi dào, nhân duyên tốt đẹp.'
    },
    {
      number: 24, rank: 'Trung Cát', title: 'Vũ Quá Thiên Thanh — Mưa Tạnh Trời Trong',
      poem: 'Mưa qua trời lại sáng trong ngần\nGian khó lùi xa đón phúc phần\nGiữ vững lòng thành đừng nản chí\nHoa thơm trái ngọt đến mười phân.',
      meaning: 'Khó khăn cũ sắp qua đi, vận may mới đang tới. Hãy kiên nhẫn và giữ tâm bình tĩnh.',
      ttsSummary: 'Quẻ số 24, Trung Cát, Vũ Quá Thiên Thanh. Mưa qua trời lại sáng trong, gian khó lùi xa để đón phúc phần mới.'
    },
    {
      number: 36, rank: 'Thượng Thượng Cát', title: 'Phúc Tinh Cao Chiếu — Sao Phúc Chiếu Mệnh',
      poem: 'Phúc tinh rực sáng giữa đêm rằm\nTừ bi Phật độ suốt quanh năm\nTài lộc tự nhiên về gõ cửa\nTrăm điều như ý vạn điều lành.',
      meaning: 'Sao Phúc chiếu mạng, tai qua nạn khỏi, tiền tài sung túc, gia đạo hưng long.',
      ttsSummary: 'Quẻ số 36, Thượng Thượng Cát, Phúc Tinh Cao Chiếu. Sao Phúc chiếu mạng, tài lộc tự nhiên gõ cửa, trăm điều như ý.'
    },
    {
      number: 52, rank: 'Thượng Cát', title: 'Ngọc Xuất Côn Sơn — Ngọc Quý Phát Sáng',
      poem: 'Ngọc quý Côn Sơn tỏa ánh ngời\nBấy lâu rèn giũa nay gặp thời\nTri âm tương ngộ cùng nâng đỡ\nSự nghiệp thăng hoa rạng rỡ đời.',
      meaning: 'Nỗ lực bấy lâu nay sắp được đền đáp xứng đáng. Có người tốt nâng đỡ trong công việc và cuộc sống.',
      ttsSummary: 'Quẻ số 52, Thượng Cát, Ngọc Xuất Côn Sơn. Nỗ lực bấy lâu sắp được đền đáp xứng đáng, sự nghiệp thăng hoa.'
    },
    {
      number: 68, rank: 'Đại Cát', title: 'Lộc Mã Đồng Hương — Lộc Tài Cùng Tới',
      poem: 'Lộc Mã song hành đến tận nhà\nLàm ăn buôn bán nở như hoa\nTâm thành bố thí thêm công đức\nPhú quý vinh hoa khắp một nhà.',
      meaning: 'Quẻ đại lợi về tài lộc và kinh doanh. Nên làm nhiều việc thiện để phúc đức càng thêm bền vững.',
      ttsSummary: 'Quẻ số 68, Đại Cát, Lộc Mã Đồng Hương. Đại lợi về tài lộc và buôn bán, phú quý vinh hoa khắp một nhà.'
    },
    {
      number: 81, rank: 'Thượng Cát', title: 'Nguyệt Nhập Trung Thiên — Trăng Rằm Giữa Đỉnh',
      poem: 'Trăng tròn vằng vặc giữa trời thu\nSoi sáng muôn phương sạch mây mù\nTình duyên viên mãn gia đình thuận\nTâm an vạn sự chẳng ưu tư.',
      meaning: 'Tình duyên và gia đạo vô cùng tốt đẹp. Người độc thân dễ gặp ý trung nhân, gia đình thêm tin vui.',
      ttsSummary: 'Quẻ số 81, Thượng Cát, Nguyệt Nhập Trung Thiên. Tình duyên viên mãn, gia đình hòa thuận, tâm an vạn sự lành.'
    },
    {
      number: 99, rank: 'Thượng Thượng Cát', title: 'Vạn Sự Viên Thành — Cửu Cửu Đại Cát',
      poem: 'Chín tầng mây trắng ánh hào quang\nTừ bi Phật Tổ độ nhân gian\nThí chủ lòng thành dâng lễ bái\nTrọn đời trường thọ hưởng vinh khang.',
      meaning: 'Quẻ tối thượng cát tường. Sức khỏe trường thọ, công danh hiển đạt, vạn sự viên thành.',
      ttsSummary: 'Quẻ số 99, Thượng Thượng Cát, Vạn Sự Viên Thành. Quẻ tối thượng cát tường, sức khỏe trường thọ, vạn sự như ý.'
    }
  ];

  // Bộ lọc ký tự lạ & từ ngữ phản cảm (bê nguyên từ server.js)
  const WEIRD_SPAM_RE = /[𒀀-𒑏﷽⠀-⣿▀-▟]|[̀-ͯ]{3,}/u;
  const BRACKET_EMOTE_RE = /\[[^\]]{1,24}\]/g;
  const ALLOWED_VI_TEXT_RE = /[^0-9a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ\s.,!?]/g;
  const ALLOWED_VI_NAME_RE = /[^0-9a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ\s._-]/g;
  const VI_LETTER_RE = /[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/g;
  const BAD_WORDS_RE = /(đá dái|địt|lồn|cặc|đm|vcl|vl|yamate|i cư|lừa đảo|lừa à|te-le gram|telegram|bố là trùm)/i;

  function sanitizeUserName(rawName) {
    const normalized = String(rawName || '')
      .normalize('NFKC')
      .normalize('NFC')
      .replace(BRACKET_EMOTE_RE, ' ')
      .replace(ALLOWED_VI_NAME_RE, ' ')
      .replace(/(.)\1{3,}/gi, '$1$1')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 26);
    if (!normalized || BAD_WORDS_RE.test(normalized)) return 'Thí Chủ Hữu Duyên';
    const letters = normalized.match(VI_LETTER_RE) || [];
    if (letters.length < 2) return 'Thí Chủ Hữu Duyên';
    return normalized;
  }

  function sanitizeWishText(rawWish) {
    if (!rawWish) return '';
    const cleaned = String(rawWish)
      .normalize('NFKC')
      .normalize('NFC')
      .replace(BRACKET_EMOTE_RE, ' ')
      .replace(ALLOWED_VI_TEXT_RE, ' ')
      .replace(/([.,!?])\1+/g, '$1')
      .replace(/(.)\1{2,}/gi, '$1$1')
      .replace(/\s+/g, ' ')
      .replace(/^[.,!?\s-]+|[.,!?\s-]+$/g, '')
      .slice(0, 120);
    if (!cleaned || BAD_WORDS_RE.test(cleaned)) return '';
    const letters = cleaned.match(VI_LETTER_RE) || [];
    if (letters.length < 2) return '';
    return cleaned;
  }

  // Không còn người ảo — mọi phật tử trong chùa đều là người thật ghi danh.
  // Số liệu, bảng công đức, nhật ký cũng chỉ ghi nhận hoạt động thật.

  const DEFAULT_STATE = () => ({
    totalIncense: 0,
    totalMerit: 0,
    woodenFishHits: 0,
    bellRings: 0,
    lanternCount: 0,
    fortuneCount: 0,
    activeIncenseSticks: 3,
    haloIntensity: 0.35,
    offerings: { lotus: 0, fruit: 0, lamp: 0, dragon: 0 },
    devotees: {},
    recentEvents: [],
    settings: {
      ttsEnabled: true,
      ttsVoice: 'maichi',
      bgMusicEnabled: true,
      sfxEnabled: true,
      smokeDensity: 1.0
    },
    tiktok: { connected: false, connecting: false, username: '', roomId: null, viewerCount: 0, lastError: null }
  });

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const base = DEFAULT_STATE();
        return {
          ...base,
          ...saved,
          devotees: saved.devotees || {},
          offerings: { ...base.offerings, ...(saved.offerings || {}) },
          recentEvents: saved.recentEvents || [],
          settings: { ...base.settings, ...(saved.settings || {}) },
          tiktok: base.tiktok
        };
      }
    } catch (_) { }
    return DEFAULT_STATE();
  }

  let state = loadState();
  let saveTimer = null;
  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        const { tiktok, ...toSave } = state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (_) { }
    }, 800);
  }

  function getLeaderboard(limit = 6) {
    return Object.values(state.devotees)
      .sort((a, b) => b.merit - a.merit)
      .slice(0, limit)
      .map((d, index) => ({
        rank: index + 1,
        name: d.name,
        uniqueId: d.uniqueId,
        avatar: d.avatar || '',
        merit: d.merit,
        incense: d.incense || 0,
        lastWish: d.lastWish || ''
      }));
  }

  function recordDevotee(user, uniqueId, avatar, meritDelta, incenseDelta = 0, giftDelta = 0, wish = '') {
    const displayName = sanitizeUserName(user || uniqueId);
    const cleanWish = sanitizeWishText(wish);
    const key = (uniqueId || displayName).slice(0, 40);
    if (!state.devotees[key]) {
      state.devotees[key] = {
        name: displayName,
        uniqueId: uniqueId || displayName.toLowerCase().replace(/\s+/g, ''),
        avatar: avatar || '',
        merit: 0, incense: 0, gifts: 0, lastWish: ''
      };
    }
    const dev = state.devotees[key];
    dev.name = displayName;
    if (avatar) dev.avatar = avatar;
    dev.merit += meritDelta;
    dev.incense += incenseDelta;
    dev.gifts += giftDelta;
    if (cleanWish) dev.lastWish = cleanWish;
    state.totalMerit += meritDelta;
    state.haloIntensity = Math.min(1.0, 0.35 + (state.totalMerit % 1000) / 1400);
    return dev;
  }

  // ── Ghế & hàng chờ DÙNG CHUNG (TempleNet — sơ đồ realtime giữa các trình duyệt) ──
  const net = () => window.TempleNet || null;
  const EMPTY_ROSTER = { seats: Array(TOTAL_SEATS).fill(null), queue: [], people: [], freeSeats: [] };
  function sharedRoster() {
    const n = net();
    return n ? n.roster() : EMPTY_ROSTER;
  }
  function mySid() { const n = net(); return n ? n.sid : ''; }
  function mySeatIdx() {
    const r = sharedRoster();
    return r.seats.findIndex((s) => s && s.uniqueId === mySid());
  }

  function pushEventLog(evt) {
    if (evt.seatIdx === undefined && evt.type !== 'seatTaken' && evt.type !== 'seatVacated') {
      // sự kiện nghi thức luôn là của mình (RPC local) — gắn chiếu + sid hiện tại
      evt.seatIdx = mySeatIdx();
      evt.uniqueId = mySid();
    }
    const entry = { id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString(), ts: Date.now(), ...evt };
    state.recentEvents.unshift(entry);
    if (state.recentEvents.length > 35) state.recentEvents.length = 35;
    return entry;
  }

  function getPublicState() {
    const r = sharedRoster();
    // bảng công đức = CHỈ người đang ngồi chiếu (sid nằm trong sơ đồ ghế thật) —
    // người đứng xem / xếp hàng / đã về không lên bảng
    const seatedSids = new Set(r.seats.filter(Boolean).map((s) => s.uniqueId));
    const board = r.people
      .filter((p) => p.name && seatedSids.has(p.sid))
      .sort((a, b) => (b.merit || 0) - (a.merit || 0))
      .slice(0, 24)
      .map((p, i) => ({ name: p.name, uniqueId: p.sid, merit: p.merit || 0, rank: i + 1 }));
    // nhật ký: sự kiện local + nghi thức của người khác
    const remote = (net() ? net().recentRits : []).map((ev) => ({ ...ev, ts: ev.ts || 0 }));
    const feed = [...state.recentEvents.map((e) => ({ ...e, ts: e.ts || Date.parse(e.timestamp) || 0 })), ...remote]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 15);
    return {
      totalIncense: state.totalIncense,
      totalMerit: state.totalMerit,
      woodenFishHits: state.woodenFishHits,
      bellRings: state.bellRings,
      lanternCount: state.lanternCount,
      fortuneCount: state.fortuneCount,
      activeIncenseSticks: state.activeIncenseSticks,
      haloIntensity: state.haloIntensity,
      offerings: state.offerings,
      leaderboard: board,
      seats: r.seats,
      queue: r.queue.map((q, i) => ({ name: q.name, uniqueId: q.sid, position: i + 1, isSim: false })),
      totalSeats: TOTAL_SEATS,
      onlineCount: r.people.length,
      recentEvents: feed,
      settings: state.settings,
      tiktok: state.tiktok,
      tts: { ready: true, status: 'browser', voice: 'vi-VN' }
    };
  }

  // app3d.js gán callback này để nhận event + state mới
  let onEventCb = null;

  const Rituals = {
    burnIncense(params = {}) {
      const user = sanitizeUserName(params.user);
      const uniqueId = params.uniqueId || '';
      const avatar = params.avatar || '';
      const count = Math.max(1, Math.min(9, Number(params.count) || 3));
      const wish = sanitizeWishText(params.wish) || 'Thành tâm dâng hương bái Phật, cầu bình an cát tường';
      const merit = count * 5;
      state.totalIncense += count;
      state.activeIncenseSticks = Math.min(36, state.activeIncenseSticks + count);
      const devotee = recordDevotee(user, uniqueId, avatar, merit, count, 0, wish);
      const ttsText = params.readTts === false ? '' : `Nam mô A Di Đà Phật. Cảm tạ thí chủ ${devotee.name} đã thành tâm thắp ${count} nén hương thơm. ${wish}.`;
      const event = pushEventLog({ type: 'burnIncense', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, count, merit, wish, wishCustom: !!sanitizeWishText(params.wish), ttsText, ttsVoice: 'vi-VN' });
      broadcastRitual(event, devotee);
      saveState();
      return { event, state: getPublicState() };
    },

    strikeWoodenFish(params = {}) {
      const user = sanitizeUserName(params.user);
      const uniqueId = params.uniqueId || '';
      const avatar = params.avatar || '';
      const count = Math.max(1, Math.min(50, Number(params.count) || 1));
      const merit = count;
      state.woodenFishHits += count;
      const devotee = recordDevotee(user, uniqueId, avatar, merit, 0, 0);
      const event = pushEventLog({ type: 'strikeWoodenFish', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, count, merit, ttsText: params.ttsText || '' });
      broadcastRitual(event, devotee);
      saveState();
      return { event, state: getPublicState() };
    },

    ringBell(params = {}) {
      const user = sanitizeUserName(params.user);
      const uniqueId = params.uniqueId || '';
      const avatar = params.avatar || '';
      const count = Math.max(1, Math.min(9, Number(params.count) || 1));
      const wish = sanitizeWishText(params.wish) || 'Thỉnh chuông Bát Nhã, phiền não tiêu tan, trí tuệ sáng ngời';
      const merit = count * 10;
      state.bellRings += count;
      const devotee = recordDevotee(user, uniqueId, avatar, merit, 0, 0, wish);
      const ttsText = params.readTts ? `Thí chủ ${devotee.name} thỉnh Đại Hồng Chung cầu nguyện: ${wish}.` : '';
      const event = pushEventLog({ type: 'ringBell', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, count, merit, wish, wishCustom: !!sanitizeWishText(params.wish), ttsText, ttsVoice: 'vi-VN' });
      broadcastRitual(event, devotee);
      saveState();
      return { event, state: getPublicState() };
    },

    sendPrayer(params = {}) {
      const user = sanitizeUserName(params.user);
      const uniqueId = params.uniqueId || '';
      const avatar = params.avatar || '';
      const wish = sanitizeWishText(params.wish) || 'Cầu cho quốc thái dân an, gia đình mạnh khỏe hạnh phúc';
      const merit = 10;
      state.lanternCount += 1;
      const devotee = recordDevotee(user, uniqueId, avatar, merit, 1, 0, wish);
      const ttsText = params.readTts === false ? '' : `Lời cầu nguyện của thí chủ ${devotee.name}: ${wish}. Nam mô A Di Đà Phật.`;
      const event = pushEventLog({ type: 'sendPrayer', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, wish, merit, wishCustom: !!sanitizeWishText(params.wish), ttsText, ttsVoice: 'vi-VN' });
      broadcastRitual(event, devotee);
      saveState();
      return { event, state: getPublicState() };
    },

    offerGift(params = {}) {
      const user = sanitizeUserName(params.user);
      const uniqueId = params.uniqueId || '';
      const avatar = params.avatar || '';
      const coins = Math.max(1, Number(params.coins) || 10);
      const giftType = ['lotus', 'fruit', 'lamp', 'dragon'].includes(params.giftType)
        ? params.giftType
        : (coins >= 100 ? 'dragon' : coins >= 20 ? 'fruit' : coins >= 5 ? 'lamp' : 'lotus');
      const giftLabels = { lotus: 'Đài Hoa Sen Vàng', fruit: 'Mâm Ngũ Quả Cát Tường', lamp: 'Đèn Lưu Ly Trí Tuệ', dragon: 'Đại Lễ Kim Long Chầu Phật' };
      const giftName = params.giftName || giftLabels[giftType];
      const multiplier = coins >= 100 ? 50 : coins >= 10 ? 30 : 20;
      const merit = Math.max(20, coins * multiplier);
      state.offerings[giftType] = (state.offerings[giftType] || 0) + 1;
      state.totalIncense += 3;
      state.activeIncenseSticks = Math.min(36, state.activeIncenseSticks + 3);
      const wish = params.wish || `Dâng cúng ${giftName} lên Tam Bảo`;
      const devotee = recordDevotee(user, uniqueId, avatar, merit, 3, 1, wish);
      const ttsText = params.readTts === false ? '' : `Công đức vô lượng! Cảm tạ thí chủ ${devotee.name} đã phát tâm dâng cúng ${giftName}, tích thêm ${merit} điểm công đức. Nguyện cầu chư Phật gia hộ cho thí chủ vạn sự cát tường như ý.`;
      const event = pushEventLog({ type: giftType === 'dragon' ? 'grandCeremony' : 'offerGift', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, giftType, giftName, coins, merit, wish, wishCustom: !!String(params.wish || '').trim(), ttsText, ttsVoice: 'vi-VN' });
      broadcastRitual(event, devotee);
      saveState();
      return { event, state: getPublicState() };
    },

    drawFortune(params = {}) {
      const user = sanitizeUserName(params.user);
      const uniqueId = params.uniqueId || '';
      const avatar = params.avatar || '';
      const topic = sanitizeWishText(params.topic) || 'Gia đạo, Tài lộc và Bình an';
      const fortune = FORTUNE_DECK[Math.floor(Math.random() * FORTUNE_DECK.length)];
      const merit = 10;
      state.fortuneCount += 1;
      const devotee = recordDevotee(user, uniqueId, avatar, merit, 0, 0, `Xin xăm: Quẻ số ${fortune.number} (${fortune.rank})`);
      const ttsText = params.readTts === false ? '' : `Thí chủ ${devotee.name} vừa gieo được ${fortune.ttsSummary}`;
      const event = pushEventLog({ type: 'drawFortune', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, topic, fortune, merit, ttsText, ttsVoice: 'vi-VN' });
      broadcastRitual(event, devotee);
      saveState();
      return { event, state: getPublicState() };
    },

    grandCeremony(params = {}) {
      return Rituals.offerGift({ ...params, giftType: 'dragon', coins: Math.max(100, Number(params.coins) || 199), giftName: params.giftName || 'Đại Lễ Hào Quang Vạn Trượng' });
    },

    updateSettings(params = {}) {
      state.settings = { ...state.settings, ...params };
      saveState();
      return { state: getPublicState() };
    }
  };

  // broadcast nghi thức của mình lên kênh chung + đồng bộ công đức hiển thị
  function broadcastRitual(event, devotee) {
    const n = net();
    if (!n) return;
    n.setMerit(devotee ? devotee.merit : 0);
    n.sendRitual(event);
  }

  // Chặn spam lễ: mỗi nghi thức có nhịp riêng — spam click chồng animation +
  // bắn storm event Firebase lên mọi client → lag. Quá nhanh thì trả cooldown.
  const RITUAL_COOLDOWN_MS = {
    'temple.burnIncense': 5000,
    'temple.strikeWoodenFish': 1500,
    'temple.sendPrayer': 4000,
    'temple.ringBell': 4000,
    'temple.drawFortune': 5000,
    'temple.offerGift': 8000,
    'temple.grandCeremony': 30000
  };
  const lastRitualAt = {};

  function handleRpc(method, params = {}) {
    const cd = RITUAL_COOLDOWN_MS[method];
    if (cd) {
      const last = lastRitualAt[method] || 0;
      if (Date.now() - last < cd) return { state: getPublicState(), error: 'cooldown' };
      lastRitualAt[method] = Date.now();
    }
    switch (method) {
      case 'temple.getState': return { state: getPublicState() };
      case 'temple.burnIncense': return Rituals.burnIncense(params);
      case 'temple.strikeWoodenFish': return Rituals.strikeWoodenFish(params);
      case 'temple.ringBell': return Rituals.ringBell(params);
      case 'temple.sendPrayer': return Rituals.sendPrayer(params);
      case 'temple.offerGift': return Rituals.offerGift(params);
      case 'temple.drawFortune': return Rituals.drawFortune(params);
      case 'temple.grandCeremony': return Rituals.grandCeremony(params);
      case 'temple.updateSettings': return Rituals.updateSettings(params);
      case 'temple.register': {
        // Ghi danh pháp danh → biết mình đang ở ghế / hàng chờ / cần chọn ghế
        const name = sanitizeUserName(params.user);
        const n = net();
        if (!n) return { state: getPublicState(), registered: false, error: 'offline' };
        n.setIdentity(name);
        const r = sharedRoster();
        const seated = r.seats.findIndex((s) => s && s.uniqueId === n.sid);
        if (seated >= 0) return { state: getPublicState(), registered: true, seatIdx: seated };
        const qIdx = r.queue.findIndex((q) => q.sid === n.sid);
        if (qIdx >= 0) return { state: getPublicState(), registered: true, queued: true, position: qIdx + 1 };
        if (!r.freeSeats.length) {
          n.enqueue();
          const evt = pushEventLog({ type: 'queued', user: name, uniqueId: n.sid, position: r.queue.length + 1 });
          saveState();
          return { event: evt, state: getPublicState(), registered: true, queued: true, position: r.queue.length + 1 };
        }
        recordDevotee(name, '', '', 0, 0, 0); // key = tên hiển thị, trùng với record nghi thức
        saveState();
        return { state: getPublicState(), registered: true, needPick: true, freeSeats: r.freeSeats };
      }
      case 'temple.pickSeat': {
        const name = sanitizeUserName(params.user);
        const n = net();
        if (!n) return { state: getPublicState(), error: 'offline' };
        const r = sharedRoster();
        const mine = r.seats.findIndex((s) => s && s.uniqueId === n.sid);
        if (mine >= 0) return { state: getPublicState(), seatIdx: mine, alreadySeated: true };
        const idx = Number(params.seatIdx);
        const res = n.claimSeat(idx);
        if (res.error) {
          return { state: getPublicState(), error: res.error, freeSeats: sharedRoster().freeSeats };
        }
        const evt = pushEventLog({ type: 'seatTaken', seatIdx: idx, user: name, uniqueId: n.sid });
        saveState();
        return { event: evt, state: getPublicState(), seatIdx: idx };
      }
      case 'temple.leaveSeat': {
        // Thoát web = mất ghế; vào lại phải xếp hàng/chọn lại
        const n = net();
        const idx = mySeatIdx();
        if (n) n.leave();
        const evt = idx >= 0 ? pushEventLog({ type: 'seatVacated', seatIdx: idx, user: sanitizeUserName(params.user), uniqueId: mySid() }) : null;
        saveState();
        return { event: evt, state: getPublicState() };
      }
      case 'live.connect':
      case 'live.disconnect':
        return { state: getPublicState() };
      default:
        return { state: getPublicState() };
    }
  }

  // ── Kết nối kênh chung: người thật thấy nhau, ghế/hàng chờ dùng chung ──
  const n = net();
  if (n) {
    n.onChange = () => {
      if (typeof onEventCb === 'function') onEventCb({ state: getPublicState() });
    };
    n.onRitual = (ev) => {
      // nghi thức của người khác: cộng vào tổng công đức chùa (phiên này)
      state.totalMerit += ev.merit || 0;
      if (ev.type === 'burnIncense') state.totalIncense += ev.count || 3;
      saveState();
      if (typeof onEventCb === 'function') onEventCb({ event: ev, state: getPublicState() });
    };
    n.onSeatLost = () => {
      const evt = pushEventLog({ type: 'seatLost', user: n.me.name || 'Bạn', uniqueId: n.sid });
      saveState();
      if (typeof onEventCb === 'function') onEventCb({ event: evt, state: getPublicState() });
    };
    n.start();
  }

  return {
    handleRpc,
    getState: getPublicState,
    set onEvent(cb) { onEventCb = cb; },
    get onEvent() { return onEventCb; }
  };
})();
