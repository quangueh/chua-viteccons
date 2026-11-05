/* ============================================================
 * CÁCH CỤC TỬ VI — Việt hóa từ Renhuai123/ziwei-doushu patterns.ts
 * (nguồn: Tử Vi Toàn Thư, Cốt Tủy Phú, Nghi Hải Tư Thiên Kỷ)
 * Mỗi pattern: sao bắt buộc trong cung + mô tả chuyên sâu.
 * ============================================================ */
(function () {
  'use strict';

  /* stars: danh sách chính tinh bắt buộc đồng cung (AND);
     starsAny: ít nhất 1 trong nhóm; level: excellent/good/neutral/caution */
  var PATTERNS = [
    {
      id: 'tu-phu-dong-cung', name: 'Tử Phủ Đồng Cung', level: 'excellent',
      stars: ['Tử Vi', 'Thiên Phủ'],
      desc: 'Tử Vi Đế Tinh hội Thiên Phủ Khố Tinh — cách "quân thần tương đắc". Vừa có quyền uy vừa có tài khố, chủ phú quý song toàn, được người đời kính trọng. Miếu vượng thì đại phú đại quý; hãm địa thì quyền cao mà tài bền, cần kiên nhẫn tích lũy. Kỵ gặp Không Kiếp phá hay Kỵ xung — đế vương mất ngôi.'
    },
    {
      id: 'vu-khuc-that-sat', name: 'Vũ Khúc Thất Sát', level: 'excellent',
      stars: ['Vũ Khúc', 'Thất Sát'],
      desc: 'Tài tinh hội Tướng tinh — cách "tướng tài". Quả quyết, dám nghĩ dám làm, giỏi tài chính và quản lý. Thích hợp quân đội, doanh nghiệp, đầu tư mạo hiểm. Cần chế hóa bởi sao nhu (Thiên Đồng, Thái Âm) mới bớt cứng; gặp Kỵ thì tiền và quyền cùng hao tổn.'
    },
    {
      id: 'thien-dong-thien-luong', name: 'Thiên Đồng Thiên Lương', level: 'good',
      stars: ['Thiên Đồng', 'Thiên Lương'],
      desc: 'Phúc tinh hội Ấm tinh — cách "phúc ấm". Ôn hòa, nhân hậu, hay giúp người, được người lớn tuổi quý mến. Hợp y dược, giáo dục, tôn giáo, công tác xã hội. Bản chất an phận nên khó thành đại phú đại quý, nhưng sống lâu, ít sóng gió, được phúc ấm che chở.'
    },
    {
      id: 'nhat-nguyet-dong-cung', name: 'Nhật Nguyệt Đồng Cung', level: 'excellent',
      stars: ['Thái Dương', 'Thái Âm'],
      desc: 'Thái Dương và Thái Âm đồng cung — âm dương giao hội, cách "nhật nguyệt tịnh minh". Chủ văn võ song toàn, hôn nhân thuận lợi, nam nữ đều được lộc. Miếu vượng thì danh lợi song toàn; hãm địa thì hai sao triệt tiêu sức mạnh, cần tinh thần phấn đấu bù đắp.'
    },
    {
      id: 'liem-trinh-thien-tuong', name: 'Liêm Trinh Thiên Tướng', level: 'good',
      stars: ['Liêm Trinh', 'Thiên Tướng'],
      desc: 'Ấn tinh hội Liêm Trinh — cách "liêm tướng". Quyền ấn, thanh danh, chủ về quản lý hành chính, pháp luật, kinh doanh có tổ chức. Cần giữ mình thanh liêm mới được quý; gặp Kỵ hay Kình Đà thì dễ vướng quan phi, kiện tụng.'
    },
    {
      id: 'co-mon-thai-duong', name: 'Cự Môn Thái Dương', level: 'good',
      stars: ['Cự Môn', 'Thái Dương'],
      desc: 'Ám tinh được Quang tinh hóa giải — cách "nhật nguyệt giao huy". Thái Dương soi sáng Cự Môn, biến khẩu thiệt thành tài ăn nói, truyền thông, ngoại ngữ, giảng dạy. Miếu vượng thì học thuật, danh tiếng; hãm thì miệng lưỡi vẫn là nguồn thị phi.'
    },
    {
      id: 'co-co-dong-luong', name: 'Cơ Nguyệt Đồng Lương', level: 'excellent',
      starsAll: ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'],
      desc: 'Bốn sao văn tinh hội đủ — cách "cơ nguyệt đồng lương", một trong những cách đẹp nhất. Chủ văn chương, trí tuệ, công chức, y dược, giáo dục. Miếu vượng thì khoa bảng, văn võ toàn tài; cần cả bốn sao không hãm mới thành đại cách.'
    },
    {
      id: 'vu-tham', name: 'Vũ Tham Cách', level: 'excellent',
      stars: ['Vũ Khúc', 'Tham Lang'],
      desc: 'Tài tinh hội Đào hoa dục vọng tinh — cách "vũ tham". Cổ thư nói "Vũ Tham bất phát thiếu niên nhân" — ba mươi tuổi sau mới phát tài. Chủ tiền tài đến từ nhân mạch, ứng xử, quản lý dục vọng. Hợp tài chính, đầu cơ, kinh doanh giải trí. Cần học tiết chế ham muốn.'
    },
    {
      id: 'sat-pha-lang', name: 'Sát Phá Lang', level: 'good',
      starsAll: ['Thất Sát', 'Phá Quân', 'Tham Lang'],
      desc: 'Ba sao khai sáng hội đủ — cách "sát phá lang", mệnh cách xông pha. Một đời biến động, không chịu an phận, hợp khởi nghiệp, quân cảnh, kinh doanh mạo hiểm. Trẻ tuổi dễ xung động thất bại; trung niên mới ổn định. Cần kỷ luật tự thân rất cao.'
    },
    {
      id: 'tham-lang-hoa-linh', name: 'Tham Lang Hỏa Linh', level: 'excellent',
      stars: ['Tham Lang'], minorAny: ['Hỏa Tinh', 'Linh Tinh'],
      desc: 'Đào hoa tinh gặp Hỏa/Linh — cách "hỏa tham" "linh tham". Cổ thư "Tham Lang ngộ hỏa linh, tất phát hoành tài" — tiền đến đột ngột từ cơ hội bất ngờ, kinh doanh nóng, đầu cơ. Nhưng đến nhanh đi cũng nhanh: phải biết thu hoạch đúng lúc, tránh tham lam.'
    },
    {
      id: 'thach-trung-an-ngoc', name: 'Thạch Trung Ẩn Ngọc', level: 'excellent',
      stars: ['Cự Môn'], branchOnly: [0, 6],
      desc: 'Cự Môn tọa Mệnh tại Tý hoặc Ngọ — cách "thạch trung ẩn ngọc". Vẻ ngoài bình thường, nội tâm tài hoa. Thời trẻ vô danh, trung niên mới hiển quý. Hợp chuyên môn, nghiên cứu, truyền thông, môi giới. Cần Văn Xương/Khúc hoặc lộc quyền khoa trợ mới "phá đá thấy ngọc".'
    },
    {
      id: 'minh-chau-xuat-hai', name: 'Minh Châu Xuất Hải', level: 'excellent',
      emptyMing: true,
      desc: 'Mệnh cung không chính tinh, đối cung có Thái Dương + Thái Âm — cách "minh châu xuất hải". Sinh ra bình thường, phải dựa vào nỗ lực mới ra đầu. Rất hợp đi xa, học thuật, làm trong tập đoàn lớn, hoặc phát triển muộn mà vang dội.'
    },
    {
      id: 'tu-vi-doc-tọa', name: 'Tử Vi Độc Tọa', level: 'good',
      stars: ['Tử Vi'], solo: true,
      desc: 'Tử Vi độc thủ cung Mệnh — Đế tinh lẻ loi. Tự trọng, có khí chất lãnh đạo, nhưng "vua cô độc" thiếu quân thần phụ tá. Cần Tả Hữu/Biện Xương Khúc hội chiếu mới phát huy; đơn độc dễ kiêu căng, cô độc, bị hiểu lầm là kiêu ngạo.'
    },
    {
      id: 'lien-sat-duong', name: 'Liêm Sát Kình', level: 'caution',
      starsAll: ['Liêm Trinh', 'Thất Sát'], minorAny: ['Kình Dương'],
      desc: 'Liêm Trinh Thất Sát hội Kình Dương — tổ hợp cần đề phòng. Dám làm dám chịu nhưng dễ vướng quan phi, hình thương, tai nạn. Cần giữ lời nói, tránh nóng vội quyết định, đặc biệt trong năm hạn xấu. Chú ý pháp lý và an toàn giao thông.'
    },
    {
      id: 'cu-hoa-duong', name: 'Cự Hỏa Dương', level: 'caution',
      starsAll: ['Cự Môn'], minorAny: ['Hỏa Tinh', 'Kình Dương'],
      desc: 'Cự Môn gặp Hỏa tinh, Kình Dương — khẩu thiệt cộng nóng tính thành tổ hợp xung đột. Dễ gây thị phi, tranh chấp, kiện tụng. Học cách nói ít, kiềm chế cảm xúc, tránh tranh luận đúng-sai; trong năm hạn xấu nên giữ mình rất kỹ.'
    },
    {
      id: 'ma-dau-dai-ten', name: 'Mã Đầu Đại Tiễn', level: 'caution',
      stars: ['Kình Dương'], branchOnly: [6], solo: true,
      desc: 'Kình Dương tọa Mệnh tại Ngọ — cách "mã đầu đại tiễn". Cổ thư "Uy trấn biên cương" — sức chiến đấu, ý chí sắt. Hợp quân đội, cảnh sát, kinh doanh mạo hiểm. Nhưng hung tinh độc tọa dễ nóng tính, dễ gặp thương tích; cần học kiên nhẫn và an toàn.'
    },
    {
      id: 'lua-ton-thu-menh', name: 'Lộc Tồn Thủ Mệnh', level: 'good',
      minorAny: ['Lộc Tồn'], isMingOnly: true,
      desc: 'Lộc Tồn tọa Mệnh — cách "lộc tồn thủ mệnh". Cơm áo không lo, tính cách bảo thủ, giỏi tích lũy. Nhưng dễ bị kẹp giữa cát tinh và hung tinh; cần Khoa Quyền Lộc hội chiếu mới thành đại phúc cách.'
    },
    {
      id: 'thien-co-thai-am', name: 'Cơ Nguyệt Đồng Lương (bản cung)', level: 'excellent',
      starsAll: ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'],
      desc: 'Bốn văn tinh đồng cung — cách "cơ nguyệt đồng lương". Trí tuệ, văn chương, phúc ấm đủ đầy. Hợp công chức, học thuật, y tế, giáo dục. Miếu vượng thì danh lợi song toàn; cần cả bốn sao sáng mới là đại cách.'
    },
    {
      id: 'sat-pha-wolf-luc', name: 'Sát Phá Lang Hóa Lộc', level: 'excellent',
      starsAll: ['Thất Sát', 'Phá Quân', 'Tham Lang'], hasLuhu: true,
      desc: 'Sát Phá Lang hội Hóa Lộc — cách "khai sáng phát tài". Xông pha mà có lộc, biến động sinh ra tiền bạc. Hợp khởi nghiệp, đầu tư mạo hiểm, kinh doanh đa ngành. Cần biết dừng đúng lúc vì tiền đến từ biến động.'
    },
    /* ===== Bổ sung: đồng cung ===== */
    {
      id: 'co-co', name: 'Cơ Lương Cách', level: 'good',
      stars: ['Thiên Cơ', 'Thiên Lương'],
      desc: 'Thiên Cơ trí tuệ hội Thiên Lương che chở — cách "cơ lương". Vừa thông minh vừa nhân hậu, hợp nghề y dược, giáo dục, nghiên cứu, pháp luật. Miếu vượng thì văn võ song toàn; hãm thì trí tuệ bị che khuất, hay lo nghĩ quá độ.'
    },
    {
      id: 'sat-pha', name: 'Sát Phá Cách', level: 'good',
      stars: ['Thất Sát', 'Phá Quân'],
      desc: 'Thất Sát Tướng tinh hội Phá Quân Phá tinh — cách "sát phá". Dũng mãnh, dám phá dám lập, hợp quân đội, cảnh sát, doanh nghiệp mạo hiểm. Một đời nhiều biến động; cần kỷ luật thép mới thành đại sự.'
    },
    {
      id: 'nhat-vo', name: 'Nhật Vũ Cách', level: 'good',
      stars: ['Thái Dương', 'Vũ Khúc'],
      desc: 'Thái Dương Quang tinh hội Vũ Khúc Tài tinh — cách "nhật võ". Danh lợi song toàn, vừa có thanh danh vừa có tiền tài. Hợp quan lộc, tài chính, kỹ thuật. Miếu vượng thì phú quý; hãm thì danh tài đều khó giữ.'
    },
    {
      id: 'phu-am', name: 'Phủ Âm Cách', level: 'good',
      stars: ['Thiên Phủ', 'Thái Âm'],
      desc: 'Thiên Phủ Khố tinh hội Thái Âm Nguyệt tinh — cách "phủ âm". Giàu sang từ từ, điền sản dày, nữ mệnh đặc biệt tốt. Hợp bất động sản, kinh doanh ổn định, gia đình êm ấm. Miếu vượng thì phú quý; hãm thì giữ của kém.'
    },
    {
      id: 'duong-luong', name: 'Dương Lương Cách', level: 'good',
      stars: ['Thái Dương', 'Thiên Lương'],
      desc: 'Thái Dương Quang tinh hội Thiên Lương Ấm tinh — cách "dương lương". Quang minh chính đại, hay giúp người, hợp giáo dục, y tế, từ thiện, quản lý. Miếu vượng thì danh tiếng lừng lẫy; hãm thì bị che khuất.'
    },
    {
      id: 'lien-pha', name: 'Liêm Phá Cách', level: 'caution',
      stars: ['Liêm Trinh', 'Phá Quân'],
      desc: 'Liêm Trinh Đào hoa tinh hội Phá Quân Phá tinh — cách "liêm phá". Tài nghệ và biến động kết hợp, dễ vướng thị phi, hình thương, hoặc phá sản rồi dựng lại. Cần giữ mình rất kỹ, tránh đường tắt mờ ám.'
    },
    {
      id: 'co-vo', name: 'Cơ Vũ Cách', level: 'good',
      stars: ['Thiên Cơ', 'Vũ Khúc'],
      desc: 'Thiên Cơ trí tuệ hội Vũ Khúc tài tinh — cách "cơ võ". Đầu óc phân tích cùng tính quyết đoán tài chính, hợp kỹ thuật, tài chính, phân tích đầu tư. Miếu vượng thì giàu có; hãm thì đa nghi và tiền bạc thất thường.'
    },
    {
      id: 'thai-am-co-mon', name: 'Âm Cự Cách', level: 'caution',
      stars: ['Thái Âm', 'Cự Môn'],
      desc: 'Thái Âm Nguyệt tinh hội Cự Môn Ám tinh — cách "âm cự". Sắc đẹp và khẩu tài kết hợp, dễ vướng thị phi tình ái, khẩu thiệt. Hợp nghệ thuật, truyền thông nhưng cần giữ mình trong sạch.'
    },
    /* ===== Bổ sung: giáp cung (sao kẹp hai bên) ===== */
    {
      id: 'ta-huu-giep', name: 'Tả Hữu Giáp Cung', level: 'excellent',
      neighborMinorAny: ['Tả Phù', 'Hữu Bật'],
      desc: 'Tả Phù Hữu Bật giáp hai bên cung — quý nhân kẹp hỗ trợ. Cổ thư "Tả Hữu giáp, phúc hậu". Chủ được người giúp đỡ hai phía, công việc nhẹ nhàng, ít phải tự mình gánh vác. Kỵ cung bị Không Kiếp phá thì quý nhân hóa vô.'
    },
    {
      id: 'xuong-khuc-giep', name: 'Xương Khúc Giáp Cung', level: 'excellent',
      neighborMinorAny: ['Văn Xương', 'Văn Khúc'],
      desc: 'Văn Xương Văn Khúc giáp hai bên — văn tinh kẹp trợ. Chủ thông minh, văn chương, thi cử, học thuật. Miếu vượng thì khoa bảng đỗ đạt, văn võ song toàn; cần cung chính tinh không quá hung mới phát huy.'
    },
    {
      id: 'khoi-viet-giep', name: 'Khôi Việt Giáp Cung', level: 'good',
      neighborMinorAny: ['Thiên Khôi', 'Thiên Việt'],
      desc: 'Thiên Khôi Thiên Việt giáp hai bên — quý tinh kẹp nâng. Nam mệnh gọi "Thiên Ất", nữ mệnh gọi "Ngọc Đường". Chủ quý nhân đề bạt trong thi cử, cầu chức, thời khắc then chốt thường có người giúp.'
    },
    {
      id: 'hoa-linh-giep', name: 'Hỏa Linh Giáp Cung', level: 'caution',
      neighborMinorAny: ['Hỏa Tinh', 'Linh Tinh'],
      desc: 'Hỏa Tinh Linh Tinh giáp hai bên — hung tinh kẹp xung. Chủ tính gấp, dễ xung đột, tai nạn bất ngờ, quyết định nóng vội. Cần rèn kiên nhẫn, tránh tranh luận và quyết định lớn khi nóng.'
    },
    {
      id: 'khong-kiep-giep', name: 'Không Kiếp Giáp Cung', level: 'caution',
      neighborMinorAny: ['Địa Không', 'Địa Kiếp'],
      desc: 'Địa Không Địa Kiếp giáp hai bên — không kiếp kẹp phá. Chủ tài đến tài đi, ý tưởng thiên về tâm linh triết học, vật chất khó giữ. Cổ thư "Không Kiếp giáp, tài bất tụ". Hợp nghề kỹ thuật, tôn giáo, nghiên cứu hơn là tích lũy.'
    },
    {
      id: 'duong-da-giep', name: 'Dương Đà Giáp Cung', level: 'caution',
      neighborMinorAny: ['Kình Dương', 'Đà La'],
      desc: 'Kình Dương Đà La giáp hai bên — hung tinh kẹp bức. Chủ trở ngại, trì trệ, khó khăn chồng chất trong phương diện cung này. Cần kiên trì, tránh nóng vội, và học cách hóa giải bằng đức hạnh.'
    },
    {
      id: 'thien-hinh-giep', name: 'Thiên Hình Giáp Cung', level: 'caution',
      neighborMinorAny: ['Thiên Hình'],
      desc: 'Thiên Hình giáp hai bên — hình tinh kẹp. Chủ thị phi, kiện tụng, pháp lý, hoặc hình phạt. Cần giữ mình ngay thẳng, tránh tranh chấp, đặc biệt trong hợp đồng và quan hệ đối tác.'
    }
  ];

  /* ============ Matcher ============ */
  function starSet(palace) {
    var MAJORS = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh', 'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'];
    return (palace.stars || []).filter(function (s) { return MAJORS.indexOf(s.name) >= 0; }).map(function (s) { return s.name; });
  }
  function minorSet(palace) {
    var MAJORS = ['Tử Vi', 'Thiên Cơ', 'Thái Dương', 'Vũ Khúc', 'Thiên Đồng', 'Liêm Trinh', 'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', 'Phá Quân'];
    return (palace.stars || []).filter(function (s) { return MAJORS.indexOf(s.name) < 0; }).map(function (s) { return s.name; });
  }

  function matchPalace(palace, allPalaces, chartObj) {
    var majors = starSet(palace);
    var minors = minorSet(palace);
    var isMing = palace.isMing;
    var results = [];

    PATTERNS.forEach(function (pt) {
      // điều kiện cung
      if (pt.isMingOnly && !isMing) return;
      if (pt.emptyMing && !(isMing && majors.length === 0)) return;
      if (pt.branchOnly && pt.branchOnly.indexOf(palace.branchIdx) < 0) return;
      if (pt.solo && majors.length !== 1) return;
      // sao chính
      if (pt.stars) {
        for (var i = 0; i < pt.stars.length; i++) if (majors.indexOf(pt.stars[i]) < 0) return;
      }
      if (pt.starsAll) {
        for (var j = 0; j < pt.starsAll.length; j++) if (majors.indexOf(pt.starsAll[j]) < 0) return;
      }
      // phụ tinh
      if (pt.minorAny) {
        var ok = false;
        for (var k = 0; k < pt.minorAny.length; k++) if (minors.indexOf(pt.minorAny[k]) >= 0) ok = true;
        if (!ok) return;
      }
      // hóa lộc (sao có sihua 'Hóa Lộc')
      if (pt.hasLuhu) {
        var hasLu = (palace.stars || []).some(function (s) { return s.sihua === 'Hóa Lộc'; });
        if (!hasLu) return;
      }
      // giáp cung: sao phụ tinh ở 2 cung kề (branchIdx ±1)
      if (pt.neighborMinorAny && allPalaces && palace.branchIdx != null) {
        var prevP = allPalaces.filter(function (x) { return x.branchIdx === (palace.branchIdx + 11) % 12; })[0];
        var nextP = allPalaces.filter(function (x) { return x.branchIdx === (palace.branchIdx + 1) % 12; })[0];
        var neiMinors = [];
        if (prevP) neiMinors = neiMinors.concat(minorSet(prevP));
        if (nextP) neiMinors = neiMinors.concat(minorSet(nextP));
        var neiOk = false;
        for (var nm = 0; nm < pt.neighborMinorAny.length; nm++) {
          if (neiMinors.indexOf(pt.neighborMinorAny[nm]) >= 0) neiOk = true;
        }
        if (!neiOk) return;
      }
      results.push({ name: pt.name, level: pt.level, desc: pt.desc });
    });

    // 明珠出海: Mệnh không chính tinh + đối cung có Nhật Nguyệt
    if (isMing && majors.length === 0 && allPalaces) {
      var opp = allPalaces.filter(function (x) { return x.branchIdx === ((palace.branchIdx || 0) + 6) % 12; })[0];
      if (opp) {
        var om = starSet(opp);
        if (om.indexOf('Thái Dương') >= 0 && om.indexOf('Thái Âm') >= 0) {
          results.push({ name: 'Minh Châu Xuất Hải', level: 'excellent', desc: PATTERNS.filter(function (p) { return p.id === 'minh-chau-xuat-hai'; })[0].desc });
        }
      }
    }
    return results;
  }

  window.ZiweiPatterns = { matchPalace: matchPalace, PATTERNS: PATTERNS };
})();
