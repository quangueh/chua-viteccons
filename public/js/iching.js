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

  /* -------- luận giải: đời thường trước, chuyên môn sau -------- */
  var CAT_NAME = {
    'duyen': 'Tình duyên / Hôn nhân', 'tai': 'Tiền bạc / Tài chính', 'quan': 'Sự nghiệp / Công danh',
    'con': 'Con cái / Đời sau', 'cha': 'Gia đình / Cha mẹ / Nhà cửa', 'ban': 'Bạn bè / Đối tác',
    'suckhoe': 'Sức khỏe / Bản thân', 'chung': 'Câu hỏi chung'
  };
  /* giải thích lục thân bằng lời đời */
  var LT_PLAIN = {
    'Phụ Mẫu': 'đứng cho cha mẹ, người lớn, giấy tờ, nhà cửa, việc đã có sẵn',
    'Huynh Đệ': 'đứng cho anh em, bạn bè — và cả đối thủ, người chia tiền của bạn',
    'Tử Tôn': 'đứng cho con cái, niềm vui — là sao phúc, cứu nguy, giải sầu',
    'Thê Tài': 'đứng cho tiền bạc, của cải — nam hỏi duyên thì là người phụ nữ',
    'Quan Quỷ': 'đứng cho quan chức, áp lực, phiền muộn, bệnh tật — nữ hỏi duyên thì là người đàn ông'
  };
  /* lời khuyên theo chủ đề + quẻ thuận/khó */
  var CAT_TIP = {
    'duyen': { thuan: 'Duyên có căn — có thể chủ động tiến tới, hỏi han, tìm hiểu đối phương. Nhưng xem kỹ hào Ứng (đối phương): ứng tĩnh vượng thì người ấy ổn định thật lòng.', kho: 'Duyên chưa đến lúc — đừng ép, đừng níu. Quan Quỷ/Huynh Đệ động thường là có người xen vào hoặc hiểu lầm; giữ khoảng cách, chờ quẻ biến.', giua: 'Duyên đan xen — có tín hiệu tốt nhưng chưa đủ. Để tự nhiên phát triển, đừng vội cam kết, xem biến quẻ chỉ hướng cuối cùng.' },
    'tai': { thuan: 'Tài vận tốt — Thê Tài vượng thì tiền có căn đến. Tiến hành việc tài chính đang tính, nhưng coi chừng Huynh Đệ động là người chia hao.', kho: 'Tài vận yếu — Thê Tài suy/không thì đừng đầu tư lớn, đừng cho vay, đừng ký hợp đồng tiền lúc này. Chờ thời vận chuyển.', giua: 'Tiền khó đoán — thuận trở đan xen. Chia nhỏ quyết định, giữ tiền mặt, đừng dồn hết một chỗ.' },
    'quan': { thuan: 'Quan lộc vượng — có cửa thăng tiến/thi đậu/được trọng dụng. Quan Quỷ ở đây là việc làm, chức vụ — vượng là tốt, đừng sợ tên "quỷ".', kho: 'Quan lộc suy — việc nghề đang chững, đừng xin chuyển/đổi việc lúc này. Quan Quỷ lâm không là chức vụ hão, hứa hẹn không thực.', giua: 'Việc có biến chuyển — cơ hội nhưng phải chờ thời. Chuẩn bị sẵn hồ sơ/năng lực, đợi quẻ ứng vào tháng vượng.' },
    'con': { thuan: 'Tử Tôn vượng — đường con cái tốt, sinh nở thuận, con cái khỏe ngoan. Cũng là sao phúc giải phiền.', kho: 'Tử Tôn suy — việc con cái cần chờ, đừng ép; có thể muộn con hoặc con cái hay đau. Tu phước thêm.', giua: 'Bình thường — theo tự nhiên.' },
    'cha': { thuan: 'Phụ Mẫu vượng — được người lớn che chở, giấy tờ nhà cửa thuận, có quý nhân tuổi tác.', kho: 'Phụ Mẫu suy — việc giấy tờ/nhà cửa hay cha mẹ khó khăn; cẩn thận thủ tục pháp lý, chăm sức khỏe người già.', giua: 'Bình thường.' },
    'ban': { thuan: 'Huynh Đệ vượng — bạn bè đối tác tin cậy, hợp tác có lợi.', kho: 'Huynh Đệ là sao hao tài — hợp tác dễ tranh lợi, chia tiền không đều; đừng góp vốn vội, ký rõ giấy tờ.', giua: 'Hợp tác bình thường — làm rõ quyền lợi trước.' },
    'suckhoe': { thuan: 'Thế hào vững — sức khỏe căn bản tốt. Quan Quỷ động mới là bệnh phát — hiện ổn.', kho: 'Sức khỏe cần chú ý — Quan Quỷ vượng/động là bệnh khí mạnh; đi khám thật, đừng chỉ dựa quẻ.', giua: 'Bình thường — giữ sinh hoạt điều độ.' },
    'chung': { thuan: 'Việc hỏi có căn thực — thế ứng hòa hợp, tiến hành được.', kho: 'Việc hỏi gặp trở ngại — chậm lại, xem xét kỹ, đừng quyết gấp.', giua: 'Thuận trở đan xen — làm mà giữ mình.' }
  };

  ICHING.luan = function (q) {
    var L = { ketLuan: '', story: '', topics: [], advice: [], tech: [], thuanLoi: [], troNgai: [], chuaRo: [] };
    var cat = q.category;

    /* 1. CÂU CHUYỆN QUẺ — giải thích bản quẻ bằng lời đời */
    L.story = 'Quẻ ' + q.benName + ' gồm quái ' + q.upper.name + ' (' + TRI_IMG[q.upper.name] + ') trên, quái ' + q.lower.name + ' (' + TRI_IMG[q.lower.name] + ') dưới. ' + q.benY + '.';
    if (q.dongHao.length) L.story += ' Có ' + q.dongHao.length + ' hào đang động (hào ' + q.dongHao.join(', ') + ') — việc đang chuyển biến, sẽ trở thành quẻ ' + q.bienName + ' (' + q.bienY + ').';
    else L.story += ' Sáu hào đều tĩnh — việc hiện ổn định, ít thay đổi bất ngờ.';

    /* 2. BẢN THÂN (THẾ) vs ĐỐI PHƯƠNG/VIỆC (ỨNG) — nói dễ hiểu */
    var the = q.rows[q.theHao - 1], ung = q.rows[q.ungHao - 1];
    var rel = relChi(the.zi, ung.zi);
    var relPlain = {
      'đồng khí': 'hai bên cùng phe cùng ý', 'lục hợp': 'hai bên rất hợp nhau, dễ thành đôi/thành việc',
      'tam hợp': 'hai bên hợp nhau', 'được sinh': 'đối phương/việc đang nâng đỡ bạn',
      'sinh người': 'bạn phải bỏ ra cho đối phương/việc', 'bị khắc': 'đối phương/việc đang áp chế bạn',
      'khắc người': 'bạn chi phối được đối phương/việc', 'lục xung': 'hai bên khác ý, dễ xung đột chia rẽ',
      'bình': 'hai bên bình thường, không ai áp ai'
    };
    L.topics.push(['Bạn và đối phương/việc', 'Hào Thế (bạn) là ' + the.lt + ' ' + the.najia + (the.dong ? ' đang động — bạn đang chủ động thay đổi' : ' đứng yên — bạn đang giữ nguyên') + '. Hào Ứng (đối phương/việc) là ' + ung.lt + ' ' + ung.najia + (ung.dong ? ' đang động — phía kia đang biến' : '') + '. Hai hào ' + rel + ' — ' + relPlain[rel] + '.' + (the.khong ? ' ⚠ Thế lâm Tuần Không — bạn đang lưỡng lự, chưa vững ý.' : '') + (ung.khong ? ' ⚠ Ứng lâm Tuần Không — đối phương/việc chưa chắc thực, đừng tin hết lời hứa.' : '')]);

    /* 3. VIỆC CHÍNH — dụng thần */
    if (q.dungLt && q.dungRows.length) {
      var d = q.dungRows[0];
      var vuong = (d.vsMonth === 'được sinh' || d.vsMonth === 'đồng khí' || d.vsMonth === 'lục hợp' || d.vsMonth === 'tam hợp' || d.vsDay === 'được sinh' || d.vsDay === 'đồng khí');
      var suy = (d.vsMonth === 'bị khắc' || d.vsDay === 'bị khắc' || d.khong);
      var stt = vuong ? 'VƯỢNG — có sức thực, việc dễ thành' : suy ? 'SUY — lực yếu, việc khó/chưa đến lúc' : 'TRUNG — việc còn phụ thuộc diễn biến';
      L.topics.push(['Việc ' + CAT_NAME[cat].toLowerCase() + ' (dụng thần ' + q.dungLt + ')', q.dungLt + ' ' + LT_PLAIN[q.dungLt] + '. Trong quẻ này nó nằm hào ' + d.pos + ' (' + d.najia + ')' + (d.dong ? ', đang động — việc đang xoay chuyển' : '') + '. Đối chiếu ngày tháng hiện tại thì sao này ' + stt + '.' + (d.khong ? ' Hào lâm Tuần Không — việc hão/chưa thực, thành mà như không.' : '')]);
      if (vuong) L.thuanLoi.push('sao chính (' + q.dungLt + ') có lực trong tháng/ngày này');
      if (suy) L.troNgai.push('sao chính (' + q.dungLt + ') yếu lực' + (d.khong ? ' và lâm hão không' : ''));
    } else if (q.dungLt) {
      L.topics.push(['Việc ' + CAT_NAME[cat].toLowerCase(), 'Quẻ không có hào ' + q.dungLt + ' (' + LT_PLAIN[q.dungLt] + ') hiện lên — tức chủ đề này hiện MỜ, chưa hiện rõ trong số phận lúc này. Chờ thêm hoặc xem lại sau.']);
      L.chuaRo.push('sao chính không hiện trên quẻ');
    }

    /* 4. CÁC HÀO ĐỘNG — sự kiện đang xảy ra */
    q.rows.forEach(function (r) {
      if (r.dong) {
        var warn = '';
        if (r.lt === 'Quan Quỷ' && cat !== 'quan' && cat !== 'suckhoe') warn = ' — ⚠ sao phiền muộn/thị phi động: đề phòng rắc rối, cãi cọ, người xen vào';
        if (r.lt === 'Huynh Đệ' && cat === 'tai') warn = ' — ⚠ sao hao tài động: dễ mất tiền, bị chia lợi, đừng cho vay';
        if (r.lt === 'Tử Tôn') warn = ' — sao phúc động: phiền muộn được giải, có người/việc giúp bạn';
        if (r.lt === 'Thê Tài' && cat === 'duyen') warn = ' — sao tình duyên/tiền động: duyên đang chuyển';
        L.topics.push(['Hào ' + r.pos + ' đang động', 'Hào ' + r.pos + ' (' + r.lt + ' ' + LT_PLAIN[r.lt] + ') đang động' + warn + '.']);
        if (warn.indexOf('⚠') >= 0) L.troNgai.push(r.lt + ' động hào ' + r.pos);
        if (r.lt === 'Tử Tôn') L.thuanLoi.push('sao phúc (Tử Tôn) động cứu nguy');
      }
    });

    /* 5. HƯỚNG BIẾN */
    if (q.dongHao.length) L.topics.push(['Xu hướng tương lai', 'Việc sẽ chuyển thành quẻ ' + q.bienName + ': ' + q.bienY + '.']);

    /* 6. KẾT LUẬN + LỜI KHUYÊN */
    var t = L.thuanLoi.length, tr = L.troNgai.length;
    var trang = t > tr * 2 ? 'thuan' : tr > t ? 'kho' : 'giua';
    var trangTxt = { thuan: 'THUẬN', kho: 'KHÓ', giua: 'VỪA' }[trang];
    L.ketLuan = 'Kết quả: ' + trangTxt + ' — ' + q.benName + (q.dongHao.length ? ' biến ' + q.bienName : ' (tĩnh)') + '. ' + CAT_TIP[cat][trang];
    L.advice = [CAT_TIP[cat][trang]];
    /* thêm lời khuyên theo trở ngại cụ thể */
    if (L.troNgai.length) L.advice.push('Cẩn thận: ' + L.troNgai.join('; ') + '.');
    if (ung.khong) L.advice.push('Đối phương/việc chưa chắc thực — đừng ký giấy, đừng đưa tiền, đừng tin lời hứa lúc này.');
    if (the.khong) L.advice.push('Bạn đang lưỡng lự — giữ mình, đợi quyết tâm vững rồi hẵng làm.');
    /* chuyên môn (xếp cuối) */
    L.tech = [
      'Bản quẻ ' + q.benName + ' thuộc cung ' + q.cung.name + ' hành ' + q.cungEl + ' — ' + q.genName,
      'Thế hào ' + q.theHao + ' · Ứng hào ' + q.ungHao,
      'Nhật thần ' + (q.dayGC || '—') + ' · Nguyệt kiến ' + (q.monGC || '—') + ' · Tuần không ' + (q.khong.join(', ') || '—')
    ];
    return L;
  };

  /* hình quẻ unicode theo upper/lower */

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
