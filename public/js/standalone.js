/**
 * TempleLocal — Engine chùa online chạy hoàn toàn phía client (bản tĩnh, không server).
 * Mô phỏng lại logic Rituals của server.js: state, bảng công đức, quẻ xăm, autoSim.
 * live.js gọi window.TempleLocal.handleRpc(...) và nhận state/event y hệt server thật.
 */
window.TEMPLE_STATIC = true;
window.TempleLocal = (function () {
  const STORAGE_KEY = 'chua_viteccons_state_v1';

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

  // Đạo tràng mở màn: anh chị em Viteccons vào chùa trước (để chánh điện không trống)
  const SEED_DEVOTEES = [
    { user: 'KS. Ngọc Anh', uniqueId: 'ngocanh.pkt', merit: 420, incense: 21, lastWish: 'Cầu các công trình bàn giao đúng tiến độ, an toàn tuyệt đối' },
    { user: 'CN. Minh Quân', uniqueId: 'minhquan.ct', merit: 365, incense: 18, lastWish: 'Nam mô A Di Đà Phật, cầu an toàn lao động trên mọi công trường' },
    { user: 'Diệu Thảo TC-HC', uniqueId: 'thao.tchc', merit: 310, incense: 15, lastWish: 'Cầu đại gia đình Viteccons đoàn kết, vạn sự như ý' },
    { user: 'ĐT. Hoàng Nam', uniqueId: 'nam.doi', merit: 268, incense: 12, lastWish: 'Cầu thi công suôn sẻ, anh em no ấm bình an' },
    { user: 'Chị Thanh Hà', uniqueId: 'thanhha.kt', merit: 215, incense: 12, lastWish: 'Cầu chủ đầu tư thanh toán đúng hạn, công ty phát đạt' },
    { user: 'Vũ Đức Thịnh', uniqueId: 'ducthinh.vt', merit: 188, incense: 9, lastWish: 'Con xin gieo quẻ cầu tài lộc đầu năm cho gia đình' },
    { user: 'Anh Bảy Cơ Khí', uniqueId: 'bay.cokhi', merit: 150, incense: 9, lastWish: 'Cầu gia đình mạnh khỏe, con cái học hành đỗ đạt' },
    { user: 'Thím Sáu Bếp Ăn', uniqueId: 'sau.bepan', merit: 122, incense: 6, lastWish: 'Cầu anh em công trường ăn ngon khỏe mạnh' },
    { user: 'Chú Tư Bảo Vệ', uniqueId: 'tu.baove', merit: 96, incense: 6, lastWish: 'Cầu trực đêm yên ả, mọi điều bình an vô sự' },
    { user: 'Em Tám Hồ sơ', uniqueId: 'tam.hoso', merit: 68, incense: 3, lastWish: 'Cầu hồ sơ thầu trúng liên miên, giấy tờ thông suốt' },
    { user: 'KS. Bảo Kết Cấu', uniqueId: 'bao.kc', merit: 60, incense: 3, lastWish: 'Cầu sắt thép vững chãi, bê tông đạt mác' },
    { user: 'Anh Phong Giàn Giáo', uniqueId: 'phong.gg', merit: 55, incense: 3, lastWish: 'Cầu thao tác trên cao luôn an toàn tuyệt đối' },
    { user: 'Chị Yến Vật Tư', uniqueId: 'yen.vt', merit: 50, incense: 3, lastWish: 'Cầu vật tư về đúng giá, không thất thoát' },
    { user: 'CN. Vinh Điện Nước', uniqueId: 'vinh.dn', merit: 46, incense: 3, lastWish: 'Cầu hệ thống điện nước vận hành trơn tru' },
    { user: 'Bác Lợi Lái Cẩu', uniqueId: 'loi.cau', merit: 42, incense: 3, lastWish: 'Cầu mỗi nhịp cẩu đều chuẩn xác, gió lành mây êm' },
    { user: 'CN. Tấn Hàn', uniqueId: 'tan.han', merit: 38, incense: 3, lastWish: 'Cầu mối hàn chắc bền như lòng anh em' },
    { user: 'KS. Dũng QS', uniqueId: 'dung.qs', merit: 34, incense: 3, lastWish: 'Cầu boq khớp từng hạng mục, thanh toán không trễ' },
    { user: 'Anh Hòa An Toàn', uniqueId: 'hoa.at', merit: 30, incense: 3, lastWish: 'Cầu an toàn lao động, ai cũng về nhà bình an' },
    { user: 'Chị Thu Kế Hoạch', uniqueId: 'thu.kh', merit: 27, incense: 3, lastWish: 'Cầu tiến độ chạy đúng, milestone không trượt' },
    { user: 'Em Trang Thiết Kế', uniqueId: 'trang.tk', merit: 24, incense: 3, lastWish: 'Cầu bản vẽ shop drawing duyệt một lần qua' },
    { user: 'CN. Cường Cốp Pha', uniqueId: 'cuong.cp', merit: 21, incense: 3, lastWish: 'Cầu cốp pha chắc tay, đổ bê tông mướt mặt' },
    { user: 'KS. Tú Trắc Địa', uniqueId: 'tu.td', merit: 18, incense: 3, lastWish: 'Cầu tọa độ chuẩn từng milimet, không sai sót' }
  ];

  const SIM_DEVOTEES = [
    { user: 'KS. Ngọc Anh', uniqueId: 'ngocanh.pkt', wish: 'Cầu công trình bàn giao đúng tiến độ, chất lượng Build by Heart' },
    { user: 'Trần Minh Quân', uniqueId: 'minhquan.ct', wish: 'Cầu an toàn lao động, không một tai nạn nào trên công trường' },
    { user: 'Diệu Thảo Tâm An', uniqueId: 'tam_an_99', wish: 'Nam Mô A Di Đà Phật, nguyện cầu đại gia đình Viteccons bình an hưng thịnh' },
    { user: 'Lê Hoàng Nam', uniqueId: 'hoangnam.doi', wish: 'Cầu thi công thuận lợi, trời thuận thủy hòa nhân an' },
    { user: 'Phạm Thanh Hà', uniqueId: 'thanhha.kt', wish: 'Cầu thanh toán công nợ thông suốt, dòng tiền hanh thông' },
    { user: 'Vũ Đức Thịnh', uniqueId: 'ducthinh.vt', wish: 'Con xin gieo một quẻ cầu tài lộc đầu năm' },
    { user: 'Anh Bảy Cơ Khí', uniqueId: 'bay.cokhi', wish: 'Cầu máy móc vận hành trơn tru, hàng mục hoàn thành đẹp đẽ' },
    { user: 'Chị Hằng Kế Toán', uniqueId: 'hang.kt', wish: 'Cầu quyết toán trôi chảy, số liệu khớp từng đồng' }
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

  function seedState() {
    const s = DEFAULT_STATE();
    SEED_DEVOTEES.forEach((d) => {
      s.devotees[d.uniqueId] = {
        name: d.user,
        uniqueId: d.uniqueId,
        avatar: '',
        merit: d.merit,
        incense: d.incense,
        gifts: 0,
        lastWish: d.lastWish
      };
      s.totalMerit += d.merit;
    });
    return s;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const base = DEFAULT_STATE();
        const devotees = saved.devotees || {};
        let addedMerit = 0;
        // Gộp thêm phật tử Viteccons mới vào đạo tràng (giữ nguyên công đức người dùng)
        SEED_DEVOTEES.forEach((d) => {
          if (!devotees[d.uniqueId]) {
            devotees[d.uniqueId] = {
              name: d.user,
              uniqueId: d.uniqueId,
              avatar: '',
              merit: d.merit,
              incense: d.incense,
              gifts: 0,
              lastWish: d.lastWish
            };
            addedMerit += d.merit;
          }
        });
        return {
          ...base,
          ...saved,
          totalMerit: (saved.totalMerit || 0) + addedMerit,
          devotees,
          offerings: { ...base.offerings, ...(saved.offerings || {}) },
          recentEvents: saved.recentEvents || [],
          settings: { ...base.settings, ...(saved.settings || {}), autoSim: true },
          tiktok: base.tiktok
        };
      }
    } catch (_) { }
    return seedState();
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

  function pushEventLog(evt) {
    const entry = { id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString(), ...evt };
    state.recentEvents.unshift(entry);
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

  // AUTO-SIMULATION — đạo tràng tự đi chùa để chánh điện luôn rộn ràng
  let autoSimTimer = null;
  function runSingleSimulationStep() {
    const pick = SIM_DEVOTEES[Math.floor(Math.random() * SIM_DEVOTEES.length)];
    const roll = Math.random();
    let res;
    if (roll < 0.30) {
      res = Rituals.burnIncense({ user: pick.user, uniqueId: pick.uniqueId, count: 3, wish: pick.wish, readTts: false });
    } else if (roll < 0.55) {
      res = Rituals.sendPrayer({ user: pick.user, uniqueId: pick.uniqueId, wish: pick.wish, readTts: false });
    } else if (roll < 0.75) {
      res = Rituals.drawFortune({ user: pick.user, uniqueId: pick.uniqueId, topic: pick.wish, readTts: false });
    } else if (roll < 0.90) {
      res = Rituals.offerGift({ user: pick.user, uniqueId: pick.uniqueId, giftType: 'lotus', coins: 15, giftName: 'Hoa Sen Vàng Tinh Khiết', readTts: false });
    } else {
      res = Rituals.ringBell({ user: pick.user, uniqueId: pick.uniqueId, count: 1, wish: pick.wish, readTts: false });
    }
    emit(res.event);
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
