/* ============================================================
 * TỬ VI ĐẨU SỐ — engine chuyên sâu (port từ Renhuai123/ziwei-doushu
 * + iztro 2.6.4, MIT). Toàn bộ tính toán an sao do iztro thực hiện
 * chuẩn theo phái toàn thư; file này chuẩn hoá dữ liệu + diễn giải.
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- Bảng tra Hán → Việt ---------- */
  var STEM_VI = { '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu', '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý' };
  var BR_VI = { '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi' };
  var BR_IDX = { '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5, '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11 };
  var SIHUA_VI = { '禄': 'Hóa Lộc', '权': 'Hóa Quyền', '科': 'Hóa Khoa', '忌': 'Hóa Kỵ' };
  var BRIGHT_VI = { '庙': 'Miếu', '旺': 'Vượng', '得': 'Đắc', '利': 'Lợi', '平': 'Bình', '不': 'Bất', '闲': 'Nhàn', '陷': 'Hãm', '地': 'Địa' };
  var PALACE_VI = {
    '命宫': 'Mệnh', '兄弟宫': 'Huynh Đệ', '夫妻宫': 'Phu Thê', '子女宫': 'Tử Tức',
    '财帛宫': 'Tài Bạch', '疾厄宫': 'Tật Ách', '迁移宫': 'Thiên Di', '交友宫': 'Nô Bộc',
    '官禄宫': 'Quan Lộc', '田宅宫': 'Điền Trạch', '福德宫': 'Phúc Đức', '父母宫': 'Phụ Mẫu'
  };
  var ZODIAC_VI = { '鼠': 'Tý', '牛': 'Sửu', '虎': 'Dần', '兔': 'Mão', '龙': 'Thìn', '蛇': 'Tỵ', '马': 'Ngọ', '羊': 'Mùi', '猴': 'Thân', '鸡': 'Dậu', '狗': 'Tuất', '猪': 'Hợi' };
  var EL_VI = { '木': 'Mộc', '火': 'Hỏa', '土': 'Thổ', '金': 'Kim', '水': 'Thủy' };

  /* Bố cục lưới 4×4 chuẩn lá số (hàng, cột) — branch index → vị trí */
  var GRID_POS = { 5: [0, 0], 6: [0, 1], 7: [0, 2], 8: [0, 3], 4: [1, 0], 9: [1, 3], 3: [2, 0], 10: [2, 3], 2: [3, 0], 1: [3, 1], 0: [3, 2], 11: [3, 3] };

  /* ---------- Diễn giải (tiếng Việt, phái toàn thư) ---------- */
  var STAR_INFO = {
    'Tử Vi': { el: 'Thổ', kw: 'Đế Tinh — tôn quý, lãnh đạo, độc lập, tự trọng', good: 'Cung miếu vượng: quý hiển, uy quyền, tự lập. Hãm: cô độc, kiêu ngạo.' },
    'Thiên Cơ': { el: 'Mộc', kw: 'Thiện Tinh — thông minh, cơ mưu, biến động, nhanh nhẹn', good: 'Giỏi phân tích, làm việc trí tuệ. Miếu: đại quý. Hãm: hay thay đổi, đa nghi.' },
    'Thái Dương': { el: 'Hỏa', kw: 'Quang Minh — nhiệt huyết, quan lộc, danh tiếng, rộng lượng', good: 'Thành công nhờ danh tiếng, hợp công chức. Hãm địa: vất vả, hay bị che khuất.' },
    'Vũ Khúc': { el: 'Kim', kw: 'Tài Tinh — cương nghị, quyết đoán, tài chính, thực tế', good: 'Giỏi tài chính, thương mại. Miếu: giàu có. Cần chế hóa.' },
    'Thiên Đồng': { el: 'Thủy', kw: 'Phúc Tinh — ôn hòa, hưởng phúc, lười biếng, duyên phận', good: 'Sống an nhàn, ít tranh đấu. Miếu: phúc thọ. Hãm: ỷ lại, hưởng thụ quá độ.' },
    'Liêm Trinh': { el: 'Hỏa', kw: '次桃花 — tài nghệ, quan lộc, thị phi, đam mê', good: 'Tham chính trị, nghệ thuật. Miếu: quyền quý. Hãm: thị phi, hình thương.' },
    'Thiên Phủ': { el: 'Thổ', kw: 'Khố Tinh — tài khố, ổn trọng, bảo thủ, an phận', good: 'Giàu có tích lũy, ổn định. Miếu vượng: phú quý song toàn.' },
    'Thái Âm': { el: 'Thủy', kw: 'Nguyệt Tinh — nhu mỹ, giàu sang, điền sản, mẫu tính', good: 'Miếu vượng: giàu có, điền sản. Miếu Thủy Bạch: giàu sang.' },
    'Tham Lang': { el: 'Mộc', kw: 'Đào Hoa — đa tài, dục vọng, đào hoa, đa năng', good: 'Nhiều năng khiếu, duyên người. Miếu: giàu sang. Hãm: ham mê, thị phi.' },
    'Cự Môn': { el: 'Thủy', kw: 'Ám Tinh — khẩu thiệt, tranh luận, thuyết phục, nghiên cứu', good: 'Giỏi ăn nói, luật pháp, nghiên cứu. Miếu: học thuật. Hãm: khẩu thiệt.' },
    'Thiên Tướng': { el: 'Thủy', kw: 'Ấn Tinh — phụ tá, hành chính, ổn trọng, cân bằng', good: 'Hợp công chức, quản lý. Miếu: quan lộc vững. Hãm: hay bị lợi dụng.' },
    'Thiên Lương': { el: 'Thổ', kw: 'Ấm Tinh — che chở, y dược, từ thiện, trưởng bối', good: 'Người che chở, bác sĩ, tôn giáo. Miếu: phúc thọ.' },
    'Thất Sát': { el: 'Kim', kw: 'Tướng Tinh — quyết đoán, cô độc, biến động, cách mạng', good: 'Tướng soái, người tiên phong. Miếu: uy quyền. Hãm: cô đơn, phá phách.' },
    'Phá Quân': { el: 'Thủy', kw: 'Phá Tinh — khai phá, biến động, phá cũ dựng mới', good: 'Cách mạng, doanh nhân. Miếu: thành tựu lớn sau biến động.' }
  };
  var PALACE_INFO = {
    '命宫': { kw: 'Bản mệnh — tính cách, dung mạo, khí chất, hướng phát triển cả đời', tip: 'Cung quan trọng nhất, định tính cách gốc và vận mệnh tổng quát.' },
    '兄弟宫': { kw: 'Huynh đệ — anh chị em, bạn bè thân, quan hệ ngang hàng', tip: 'Xem tình cảm với anh chị em, bạn bè, đối tác ngang hàng.' },
    '夫妻宫': { kw: 'Phu thê — hôn nhân, người phối ngẫu, tình duyên', tip: 'Xem duyên vợ/chồng, phẩm chất người bạn đời, thời điểm kết hôn.' },
    '子女宫': { kw: 'Tử tức — con cái, sáng tạo, đời sau, sản nghiệp', tip: 'Xem số con, quan hệ con cái, và các "đứa con tinh thần" (tác phẩm, sáng tạo).' },
    '财帛宫': { kw: 'Tài bạch — tiền bạc, nguồn thu, cách kiếm và giữ tiền', tip: 'Xem khả năng tài chính, nghề nghiệp sinh lời, thói quen tiền bạc.' },
    '疾厄宫': { kw: 'Tật ách — sức khỏe, bệnh tật, tai ương, tai nạn', tip: 'Xem thể chất, bệnh hay mắc, phần sức khỏe cần giữ gìn.' },
    '迁移宫': { kw: 'Thiên di — ra ngoài, di chuyển, môi trường bên ngoài', tip: 'Xem vận khi ra ngoài, đi xa, đối ngoại, sự nghiệp bên ngoài quê nhà.' },
    '交友宫': { kw: 'Nô bộc — bạn bè, người dưới quyền, quan hệ xã hội', tip: 'Xem bạn bè, người giúp đỡ, cấp dưới, và những kẻ "tiểu nhân".' },
    '官禄宫': { kw: 'Quan lộc — sự nghiệp, công danh, địa vị, nghề nghiệp', tip: 'Xem con đường sự nghiệp, nghề phù hợp, cơ hội thăng tiến.' },
    '田宅宫': { kw: 'Điền trạch — nhà cửa, đất đai, bất động sản, gia đình', tip: 'Xem khả năng sở hữu nhà đất, tổ ấm, môi trường sống.' },
    '福德宫': { kw: 'Phúc đức — phúc phần, tâm linh, hưởng thụ, niềm vui', tip: 'Xem phúc phận, đời sống tinh thần, khả năng hưởng thụ, tôn giáo.' },
    '父母宫': { kw: 'Phụ mẫu — cha mẹ, cấp trên, người lớn, nền tảng', tip: 'Xem quan hệ cha mẹ, người bảo trợ, cấp trên, di sản gia đình.' }
  };
  var JU_INFO = {
    2: { name: 'Thủy Nhị Cục', el: 'Thủy', kw: 'Trí tuệ, linh hoạt, tư duy sâu sắc, giỏi giao tiếp' },
    3: { name: 'Mộc Tam Cục', el: 'Mộc', kw: 'Nhân hậu, nhân văn, phát triển bền vững, có đức' },
    4: { name: 'Kim Tứ Cục', el: 'Kim', kw: 'Nghĩa khí, quyết đoán, nguyên tắc, công bằng' },
    5: { name: 'Thổ Ngũ Cục', el: 'Thổ', kw: 'Thực tế, ổn trọng, bao dung, đáng tin cậy' },
    6: { name: 'Hỏa Lục Cục', el: 'Hỏa', kw: 'Nhiệt huyết, sáng tạo, lôi cuốn, bốc đồng' }
  };

  /* ---------- Chuẩn hoá dữ liệu iztro → data gọn ---------- */
  function vnStem(s) { return STEM_VI[s] || s; }
  function vnBranch(s) { return BR_VI[s] || BR_VI[s && s.length ? s[s.length - 1] : ''] || s; }
  function vnPalace(n) { if (n === 'Tử Nữ') return 'Tử Tức'; return PALACE_VI[n] || n; }
  function vnSiHua(s) { return SIHUA_VI[s] || s; }
  function vnBright(b) { return BRIGHT_VI[b] || b; }

  function normStar(st) {
    return {
      name: st.name,
      type: st.type || '',
      brightness: vnBright(st.brightness),
      sihua: st.mutagen ? vnSiHua(st.mutagen) : null
    };
  }

  function normPalace(p) {
    var branchChar = p.earthlyBranch;
    var branchIdx = typeof branchChar === 'number' ? branchChar : (BR_IDX[branchChar] !== undefined ? BR_IDX[branchChar] : null);
    if (branchIdx === null) {
      // iztro vi-VN trả tên branch tiếng Việt — map ngược
      for (var k in BR_VI) if (BR_VI[k] === branchChar) { branchIdx = BR_IDX[k]; break; }
    }
    var stars = [];
    (p.majorStars || []).forEach(function (s) { stars.push(normStar(s)); });
    (p.minorStars || []).forEach(function (s) { stars.push(normStar(s)); });
    (p.adjectiveStars || []).forEach(function (s) { stars.push(normStar(s)); });
    var dx = p.decadal && p.decadal.range ? p.decadal.range : null;
    return {
      name: vnPalace(p.name),
      rawName: p.name,
      stem: vnStem(p.heavenlyStem),
      branch: branchChar,
      branchIdx: branchIdx,
      stars: stars,
      isMing: vnPalace(p.name) === 'Mệnh',
      isShen: !!p.isBodyPalace,
      isBody: !!p.isBodyPalace,
      empty: p.isEmpty === true || ((p.majorStars || []).length === 0),
      decadal: dx,
      ages: p.ages || null
    };
  }

  /* ---------- API chính ---------- */
  window.Ziwei = {
    available: function () { return typeof window.iztro !== 'undefined' && !!window.iztro.astro; },

    /* birth: {year, month, day, hour(0-23), gender:'male'|'female'} */
    buildChart: function (birth) {
      if (!this.available()) return null;
      var hour = birth.hour == null ? 12 : birth.hour;
      var timeIndex = Math.min(12, Math.max(0, Math.floor((hour + 1) / 2)));
      var gender = birth.gender === 'male' ? '男' : '女';
      var dateStr = birth.year + '-' + birth.month + '-' + birth.day;
      var chart = birth.lunar
        ? window.iztro.astro.byLunar(dateStr, timeIndex, gender, !!birth.leapMonth, true, 'vi-VN', {})
        : window.iztro.astro.bySolar(dateStr, timeIndex, gender, true, 'vi-VN', {});
      var palaces = (chart.palaces || []).map(normPalace);
      // sắp theo branchIdx để GRID_POS tra được
      palaces.sort(function (a, b) { return (a.branchIdx || 0) - (b.branchIdx || 0); });
      var juNum = parseInt(chart.fiveElementsClass, 10) || 0;
      var ming = palaces.filter(function (p) { return p.isMing; })[0];
      var shen = palaces.filter(function (p) { return p.isShen || p.isBody; })[0];
      return {
        raw: chart,
        palaces: palaces,
        mingBranch: chart.earthlyBranchOfSoulPalace,
        shenBranch: chart.earthlyBranchOfBodyPalace,
        ju: juNum,
        juName: (JU_INFO[juNum] || {}).name || (chart.fiveElementsClass || ''),
        juInfo: JU_INFO[juNum] || null,
        lunarDate: chart.lunarDate || '',
        chineseDate: chart.chineseDate || '',
        solarDate: chart.solarDate || '',
        inputLunar: !!birth.lunar,
        zodiac: ZODIAC_VI[chart.zodiac] || chart.zodiac || '',
        sign: chart.sign || '',
        gender: birth.gender,
        birth: birth
      };
    },

    /* horoscope cho 1 ngày cụ thể — trả {day, month, year, decadal} đã chuẩn hoá */
    horoscope: function (chartObj, dateStr) {
      if (!chartObj || !chartObj.raw) return null;
      var h;
      try { h = chartObj.raw.horoscope(dateStr || new Date()); } catch (e) { return null; }
      function cleanStarName(n) { return String(n || '').replace(/\([a-z]\)$/i, ''); }
      function normLevel(lv) {
        if (!lv) return null;
        // mutagen: mảng [化禄,化权,化科,化忌] → {label, star}
        var SIHUA_LABELS = ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'];
        var mutagen = null;
        if (Array.isArray(lv.mutagen)) {
          mutagen = lv.mutagen.map(function (s, i) { return { label: SIHUA_LABELS[i] || 'Hóa', star: cleanStarName(s) }; });
        } else if (lv.mutagen && typeof lv.mutagen === 'object') {
          mutagen = Object.keys(lv.mutagen).map(function (k) { return { label: vnSiHua(k), star: cleanStarName(lv.mutagen[k]) }; });
        }
        // stars: mảng các nhóm (theo cung) — làm phẳng, bỏ hậu tố (d)/(y)/(m)
        var stars = [];
        (lv.stars || []).forEach(function (grp) {
          (Array.isArray(grp) ? grp : [grp]).forEach(function (s) {
            if (s && s.name) stars.push({ name: cleanStarName(s.name), brightness: vnBright(s.brightness), sihua: s.mutagen ? vnSiHua(s.mutagen) : null });
          });
        });
        return {
          name: lv.name,
          stem: vnStem(lv.heavenlyStem),
          branch: vnBranch(lv.earthlyBranch),
          palaceNames: (lv.palaceNames || []).map(vnPalace),
          mutagen: mutagen,
          stars: stars
        };
      }
      return {
        decadal: normLevel(h.decadal),
        year: normLevel(h.yearly),
        month: normLevel(h.monthly),
        day: normLevel(h.daily),
        hour: normLevel(h.hourly)
      };
    },

    /* cung chứa 1 branch index */
    palaceAt: function (chartObj, branchIdx) {
      return (chartObj.palaces || []).filter(function (p) { return p.branchIdx === branchIdx; })[0] || null;
    },

    /* sao chính (14 chính tinh) của 1 cung */
    majorsOf: function (palace) {
      var MAJORS = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh', 'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'];
      return (palace.stars || []).filter(function (s) { return MAJORS.indexOf(s.name) >= 0; });
    },

    /* diễn giải chi tiết ~1 trang A4 cho 1 cung */
    palaceDetail: function (chartObj, palace, allPalaces) {
      var T = window.ZiweiTexts || {};
      var p = palace;
      var domain = (T.DOMAIN || {})[p.name] || 'self';
      var D = window.ZiweiDeep || {};
      var sections = [];
      var majors = this.majorsOf(p);
      var ZP = window.ZiweiPatterns;
      var pats = (ZP && ZP.matchPalace) ? (ZP.matchPalace(p, allPalaces, chartObj) || []) : [];

      // 1) Tổng quan — trọng tâm trước: cung + sao + cách cục + việc nên làm đầu tiên
      var ki = PALACE_INFO[p.rawName] || PALACE_INFO[p.name] || { kw: '' };
      var ov = 'Cung ' + p.name + ' (' + p.stem + ' ' + (typeof p.branch === 'string' ? p.branch : '') + ') — ' + (ki.kw || '');
      ov += majors.length ? '\nChính tinh: ' + majors.map(function (s) { return s.name + (s.brightness && s.brightness !== 'Bình' ? ' ' + s.brightness : ''); }).join(', ') : '\nCung không chính tinh — chủ đề ' + p.name + ' mượn lực từ cung đối và tam hợp.';
      if (pats.length) ov += '\nCách cục nổi bật: ' + pats.slice(0, 2).map(function (x) { return x.name; }).join(' · ');
      var firstAct = ((D.PALACE_ACTION || {})[p.name] || {}).should;
      if (firstAct && firstAct.length) ov += '\n→ Việc nên làm trước: ' + firstAct[0];
      sections.push({ h: 'Tổng quan', body: ov, main: true });

      // 2) Ý nghĩa cung nền + luận sâu (thu gọn — dài)
      var palaceLong = (T.PALACE_LONG || {})[p.name] || (T.PALACE_LONG || {})[p.rawName] || '';
      if (palaceLong) sections.push({ h: 'Ý nghĩa cung ' + p.name + ' (chi tiết)', body: palaceLong, sub: true });
      var palaceDeep = (D.PALACE_DEEP || {})[p.name] || '';
      if (palaceDeep) sections.push({ h: 'Luận sâu cung ' + p.name, body: palaceDeep, sub: true });

      // 3) Cung không?
      if (p.empty || majors.length === 0) {
        sections.push({ h: 'Cung không chính tinh', body: (T.EMPTY_PALACE_TEXT || '') });
        // mượn sao đối cung
        var oppIdx = p.branchIdx != null ? (p.branchIdx + 6) % 12 : null;
        var opp = oppIdx != null && allPalaces ? allPalaces.filter(function (x) { return x.branchIdx === oppIdx; })[0] : null;
        if (opp) {
          var oppMajors = this.majorsOf(opp);
          sections.push({ h: 'Mượn sao từ cung đối — ' + opp.name, body: oppMajors.length ? oppMajors.map(function (s) { return s.name + (s.brightness ? ' (' + s.brightness + ')' : ''); }).join(', ') + ' — ' + ((T.STAR_DOMAIN || {})[oppMajors[0] && oppMajors[0].name] || {})[domain] || '' : 'Cung đối cũng không chính tinh.' });
        }
      }

      // 4) Từng chính tinh tọa thủ — STAR_LONG + góc nhìn theo lĩnh vực
      majors.forEach(function (s) {
        var starLong = (T.STAR_LONG || {})[s.name] || '';
        var domainTxt = ((T.STAR_DOMAIN || {})[s.name] || {})[domain] || '';
        var combo = (T.COMBO_HINTS || {})[s.name] || '';
        var brightTxt = (T.BRIGHT_LONG || {})[s.brightness] || '';
        var sihuaTxt = s.sihua ? ((T.SIHUA_LONG || {})[s.sihua] || '') : '';
        var body = starLong;
        if (domainTxt) body += '\n\n' + domainTxt;
        if (brightTxt) body += '\n\nĐộ sáng: ' + brightTxt + '.';
        if (sihuaTxt) body += '\n\n' + sihuaTxt + '.';
        if (combo) body += '\n\nCách cục: ' + combo;
        // hành động theo sao
        var starAct = ((D.STAR_ACTION || {})[s.name]) || null;
        if (starAct) {
          body += '\n\n══ HÀNH ĐỘNG THEO SAO ' + s.name + ' ══';
          body += '\n• NÊN: ' + (starAct.should || []).join(' • ');
          body += '\n• TRÁNH: ' + (starAct.avoid || []).join(' • ');
          if (starAct.career) body += '\n• NGHỀ: ' + starAct.career;
          if (starAct.health) body += '\n• SỨC KHỎE: ' + starAct.health;
          if (starAct.finance) body += '\n• TÀI CHÍNH: ' + starAct.finance;
        }
        sections.push({ h: s.name + (s.brightness ? ' (' + s.brightness + ')' : '') + (s.sihua ? ' — ' + s.sihua : ''), body: body, main: true });
      });

      // 4c) Ngũ hành tương quan — hành cung vs hành sao (sinh/khắc)
      var BR_EL = { 2: 'Mộc', 3: 'Mộc', 5: 'Hỏa', 6: 'Hỏa', 8: 'Kim', 9: 'Kim', 0: 'Thủy', 11: 'Thủy', 1: 'Thổ', 4: 'Thổ', 7: 'Thổ', 10: 'Thổ' };
      var STAR_EL = { 'Tử Vi': 'Thổ', 'Thiên Cơ': 'Mộc', 'Thái Dương': 'Hỏa', 'Vũ Khúc': 'Kim', 'Thiên Đồng': 'Thủy', 'Liêm Trinh': 'Hỏa', 'Thiên Phủ': 'Thổ', 'Thái Âm': 'Thủy', 'Tham Lang': 'Mộc', 'Cự Môn': 'Thủy', 'Thiên Tướng': 'Thủy', 'Thiên Lương': 'Thổ', 'Thất Sát': 'Kim', 'Phá Quân': 'Thủy' };
      var SHENG = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
      var KHAC = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };
      if (p.branchIdx != null && majors.length) {
        var cungEl = BR_EL[p.branchIdx];
        var elLines = ['Cung ' + p.name + ' thuộc hành ' + cungEl + '. Tương quan với chính tinh:'];
        var goodCount = 0, badCount = 0;
        majors.forEach(function (s) {
          var se = STAR_EL[s.name];
          var rel;
          if (!se || !cungEl) rel = 'trung tính';
          else if (se === cungEl) { rel = 'đồng hành — bình ổn'; goodCount++; }
          else if (SHENG[cungEl] === se) { rel = 'cung sinh sao — sao được nuôi, phát huy tốt'; goodCount++; }
          else if (SHENG[se] === cungEl) { rel = 'sao sinh cung — cung được sao phù trợ'; goodCount++; }
          else if (KHAC[cungEl] === se) { rel = 'cung khắc sao — sao bị áp chế, cần lưu ý'; badCount++; }
          else { rel = 'sao khắc cung — cung bị hao tổn, cần chế hóa'; badCount++; }
          elLines.push('• ' + s.name + ' (' + se + '): ' + rel);
        });
        elLines.push(badCount === 0 ? 'Tổng thể: ngũ hành tương sinh tương hòa — cung này thuận lợi, sao phát huy tốt.' :
          goodCount > badCount ? 'Tổng thể: được tương sinh nhiều hơn tương khắc — cung này vẫn có nền tảng tốt, chỉ cần lưu ý các sao bị khắc chế.' :
            'Tổng thể: tương khắc chiếm ưu thế — cung này cần chế hóa, tránh quyết định lớn và giữ sức khỏe tinh thần.');
        sections.push({ h: 'Ngũ hành tương quan', body: elLines.join('\n'), sub: true });
      }

      // 4b) Cách cục nhận diện — matching tổ hợp sao kinh điển
      if (pats.length) {
        var LEVEL_VI = { excellent: 'Đại cách ★★★', good: 'Cách tốt ★★', neutral: 'Cách trung ★', caution: 'Cách cần đề phòng ⚠' };
        var patBody = pats.map(function (pt) {
          return '◆ ' + pt.name + ' [' + (LEVEL_VI[pt.level] || pt.level) + ']\n' + pt.desc;
        }).join('\n\n');
        sections.push({ h: 'Cách cục nhận diện (' + pats.length + ' cách)', body: patBody, main: true });
      }

      // 5) Phụ tinh hội chiếu
      var minors = (p.stars || []).filter(function (s) { return majors.indexOf(s) < 0; });
      if (minors.length) {
        var minorLines = minors.map(function (s) {
          var info = (T.MINOR_INFO || {})[s.name] || s.name;
          return '• ' + info + (s.brightness && s.brightness !== 'Bình' ? ' (' + s.brightness + ')' : '');
        });
        sections.push({ h: 'Phụ tinh hội chiếu (' + minors.length + ' sao)', body: minorLines.join('\n'), sub: true });
      }

      // 6) Tam phương tứ chính — đối cung + tam hợp
      if (allPalaces && p.branchIdx != null) {
        var opp = allPalaces.filter(function (x) { return x.branchIdx === (p.branchIdx + 6) % 12; })[0];
        var tamHopGroups = [[2, 6, 10], [8, 0, 4], [11, 3, 7], [5, 9, 1]];
        var group = tamHopGroups.filter(function (g) { return g.indexOf(p.branchIdx) >= 0; })[0] || [];
        var tamHop = group.filter(function (b) { return b !== p.branchIdx; }).map(function (b) {
          var pp = allPalaces.filter(function (x) { return x.branchIdx === b; })[0];
          return pp ? pp.name + ' (' + this.majorsOf(pp).map(function (s) { return s.name; }).join(', ') + ')' : '';
        }, this);
        var tamTxt = '';
        if (opp) tamTxt += '• Cung đối (xung chiếu): ' + opp.name + ' — ' + (this.majorsOf(opp).map(function (s) { return s.name; }).join(', ') || 'không chính tinh') + '\n';
        if (tamHop.length) tamTxt += '• Tam hợp: ' + tamHop.join(' · ') + '\n';
        if (tamTxt) sections.push({ h: 'Tam phương tứ chính', body: tamTxt.trim(), sub: true });
      }

      // 7) Đại hạn qua cung này
      if (p.decadal) {
        sections.push({ h: 'Đại hạn qua cung này', body: 'Tuổi ' + p.decadal[0] + '–' + p.decadal[1] + ': thời kỳ này cung ' + p.name + ' phát vận — chú ý các sao tọa thủ và sao lưu niên để biết cụ thể hơn.', sub: true });
      }

      // 8) Hành động cụ thể theo cung — NÊN/TRÁNH/NGHỀ/SỨC KHỎE/TÀI CHÍNH
      var palaceAct = (D.PALACE_ACTION || {})[p.name] || null;
      if (palaceAct) {
        var actBody = '';
        actBody += 'NÊN LÀM:\n' + (palaceAct.should || []).map(function (x) { return '• ' + x; }).join('\n') + '\n\n';
        actBody += 'TRÁNH:\n' + (palaceAct.avoid || []).map(function (x) { return '• ' + x; }).join('\n') + '\n\n';
        if (palaceAct.career) actBody += 'NGHỀ PHÙ HỢP: ' + palaceAct.career + '\n\n';
        if (palaceAct.health) actBody += 'SỨC KHỎE: ' + palaceAct.health + '\n\n';
        if (palaceAct.timing) actBody += 'THỜI ĐIỂM: ' + palaceAct.timing;
        sections.push({ h: 'Hành động cụ thể cung ' + p.name, body: actBody.trim(), main: true });
      }

      // 9) Lời khuyên
      var advice = (T.PALACE_ADVICE || {})[p.name] || '';
      if (advice) sections.push({ h: 'Lời khuyên', body: advice, sub: true });

      return { title: p.name + ' cung — ' + p.stem + ' ' + (typeof p.branch === 'string' ? p.branch : ''), sections: sections };
    },

    /* diễn giải ngắn (giữ tương thích) */
    palaceTip: function (palace) {
      var d = this.palaceDetail(null, palace, null);
      return { title: d.title, body: (d.sections[1] || d.sections[0] || { body: '' }).body };
    },

    /* tổng quan lá số */
    summary: function (chartObj) {
      if (!chartObj) return null;
      var ming = chartObj.palaces.filter(function (p) { return p.isMing; })[0];
      var shen = chartObj.palaces.filter(function (p) { return p.isShen || p.isBody; })[0];
      var mingMajors = ming ? this.majorsOf(ming) : [];
      var lines = [];
      lines.push('Mệnh cung tại ' + (ming ? ming.name : '?') + ' — ' + chartObj.juName + ', tuổi ' + chartObj.zodiac + ', ' + chartObj.sign);
      if (mingMajors.length) lines.push('Chính tinh Mệnh: ' + mingMajors.map(function (s) { return s.name + (s.brightness ? '(' + s.brightness + ')' : ''); }).join(', '));
      else lines.push('Mệnh cung không chính tinh (cung không)');
      if (shen && shen !== ming) lines.push('Thân cư ' + shen.name + ' cung');
      return lines.join('\n');
    },

    GRID_POS: GRID_POS,
    PALACE_INFO: PALACE_INFO,
    STAR_INFO: STAR_INFO,
    JU_INFO: JU_INFO,
    /* hành của 14 chính tinh → tô màu sao trên lá số */
    STAR_EL: { 'Tử Vi': 'Thổ', 'Thiên Cơ': 'Mộc', 'Thái Dương': 'Hỏa', 'Vũ Khúc': 'Kim', 'Thiên Đồng': 'Thủy', 'Liêm Trinh': 'Hỏa', 'Thiên Phủ': 'Thổ', 'Thái Âm': 'Thủy', 'Tham Lang': 'Mộc', 'Cự Môn': 'Thủy', 'Thiên Tướng': 'Thủy', 'Thiên Lương': 'Thổ', 'Thất Sát': 'Kim', 'Phá Quân': 'Thủy' },
    /* nhóm cung → màu nhấn ô cung */
    PALACE_CAT: {
      'Mệnh': 'ming', 'Phu Thê': 'phu-the', 'Tử Tức': 'tu-tuc', 'Tài Bạch': 'tai-bach',
      'Tật Ách': 'tat-ach', 'Thiên Di': 'thien-di', 'Nô Bộc': 'no-boc', 'Quan Lộc': 'quan-loc',
      'Điền Trạch': 'dien-trach', 'Phúc Đức': 'phuc-duc', 'Phụ Mẫu': 'phu-mau', 'Huynh Đệ': 'huynh-de'
    }
  };
})();
