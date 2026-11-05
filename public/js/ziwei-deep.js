/* ============================================================
 * KHO VĂN LUẬN GIẢI CHUYÊN SÂU — hành động cụ thể
 * Bổ sung ziwei-texts.js: mỗi cung ~2000-3000 từ khi ghép,
 * có phần NÊN LÀM / TRÁNH / NGHỀ PHÙ HỢP / SỨC KHỎE / TÀI CHÍNH.
 * ============================================================ */
(function () {
  'use strict';

  /* ============ Luận sâu từng cung — cuộc đời theo cung ============ */
  var PALACE_DEEP = {
    'Mệnh': `Đi sâu vào cung Mệnh là đi vào "nhân quả" của cả đời: mọi cung khác đều là chi tiết, còn Mệnh là tổng thể. Khi đọc cung này cần trả lời 5 câu hỏi lớn: bạn là người như thế nào (tính cách), bạn mạnh ở đâu (sao miếu), bạn yếu ở đâu (sao hãm/kỵ), bạn được trời cho gì (phụ tinh tốt), và bạn phải trả giá gì (sao hung, kỵ, không kiếp).\n\nVới chính tinh miếu vượng, cung Mệnh là "mỏ vàng" — hãy phát huy tối đa vì đây là thế mạnh trời cho. Với chính tinh hãm địa hoặc bị Kỵ/Không Kiếp phá, cung Mệnh là "bài toán khó" — không phải không làm được, mà phải biết cách đi đường vòng, dùng trí tuệ thay sức mạnh, và chấp nhận rằng thành công sẽ đến muộn hơn người khác.\n\nĐiểm quan trọng nhất khi luận Mệnh: đừng chỉ nhìn sao tọa thủ mà quên tam phương. Một cung Mệnh có 1 sao hãm nhưng được 3 cung tam hợp chiếu tốt còn mạnh hơn cung có 2 sao miếu nhưng bị xung phá tứ phía. Tam phương tứ chính mới là "sức mạnh tổng hợp" của vận mệnh.`,

    'Phụ Mẫu': `Cung Phụ Mẫu không chỉ nói về cha mẹ ruột mà còn là "gốc rễ văn hóa" — những gì bạn thừa hưởng về mặt tinh thần, cách giáo dục, và môi trường lớn lên. Người có cung này tốt thường có nền tảng vững để đi đường dài; người cung này xấu thường phải tự xây lại nền móng của chính mình.\n\nTrong thực tế, cung Phụ Mẫu tốt cho thấy: cha mẹ (hoặc người lớn nuôi dưỡng) là điểm tựa, bạn được dạy dỗ bài bản, có người lo lắng cho bạn khi thất bại. Cung xấu cho thấy: phải tự lập sớm, thiếu sự che chở, hoặc quan hệ với cha mẹ có khoảng cách về tình cảm dù vẫn đầy đủ vật chất.\n\nCung này cũng phản ánh cách bạn đối diện với "quyền lực trên đầu" — cấp trên, người lớn tuổi, hệ thống. Phụ Mẫu tốt thì bạn biết tôn trọng và được nâng đỡ; Phụ Mẫu xấu thì bạn dễ xung đột với cấp trên hoặc bị ràng buộc bởi kỳ vọng gia đình.`,

    'Phúc Đức': `Phúc Đức là cung "báo trước" của cả lá số — nó cho biết bạn sẽ "hưởng" hay "chịu" vận đời. Người Phúc Đức hậu thì dù đại hạn xấu cũng giảm đau; người Phúc Đức bạc thì may mắn đến cũng khó giữ. Đây là cung của nghiệp, không phải của nỗ lực — bạn không "làm" ra phúc, bạn "được" phúc hay không.\n\nSao tốt tại Phúc Đức cho tâm hồn an lạc, ít lo âu, biết đủ, và quan trọng nhất là có "phúc tu" — nghiệp thiện có thành tựu. Sao xấu (đặc biệt Kỵ, Không Kiếp, Cô Thần) cho thấy tâm hay bất an, khó ngủ, dễ trầm cảm, hoặc phải trải qua nhiều kiếp nạn tinh thần.\n\nTrong thực tế, Phúc Đức quyết định chất lượng cuộc sống hơn là số tiền: người giàu mà Phúc Đức xấu vẫn bất an; người nghèo mà Phúc Đức tốt vẫn an nhiên. Đây là cung người tu nên xem kỹ nhất.`,

    'Điền Trạch': `Điền Trạch là cung "tài sản cố định" — nhà cửa, đất đai, tổ ấm. Nó trả lời câu hỏi lớn nhất của người Việt: "Có an cư được không?". Sao tốt miếu vượng cho khả năng sở hữu nhà đất, gia đình ổn định, để lại cơ nghiệp cho con cháu. Sao xấu cho thấy nhà cửa hay dời đổi, khó an cư, hoặc tài sản dễ thất thoát.\n\nCung này cũng luận "môi trường sống" — không chỉ là nhà mà là không gian xung quanh: hàng xóm, phong thủy, và cảm giác "đây có phải là nhà không". Điền Trạch tốt thì dù ở đâu cũng thấy an; Điền Trạch xấu thì dù giàu có vẫn thấy thiếu một mái nhà tinh thần.\n\nTrong thực tế, Điền Trạch quyết định khả năng "giữ của": Tài Bạch tốt mà Điền Trạch xấu thì tiền về tay nhưng khó mua được nhà đất; cả hai cùng tốt mới là giàu có bền vững. Đây là cung người mua nhà nên xem kỹ nhất.`,

    'Quan Lộc': `Quan Lộc là cung "sân khấu đời" — nơi bạn thể hiện tài năng, leo cao sự nghiệp, và để lại tên tuổi. Nó không chỉ là nghề nghiệp mà còn là "cách bạn được xã hội công nhận". Sao tốt miếu vượng cho sự nghiệp hanh thông, dễ thăng tiến, được cấp trên tin cậy. Sao xấu cho thấy sự nghiệp nhiều trắc trở, hay đổi việc, khó giữ chức vụ.\n\nCung này phải xem cùng Mệnh (năng lực) và Tài Bạch (nguồn thu): Quan Lộc tốt mà Tài Bạch yếu thì danh nhiều hơn lợi; cả hai cùng tốt mới là phú quý song toàn. Quan Lộc xấu mà Mệnh mạnh thì tài giỏi nhưng khó phát huy.\n\nTrong thực tế, Quan Lộc quyết định "bạn làm gì để sống" — không phải bạn giỏi gì mà là bạn được trả tiền cho việc gì. Đây là cung người đổi nghề nên xem kỹ nhất.`,

    'Nô Bộc': `Nô Bộc là cung "mạng lưới quan hệ" — bạn bè, cộng sự, cấp dưới, và cả những mối quan hệ ngang hàng. Nó cho biết bạn "vận hành" trong tập thể ra sao và thu hút được loại người nào vào đời. Sao tốt cho bạn có nhiều bạn bè tốt, được cấp dưới trung thành, dễ hợp tác. Sao xấu cho thấy dễ gặp tiểu nhân, bạn bè phản bội, hoặc bị lợi dụng trong quan hệ đối tác.\n\nCung này cũng phản ánh khả năng "dùng người": Nô Bộc tốt thì giao việc cho người khác hiệu quả, công việc nhẹ nhàng; Nô Bộc xấu thì phải ôm đồm tự làm, hay bị người khác lừa gạt. Đây là cung người làm quản lý nên xem kỹ nhất.\n\nTrong thực tế, Nô Bộc quyết định "ai ở bên bạn" — không phải bạn chọn ai mà là ai chọn bạn. Đây là cung người muốn mở rộng quan hệ nên xem kỹ nhất.`,

    'Thiên Di': `Thiên Di là cung "cái tôi xã hội" — hình ảnh bạn để lại trong mắt thiên hạ, khác với Mệnh là con người thật. Nó luận về việc ra ngoài, di chuyển, đổi môi trường, và cách bạn thể hiện bản thân trước người lạ. Sao tốt cho vận may khi ra ngoài, dễ được người lạ giúp đỡ, có tiếng tăm tốt, hợp đi xa.\n\nCung này cũng là cung đối của Mệnh — hai cung này chiếu nhau, nên sao tốt ở Thiên Di sẽ "cứu" cho Mệnh yếu, và ngược lại. Thiên Di tốt mà Mệnh yếu thì bạn được người khác giúp đỡ nhiều; Mệnh tốt mà Thiên Di xấu thì bạn tự lập được nhưng khó được công nhận bên ngoài.\n\nTrong thực tế, Thiên Di quyết định "bạn có nên đi xa không" — hợp xuất ngoại, buôn bán, hoặc phải chịu áp lực khi tiếp xúc môi trường mới. Đây là cung người định cư nước ngoài nên xem kỹ nhất.`,

    'Tật Ách': `Tật Ách là cung "sức khỏe và tai ương" — thể chất, bệnh tật, tai nạn, và cả những "bệnh" tinh thần. Nó cho biết bạn sinh ra với thể trạng nào, hay mắc bệnh gì, và phải giữ gìn sức khỏe thế nào. Sao tốt miếu vượng cho sức khỏe dẻo dai, ít bệnh, khả năng tự chữa tốt, thọ cao. Sao xấu cho thấy thể chất yếu, hay đau ốm, cần đề phòng bệnh theo hành của sao tọa thủ.\n\nCung này cũng luận tai nạn: Tật Ách bị xung phá mạnh dễ gặp tai nạn bất ngờ, phẫu thuật, hoặc bệnh mạn tính. Người tu nên xem cung này để biết phần sức khỏe mình cần bổ khuyết.\n\nTrong thực tế, Tật Ách quyết định "bạn có đủ sức để hưởng phúc không" — giàu có mà sức khỏe kém thì không hưởng được; nghèo mà khỏe mạnh thì vẫn sống tốt. Đây là cung mọi người nên xem kỹ nhất.`,

    'Tài Bạch': `Tài Bạch là cung "tiền bạc và tài lộc" — nguồn thu, cách kiếm tiền, khả năng giữ của. Nó trả lời: bạn kiếm tiền bằng cách nào, có giữ được không, và tiền bạc có làm bạn hạnh phúc hay lo lắng. Sao tốt miếu vượng cho khả năng kiếm tiền tốt, tài chính vững, biết tích lũy. Sao xấu cho thấy tiền bạc hay thất thoát, khó giữ lộc, hoặc phải vất vả lắm mới có được đồng tiền.\n\nCung này phải xem cùng Quan Lộc (nghề sinh tiền) và Điền Trạch (nơi giữ tiền): Tài Bạch tốt mà Điền Trạch xấu thì tiền về tay nhưng khó mua được tài sản; cả hai cùng tốt mới là giàu có bền vững.\n\nTrong thực tế, Tài Bạch quyết định "bạn có giàu được không" — không phải bạn kiếm được bao nhiêu mà là bạn giữ được bao nhiêu. Đây là cung người kinh doanh nên xem kỹ nhất.`,

    'Tử Tức': `Tử Tức là cung "con cái và sáng tạo" — số con, quan hệ con cái, và cả những "đứa con tinh thần" là tác phẩm, dự án, di sản. Sao tốt cho con cái hiếu thảo, đông đúc, có năng khiếu; người không con cũng có nhiều sản phẩm sáng tạo, học trò, hoặc công trình để đời. Sao xấu cho thấy ít con, con cái không như ý, hoặc khó khăn trong việc "sinh thành" ý tưởng và tác phẩm.\n\nCung này cũng phản ánh thế hệ kế tiếp: Tử Tức tốt thì hậu vận có người nối nghiệp; Tử Tức xấu thì phải tự làm đến cùng, ít người kế thừa. Đây là cung người già nên xem kỹ nhất.\n\nTrong thực tế, Tử Tức quyết định "bạn có để lại gì cho đời sau" — không chỉ là con cái mà còn là tác phẩm, tri thức, và di sản tinh thần. Đây là cung người sáng tạo nên xem kỹ nhất.`,

    'Phu Thê': `Phu Thê là cung "hôn nhân và tình duyên" — người phối ngẫu, phẩm chất bạn đời, thời điểm kết hôn, và cả các mối quan hệ đối tác thân mật. Sao tốt miếu vượng cho phối ngẫu tốt, hôn nhân bền, được người bạn đời nâng đỡ. Sao xấu cho thấy hôn nhân trắc trở, dễ ly dị, hoặc phải kết hôn muộn, lấy người không hợp.\n\nCung này cũng luận quan hệ nam nữ nói chung: Phu Thê tốt thì duyên tình thuận, dễ gặp người thương; Phu Thê xấu thì tình cảm hay giằng co, khó giữ. Đây là cung người độc thân nên xem kỹ nhất.\n\nTrong thực tế, Phu Thê quyết định "bạn có được yêu thương không" — không phải bạn yêu ai mà là ai yêu bạn. Đây là cung mọi người nên xem kỹ nhất.`,

    'Huynh Đệ': `Huynh Đệ là cung "anh chị em và bạn bè" — quan hệ ngang hàng, bạn tri kỷ, và cả những mối quan hệ thời niên thiếu. Sao tốt cho anh chị em hòa thuận, có người san sẻ, thời thơ ấu êm ấm, dễ có bạn tri kỷ. Sao xấu cho thấy ít anh chị em, hoặc quan hệ với họ xa cách, ghen tị, tranh chấp.\n\nCung này cũng phản ánh cách bạn đối xử với người ngang hàng lúc trưởng thành — Huynh Đệ tốt thì dễ hợp tác, Huynh Đệ xấu thì hay ganh đua, đố kỵ với đồng nghiệp bạn bè cùng lứa. Đây là cung người có anh chị em nên xem kỹ nhất.\n\nTrong thực tế, Huynh Đệ quyết định "bạn có được san sẻ không" — không phải bạn có bao nhiêu bạn mà là bạn có bao nhiêu người thật lòng. Đây là cung người muốn kết bạn nên xem kỹ nhất.`,
  };

  /* ============ Hành động cụ thể theo cung ============ */
  var PALACE_ACTION = {
    'Mệnh': {
      should: ['Phát huy tối đa thế mạnh của chính tinh tọa thủ — đây là "mỏ vàng" trời cho', 'Học cách chế hóa điểm yếu: sao hãm thì dùng trí tuệ thay sức mạnh, sao Kỵ thì tránh quyết định lớn vào năm xấu', 'Xây dựng thói quen tốt từ sớm — cung Mệnh là "nền" cho mọi cung khác', 'Chọn môi trường sống và làm việc phù hợp với tính cách sao tọa thủ'],
      avoid: ['Đừng cố gắng "làm điều không phải mình" — cung Mệnh quyết định bạn mạnh ở đâu, ép mình đi ngược sẽ thất bại', 'Tránh quyết định lớn vào năm có sao Kỵ hoặc đại hạn xấu', 'Đừng để tính cách sao tọa thủ phá hỏng quan hệ — ví dụ Tử Vi quá kiêu, Thiên Cơ quá đa nghi'],
      career: 'Chọn nghề phù hợp với tính cách sao tọa thủ: Tử Vi hợp lãnh đạo, Thiên Cơ hợp trí tuệ, Vũ Khúc hợp tài chính, Thất Sát hợp quyết đoán',
      health: 'Sức khỏe theo hành của sao tọa thủ: Kim (Vũ Khúc) cần giữ phổi, Mộc (Thiên Cơ) cần giữ gan, Thủy (Thái Âm) cần giữ thận, Hỏa (Liêm Trinh) cần giữ tim',
      timing: 'Năm tốt để phát triển: năm có sao miếu vượng được lưu niên chiếu; năm xấu: năm có Kỵ hoặc đại hạn chuyển cung xấu'
    },
    'Phụ Mẫu': {
      should: ['Tôn trọng và chăm sóc cha mẹ — cung này tốt thì đây là nguồn lực lớn', 'Học từ cách giáo dục của gia đình — dù tốt hay xấu đều là bài học', 'Xây dựng quan hệ tốt với cấp trên và người lớn tuổi', 'Nếu cung này xấu, hãy học cách tự lập và không phụ thuộc'],
      avoid: ['Đừng để kỳ vọng của gia đình đè nặng lên quyết định của mình', 'Tránh xung đột với cấp trên — cung này xấu thì càng dễ bị ràng buộc', 'Đừng lặp lại sai lầm giáo dục của cha mẹ nếu có'],
      career: 'Cung này tốt thì dễ được cấp trên nâng đỡ; cung này xấu thì phải tự lập nghiệp, tránh phụ thuộc tổ chức',
      health: 'Sức khỏe của cha mẹ và người lớn tuổi — cung này xấu thì cần chú ý bệnh của họ',
      timing: 'Năm tốt để vun đắp quan hệ gia đình: năm có sao tốt chiếu cung này'
    },
    'Phúc Đức': {
      should: ['Chăm sóc tâm linh và phúc phần — đây là "nền" cho mọi thứ', 'Tu hành, thiền định, hoặc hoạt động tâm linh phù hợp', 'Biết đủ và buông bỏ — cung này tốt thì đây là thế mạnh lớn', 'Giúp đỡ người khác — nghiệp thiện sẽ được tích lũy'],
      avoid: ['Đừng để lo âu và bất an chi phối — cung này xấu thì tâm là "bệnh" lớn nhất', 'Tránh sa đọa vào dục vọng — Phúc Đức xấu thì dễ bị cám dỗ', 'Đừng bỏ qua sức khỏe tinh thần — trầm cảm, mất ngủ là dấu hiệu cung này xấu'],
      career: 'Cung này tốt thì tâm lý vững, ít stress; cung này xấu thì cần chọn nghề ít áp lực',
      health: 'Sức khỏe tinh thần quan trọng nhất — trầm cảm, mất ngủ, rối loạn lo âu là dấu hiệu cần chú ý',
      timing: 'Năm tốt để tu hành và tích phúc: năm có sao tốt chiếu cung này; năm xấu: năm có Kỵ hoặc đại hạn xấu'
    },
    'Điền Trạch': {
      should: ['Tích lũy tài sản và xây dựng tổ ấm — đây là "nền" vật chất', 'Mua nhà đất khi có điều kiện — cung này tốt thì đây là đầu tư tốt', 'Chăm sóc môi trường sống — nhà cửa sạch sẽ, phong thủy tốt', 'Xây dựng gia đình ổn định — cung này tốt thì đây là nền cho con cháu'],
      avoid: ['Đừng mua nhà đất khi cung này xấu hoặc năm xấu — dễ thất thoát', 'Tránh để nhà cửa quá cũ kỹ hoặc quá sang trọng — mất cân bằng', 'Đừng bỏ qua phong thủy — cung này tốt thì phong thủy tốt sẽ tăng phúc'],
      career: 'Cung này tốt thì có thể đầu tư bất động sản; cung này xấu thì nên thuê nhà và tập trung sự nghiệp',
      health: 'Môi trường sống ảnh hưởng sức khỏe — nhà ẩm mốc, thiếu ánh sáng tự nhiên là dấu hiệu xấu',
      timing: 'Năm tốt để mua nhà: năm có sao tốt chiếu cung này và Tài Bạch; năm xấu: năm có Kỵ hoặc đại hạn xấu'
    },
    'Quan Lộc': {
      should: ['Phát triển sự nghiệp và công danh — đây là "sân khấu" thể hiện tài năng', 'Chọn nghề phù hợp với tính cách và thế mạnh', 'Xây dựng quan hệ tốt với cấp trên và đồng nghiệp', 'Kiên nhẫn leo cao — cung này tốt thì đây là con đường thành công'],
      avoid: ['Đừng đổi nghề liên tục — cung này xấu thì càng dễ thất bại', 'Tránh xung đột với cấp trên — cung này xấu thì dễ bị ghét', 'Đừng bỏ qua cơ hội học hỏi — cung này tốt thì đây là cách thăng tiến'],
      career: 'Chọn nghề theo sao tọa thủ: Tử Vi hợp lãnh đạo, Thiên Cơ hợp trí tuệ, Vũ Khúc hợp tài chính, Thất Sát hợp quyết đoán',
      health: 'Sức khỏe ảnh hưởng hiệu suất công việc — cung này xấu thì cần chú ý stress và burnout',
      timing: 'Năm tốt để thăng tiến: năm có sao tốt chiếu cung này và Mệnh; năm xấu: năm có Kỵ hoặc đại hạn xấu'
    },
    'Nô Bộc': {
      should: ['Xây dựng quan hệ tốt với bạn bè và người dưới quyền', 'Học cách dùng người — cung này tốt thì đây là thế mạnh lớn', 'Giúp đỡ người khác — cung này tốt thì bạn sẽ được giúp lại', 'Chọn lọc bạn bè — cung này xấu thì cần đề phòng tiểu nhân'],
      avoid: ['Đừng tin tưởng mù quáng — cung này xấu thì dễ bị lợi dụng', 'Tránh giao việc cho người không đáng tin — cung này xấu thì cấp dưới có thể phản bội', 'Đừng bỏ qua lời khuyên của người khác — cung này tốt thì bạn sẽ được nâng đỡ'],
      career: 'Cung này tốt thì dễ hợp tác và thăng tiến; cung này xấu thì phải tự lập và tránh phụ thuộc người khác',
      health: 'Quan hệ xã hội ảnh hưởng sức khỏe tinh thần — cung này xấu thì dễ bị stress vì quan hệ',
      timing: 'Năm tốt để mở rộng quan hệ: năm có sao tốt chiếu cung này'
    },
    'Thiên Di': {
      should: ['Ra ngoài và trải nghiệm thế giới — cung này tốt thì đây là cơ hội lớn', 'Di chuyển, đi xa, hoặc đổi môi trường — cung này tốt thì sẽ may mắn', 'Xây dựng tiếng tăm tốt — cung này tốt thì bạn sẽ được công nhận', 'Học cách thích nghi — cung này xấu thì càng cần rèn luyện'],
      avoid: ['Đừng sợ thay đổi — cung này xấu thì càng cần dũng cảm', 'Tránh quyết định lớn khi ra ngoài mà chưa chuẩn bị — cung này xấu thì dễ gặp chuyện', 'Đừng bỏ qua cơ hội — cung này tốt thì đây là cách phát triển'],
      career: 'Cung này tốt thì hợp đi xa, buôn bán, xuất ngoại; cung này xấu thì nên ở gần nhà và tập trung nội địa',
      health: 'Sức khỏe khi đi xa — cung này xấu thì cần chú ý sức khỏe và an toàn',
      timing: 'Năm tốt để đi xa: năm có sao tốt chiếu cung này; năm xấu: năm có Kỵ hoặc đại hạn xấu'
    },
    'Tật Ách': {
      should: ['Chăm sóc sức khỏe — đây là "vốn" quan trọng nhất', 'Rèn luyện thể chất và tinh thần — cung này tốt thì đây là thế mạnh', 'Phòng bệnh theo hành của sao tọa thủ — Kim cần giữ phổi, Mộc cần giữ gan', 'Đi khám sức khỏe định kỳ — cung này xấu thì càng cần chú ý'],
      avoid: ['Đừng lạm dụng sức khỏe — cung này xấu thì càng dễ bệnh', 'Tránh stress và lo âu — cung này xấu thì đây là "bệnh" lớn nhất', 'Đừng bỏ qua triệu chứng — cung này xấu thì bệnh sẽ nặng hơn'],
      career: 'Cung này tốt thì sức khỏe tốt, hiệu suất cao; cung này xấu thì cần chọn nghề ít áp lực',
      health: 'Sức khỏe theo hành của sao tọa thủ: Kim (Vũ Khúc) cần giữ phổi, Mộc (Thiên Cơ) cần giữ gan, Thủy (Thái Âm) cần giữ thận, Hỏa (Liêm Trinh) cần giữ tim',
      timing: 'Năm tốt để chăm sóc sức khỏe: năm có sao tốt chiếu cung này; năm xấu: năm có Kỵ hoặc đại hạn xấu'
    },
    'Tài Bạch': {
      should: ['Quản lý tiền bạc và tài chính — đây là "nguồn" của mọi thứ', 'Kiếm tiền bằng cách phù hợp với tính cách và thế mạnh', 'Tiết kiệm và đầu tư — cung này tốt thì đây là con đường giàu có', 'Tránh tiêu xài hoang phí — cung này xấu thì càng cần kỷ luật'],
      avoid: ['Đừng đầu tư mạo hiểm — cung này xấu thì dễ thất thoát', 'Tránh cho vay hoặc đầu tư vào người không đáng tin — cung này xấu thì dễ bị lừa', 'Đừng bỏ qua kế hoạch tài chính — cung này xấu thì càng cần quản lý chặt'],
      career: 'Cung này tốt thì hợp kinh doanh, tài chính, đầu tư; cung này xấu thì nên tập trung lương và tiết kiệm',
      health: 'Tiền bạc ảnh hưởng sức khỏe tinh thần — cung này xấu thì dễ bị stress vì tiền',
      timing: 'Năm tốt để đầu tư: năm có sao tốt chiếu cung này và Quan Lộc; năm xấu: năm có Kỵ hoặc đại hạn xấu'
    },
    'Tử Tức': {
      should: ['Chăm sóc con cái và sáng tạo — đây là "di sản" tinh thần', 'Nuôi dạy con cái tốt — cung này tốt thì đây là niềm vui lớn', 'Sáng tạo và để lại tác phẩm — cung này tốt thì bạn sẽ có di sản', 'Chấp nhận và tha thứ — cung này xấu thì càng cần học cách buông bỏ'],
      avoid: ['Đừng ép buộc con cái — cung này xấu thì càng dễ xung đột', 'Tránh bỏ qua sáng tạo — cung này tốt thì đây là cách để lại di sản', 'Đừng so sánh con cái với người khác — cung này xấu thì càng dễ thất vọng'],
      career: 'Cung này tốt thì hợp nghề liên quan đến con cái, giáo dục, sáng tạo; cung này xấu thì nên tập trung sự nghiệp cá nhân',
      health: 'Sức khỏe của con cái — cung này xấu thì cần chú ý sức khỏe và an toàn của họ',
      timing: 'Năm tốt để có con hoặc sáng tạo: năm có sao tốt chiếu cung này'
    },
    'Phu Thê': {
      should: ['Xây dựng hôn nhân và tình duyên — đây là "bạn đời" quan trọng', 'Chọn người bạn đời phù hợp — cung này tốt thì đây là niềm hạnh phúc', 'Vun đắp tình cảm — cung này tốt thì đây là con đường bền lâu', 'Tha thứ và nhường nhịn — cung này xấu thì càng cần học cách buông bỏ'],
      avoid: ['Đừng ghen tuông và kiểm soát — cung này xấu thì càng dễ phá hỏng hôn nhân', 'Tránh quyết định lớn khi đang giận dữ — cung này xấu thì dễ ly dị', 'Đừng bỏ qua lời khuyên của bạn đời — cung này tốt thì họ sẽ giúp đỡ'],
      career: 'Cung này tốt thì hôn nhân hỗ trợ sự nghiệp; cung này xấu thì cần tập trung sự nghiệp cá nhân',
      health: 'Sức khỏe của bạn đời — cung này xấu thì cần chú ý sức khỏe và an toàn của họ',
      timing: 'Năm tốt để kết hôn: năm có sao tốt chiếu cung này và Hồng Loan; năm xấu: năm có Kỵ hoặc đại hạn xấu'
    },
    'Huynh Đệ': {
      should: ['Duy trì quan hệ tốt với anh chị em và bạn bè — đây là "mạng lưới" hỗ trợ', 'San sẻ và giúp đỡ lẫn nhau — cung này tốt thì đây là thế mạnh lớn', 'Chọn lọc bạn bè — cung này xấu thì càng cần đề phòng tiểu nhân', 'Tha thứ và không ganh đua — cung này xấu thì càng cần học cách buông bỏ'],
      avoid: ['Đừng ganh đua và đố kỵ — cung này xấu thì càng dễ mất bạn', 'Tránh tin tưởng mù quáng — cung này xấu thì dễ bị lợi dụng', 'Đừng bỏ qua lời khuyên của bạn bè — cung này tốt thì họ sẽ giúp đỡ'],
      career: 'Cung này tốt thì dễ hợp tác và thăng tiến; cung này xấu thì nên tập trung sự nghiệp cá nhân',
      health: 'Quan hệ xã hội ảnh hưởng sức khỏe tinh thần — cung này xấu thì dễ bị stress vì quan hệ',
      timing: 'Năm tốt để kết bạn: năm có sao tốt chiếu cung này'
    },
  };

  /* ============ Hành động theo sao — nên/tránh theo sao ============ */
  var STAR_ACTION = {
    'Tử Vi': {
      should: ['Phát huy bản lĩnh lãnh đạo — đây là thế mạnh trời cho', 'Học cách lắng nghe và tôn trọng người khác — cung này tốt thì sẽ được phụng sự', 'Giữ vững nguyên tắc và tự trọng — cung này tốt thì sẽ được kính trọng', 'Chọn môi trường làm việc có tôn ti trật tự rõ ràng'],
      avoid: ['Đừng kiêu ngạo và độc đoán — cung này xấu thì sẽ mất lòng người', 'Tránh quyết định một mình — cung này xấu thì dễ phạm sai lầm', 'Đừng bỏ qua lời khuyên của người khác — cung này xấu thì sẽ bị cô lập'],
      career: 'Hợp lãnh đạo, quản trị, chính trị, kinh doanh lớn — cần môi trường có quyền lực và tôn ti',
      health: 'Sức khỏe tốt nhưng cần chú ý huyết áp và tim mạch — sao Thổ chủ về ổn định nhưng cũng dễ cứng',
      finance: 'Tài chính ổn định, biết tích lũy — nhưng cần học cách đầu tư và không giữ tiền mặt quá nhiều'
    },
    'Thiên Cơ': {
      should: ['Phát huy trí tuệ và khả năng phân tích — đây là thế mạnh trời cho', 'Học cách kiên định và không thay đổi thất thường — cung này xấu thì càng cần rèn luyện', 'Chọn nghề trí tuệ phù hợp — kỹ sư, phân tích, chiến lược, giáo dục', 'Ghi chép và lập kế hoạch — cung này xấu thì càng cần kỷ luật'],
      avoid: ['Đừng đa nghi và hay thay đổi — cung này xấu thì sẽ mất cơ hội', 'Tránh quyết định vội vàng — cung này xấu thì dễ phạm sai lầm', 'Đừng bỏ qua trực giác — cung này xấu thì sẽ bị phân tích quá mức'],
      career: 'Hợp trí tuệ, kỹ thuật, phân tích, giáo dục, IT — cần môi trường có không gian sáng tạo',
      health: 'Sức khỏe tốt nhưng cần chú ý thần kinh và giấc ngủ — sao Mộc chủ về biến động',
      finance: 'Tiền đến từ trí tuệ nhưng cũng đi nhanh — cần kỷ luật giữ của và đầu tư dài hạn'
    },
    'Thái Dương': {
      should: ['Phát huy sự rộng lượng và nhiệt huyết — đây là thế mạnh trời cho', 'Học cách nhận lại sự chăm sóc — cung này xấu thì dễ kiệt sức vì cho đi quá nhiều', 'Chọn nghề cần danh tiếng và sự công khai — giáo dục, y tế, từ thiện, quản lý', 'Chia sẻ kiến thức và kinh nghiệm — cung này tốt thì sẽ được kính trọng'],
      avoid: ['Đừng lo nghĩ cho người khác quên mình — cung này xấu thì sẽ kiệt sức', 'Tránh quyết định cảm tính — cung này xấu thì dễ bị cảm xúc chi phối', 'Đừng bỏ qua sức khỏe — cung này xấu thì dễ bị "cháy" vì quá nhiệt huyết'],
      career: 'Hợp giáo dục, y tế, từ thiện, quản lý, truyền thông — cần môi trường có sự công nhận',
      health: 'Sức khỏe tốt nhưng cần chú ý tim mạch và huyết áp — sao Hỏa chủ về nhiệt',
      finance: 'Tiền đến từ danh tiếng và sự rộng lượng — hợp nghề cần "ánh sáng" cá nhân'
    },
    'Vũ Khúc': {
      should: ['Phát huy tính quyết đoán và thực tế — đây là thế mạnh trời cho', 'Học cách mềm dẻo trong giao tiếp — cung này xấu thì sẽ bị coi là cứng nhắc', 'Chọn nghề tài chính, kỹ thuật, thương mại — cần môi trường có con số', 'Kiên nhẫn tích lũy — cung này tốt thì sẽ giàu có'],
      avoid: ['Đừng cứng nhắc và ít biểu đạt — cung này xấu thì sẽ bị hiểu lầm là lạnh lùng', 'Tránh quyết định độc đoán — cung này xấu thì sẽ mất lòng người', 'Đừng bỏ qua cảm xúc — cung này xấu thì sẽ khó gần'],
      career: 'Hợp tài chính, ngân hàng, kỹ thuật, thương mại, quân đội — cần môi trường có kỷ luật',
      health: 'Sức khỏe tốt nhưng cần chú ý phổi và hô hấp — sao Kim chủ về cứng',
      finance: 'Tiền đến từ tài chính và quyết đoán — nhưng cũng dễ mất vì quá tin vào con số'
    },
    'Thiên Đồng': {
      should: ['Phát huy sự ôn hòa và khả năng hưởng thụ — đây là thế mạnh trời cho', 'Học cách tự lập và không ỷ lại — cung này xấu thì sẽ bị lợi dụng', 'Chọn nghề nhẹ nhàng, chăm sóc, dịch vụ — cần môi trường ít áp lực', 'Đặt mục tiêu rõ ràng — cung này xấu thì sẽ mãn nguyện với hiện tại'],
      avoid: ['Đừng ỷ lại và hưởng thụ quá độ — cung này xấu thì sẽ mất cơ hội', 'Tránh quyết định cảm tính — cung này xấu thì dễ bị lợi dụng lòng tốt', 'Đừng bỏ qua cơ hội — cung này xấu thì sẽ mãn nguyện với hiện tại'],
      career: 'Hợp dịch vụ, chăm sóc, giáo dục, y tế — cần môi trường ít áp lực và nhiều sự quan tâm',
      health: 'Sức khỏe tốt nhưng cần chú ý thận và tiết niệu — sao Thủy chủ về mềm',
      finance: 'Tiền đến đều nhưng ít khi đột phá — cần kỷ luật đầu tư và không ỷ lại'
    },
    'Liêm Trinh': {
      should: ['Phát huy tài nghệ và sự tinh tế — đây là thế mạnh trời cho', 'Học cách giữ thanh danh sạch — cung này xấu thì sẽ vướng thị phi', 'Chọn nghề nghệ thuật, chính trị, quản lý — cần môi trường có sáng tạo', 'Cẩn thận trong quan hệ — cung này xấu thì dễ bị ghen ghét'],
      avoid: ['Đừng vướng thị phi và hình tù — cung này xấu thì sẽ mất thanh danh', 'Tránh quyết định cảm tính — cung này xấu thì dễ phạm sai lầm', 'Đừng bỏ qua lời khuyên của người khác — cung này xấu thì sẽ bị cô lập'],
      career: 'Hợp nghệ thuật, chính trị, quản lý, kinh doanh có yếu tố sáng tạo — cần môi trường có tự do',
      health: 'Sức khỏe tốt nhưng cần chú ý tim mạch và huyết áp — sao Hỏa chủ về nhiệt',
      finance: 'Tiền đến từ tài nghệ và quan hệ — nhưng cũng dễ mất vì thị phi và hình tù'
    },
    'Thiên Phủ': {
      should: ['Phát huy khả năng tích lũy và giữ của — đây là thế mạnh trời cho', 'Học cách đổi mới và không bảo thủ — cung này xấu thì sẽ bị tụt hậu', 'Chọn nghề quản lý tài sản, ngân hàng, bất động sản — cần môi trường có kỷ luật', 'Kiên nhẫn tích lũy — cung này tốt thì sẽ giàu có bền vững'],
      avoid: ['Đừng bảo thủ và ít đổi mới — cung này xấu thì sẽ bị tụt hậu', 'Tránh quyết định mạo hiểm — cung này xấu thì sẽ mất của', 'Đừng bỏ qua cơ hội — cung này xấu thì sẽ mãn nguyện với hiện tại'],
      career: 'Hợp quản lý, hành chính, tài chính, bất động sản — cần môi trường có kỷ luật và ổn định',
      health: 'Sức khỏe tốt nhưng cần chú ý dạ dày và tiêu hóa — sao Thổ chủ về ổn định',
      finance: 'Tiền đến từ tích lũy và giữ của — nhưng cũng dễ mất vì bảo thủ và không đầu tư'
    },
    'Thái Âm': {
      should: ['Phát huy nhan sắc và sự tinh tế — đây là thế mạnh trời cho', 'Học cách quyết đoán và không đa nghi — cung này xấu thì sẽ bị lo nghĩ chi phối', 'Chọn nghề nghệ thuật, thiết kế, bất động sản — cần môi trường có thẩm mỹ', 'Chia sẻ vẻ đẹp và sự tinh tế — cung này tốt thì sẽ được yêu mến'],
      avoid: ['Đừng lo nghĩ và đa nghi — cung này xấu thì sẽ mất cơ hội', 'Tránh quyết định cảm tính — cung này xấu thì dễ bị cảm xúc chi phối', 'Đừng bỏ qua sức khỏe — cung này xấu thì sẽ bị "mờ" vì quá lo nghĩ'],
      career: 'Hợp nghệ thuật, thiết kế, bất động sản, giáo dục, y tế — cần môi trường có thẩm mỹ',
      health: 'Sức khỏe tốt nhưng cần chú ý thận và tiết niệu — sao Thủy chủ về mềm',
      finance: 'Tiền đến từ điền sản và thẩm mỹ — nhưng cũng dễ mất vì quá tinh tế và ít thực tế'
    },
    'Tham Lang': {
      should: ['Phát huy tính đa năng và nhiều năng khiếu — đây là thế mạnh trời cho', 'Học cách tiết chế dục vọng — cung này xấu thì sẽ sa đọa', 'Chọn nghề nghệ thuật, giải trí, kinh doanh đa ngành — cần môi trường có sáng tạo', 'Đặt mục tiêu rõ ràng — cung này xấu thì sẽ bị ham mê chi phối'],
      avoid: ['Đừng sa đọa vào dục vọng — cung này xấu thì sẽ mất tất cả', 'Tránh quyết định cảm tính — cung này xấu thì dễ bị cảm xúc chi phối', 'Đừng bỏ qua kỷ luật — cung này xấu thì sẽ bị ham mê lôi kéo'],
      career: 'Hợp nghệ thuật, giải trí, kinh doanh đa ngành, giáo dục — cần môi trường có tự do và sáng tạo',
      health: 'Sức khỏe tốt nhưng cần chú ý gan và mật — sao Mộc chủ về biến động',
      finance: 'Tiền đến từ đa năng nhưng cũng dễ mất vì ham mê — cần kỷ luật giữ của'
    },
    'Cự Môn': {
      should: ['Phát huy tài ăn nói và khả năng thuyết phục — đây là thế mạnh trời cho', 'Học cách giữ lời nói và không gây thị phi — cung này xấu thì sẽ vướng khẩu thiệt', 'Chọn nghề luật sư, nhà báo, giáo viên, nghiên cứu — cần môi trường có tri thức', 'Nói ít lại — cung này xấu thì sẽ bị ghét vì khẩu thiệt'],
      avoid: ['Đừng gây thị phi và khẩu thiệt — cung này xấu thì sẽ mất thanh danh', 'Tránh quyết định cảm tính — cung này xấu thì dễ phạm sai lầm', 'Đừng bỏ qua lời khuyên của người khác — cung này xấu thì sẽ bị cô lập'],
      career: 'Hợp luật sư, nhà báo, giáo viên, nghiên cứu, tư vấn — cần môi trường có tri thức và tự do',
      health: 'Sức khỏe tốt nhưng cần chú ý thận và tiết niệu — sao Thủy chủ về mềm',
      finance: 'Tiền đến từ miệng lưỡi và tri thức — nhưng cũng dễ mất vì thị phi và khẩu thiệt'
    },
    'Thiên Tướng': {
      should: ['Phát huy khả năng quản lý và hành chính — đây là thế mạnh trời cho', 'Học cách có chính kiến và không bị lợi dụng — cung này xấu thì sẽ bị lợi dụng', 'Chọn nghề công chức, quản lý, hành chính — cần môi trường có kỷ luật', 'Phát triển ý tưởng riêng — cung này xấu thì sẽ bị phụ thuộc người khác'],
      avoid: ['Đừng thiếu chủ kiến và bị lợi dụng — cung này xấu thì sẽ mất tất cả', 'Tránh quyết định cảm tính — cung này xấu thì dễ bị lợi dụng lòng tốt', 'Đừng bỏ qua cơ hội — cung này xấu thì sẽ mãn nguyện với hiện tại'],
      career: 'Hợp công chức, quản lý, hành chính, phụ tá — cần môi trường có kỷ luật và ổn định',
      health: 'Sức khỏe tốt nhưng cần chú ý thận và tiết niệu — sao Thủy chủ về mềm',
      finance: 'Tiền đến từ quản lý và hành chính — nhưng cũng dễ mất vì thiếu chủ kiến'
    },
    'Thiên Lương': {
      should: ['Phát huy lòng từ thiện và khả năng che chở — đây là thế mạnh trời cho', 'Học cách đặt giới hạn và không bị lợi dụng — cung này xấu thì sẽ bị lợi dụng lòng tốt', 'Chọn nghề y dược, tôn giáo, giáo dục, từ thiện — cần môi trường có lòng tốt', 'Giữ gìn sức khỏe — cung này xấu thì sẽ bị gánh vác quá nhiều'],
      avoid: ['Đừng bị lợi dụng lòng tốt — cung này xấu thì sẽ mất tất cả', 'Tránh quyết định cảm tính — cung này xấu thì dễ bị lợi dụng', 'Đừng bỏ qua sức khỏe — cung này xấu thì sẽ bị kiệt sức vì lo cho người khác'],
      career: 'Hợp y dược, tôn giáo, giáo dục, từ thiện, quản lý — cần môi trường có lòng tốt',
      health: 'Sức khỏe tốt nhưng cần chú ý dạ dày và tiêu hóa — sao Thổ chủ về ổn định',
      finance: 'Tiền đến từ đức và lòng tốt — nhưng cũng dễ mất vì quá cho đi'
    },
    'Thất Sát': {
      should: ['Phát huy tính quyết đoán và độc lập — đây là thế mạnh trời cho', 'Học cách hợp tác và không độc đoán — cung này xấu thì sẽ bị cô lập', 'Chọn nghề tướng lĩnh, doanh nhân, quân đội, thể thao — cần môi trường có thử thách', 'Kiên nhẫn và không nóng vội — cung này xấu thì sẽ bị phá phách chi phối'],
      avoid: ['Đừng độc đoán và cô độc — cung này xấu thì sẽ mất lòng người', 'Tránh quyết định cảm tính — cung này xấu thì dễ phạm sai lầm', 'Đừng bỏ qua lời khuyên của người khác — cung này xấu thì sẽ bị cô lập'],
      career: 'Hợp tướng lĩnh, doanh nhân, quân đội, thể thao — cần môi trường có thử thách và tự do',
      health: 'Sức khỏe tốt nhưng cần chú ý phổi và hô hấp — sao Kim chủ về cứng',
      finance: 'Tiền đến từ quyết đoán và độc lập — nhưng cũng dễ mất vì quá liều'
    },
    'Phá Quân': {
      should: ['Phát huy khả năng khai phá và biến động — đây là thế mạnh trời cho', 'Học cách ổn định và không phá hoại — cung này xấu thì sẽ mất tất cả', 'Chọn nghề doanh nhân, cách mạng, kinh doanh, bất động sản — cần môi trường có biến động', 'Kiên nhẫn và không nóng vội — cung này xấu thì sẽ bị phá phách chi phối'],
      avoid: ['Đừng phá hoại và biến động — cung này xấu thì sẽ mất tất cả', 'Tránh quyết định cảm tính — cung này xâu thì dễ phạm sai lầm', 'Đừng bỏ qua kỷ luật — cung này xấu thì sẽ bị biến động lôi kéo'],
      career: 'Hợp doanh nhân, cách mạng, kinh doanh, bất động sản — cần môi trường có biến động và tự do',
      health: 'Sức khỏe tốt nhưng cần chú ý thận và tiết niệu — sao Thủy chủ về mềm',
      finance: 'Tiền đến từ khai phá và biến động — nhưng cũng dễ mất vì quá liều'
    },
  };

  /* ============ API ============ */
  window.ZiweiDeep = {
    PALACE_DEEP: PALACE_DEEP,
    PALACE_ACTION: PALACE_ACTION,
    STAR_ACTION: STAR_ACTION,
  };
})();
