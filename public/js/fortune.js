/* ==========================================================================
   TỬ VI & HOÀNG ĐẠO — tính Can Chi THẬT từ ngày dương lịch
   - Tứ trụ: năm / tháng / ngày (can-chi chính xác theo lịch)
   - Giờ hoàng đạo: chấm điểm theo sinh/khắc/hợp/xung ngũ hành
   - Ngày đẹp: quét 30 ngày tới, xếp hạng theo hành mệnh
   ========================================================================== */
(function () {
  'use strict';

  const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  // hành của thiên can / địa chi
  const STEM_EL = ['Mộc', 'Mộc', 'Hỏa', 'Hỏa', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Thủy', 'Thủy'];
  const BR_EL = ['Thủy', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hỏa', 'Hỏa', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thủy'];
  const EL_IDX = { 'Thủy': 0, 'Mộc': 1, 'Hỏa': 2, 'Thổ': 3, 'Kim': 4 };
  const EL_NAME = ['Thủy', 'Mộc', 'Hỏa', 'Thổ', 'Kim'];
  // sinh khắc: A sinh B khi (idxB - idxA) % 5 === 1  (Thủy→Mộc→Hỏa→Thổ→Kim→Thủy)
  const sinh = (a, b) => ((EL_IDX[b] - EL_IDX[a]) % 5 + 5) % 5 === 1;
  const khacNhau = (a, b) => a !== b;

  // địa chi → hành (rút gọn, đủ dùng)
  const branchEl = (b) => BR_EL[((b % 12) + 12) % 12];
  const stemEl = (s) => STEM_EL[((s % 10) + 10) % 10];

  // quan hệ hai hành: 'sinh' | 'duoc-sinh' | 'dong' | 'khac' | 'bi-khac'
  function elRelation(a, b) { // a = hành nguồn/ngày, b = hành kia
    if (a === b) return 'dong';
    if (sinh(a, b)) return 'sinh';        // a sinh b
    if (sinh(b, a)) return 'duoc-sinh';   // b sinh a
    // khắc: a khắc b khi b là hành "bị khắc" của a — Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc, Mộc khắc Thổ
    const KHAC = { 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc', 'Mộc': 'Thổ' };
    if (KHAC[a] === b) return 'khac';
    return 'bi-khac';
  }

  // ── Can Chi ngày: neo 2000-01-01 = Mậu Ngọ (index 54 trong chu kỳ 60) ──
  function dayGanzhi(y, m, d) {
    const utc = Date.UTC(y, m - 1, d, 12, 0, 0);
    const base = Date.UTC(2000, 0, 1, 12, 0, 0);
    const days = Math.round((utc - base) / 86400000);
    const idx = ((54 + days) % 60 + 60) % 60;
    return { stem: idx % 10, branch: idx % 12, idx };
  }
  // năm can-chi (mốc Lập Xuân ~4/2: trước đó tính năm trước)
  function yearGanzhi(y, m, d) {
    let yy = y;
    if (m === 1 && d < 4) yy = y - 1;
    else if (m === 2 && d < 4) yy = y - 1;
    const stem = ((yy - 4) % 10 + 10) % 10;
    const branch = ((yy - 4) % 12 + 12) % 12;
    return { stem, branch };
  }
  // tháng can-chi: chi tháng ≈ tháng dương (Dần=2 bắt đầu tháng 2), can theo can năm
  function monthGanzhi(y, m, d) {
    const yg = yearGanzhi(y, m, d);
    // chi tháng: Tý=0...Dần=2 — tháng 2→Dần(2), 3→Mão(3)... 1→Sửu(1)? chuẩn: tháng 1 (sau lập xuân) = Dần
    // xấp xỉ theo tháng mặt trời: branch = (m + 1) % 12  → T2=3? chỉnh: tháng 2 = Dần(2) → branch = m % 12
    const branch = ((m % 12) + 12) % 12; // T2→2 Dần, T3→3 Mão ... T11→11 Hợi, T12→0 Tý, T1→1 Sửu
    // can tháng: can Dần theo can năm %5 — Giáp/Canh→Bính, Ất/Tân→Mậu, Bính/Nhâm→Canh, Đinh/Quý→Nhâm, Mậu→Giáp
    const baseByGroup = { 0: 2, 1: 4, 2: 6, 3: 8, 4: 0 };
    const base = baseByGroup[yg.stem % 5];
    // can tháng = base + (branch - 2) vì Dần(2) là tháng đầu
    const stem = (((base + (branch - 2)) % 10) + 10) % 10;
    return { stem, branch };
  }

  const EL_INFO = {
    'Mộc': { color: '#5fbf6a', dir: 'Đông / Đông Nam', num: '1, 3', item: 'Cây xanh, sách vở', uni: 'Xanh lá' },
    'Hỏa': { color: '#ff7a4d', dir: 'Nam', num: '2, 7', item: 'Nến, đèn, chữ ký', uni: 'Đỏ / Tím' },
    'Thổ': { color: '#d8a03c', dir: 'Trung ương / Tây Nam', num: '5, 10', item: 'Đá, gốm, trang sức vàng', uni: 'Vàng đất / Nâu' },
    'Kim': { color: '#e8ecf4', dir: 'Tây / Tây Bắc', num: '4, 9', item: 'Trang sức kim loại, trắng bạc', uni: 'Trắng / Xám bạc' },
    'Thủy': { color: '#5aa8e8', dir: 'Bắc', num: '6, 8', item: 'Nước, gương, áo đen-xanh', uni: 'Đen / Xanh dương' },
  };
  const ANIMAL = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const CON_GIAP = ['Thân Tý', 'Thân Sửu', 'Thái Bạch Dần', 'Thái Bạch Mão', 'Quan Đới Thìn', 'Lục Bại Tỵ', 'Đại Hao Ngọ', 'Thành Đầu Mùi', 'Bạch Hổ Thân', 'Phúc Đức Dậu', 'Tuyệt Mệnh Tuất', 'Thai Quan Hợi'];

  // 12 giờ canh (địa chi giờ) — nhãn giờ đồng hồ
  const HOURS = [
    { b: 0, label: '23–1h', name: 'Giờ Tý' }, { b: 1, label: '1–3h', name: 'Giờ Sửu' },
    { b: 2, label: '3–5h', name: 'Giờ Dần' }, { b: 3, label: '5–7h', name: 'Giờ Mão' },
    { b: 4, label: '7–9h', name: 'Giờ Thìn' }, { b: 5, label: '9–11h', name: 'Giờ Tỵ' },
    { b: 6, label: '11–13h', name: 'Giờ Ngọ' }, { b: 7, label: '13–15h', name: 'Giờ Mùi' },
    { b: 8, label: '15–17h', name: 'Giờ Thân' }, { b: 9, label: '17–19h', name: 'Giờ Dậu' },
    { b: 10, label: '19–21h', name: 'Giờ Tuất' }, { b: 11, label: '21–23h', name: 'Giờ Hợi' },
  ];
  // bộ ba hợp: nhóm địa chi tam hợp
  const TAM_HOP = [
    [8, 0, 4],   // Thân Tý Thìn — Thủy
    [11, 3, 7],  // Hợi Mão Mùi — Mộc
    [2, 6, 10],  // Dần Ngọ Tuất — Hỏa
    [5, 9, 1],   // Tỵ Dậu Sửu — Kim
    [4, 7, 10, 1] // Thìn Tuất Sửu Mùi — Thổ (tứ hành)
  ];
  const tamHop = (a, b) => TAM_HOP.some((g) => g.includes(a) && g.includes(b));
  const lucHop = (a, b) => (((a + b) % 12) === 1);
  const xung = (a, b) => (((a - b + 12) % 12) === 6);

  // chấm 1 giờ canh so với ngày (trả điểm + lý do)
  function scoreHour(dayBranch, hourBranch) {
    const de = branchEl(dayBranch), he = branchEl(hourBranch);
    let score = 0; const why = [];
    if (xung(dayBranch, hourBranch)) { score -= 4; why.push('xung ngày'); }
    if (lucHop(dayBranch, hourBranch)) { score += 3; why.push('lục hợp'); }
    if (tamHop(dayBranch, hourBranch)) { score += 2; why.push('tam hợp'); }
    const rel = elRelation(de, he);
    if (rel === 'sinh') { score += 2; why.push(`giờ ${he} sinh ${de}`); }
    else if (rel === 'duoc-sinh') { score += 1; why.push(`${de} sinh giờ`); }
    else if (rel === 'khac') { score -= 2; why.push(`giờ khắc ${de}`); }
    else if (rel === 'bi-khac') { score -= 1; why.push(`${de} khắc giờ`); }
    return { score, why: why.join(' • ') };
  }

  // ── API chính ──
  window.ChuaFortune = {
    STEMS, BRANCHES, EL_NAME, EL_INFO, CON_GIAP, HOURS,
    dayGanzhi, yearGanzhi, monthGanzhi,
    elRelation, scoreHour, sinh,

    // lá số từ ngày sinh (dương lịch) — "tứ trụ rút gọn"
    laSo(birth) {
      const [y, m, d] = birth.split('-').map(Number);
      const yg = yearGanzhi(y, m, d), mg = monthGanzhi(y, m, d), dg = dayGanzhi(y, m, d);
      const menhEl = stemEl(yg.stem);
      return {
        nam: { ...yg, label: `${STEMS[yg.stem]} ${BRANCHES[yg.branch]}` },
        thang: { ...mg, label: `${STEMS[mg.stem]} ${BRANCHES[mg.branch]}` },
        ngay: { ...dg, label: `${STEMS[dg.stem]} ${BRANCHES[dg.branch]}` },
        menh: menhEl,
        conGiap: CON_GIAP[yg.branch],
        tuoi: BRANCHES[yg.branch],
        tuoiEl: branchEl(yg.branch),
      };
    },

    // vận hạn hôm nay cho 1 lá số
    today(birth) {
      const now = new Date();
      const dg = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
      const ls = birth ? this.laSo(birth) : null;
      const dayEl = stemEl(dg.stem);
      const dayBranchEl = branchEl(dg.branch);
      let score = 5, relText = '', advice = '';
      if (ls) {
        const rel = elRelation(ls.menh, dayEl);
        const relB = elRelation(ls.tuoiEl, dayBranchEl);
        // điểm: hành can ngày vs mệnh + chi ngày vs tuổi
        score = 5;
        if (rel === 'sinh') score += 2; else if (rel === 'duoc-sinh') score += 1;
        else if (rel === 'khac') score -= 2; else if (rel === 'bi-khac') score -= 1;
        if (xung(ls.tuoi, dg.branch)) score -= 2;
        if (lucHop(ls.tuoi, dg.branch) || tamHop(ls.tuoi, dg.branch)) score += 1;
        score = Math.max(1, Math.min(10, score));
        relText = {
          'sinh': `Hành ${dayEl} của ngày ${STEMS[dg.stem]} ${BRANCHES[dg.branch]} đang sinh mệnh ${ls.menh} của bạn — thời vận hanh thông, việc gì cũng thuận.`,
          'duoc-sinh': `Mệnh ${ls.menh} được ngày ${dayEl} nâng đỡ — quý nhân phù trợ, nên chủ động xin việc, mở hướng mới.`,
          'dong': `Ngày cùng hành ${ls.menh} — bình hòa, giữ nhịp, không nên mạo hiểm lớn.`,
          'khac': `Ngày ${dayEl} khắc mệnh ${ls.menh} — cẩn trọng khẩu thiệt, tài chính, giữ sức khỏe, tránh ký kết lớn.`,
          'bi-khac': `Mệnh ${ls.menh} khắc ngày ${dayEl} — bạn hơi mạnh tay, nên nhường nhịn, tu tập, giữ tâm từ bi.`,
        }[rel] || '';
        advice = {
          'sinh': 'Hợp cầu duyên, dâng hương, khai trương, ký kết — mọi việc đều được nâng đỡ.',
          'duoc-sinh': 'Hợp học hành, xin việc, gặp gỡ đạo hữu — năng lượng đi vào bạn.',
          'dong': 'Hợp ngồi thiền, sám hối, ghi chép — ngày tĩnh, dưỡng sức.',
          'khac': 'Hợp tu tập, cúng dường, giữ gìn — tránh khởi công, tranh chấp.',
          'bi-khac': 'Hợp phóng sinh, bố thí, nhẫn nhịn — ngày thuận để tiêu trừ, hóa giải.',
        }[rel] || 'Ngày bình thường — giữ tâm an, làm việc vừa sức.';
      } else {
        score = 6; relText = 'Nhập ngày sinh để xem vận hạn cá nhân hóa.'; advice = 'Bấm "Nhập ngày sinh" ở trên.';
      }
      return {
        score, dayLabel: `${STEMS[dg.stem]} ${BRANCHES[dg.branch]}`,
        dayEl, dayBranchEl, relText, advice,
        lucky: ls ? EL_INFO[ls.menh] : null,
      };
    },

    // giờ hoàng đạo hôm nay — chấm điểm 12 giờ canh theo ngày
    auspiciousHours() {
      const now = new Date();
      const dg = dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate());
      const scored = HOURS.map((h) => ({ ...h, ...scoreHour(dg.branch, h.b) }))
        .sort((a, b) => b.score - a.score);
      // top 4 giờ — điểm cao = đại cát, điểm vừa = bình hòa nên dùng
      return {
        dayLabel: `${STEMS[dg.stem]} ${BRANCHES[dg.branch]}`,
        dayBranch: dg.branch,
        good: scored.slice(0, 4),
        all: scored,
      };
    },

    // ngày đẹp trong 30 ngày tới — quét can-chi, xếp theo hợp mệnh
    goodDays(birth, n = 30) {
      const ls = birth ? this.laSo(birth) : null;
      const out = [];
      const today0 = new Date(); today0.setHours(0, 0, 0, 0);
      for (let i = 0; i < n; i++) {
        const dt = new Date(today0.getTime() + i * 86400000);
        const dg = dayGanzhi(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        const dayEl = stemEl(dg.stem), dayBe = branchEl(dg.branch);
        let score = 5; const bits = [];
        if (ls) {
          const rel = elRelation(ls.menh, dayEl);
          if (rel === 'sinh') { score += 3; bits.push(`can ${dayEl} sinh mệnh`); }
          else if (rel === 'duoc-sinh') { score += 2; bits.push(`mệnh được ${dayEl} nâng`); }
          else if (rel === 'khac') { score -= 3; bits.push(`can ${dayEl} khắc mệnh`); }
          else if (rel === 'bi-khac') { score -= 1; bits.push(`mệnh hơi mạnh`); }
          const relB = elRelation(ls.tuoiEl, dayBe);
          if (relB === 'sinh') { score += 1; bits.push('chi hợp'); }
          if (xung(ls.tuoi, dg.branch)) { score -= 3; bits.push('xung tuổi'); }
          if (lucHop(ls.tuoi, dg.branch) || tamHop(ls.tuoi, dg.branch)) { score += 1; bits.push('hợp chi'); }
        } else {
          // không có lá số: ưu tiên ngày có can-chi "đẹp" — can-chi đồng hành
          if (dayEl === dayBe) { score += 1; bits.push('can chi đồng hành'); }
        }
        score = Math.max(0, Math.min(10, score));
        out.push({
          date: dt, score,
          label: `${STEMS[dg.stem]} ${BRANCHES[dg.branch]}`,
          el: dayEl, why: bits.join(' • ') || 'ngày bình hòa',
        });
      }
      return out.sort((a, b) => b.score - a.score).slice(0, 5);
    },
  };
})();
