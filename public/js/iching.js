/* ============================================================
 * iching.js — Engine Lục Hào Nạp Giáp (chạy thuần frontend)
 * Gieo 3 đồng xu × 6 hào → nạp giáp, lục thân, thế ứng,
 * tuần không, biến quẻ, vượng suy nhật-nguyệt, luận giải.
 * Thuật toán theo phái Kinh Dịch / Lục Hào cổ truyền.
 * ============================================================ */
(function () {
  'use strict';
  var ICHING = {};

  /* 8 quái — bit0 = hào 1 (hào Sơ). Dương=1, Âm=0 */
  var TRI = [
    { name: 'Khôn', sym: '☷', el: 'Thổ', bits: 0 }, // 000
    { name: 'Chấn', sym: '☳', el: 'Mộc', bits: 1 }, // 001
    { name: 'Khảm', sym: '☵', el: 'Thủy', bits: 2 }, // 010
    { name: 'Đoài', sym: '☱', el: 'Kim', bits: 3 }, // 011
    { name: 'Cấn', sym: '☶', el: 'Thổ', bits: 4 }, // 100
    { name: 'Ly', sym: '☲', el: 'Hỏa', bits: 5 },  // 101
    { name: 'Tốn', sym: '☴', el: 'Mộc', bits: 6 }, // 110
    { name: 'Kiền', sym: '☰', el: 'Kim', bits: 7 } // 111
  ];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var CHI_EL = { 'Tý': 'Thủy', 'Sửu': 'Thổ', 'Dần': 'Mộc', 'Mão': 'Mộc', 'Thìn': 'Thổ', 'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa', 'Mùi': 'Thổ', 'Thân': 'Kim', 'Dậu': 'Kim', 'Tuất': 'Thổ', 'Hợi': 'Thủy' };
  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  /* sinh: A sinh B; khắc: A khắc B */
  var SHENG = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  var KHAC = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };

  /* Nạp Giáp: mỗi quái có 3 hào nội + 3 hào ngoại, mỗi hào là Can Chi */
  var NAJIA = {
    7: { in: ['Giáp Tý', 'Giáp Dần', 'Giáp Thìn'], out: ['Nhâm Ngọ', 'Nhâm Thân', 'Nhâm Tuất'] },   // Kiền
    2: { in: ['Mậu Dần', 'Mậu Thìn', 'Mậu Ngọ'], out: ['Mậu Thân', 'Mậu Tuất', 'Mậu Tý'] },     // Khảm
    4: { in: ['Bính Thìn', 'Bính Ngọ', 'Bính Thân'], out: ['Bính Tuất', 'Bính Tý', 'Bính Dần'] }, // Cấn
    1: { in: ['Canh Tý', 'Canh Dần', 'Canh Thìn'], out: ['Canh Ngọ', 'Canh Thân', 'Canh Tuất'] },  // Chấn
    6: { in: ['Tân Sửu', 'Tân Hợi', 'Tân Dậu'], out: ['Tân Mùi', 'Tân Tỵ', 'Tân Mão'] },         // Tốn
    5: { in: ['Kỷ Mão', 'Kỷ Sửu', 'Kỷ Hợi'], out: ['Kỷ Dậu', 'Kỷ Mùi', 'Kỷ Tỵ'] },              // Ly
    3: { in: ['Đinh Tỵ', 'Đinh Mão', 'Đinh Sửu'], out: ['Đinh Hợi', 'Đinh Dậu', 'Đinh Mùi'] },   // Đoài
    0: { in: ['Ất Mùi', 'Ất Tỵ', 'Ất Mão'], out: ['Quý Sửu', 'Quý Hợi', 'Quý Dậu'] }            // Khôn
  };

  /* Tên 64 quẻ theo (upper*8+lower) + thoán ý tóm tắt */
  var HEX = {
    '7_7': ['Thuần Kiền', 'Trời động mạnh — cát đại nếu thuận thiên giữ chính đạo; cứng quá dễ gãy, cần biết lúc tiến lúc lùi'],
    '7_0': ['Thiên Địa Phủ', 'Bế tắc — thiên địa không giao; thời xấu nên giữ mình, đợi thời chuyển'],
    '7_1': ['Thiên Lôi Vô Vọng', 'Không mong mà được — chính trực thì cát; đừng cố vọng động kẻo họa'],
    '7_2': ['Thiên Thủy Tụng', 'Kiện tụng, tranh chấp — nên hòa giải, đừng đưa việc đến cùng'],
    '7_3': ['Thiên Trạch Lý', 'Bước trên đuôi hổ — nguy hiểm cận kề; lễ nghi mềm mỏng hóa được khó'],
    '7_4': ['Thiên Sơn Độn', 'Ẩn độn rút lui — thời tiểu nhân thịnh, quân tử nên tránh xa giữ khí tiết'],
    '7_5': ['Thiên Hỏa Đồng Nhân', 'Đồng tâm hiệp lực — hợp tác thuận, được người giúp, việc lớn thành'],
    '7_6': ['Thiên Phong Cấu', 'Gặp gỡ — một âm dưới năm dương; cẩn thận cám dỗ, nhân duyên xen kẽ'],
    '0_7': ['Địa Thiên Thái', 'Thái bình — thiên địa giao hòa, vạn sự hanh thông; giữ khiêm tốn để giữ thái'],
    '0_0': ['Thuần Khôn', 'Đất thuận mềm — nhu thuận chứa đựng; nên đi sau, đừng tranh làm đầu'],
    '0_1': ['Địa Lôi Phục', 'Một dương trở về — vận xoay chuyển từ đáy lên; quay về đúng đường thì tốt'],
    '0_2': ['Địa Thủy Sư', 'Binh đội, tập thể — cần người lãnh đạo nghiêm chính; kỷ luật thì thắng'],
    '0_3': ['Địa Trạch Lâm', 'Tiến lên lớn — thịnh mà gần; nhân tài giúp đỡ, thời cơ đang tới'],
    '0_4': ['Địa Sơn Khiêm', 'Khiêm tốn — núi nằm dưới đất; giữ khiêm cung thì cát tường trọn vẹn'],
    '0_5': ['Địa Hỏa Minh Di', 'Ánh sáng bị tổn — thời tối tăm; giấu tài giữ mình qua khó'],
    '0_6': ['Địa Phong Thăng', 'Thăng tiến từng bước — gỗ mọc lên từ đất; nhờ quý nhân mà lên cao'],
    '1_7': ['Lôi Thiên Đại Tráng', 'Cường thịnh đỉnh cao — sức mạnh sung mãn; đừng dùng sức phi lý'],
    '1_0': ['Lôi Địa Dự', 'Vui sướng chuẩn bị — sấm nổ trên đất; nhạc lễ xum họp, đừng đắm quá'],
    '1_1': ['Thuần Chấn', 'Sấm động kép — chấn động lớn; sợ mà tu chỉnh thì biến cát'],
    '1_2': ['Lôi Thủy Giải', 'Giải tỏa — sấm mưa tan giải; khó khăn qua đi, hành động nhanh'],
    '1_3': ['Lôi Trạch Quy Muội', 'Gái đi lấy chồng — việc không đúng vị trí; đừng ép duyên ép việc'],
    '1_4': ['Lôi Sơn Tiểu Quá', 'Quá nhỏ — chim bay qua lưu âm thanh; làm việc nhỏ tốt, việc lớn chưa tới'],
    '1_5': ['Lôi Hỏa Phong', 'Phong thịnh rực rỡ — như mặt trời giữa trưa; thịnh cực lo suy, nắm thời cơ'],
    '1_6': ['Lôi Phong Hằng', 'Bền lâu — sấm gió phối hợp; kiên trì đúng đường thì có thành'],
    '2_7': ['Thủy Thiên Nhu', 'Chờ đợi — mây nước trên trời; đợi đúng thời, nuôi sức chờ mở'],
    '2_0': ['Thủy Địa Tỷ', 'Thân cận bền chặt — nước ôm đất; đoàn kết giao hảo đem lại cát'],
    '2_1': ['Thủy Lôi Truân', 'Khó khăn đầu — mới sinh vạn vật lúng túng; nhờ người giúp đỡ, đừng bỏ cuộc'],
    '2_2': ['Thuần Khảm', 'Tập khảm hiểm kép — nước chảy tới hiểm tới; giữ thành tín qua khó'],
    '2_3': ['Thủy Trạch Tiết', 'Tiết chế — nước trong đầm có giới; mức độ hợp lý thì trọn vẹn'],
    '2_4': ['Thủy Sơn Kiển', 'Khập khiễng — nước gặp núi chặn; gặp khó tìm người lớn giúp'],
    '2_5': ['Thủy Hỏa Ký Tế', 'Đã xong — thủy hỏa giao tế; việc thành nhưng giữ vững mới bền'],
    '2_6': ['Thủy Phong Tỉnh', 'Giếng nước — nguồn nuôi dưỡng chung; giữ nguồn trong sạch mới lâu'],
    '3_7': ['Trạch Thiên Quải', 'Quyết đoán phá vỡ — đầm trào lên trời; quyết định dứt khoát nhưng chính trực'],
    '3_0': ['Trạch Địa Tụy', 'Hội tụ — đầm trên đất; tụ hợp người tài, cẩn thận loạn tụ'],
    '3_1': ['Trạch Lôi Tùy', 'Theo hầu — đầm sấm theo nhau; thuận theo người đúng thì lợi'],
    '3_2': ['Trạch Thủy Khốn', 'Khốn cùng — đầm không nước; cùng đường giữ chữ tín, lời nói khó tin'],
    '3_3': ['Thuần Đoài', 'Đầm vui kép — hòa duyệt giao cảm; vui đúng đường, bạn bè cùng tu'],
    '3_4': ['Trạch Sơn Hàm', 'Cảm ứng — đầm trên núi; nam nữ tương cảm, thành hôn lễ'],
    '3_5': ['Trạch Hỏa Cách', 'Cách mệnh cải biến — lửa đầm tương khắc; thay đổi đúng thời thì thành'],
    '3_6': ['Trạch Phong Đại Quá', 'Quá lớn — cột chống chịu nặng; gánh quá sức, phải hạ bớt'],
    '4_7': ['Sơn Thiên Đại Súc', 'Tích lũy lớn — núi chứa trời; đức tài góp nhặt thành lớn'],
    '4_0': ['Sơn Địa Bác', 'Bong bóc — núi trên đất bị bào; thời suy lạnh, giữ nền đừng hành'],
    '4_1': ['Sơn Lôi Di', 'Nuôi dưỡng — núi trên sấm; coi miệng ăn uống lời nói, nuôi đức'],
    '4_2': ['Sơn Thủy Mông', 'Mông muội — núi dưới nước khói mờ; học tập cần thầy, mở mông dần'],
    '4_3': ['Sơn Trạch Tổn', 'Giảm bớt — núi trên đầm; tổn dưới ích trên, giảm ham được lợi'],
    '4_4': ['Thuần Cấn', 'Núi yên kép — dừng đúng chỗ; dừng khi phải dừng là đại cát'],
    '4_5': ['Sơn Hỏa Bí', 'Trang sức — núi có lửa sáng đẹp; văn sức đẹp nhưng phải chất thật'],
    '4_6': ['Sơn Phong Cổ', 'Hư hỏng cần sửa — núi gió mục nát; chỉnh lý việc cũ thì mới hanh'],
    '5_7': ['Hỏa Thiên Đại Hữu', 'Sở hữu lớn — lửa trên trời; của cải danh tiếng đầy đủ, giữ chính'],
    '5_0': ['Hỏa Địa Tấn', 'Tấn lên — mặt trời lên trên đất; được trọng dụng, tiến bộ rõ rệt'],
    '5_1': ['Hỏa Lôi Phệ Hạp', 'Nghiếp chặn — sấm lửa cắn vật ngăn; dùng pháp độ trừ chướng'],
    '5_2': ['Hỏa Thủy Vị Tế', 'Chưa xong — lửa nước chưa giao; việc gần thành, cẩn thận khâu cuối'],
    '5_3': ['Hỏa Trạch Khuê', 'Khuê ly bất hợp — lửa lên đầm lên khác chiều; ý kiến trái nhau, chuyện nhỏ còn cát'],
    '5_4': ['Hỏa Sơn Lữ', 'Lữ hành — lửa trên núi khách qua đường; bôn ba vất vả, giữ mình khách địa'],
    '5_5': ['Thuần Ly', 'Lửa sáng kép — văn minh phụ thuộc; sáng đẹp cần bám vào chính'],
    '5_6': ['Hỏa Phong Đỉnh', 'Vạc đỉnh — lửa trên gió nấu chín; dụng hiền tài, tam túc vững vàng'],
    '6_7': ['Phong Thiên Tiểu Súc', 'Tích lũy nhỏ — gió trên trời mây dày chưa mưa; đợi thêm, chưa phải lúc lớn'],
    '6_0': ['Phong Địa Quan', 'Quan sát — gió trên đất nhìn khắp; xem xét rõ ràng, dạy dỗ bằng mẫu gương'],
    '6_1': ['Phong Lôi Ích', 'Lợi ích tăng — gió sấm giúp nhau; tổn thượng ích hạ, tiến hành lợi'],
    '6_2': ['Phong Thủy Hoán', 'Tan hoán — gió trên nước tan chảy; tan tụi lạc lại, tụ nhân tâm'],
    '6_3': ['Phong Trạch Trung Phu', 'Lòng thành bên trong — gió trên đầm; thành tín tin cả cá lợn'],
    '6_4': ['Phong Sơn Tiệm', 'Tiệm tiến — gió núi cây mọc chậm; tiến từng bậc như hồng nhan'],
    '6_5': ['Phong Hỏa Gia Nhân', 'Người trong nhà — gió lửa gia đạo; mỗi người đúng vị thì nhà hòa'],
    '6_6': ['Thuần Tốn', 'Gió thấm kép — nhu thuận thấm nhập; nhẹ nhàng bền bỉ mới sâu']
  };
  /* Bát tự từng quái — vật tượng tóm tắt */
  var TRI_IMG = { 'Khôn': 'Đất — thuận mềm, chứa đựng', 'Chấn': 'Sấm — động khởi, chấn phát', 'Khảm': 'Nước — hiểm họa, trí tâm sâu', 'Đoài': 'Đầm — duyệt hòa, khẩu thiệt', 'Cấn': 'Núi — dừng yên, giữ chặt', 'Ly': 'Lửa — sáng đẹp, phụ bám', 'Tốn': 'Gió — thuận nhập, lan tỏa', 'Kiền': 'Trời — kiện cường, sáng tạo' };

  /* Hệ lục thân: ngũ hành cung vs ngũ hành hào */
  function lucThan(cungEl, haoEl) {
    if (haoEl === cungEl) return 'Huynh Đệ';
    if (SHENG[haoEl] === cungEl) return 'Phụ Mẫu';   // hào sinh cung → sinh ngã = phụ mẫu
    if (SHENG[cungEl] === haoEl) return 'Tử Tôn';    // cung sinh hào → ngã sinh = tử tôn
    if (KHAC[haoEl] === cungEl) return 'Quan Quỷ';   // hào khắc cung → khắc ngã = quan quỷ
    return 'Thê Tài';                                 // cung khắc hào → ngã khắc = thê tài
  }

  /* Cung + thế hào của quẻ (upper,lower) — mô phỏng 8 đời cung */
  function cungGen(upper, lower) {
    for (var c = 0; c < 8; c++) {
      var u = c, l = c, seq = [[u, l]];
      l ^= 1; seq.push([u, l]); l ^= 2; seq.push([u, l]); l ^= 4; seq.push([u, l]);
      u ^= 1; seq.push([u, l]); u ^= 2; seq.push([u, l]); u ^= 1; seq.push([u, l]);
      l = c; seq.push([u, l]);
      for (var g = 0; g < 8; g++) if (seq[g][0] === upper && seq[g][1] === lower) return { cung: c, gen: g };
    }
    return null;
  }
  var GEN_NAME = ['Bản cung', 'Nhất thế', 'Nhị thế', 'Tam thế', 'Tứ thế', 'Ngũ thế', 'Du hồn', 'Quy hồn'];
  var GEN_THE = [6, 1, 2, 3, 4, 5, 4, 3]; // hào thế (1-based) theo đời

  /* Tuần không từ ngày can chi {c:0-9, z:0-11} */
  function tuanKhong(dayCanChi) {
    if (!dayCanChi) return [];
    var d = ((dayCanChi.z - dayCanChi.c) % 12 + 12) % 12;
    return [(d + 10) % 12, (d + 11) % 12]; // chỉ số địa chi không
  }

  /* Quan hệ 2 địa chi: sinh/khắc/hợp/xung/tam hợp */
  var LUC_HOP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 6], [7, 8]];
  var TAM_HOP = [[8, 4, 0], [5, 9, 1], [11, 3, 7], [10, 2, 6]];
  function relChi(zi, zt) {
    if (zi === zt) return 'đồng khí';
    var e1 = CHI_EL[CHI[zi]], e2 = CHI_EL[CHI[zt]];
    for (var i = 0; i < LUC_HOP.length; i++) if ((LUC_HOP[i][0] === zi && LUC_HOP[i][1] === zt) || (LUC_HOP[i][1] === zi && LUC_HOP[i][0] === zt)) return 'lục hợp';
    for (i = 0; i < TAM_HOP.length; i++) if (TAM_HOP[i].indexOf(zi) >= 0 && TAM_HOP[i].indexOf(zt) >= 0) return 'tam hợp';
    if (Math.abs(zi - zt) === 6) return 'lục xung';
    if (SHENG[e2] === e1) return 'được sinh';
    if (SHENG[e1] === e2) return 'sinh người';
    if (KHAC[e2] === e1) return 'bị khắc';
    if (KHAC[e1] === e2) return 'khắc người';
    return 'bình';
  }

  /* Gieo 3 đồng xu → giá trị hào: 6 lão âm, 7 thiếu dương, 8 thiếu âm, 9 lão dương */
  function castCoin() {
    var s = 0;
    for (var i = 0; i < 3; i++) s += Math.random() < 0.5 ? 3 : 2;
    return s; // 6,7,8,9
  }
  function yangOf(v) { return v === 7 || v === 9; }   // hào dương?
  function dongOf(v) { return v === 6 || v === 9; }   // hào động?

  /* Gieo quẻ đầy đủ — trả object quẻ */
  ICHING.cast = function (question, category, gender) {
    var hao = []; for (var i = 0; i < 6; i++) hao.push(castCoin()); // hào 1..6, index0 = sơ
    return ICHING.build(hao, question, category, gender);
  };

  /* Xây quẻ từ 6 hào (mảng giá trị 6-9, index 0 = hào sơ) */
  ICHING.build = function (hao, question, category, gender) {
    /* trigrams: hào 1-3 = nội (lower), hào 4-6 = ngoại (upper) */
    var lo = 0, up = 0, i;
    for (i = 0; i < 3; i++) if (yangOf(hao[i])) lo |= (1 << i);
    for (i = 3; i < 6; i++) if (yangOf(hao[i])) up |= (1 << (i - 3));
    /* biến quẻ: hào động đảo bit */
    var blo = lo, bup = up;
    for (i = 0; i < 3; i++) if (dongOf(hao[i])) blo ^= (1 << i);
    for (i = 3; i < 6; i++) if (dongOf(hao[i])) bup ^= (1 << (i - 3));
    var dongHao = hao.map(function (v, k) { return dongOf(v) ? k + 1 : 0; }).filter(Boolean);

    var cg = cungGen(up, lo) || { cung: up, gen: 0 };
    var cungEl = TRI[cg.cung].el;
    var theHao = GEN_THE[cg.gen];
    var ungHao = theHao <= 3 ? theHao + 3 : theHao - 3;

    /* nạp giáp + lục thân từng hào */
    var rows = [];
    for (i = 0; i < 6; i++) {
      var triIdx = i < 3 ? lo : up;
      var nj = NAJIA[triIdx][i < 3 ? 'in' : 'out'][i % 3];
      var chi = nj.split(' ')[1];
      var zi = CHI.indexOf(chi);
      rows.push({
        pos: i + 1, val: hao[i], yang: yangOf(hao[i]), dong: dongOf(hao[i]),
        najia: nj, chi: chi, zi: zi, el: CHI_EL[chi],
        lt: lucThan(cungEl, CHI_EL[chi]),
        isThe: i + 1 === theHao, isUng: i + 1 === ungHao
      });
    }

    /* nhật thần + nguyệt kiến từ fortune.js nếu có */
    var F = window.F || window.ChuaFortune, now = new Date();
    var dayObj = F && F.dayGanzhi ? F.dayGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate()) : null;
    var monObj = F && F.monthGanzhi ? F.monthGanzhi(now.getFullYear(), now.getMonth() + 1, now.getDate()) : null;
    var dayGC = dayObj ? CAN[dayObj.stem] + ' ' + CHI[dayObj.branch] : '';
    var monGC = monObj ? CAN[monObj.stem] + ' ' + CHI[monObj.branch] : '';
    var khong = dayObj ? tuanKhong({ c: dayObj.stem, z: dayObj.branch }) : [];

    rows.forEach(function (r) {
      r.khong = khong.indexOf(r.zi) >= 0;
      if (monObj) r.vsMonth = relChi(r.zi, monObj.branch);
      if (dayObj) r.vsDay = relChi(r.zi, dayObj.branch);
    });
    /* Lục Thần theo nhật can (tham chiếu najia-core) */
    var LUC_THAN = ['Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'];
    var LT_START = { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 3, 6: 4, 7: 4, 8: 5, 9: 5 };
    if (dayObj) {
      rows.forEach(function (r, k) { r.lucThan6 = LUC_THAN[(LT_START[dayObj.stem] + k) % 6]; });
    }

    /* dụng thần theo chủ đề */
    var catLt = { 'tai': 'Thê Tài', 'quan': 'Quan Quỷ', 'con': 'Tử Tôn', 'cha': 'Phụ Mẫu', 'ban': 'Huynh Đệ' };
    var dungLt = catLt[category] || '';
    if (category === 'duyen') dungLt = gender === 'female' ? 'Quan Quỷ' : 'Thê Tài';
    if (category === 'suckhoe') dungLt = 'Quan Quỷ';
    if (category === 'chung') dungLt = '';
    var dungRows = dungLt ? rows.filter(function (r) { return r.lt === dungLt; }) : [];

    return {
      hao: hao, rows: rows, dongHao: dongHao,
      lower: TRI[lo], upper: TRI[up],
      benName: (HEX[up + '_' + lo] || ['', ''])[0], benY: (HEX[up + '_' + lo] || ['', ''])[1],
      bienLower: TRI[blo], bienUpper: TRI[bup],
      bienName: (HEX[bup + '_' + blo] || ['', ''])[0], bienY: (HEX[bup + '_' + blo] || ['', ''])[1],
      cung: TRI[cg.cung], cungEl: cungEl, genName: GEN_NAME[cg.gen], theHao: theHao, ungHao: ungHao,
      dayGC: typeof dayGC === 'string' ? dayGC : '', monGC: typeof monGC === 'string' ? monGC : '',
      khong: khong.map(function (k) { return CHI[k]; }),
      dungLt: dungLt, dungRows: dungRows,
      question: question || '', category: category || 'chung', gender: gender || ''
    };
  };

  /* -------- luận giải: kết luận trước, phân tích sau -------- */
  var CAT_NAME = {
    'duyen': 'Tình duyên / Hôn nhân', 'tai': 'Tiền bạc / Tài chính', 'quan': 'Sự nghiệp / Công danh',
    'con': 'Con cái / Đời sau', 'cha': 'Gia đình / Cha mẹ / Nhà cửa', 'ban': 'Bạn bè / Đối tác',
    'suckhoe': 'Sức khỏe / Bản thân', 'chung': 'Câu hỏi chung'
  };
  var LT_MEAN = {
    'Phụ Mẫu': 'cha mẹ, giấy tờ, nhà cửa, người lớn tuổi, việc cũ',
    'Huynh Đệ': 'anh em, bạn bè, đối thủ cạnh tranh, hao tài',
    'Tử Tôn': 'con cái, phúc tinh, giải sầu, thuốc hay, học trò',
    'Thê Tài': 'vợ, tiền bạc, của cải, người phụ nữ',
    'Quan Quỷ': 'chồng, quan lộc, thị phi, bệnh tật, áp lực'
  };
  var LT_MEAN_REL = {
    'Phụ Mẫu': 'người lớn che chở, giấy tờ hôn thú, gia đình hai bên',
    'Huynh Đệ': 'đối thủ tình duyên, người thứ ba, người ngang hàng',
    'Tử Tôn': 'sự vui vẻ, con cháu, hậu quả tình cảm',
    'Thê Tài': 'người vợ/người yêu (nếu nam hỏi), vật chất trong hôn nhân',
    'Quan Quỷ': 'người chồng/người đàn ông (nếu nữ hỏi), phiền muộn trong tình'
  };

  ICHING.luan = function (q) {
    var L = { ketLuan: '', thuanLoi: [], troNgai: [], chuaRo: [], banQue: '', luan: [] };

    /* --- bản quẻ --- */
    L.banQue = 'Bản quẻ ' + q.benName + ' (thượng ' + q.upper.name + ' ' + TRI_IMG[q.upper.name] + ' / hạ ' + q.lower.name + ' ' + TRI_IMG[q.lower.name] + '). Thuộc cung ' + q.cung.name + ' hành ' + q.cungEl + ' — ' + q.genName + ', thế hào ' + q.theHao + ', ứng hào ' + q.ungHao + '. ' + q.benY + '.';
    if (q.dongHao.length) L.banQue += ' Có ' + q.dongHao.length + ' hào động (' + q.dongHao.join(', ') + ') biến thành quẻ ' + q.bienName + ' — ' + q.bienY + '.';
    else L.banQue += ' Sáu hào tĩnh — việc ổn định, ít biến động.';

    /* --- dụng thần / thế ứng --- */
    var cat = q.category;
    if (q.dungLt && q.dungRows.length) {
      var d = q.dungRows[0];
      var v = [];
      v.push('Dụng thần ' + q.dungLt + ' tại hào ' + d.pos + ' (' + d.najia + ', hành ' + d.el + ')');
      v.push(d.dong ? 'động — có biến chuyển đang xảy ra' : 'tĩnh');
      if (d.vsMonth) v.push('đối nguyệt kiến ' + q.monGC + ': ' + d.vsMonth);
      if (d.vsDay) v.push('đối nhật thần ' + q.dayGC + ': ' + d.vsDay);
      if (d.khong) v.push('lâm Tuần Không — lực lượng giảm, việc chưa thực');
      var strong = (d.vsMonth === 'được sinh' || d.vsMonth === 'đồng khí' || d.vsMonth === 'lục hợp' || d.vsMonth === 'tam hợp' || d.vsDay === 'được sinh' || d.vsDay === 'đồng khí');
      var weak = (d.vsMonth === 'bị khắc' || d.vsDay === 'bị khắc' || d.khong);
      L.luan.push('⭐ ' + v.join(' · ') + ' → ' + (strong ? 'dụng thần VƯỢNG, việc hỏi có căn thực, dễ thành' : weak ? 'dụng thần SUY/KHÔNG, việc hỏi khó, cần thời' : 'dụng thần trung bình — việc còn phụ thuộc diễn biến'));
      if (strong) L.thuanLoi.push('dụng thần vượng tại ' + d.najia);
      if (weak) L.troNgai.push('dụng thần suy' + (d.khong ? ' và lâm không' : ''));
      if (d.dong) L.luan.push('  → Hào dụng thần động biến thành hào ' + relChi(d.zi, -1));
    } else if (q.dungLt) {
      L.chuaRo.push('Dụng thần ' + q.dungLt + ' không hiện trên bản quẻ — phải xem phục thần/ứng hào; kết luận chỉ sơ bộ');
      L.luan.push('⚠ Quẻ không có hào ' + q.dungLt + ' — việc ' + CAT_NAME[cat].toLowerCase() + ' mờ, cần xem thêm thế/ứng và phục thần bên dưới.');
    }

    /* thế - ứng */
    var the = q.rows[q.theHao - 1], ung = q.rows[q.ungHao - 1];
    var theUngRel = relChi(the.zi, ung.zi);
    L.luan.push('◆ Thế (bạn) hào ' + q.theHao + ' ' + the.najia + ' ' + the.lt + ' · Ứng (đối phương/việc) hào ' + q.ungHao + ' ' + ung.najia + ' ' + ung.lt + ' — hai hào ' + theUngRel);
    if (theUngRel === 'lục hợp' || theUngRel === 'tam hợp' || theUngRel === 'được sinh') L.thuanLoi.push('thế ứng ' + theUngRel + ' — hai bên tương hợp');
    if (theUngRel === 'lục xung' || theUngRel === 'bị khắc') L.troNgai.push('thế ứng ' + theUngRel + ' — hai bên khác ý, dễ xung đột');
    if (the.khong) L.troNgai.push('thế hào lâm Tuần Không — bản thân lưỡng lự/chưa vững');
    if (ung.khong) L.troNgai.push('ứng hào lâm Tuần Không — đối phương/việc chưa chắc thực');
    if (the.dong) L.luan.push('  → Thế hào động — bạn đang thay đổi, chủ động trong việc này');
    if (ung.dong) L.luan.push('  → Ứng hào động — đối phương/hoàn cảnh đang biến động');

    /* hào động + quan quỷ động cảnh báo */
    q.rows.forEach(function (r) {
      if (r.dong) {
        var note = 'Hào ' + r.pos + ' động (' + r.lt + ' ' + r.najia + ')';
        if (r.lt === 'Quan Quỷ' && cat !== 'quan' && cat !== 'suckhoe') { note += ' — quan quỷ động: đề phòng thị phi, phiền nhiễu trong việc hỏi'; L.troNgai.push('quan quỷ động hào ' + r.pos); }
        if (r.lt === 'Huynh Đệ' && cat === 'tai') { note += ' — huynh đệ động khắc thê tài: hao tiền, chia lợi'; L.troNgai.push('huynh đệ động hào ' + r.pos + ' hao tài'); }
        if (r.lt === 'Tử Tôn' && cat === 'suckhoe') { note += ' — tử tôn (phúc tinh) động: bệnh có lối thoát'; L.thuanLoi.push('tử tôn động cứu bệnh'); }
        L.luan.push('• ' + note);
      }
    });

    /* sinh khắc dụng thần từ các hào khác */
    if (q.dungRows.length) {
      var dz = q.dungRows[0].zi;
      q.rows.forEach(function (r) {
        if (r === q.dungRows[0]) return;
        var rel = relChi(dz, r.zi);
        if (rel === 'bị khắc' && r.dong) L.troNgai.push('hào ' + r.pos + ' (' + r.lt + ') động khắc dụng thần');
        if (rel === 'được sinh' && r.dong) L.thuanLoi.push('hào ' + r.pos + ' (' + r.lt + ') động sinh dụng thần');
      });
    }

    /* --- kết luận --- */
    var t = L.thuanLoi.length, tr = L.troNgai.length;
    var quaTinh = q.dongHao.length === 0 ? 'quẻ tĩnh — việc ổn định' : 'quẻ có ' + q.dongHao.length + ' hào động — đang biến chuyển';
    L.ketLuan = q.benName + (q.dongHao.length ? ' biến ' + q.bienName : '') + ' — ' + quaTinh + '. ' +
      (t > tr * 2 ? 'Việc hỏi THUẬN — căn quẻ tốt, nên tiến hành.' :
        tr > t ? 'Việc hỏi KHÓ — trở ngại nhiều, nên chậm chờ đợi.' :
          'Việc hỏi VỪA — thuận trở đan xen, làm mà giữ mình.') +
      ' ' + (q.bienName && q.dongHao.length ? 'Hướng biến sang ' + q.bienName + ' — ' + q.bienY.split('—')[0].trim().toLowerCase() + '.' : '');

    /* diễn biến theo biến quẻ */
    if (q.dongHao.length) {
      L.luan.push('◆ Diễn biến → ' + q.bienName + ': ' + q.bienY);
    }
    return L;
  };

  /* hình quẻ unicode theo upper/lower */
  var HEX_SYM = '䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿';
  ICHING.hexSym = function (upper, lower) {
    var bits = lower | (upper << 3); // hào1..6: bit0..5
    var MAP = { 63: 1, 0: 2, 17: 3, 34: 4, 23: 5, 58: 6, 2: 7, 16: 8, 55: 9, 59: 10, 7: 11, 56: 12, 61: 13, 47: 14, 4: 15, 8: 16, 25: 17, 38: 18, 3: 19, 48: 20, 41: 21, 37: 22, 32: 23, 1: 24, 57: 25, 39: 26, 33: 27, 30: 28, 18: 29, 45: 30, 28: 31, 14: 32, 60: 33, 15: 34, 40: 35, 5: 36, 53: 37, 43: 38, 20: 39, 10: 40, 35: 41, 49: 42, 31: 43, 62: 44, 24: 45, 6: 46, 26: 47, 22: 48, 29: 49, 46: 50, 9: 51, 36: 52, 52: 53, 11: 54, 13: 55, 44: 56, 54: 57, 27: 58, 50: 59, 19: 60, 51: 61, 12: 62, 21: 63, 42: 64 };
    var n = MAP[bits];
    return n ? HEX_SYM[n - 1] : '';
  };

  window.Ich = ICHING;
})();
