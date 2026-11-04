/**
 * TempleLocal — Engine chùa online chạy hoàn toàn phía client (bản tĩnh, không server).
 * Mô phỏng lại logic Rituals của server.js: state, bảng công đức, quẻ xăm, autoSim.
 * live.js gọi window.TempleLocal.handleRpc(...) và nhận state/event y hệt server thật.
 */
window.TEMPLE_STATIC = true;
window.TempleLocal = (function () {
  const STORAGE_KEY = 'chua_viteccons_state_v2';
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

  // Không còn ghế "ảo" seed sẵn — phật tử chỉ xuất hiện khi người thật vào chùa
  // (autoSim mô phỏng dòng người đến-đi liên tục như chùa thật)
  const SIM_DEVOTEES = [
    { user: 'KS. Ngọc Anh', uniqueId: 'ngocanh.pkt', wish: 'Cầu công trình bàn giao đúng tiến độ, chất lượng Build by Heart' },
    { user: 'Trần Minh Quân', uniqueId: 'minhquan.ct', wish: 'Cầu an toàn lao động, không một tai nạn nào trên công trường' },
    { user: 'Diệu Thảo Tâm An', uniqueId: 'tam_an_99', wish: 'Nam Mô A Di Đà Phật, nguyện cầu đại gia đình Viteccons bình an hưng thịnh' },
    { user: 'Lê Hoàng Nam', uniqueId: 'hoangnam.doi', wish: 'Cầu thi công thuận lợi, trời thuận thủy hòa nhân an' },
    { user: 'Phạm Thanh Hà', uniqueId: 'thanhha.kt', wish: 'Cầu thanh toán công nợ thông suốt, dòng tiền hanh thông' },
    { user: 'Vũ Đức Thịnh', uniqueId: 'ducthinh.vt', wish: 'Con xin gieo một quẻ cầu tài lộc đầu năm' },
    { user: 'Anh Bảy Cơ Khí', uniqueId: 'bay.cokhi', wish: 'Cầu máy móc vận hành trơn tru, hàng mục hoàn thành đẹp đẽ' },
    { user: 'Chị Hằng Kế Toán', uniqueId: 'hang.kt', wish: 'Cầu quyết toán trôi chảy, số liệu khớp từng đồng' },
    { user: 'Thích An Toàn', uniqueId: 'sim.antoan', wish: 'Cầu an toàn lao động, ai cũng về nhà bình an' },
    { user: 'Thích Trúng Thầu', uniqueId: 'sim.trungthau', wish: 'Cầu hồ sơ thầu trúng liên miên' },
    { user: 'Thích Đổ Bê Tông', uniqueId: 'sim.betong', wish: 'Cầu bê tông đạt mác, cốt thép vững chãi' },
    { user: 'Thích Nghiệm Thu', uniqueId: 'sim.nghiemthu', wish: 'Cầu nghiệm thu một lần qua, hồ sơ thông suốt' },
    { user: 'KS. Bảo Kết Cấu', uniqueId: 'bao.kc', wish: 'Cầu sắt thép vững chãi, bê tông đạt mác' },
    { user: 'Anh Phong Giàn Giáo', uniqueId: 'phong.gg', wish: 'Cầu thao tác trên cao luôn an toàn tuyệt đối' },
    { user: 'Chị Yến Vật Tư', uniqueId: 'yen.vt', wish: 'Cầu vật tư về đúng giá, không thất thoát' },
    { user: 'CN. Vinh Điện Nước', uniqueId: 'vinh.dn', wish: 'Cầu hệ thống điện nước vận hành trơn tru' },
    { user: 'Bác Lợi Lái Cẩu', uniqueId: 'loi.cau', wish: 'Cầu mỗi nhịp cẩu đều chuẩn xác, gió lành mây êm' },
    { user: 'CN. Tấn Hàn', uniqueId: 'tan.han', wish: 'Cầu mối hàn chắc bền như lòng anh em' },
    { user: 'KS. Dũng QS', uniqueId: 'dung.qs', wish: 'Cầu boq khớp từng hạng mục, thanh toán không trễ' },
    { user: 'Chị Thu Kế Hoạch', uniqueId: 'thu.kh', wish: 'Cầu tiến độ chạy đúng, milestone không trượt' },
    { user: 'Em Trang Thiết Kế', uniqueId: 'trang.tk', wish: 'Cầu bản vẽ shop drawing duyệt một lần qua' },
    { user: 'CN. Cường Cốp Pha', uniqueId: 'cuong.cp', wish: 'Cầu cốp pha chắc tay, đổ bê tông mướt mặt' },
    { user: 'KS. Tú Trắc Địa', uniqueId: 'tu.td', wish: 'Cầu tọa độ chuẩn từng milimet, không sai sót' },
    { user: 'Chú Tư Bảo Vệ', uniqueId: 'tu.baove', wish: 'Cầu trực đêm yên ả, mọi điều bình an vô sự' },
    { user: 'Thím Sáu Bếp Ăn', uniqueId: 'sau.bepan', wish: 'Cầu anh em công trường ăn ngon khỏe mạnh' },
    { user: 'Thích Giám Sát', uniqueId: 'sim.giamsat', wish: 'Cầu giám sát tinh tường, công trình vẹn toàn' },
    { user: 'Thích Tiến Độ', uniqueId: 'sim.tiendo', wish: 'Cầu tiến độ như ý, bàn giao đúng hẹn' },
    { user: 'Thích Tâm Tịnh', uniqueId: 'sim.tamtinh', wish: 'Cầu tâm an tịnh, vạn sự hanh thông' }
  ];

  const DEFAULT_STATE = () => ({
    totalIncense: 108,
    totalMerit: 1080,
    woodenFishHits: 360,
    bellRings: 36,
    lanternCount: 18,
    fortuneCount: 12,
    activeIncenseSticks: 9,
    haloIntensity: 0.45,
    offerings: { lotus: 3, fruit: 2, lamp: 2, dragon: 1 },
    devotees: {},
    seats: Array(TOTAL_SEATS).fill(null),
    queue: [],
    recentEvents: [],
    settings: {
      ttsEnabled: true,
      ttsVoice: 'maichi',
      bgMusicEnabled: true,
      sfxEnabled: true,
      smokeDensity: 1.0,
      autoSim: true,
      autoSimIntervalMs: 12000
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
          // Ghế & hàng chờ luôn bắt đầu trống mỗi phiên — vào lại phải ghi danh/xếp hàng
          seats: Array(TOTAL_SEATS).fill(null),
          queue: [],
          devotees: saved.devotees || {},
          offerings: { ...base.offerings, ...(saved.offerings || {}) },
          recentEvents: saved.recentEvents || [],
          settings: { ...base.settings, ...(saved.settings || {}), autoSim: true },
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

  // ── Ghế & hàng chờ ──────────────────────────────────────────────────────────
  function seatIndexOf(uniqueId, name) {
    return state.seats.findIndex((s) => s && (s.uniqueId === uniqueId || s.name === name));
  }
  function freeSeatIndexes() {
    const out = [];
    for (let i = 0; i < TOTAL_SEATS; i++) if (!state.seats[i]) out.push(i);
    return out;
  }
  function queueIndexOf(uniqueId, name) {
    return state.queue.findIndex((q) => q.uniqueId === uniqueId || q.name === name);
  }
  function occupySeat(idx, dev, isSim) {
    if (idx < 0 || idx >= TOTAL_SEATS || state.seats[idx]) return null;
    state.seats[idx] = { name: dev.name, uniqueId: dev.uniqueId, isSim: !!isSim, seatedAt: Date.now() };
    return pushEventLog({ type: 'seatTaken', seatIdx: idx, user: dev.name, uniqueId: dev.uniqueId, isSim: !!isSim });
  }
  // Nhả ghế rồi nhường cho người đầu hàng chờ (nếu có)
  function vacateSeat(idx) {
    const occ = state.seats[idx];
    if (!occ) return null;
    state.seats[idx] = null;
    const evt = pushEventLog({ type: 'seatVacated', seatIdx: idx, user: occ.name, uniqueId: occ.uniqueId, isSim: occ.isSim });
    promoteQueue(idx);
    return evt;
  }
  function promoteQueue(preferredIdx = -1) {
    if (!state.queue.length) return null;
    let idx = (preferredIdx >= 0 && !state.seats[preferredIdx]) ? preferredIdx : freeSeatIndexes()[0];
    if (idx === undefined) return null;
    const next = state.queue.shift();
    return occupySeat(idx, next, next.isSim);
  }

  function pushEventLog(evt) {
    if (evt.seatIdx === undefined && evt.type !== 'seatTaken' && evt.type !== 'seatVacated') {
      evt.seatIdx = seatIndexOf(evt.uniqueId, evt.user);
    }
    const entry = { id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString(), ...evt };
    if (state.recentEvents.length > 35) state.recentEvents.length = 35;
    return entry;
  }

  function getPublicState() {
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
      leaderboard: getLeaderboard(24),
      seats: state.seats.map((s, i) => (s ? { seatIdx: i, name: s.name, uniqueId: s.uniqueId, isSim: s.isSim } : null)),
      queue: state.queue.map((q) => ({ name: q.name, uniqueId: q.uniqueId, isSim: q.isSim })),
      totalSeats: TOTAL_SEATS,
      recentEvents: state.recentEvents.slice(0, 15),
      settings: state.settings,
      tiktok: state.tiktok,
      tts: { ready: true, status: 'browser', voice: 'vi-VN' }
    };
  }

  // live.js gán callback này để nhận event do autoSim sinh ra
  let onEventCb = null;
  function emit(event) {
    saveState();
    if (typeof onEventCb === 'function') {
      onEventCb({ event, state: getPublicState() });
    }
  }

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
      const event = pushEventLog({ type: 'burnIncense', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, count, merit, wish, ttsText, ttsVoice: 'vi-VN' });
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
      const event = pushEventLog({ type: 'ringBell', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, count, merit, wish, ttsText, ttsVoice: 'vi-VN' });
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
      const event = pushEventLog({ type: 'sendPrayer', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, wish, merit, ttsText, ttsVoice: 'vi-VN' });
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
      const event = pushEventLog({ type: giftType === 'dragon' ? 'grandCeremony' : 'offerGift', user: devotee.name, uniqueId: devotee.uniqueId, avatar: devotee.avatar, giftType, giftName, coins, merit, wish, ttsText, ttsVoice: 'vi-VN' });
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
      saveState();
      return { event, state: getPublicState() };
    },

    grandCeremony(params = {}) {
      return Rituals.offerGift({ ...params, giftType: 'dragon', coins: Math.max(100, Number(params.coins) || 199), giftName: params.giftName || 'Đại Lễ Hào Quang Vạn Trượng' });
    },

    updateSettings(params = {}) {
      state.settings = { ...state.settings, ...params };
      if (typeof params.autoSim === 'boolean') configureAutoSim(params.autoSim);
      saveState();
      return { state: getPublicState() };
    }
  };

  // AUTO-SIMULATION — mô phỏng người thật đến chùa: xếp hàng → ngồi ghế → lên thắp hương → ra về
  let autoSimTimer = null;
  function runSingleSimulationStep() {
    // 1) Có người chờ + có ghế trống → ưu tiên cho vào ghế trước
    if (state.queue.length && freeSeatIndexes().length) {
      const e = promoteQueue();
      if (e) emit(e); else saveState();
      return;
    }
    const roll = Math.random();
    const seatedSimIdxs = [];
    state.seats.forEach((s, i) => { if (s && s.isSim) seatedSimIdxs.push(i); });
    const idleSims = SIM_DEVOTEES.filter((d) => seatIndexOf(d.uniqueId, d.user) < 0 && queueIndexOf(d.uniqueId, d.user) < 0);

    // 2) Khách mới đến chùa (~40%) — chỉ khi hàng chờ chưa quá dài
    if (roll < 0.40 && idleSims.length && state.queue.length < 8) {
      const pick = idleSims[Math.floor(Math.random() * idleSims.length)];
      const free = freeSeatIndexes();
      if (free.length) {
        emit(occupySeat(free[Math.floor(Math.random() * free.length)], pick, true));
      } else {
        state.queue.push({ name: pick.user, uniqueId: pick.uniqueId, isSim: true });
        emit(pushEventLog({ type: 'queued', user: pick.user, uniqueId: pick.uniqueId, position: state.queue.length, isSim: true }));
      }
      return;
    }
    // 3) Phật tử đang ngồi lên dâng hương (~82%)
    if (roll < 0.88 && seatedSimIdxs.length) {
      const idx = seatedSimIdxs[Math.floor(Math.random() * seatedSimIdxs.length)];
      const occ = state.seats[idx];
      const pick = SIM_DEVOTEES.find((d) => d.uniqueId === occ.uniqueId) || { user: occ.name, uniqueId: occ.uniqueId, wish: 'Nam mô A Di Đà Phật, cầu gia đình bình an' };
      const r = Math.random();
      let res;
      if (r < 0.34) {
        res = Rituals.burnIncense({ user: pick.user, uniqueId: pick.uniqueId, count: 3, wish: pick.wish, readTts: false });
      } else if (r < 0.56) {
        res = Rituals.sendPrayer({ user: pick.user, uniqueId: pick.uniqueId, wish: pick.wish, readTts: false });
      } else if (r < 0.72) {
        res = Rituals.drawFortune({ user: pick.user, uniqueId: pick.uniqueId, topic: pick.wish, readTts: false });
      } else if (r < 0.88) {
        res = Rituals.offerGift({ user: pick.user, uniqueId: pick.uniqueId, giftType: 'lotus', coins: 15, giftName: 'Hoa Sen Vàng Tinh Khiết', readTts: false });
      } else {
        res = Rituals.ringBell({ user: pick.user, uniqueId: pick.uniqueId, count: 1, wish: pick.wish, readTts: false });
      }
      emit(res.event);
      return;
    }
    // 4) Phật tử công phu xong ra về — nhả ghế cho người xếp hàng
    if (seatedSimIdxs.length) {
      emit(vacateSeat(seatedSimIdxs[Math.floor(Math.random() * seatedSimIdxs.length)]));
    }
  }

  function configureAutoSim(enabled) {
    state.settings.autoSim = Boolean(enabled);
    if (autoSimTimer) {
      clearInterval(autoSimTimer);
      autoSimTimer = null;
    }
    if (state.settings.autoSim) {
      autoSimTimer = setInterval(runSingleSimulationStep, state.settings.autoSimIntervalMs || 12000);
    }
  }

  function handleRpc(method, params = {}) {
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
        const uniqueId = params.uniqueId || name.toLowerCase().replace(/\s+/g, '');
        const seated = seatIndexOf(uniqueId, name);
        if (seated >= 0) return { state: getPublicState(), registered: true, seatIdx: seated };
        const qIdx = queueIndexOf(uniqueId, name);
        if (qIdx >= 0) return { state: getPublicState(), registered: true, queued: true, position: qIdx + 1 };
        const free = freeSeatIndexes();
        if (!free.length) {
          state.queue.push({ name, uniqueId, isSim: false });
          const evt = pushEventLog({ type: 'queued', user: name, uniqueId, position: state.queue.length, isSim: false });
          saveState();
          return { event: evt, state: getPublicState(), registered: true, queued: true, position: state.queue.length };
        }
        recordDevotee(name, '', '', 0, 0, 0); // key = tên hiển thị, trùng với record nghi thức
        saveState();
        return { state: getPublicState(), registered: true, needPick: true, freeSeats: free };
      }
      case 'temple.pickSeat': {
        const name = sanitizeUserName(params.user);
        const uniqueId = params.uniqueId || name.toLowerCase().replace(/\s+/g, '');
        const idx = Number(params.seatIdx);
        if (seatIndexOf(uniqueId, name) >= 0) {
          return { state: getPublicState(), seatIdx: seatIndexOf(uniqueId, name), alreadySeated: true };
        }
        if (idx < 0 || idx >= TOTAL_SEATS || state.seats[idx]) {
          return { state: getPublicState(), error: 'occupied', freeSeats: freeSeatIndexes() };
        }
        const qi = queueIndexOf(uniqueId, name);
        if (qi >= 0) state.queue.splice(qi, 1);
        const evt = occupySeat(idx, { name, uniqueId }, false);
        saveState();
        return { event: evt, state: getPublicState(), seatIdx: idx };
      }
      case 'temple.leaveSeat': {
        // Thoát web = mất ghế; vào lại phải xếp hàng/chọn lại
        const name = sanitizeUserName(params.user);
        const uniqueId = params.uniqueId || name.toLowerCase().replace(/\s+/g, '');
        const idx = seatIndexOf(uniqueId, name);
        const qi = queueIndexOf(uniqueId, name);
        let evt = null;
        if (qi >= 0) state.queue.splice(qi, 1);
        if (idx >= 0) evt = vacateSeat(idx);
        saveState();
        return { event: evt, state: getPublicState() };
      }
      case 'live.setAutoSim':
        configureAutoSim(Boolean(params.enabled));
        saveState();
        return { state: getPublicState() };
      case 'live.connect':
      case 'live.disconnect':
        return { state: getPublicState() };
      default:
        return { state: getPublicState() };
    }
  }

  configureAutoSim(state.settings.autoSim !== false);

  return {
    handleRpc,
    getState: getPublicState,
    set onEvent(cb) { onEventCb = cb; },
    get onEvent() { return onEventCb; }
  };
})();
