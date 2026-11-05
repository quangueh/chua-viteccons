/* ============================================================
 * KHO VĂN LUẬN GIẢI TỬ VI — tiếng Việt chuyên sâu
 * Dùng bởi ziwei.js → palaceDetail(). Mỗi cung click vào hiện
 * bài luận giải dài (tối thiểu ~1 trang A4).
 * ============================================================ */
(function () {
  'use strict';

  /* Lĩnh vực cung — để chọn đoạn luận theo sao */
  var DOMAIN = {
    'Mệnh': 'self', 'Phúc Đức': 'self', 'Tật Ách': 'self',
    'Phu Thê': 'rel', 'Tử Tức': 'rel', 'Huynh Đệ': 'rel', 'Nô Bộc': 'rel', 'Phụ Mẫu': 'rel',
    'Tài Bạch': 'mat', 'Điền Trạch': 'mat',
    'Quan Lộc': 'car', 'Thiên Di': 'car'
  };

  /* ============ 12 CUNG — luận giải nền chuyên sâu ============ */
  var PALACE_LONG = {
    'Mệnh': `Cung Mệnh là "bản mệnh" — cung quan trọng nhất của lá số, đại diện cho chính con người bạn: tính cách gốc, dung mạo, khí chất, cách ứng xử với đời và hướng phát triển cả cuộc đời. Sao tọa thủ cung Mệnh quyết định bạn là người chủ động hay tùy duyên, cương hay nhu, thực tế hay mộng mơ.\n\nKhi luận cung Mệnh cần nhìn tổng thể tam phương tứ chính: bản cung, cung đối (Thiên Di), hai cung tam hợp. Mệnh mạnh nhờ được tam hợp chiếu từ nhiều cung tốt thì dù chính tinh có hơi kém vẫn phát triển thuận; ngược lại Mệnh bị xung phá từ nhiều phía thì tính cách và vận đời dễ gặp trắc trở.\n\nCung Mệnh cũng là gốc để suy ra các cung khác — phúc đức là nơi tâm trí nương tựa, tài bạch là nguồn lực, quan lộc là sân khấu thể hiện. Vì vậy luận Mệnh phải đặt trong bối cảnh toàn lá số chứ không đọc riêng lẻ.`,

    'Phụ Mẫu': `Cung Phụ Mẫu luận về cha mẹ, người lớn tuổi, cấp trên trực tiếp và cả nền tảng gia đình mà bạn thừa hưởng. Đây cũng là cung chỉ hoàn cảnh thời thơ ấu, sự che chở và kỳ vọng mà gia đình đặt lên bạn.\n\nSao tốt miếu vượng tại đây cho thấy được cha mẹ nuôi dưỡng đầy đủ, có người lớn dìu dắt, nền tảng vững để bước vào đời. Sao kỵ hãm hoặc bị hình kỵ xung phá cho thấy thời thơ ấu có thiếu thốn về tình cảm hoặc vật chất, quan hệ với cha mẹ có khoảng cách, hoặc bạn phải tự lập sớm.\n\nĐặc biệt cung này còn phản ánh cách bạn đối diện với quyền uy — người có Phụ Mẫu tốt thường tôn trọng cấp trên và dễ được nâng đỡ trong tổ chức; cung xấu dễ xung đột với người lớn, khó chịu sự ràng buộc.`,

    'Phúc Đức': `Cung Phúc Đức là cung của tâm linh, phúc phần, đời sống tinh thần và khả năng hưởng thụ. Nó cho biết bạn tìm niềm vui ở đâu — ở vật chất, ở gia đình, ở tri thức hay ở tĩnh lặng tu hành — và mức độ "trời cho" phúc khí của đời này.\n\nSao tốt tại Phúc Đức cho tâm hồn an lạc, ít lo âu, biết đủ và biết buông; đây là cung rất quan trọng với người tu đạo vì nó quyết định nghiệp thiện có thành tựu hay không. Sao xấu (đặc biệt Kỵ, Không Kiếp) cho thấy tâm hay bất an, khó ngủ, dễ trầm cảm hoặc phải trải qua nhiều kiếp nạn tinh thần trước khi tìm được an lạc.\n\nPhúc Đức cũng là nơi "báo trước" vận đời: phúc hậu thì đại hạn dù xấu cũng đỡ đau; phúc bạc thì may mắn khó giữ.`,

    'Điền Trạch': `Cung Điền Trạch luận về nhà cửa, đất đai, bất động sản, tổ ấm và cả môi trường sống lâu dài. Nó trả lời câu hỏi: bạn có tích lũy được tài sản cố định không, có an cư lập nghiệp được không, gia đình có êm ấm không.\n\nSao tốt, nhất là Thiên Phủ, Thiên Lương, Tử Vi miếu vượng, cho khả năng sở hữu nhà đất, vườn rộng ao sâu, gia đình ổn định. Sao xấu hoặc cung bị Không Kiếp phá cho thấy nhà cửa hay dời đổi, khó an cư, hoặc tài sản dễ thất thoát, hay phải đi thuê nhà.\n\nCung này cũng luận về "ruộng phần" — nền tảng vật chất mà đời sau hưởng: người có Điền Trạch tốt thường để lại cơ nghiệp cho con cháu; cung xấu thì của cải khó giữ qua thế hệ.`,

    'Quan Lộc': `Cung Quan Lộc là cung sự nghiệp, công danh, địa vị xã hội và con đường lập thân. Đây là cung "sân khấu" cho thấy bạn tỏa sáng ở đâu: kinh doanh, công chức, nghệ thuật, kỹ thuật hay nghiên cứu — và leo cao được đến đâu.\n\nSao tốt miếu vượng tại đây cho sự nghiệp hanh thông, dễ thăng tiến, được cấp trên tin cậy. Sao kỵ hoặc bị xung phá cho thấy sự nghiệp nhiều trắc trở, hay đổi việc, khó giữ chức vụ, hoặc phải tự lập nghiệp muộn.\n\nQuan Lộc phải xem cùng cung Mệnh (năng lực) và cung Tài Bạch (nguồn thu): Quan Lộc tốt mà Tài Bạch yếu thì danh nhiều hơn lợi; cả hai cùng tốt mới là phú quý song toàn.`,

    'Nô Bộc': `Cung Nô Bộc (còn gọi cung Giao Hữu) luận về bạn bè, người dưới quyền, cộng sự, và cả những mối quan hệ ngang hàng trong xã hội. Đây là cung phản ánh bạn "vận hành" trong tập thể ra sao và thu hút được loại người nào vào đời.\n\nSao tốt tại đây cho bạn có nhiều bạn bè tốt, được cấp dưới trung thành, dễ hợp tác và có quý nhân ngang hàng nâng đỡ. Sao xấu cho thấy dễ gặp tiểu nhân, bạn bè phản bội, cấp dưới bất trung, hoặc bị lợi dụng trong quan hệ đối tác.\n\nCung này cũng phản ánh khả năng "dùng người": Nô Bộc tốt thì giao việc cho người khác hiệu quả, công việc nhẹ nhàng; Nô Bộc xấu thì phải ôm đồm tự làm, hay bị người khác lừa gạt.`,

    'Thiên Di': `Cung Thiên Di luận về việc ra ngoài, di chuyển, đổi môi trường sống, và cách bạn thể hiện bản thân trước người ngoài. Nó là "cái tôi xã hội" — khác với Mệnh là con người thật, Thiên Di là hình ảnh bạn để lại trong mắt thiên hạ.\n\nSao tốt tại Thiên Di cho vận may khi ra ngoài, dễ được người lạ giúp đỡ, có tiếng tăm tốt, hợp đi xa, buôn bán, xuất ngoại. Sao xấu cho thấy ra ngoài hay gặp chuyện, dễ bị hiểu lầm, hoặc phải chịu áp lực khi tiếp xúc môi trường mới.\n\nThiên Di cũng là cung đối của Mệnh — hai cung này chiếu nhau, nên sao tốt ở Thiên Di sẽ "cứu" cho Mệnh yếu, và ngược lại.`,

    'Tật Ách': `Cung Tật Ách luận về sức khỏe, thể chất, bệnh tật, tai ương và cả những "bệnh" tinh thần, tâm lý. Nó cho biết bạn sinh ra với thể trạng nào, hay mắc bệnh gì, và phải giữ gìn sức khỏe thế nào.\n\nSao tốt miếu vượng tại đây cho sức khỏe dẻo dai, ít bệnh, khả năng tự chữa tốt, thọ cao. Sao xấu — đặc biệt Kỵ, Không Kiếp, hoặc chính tinh hung hãm — cho thấy thể chất yếu, hay đau ốm, cần đề phòng bệnh theo hành của sao tọa thủ.\n\nCung này cũng luận tai nạn: Tật Ách bị xung phá mạnh dễ gặp tai nạn bất ngờ, phẫu thuật, hoặc bệnh mạn tính. Người tu nên xem cung này để biết phần sức khỏe mình cần bổ khuyết.`,

    'Tài Bạch': `Cung Tài Bạch luận về tiền bạc, tài lộc, nguồn thu nhập và cách bạn kiếm, giữ, tiêu tiền. Đây là cung trả lời: bạn kiếm tiền bằng cách nào, có giữ được không, và tiền bạc có làm bạn hạnh phúc hay lo lắng.\n\nSao tốt — nhất là Vũ Khúc, Thiên Phủ, Liêm Trinh miếu vượng — cho khả năng kiếm tiền tốt, tài chính vững, biết tích lũy. Sao xấu hoặc Kỵ tọa thủ cho thấy tiền bạc hay thất thoát, khó giữ lộc, hoặc phải vất vả lắm mới có được đồng tiền.\n\nTài Bạch phải xem cùng Quan Lộc (nghề sinh tiền) và Điền Trạch (nơi giữ tiền): Tài Bạch tốt mà Điền Trạch xấu thì tiền về tay nhưng khó mua được tài sản; cả hai cùng tốt mới là giàu có bền vững.`,

    'Tử Tức': `Cung Tử Tức luận về con cái, khả năng sinh sản, và cả những "đứa con tinh thần" — tác phẩm sáng tạo, dự án, di sản tinh thần mà bạn để lại.\n\nSao tốt tại đây cho con cái hiếu thảo, đông đúc, có năng khiếu; người không con cũng có nhiều sản phẩm sáng tạo, học trò, hoặc công trình để đời. Sao xấu cho thấy ít con, con cái không như ý, hoặc khó khăn trong việc "sinh thành" ý tưởng và tác phẩm.\n\nCung này còn phản ánh thế hệ kế tiếp: Tử Tức tốt thì hậu vận có người nối nghiệp; Tử Tức xấu thì phải tự làm đến cùng, ít người kế thừa.`,

    'Phu Thê': `Cung Phu Thê luận về hôn nhân, người phối ngẫu, tình duyên và cả các mối quan hệ đối tác thân mật. Đây là cung cho biết bạn sẽ lấy được người như thế nào, hôn nhân êm hay sóng gió, và tình duyên đến lúc nào.\n\nSao tốt miếu vượng — nhất là Thiên Phủ, Thiên Lương, Thái Âm, Tử Vi — cho phối ngẫu tốt, hôn nhân bền, được người bạn đời nâng đỡ. Sao xấu hoặc Kỵ, Không Kiếp phá cho thấy hôn nhân trắc trở, dễ ly dị, hoặc phải kết hôn muộn, lấy người không hợp.\n\nCung này cũng luận quan hệ nam nữ nói chung: Phu Thê tốt thì duyên tình thuận, dễ gặp người thương; Phu Thê xấu thì tình cảm hay giằng co, khó giữ.`,

    'Huynh Đệ': `Cung Huynh Đệ luận về anh chị em ruột, bạn bè thân thiết thời thơ ấu, và cả những mối quan hệ ngang hàng thời niên thiếu. Đây là cung phản ánh bạn có được nâng đỡ bởi người cùng thế hệ không.\n\nSao tốt tại đây cho anh chị em hòa thuận, có người san sẻ, thời thơ ấu êm ấm, dễ có bạn tri kỷ. Sao xấu cho thấy ít anh chị em, hoặc quan hệ với họ xa cách, ghen tị, tranh chấp; cũng có thể phản ánh tuổi thơ thiếu vắng tình bạn.\n\nCung này cũng liên quan đến cách bạn đối xử với người ngang hàng lúc trưởng thành — Huynh Đệ tốt thì dễ hợp tác, Huynh Đệ xấu thì hay ganh đua, đố kỵ với đồng nghiệp bạn bè cùng lứa.`,
  };

  /* ============ 14 CHÍNH TINH — bản chất sâu ============ */
  var STAR_LONG = {
    'Tử Vi': `Tử Vi là Đế Tinh — sao của quyền quý, sự tôn nghiêm và khả năng lãnh đạo bẩm sinh. Người có Tử Vi miếu vượng thường có khí chất quý phái, độc lập, tự trọng, không chịu khuất phục, và có bản năng chỉ huy, tổ chức thiên hạ.\n\nTử Vi thích được người khác phụng sự nhưng bản thân lại khó phục tùng — đây là sao "vừa là vua vừa muốn làm tôi". Vì vậy người Tử Vi mạnh cần học cách lắng nghe, còn người Tử Vi yếu dễ trở nên kiêu ngạo, cô độc, khó gần.\n\nTử Vi thuộc hành Thổ, chủ về sự ổn định, vững chãi. Khi được nhiều sao tốt hội chiếu, đây là cách cục "quân vương" — phú quý song toàn; khi bị Không Kiếp hoặc Kỵ phá, dễ rơi vào cô độc, mất phương hướng, hoặc quyền lực bị lạm dụng.`,

    'Thiên Cơ': `Thiên Cơ là sao của trí tuệ, cơ mưu và sự biến hóa. Đây là sao "động" nhất trong 14 chính tinh — chủ về tư duy nhanh, khả năng phân tích, lập kế hoạch, và cũng là sao hay thay đổi, hay nghi ngờ, khó yên.\n\nNgười Thiên Cơ miếu vượng có đầu óc sắc bén, giỏi tính toán, học nhanh, hợp làm việc trí tuệ, nghiên cứu, chiến lược. Nhưng cũng dễ đa nghi, thay đổi thất thường, khó quyết đoán dứt khoát vì luôn thấy nhiều phương án.\n\nThiên Cơ thuộc hành Mộc — sinh sôi, phát triển. Cần có sao ổn định (Thiên Phủ, Tử Vi) chế hóa mới phát huy hết trí tuệ mà không bị loạn động. Hãm địa thì thành mưu sĩ đa nghi, hay tính kế người, khó thành đại sự.`,

    'Thái Dương': `Thái Dương là sao của ánh sáng, nhiệt huyết và danh tiếng. Đây là sao chủ về sự rộng lượng, quang minh, khả năng chiếu sáng cho người khác, hợp làm quan lộc, từ thiện, giáo dục, hoặc bất cứ việc gì cần "ánh sáng" và "sức nóng".\n\nNgười Thái Dương miếu vượng có tinh thần lạc quan, hào phóng, được nhiều người kính trọng, dễ thành danh. Nhưng cũng hay lo nghĩ cho người khác quên mình, dễ bị "cháy" vì quá nhiệt huyết.\n\nThái Dương thuộc hành Hỏa — bốc lên, rực rỡ nhưng cũng dễ tàn. Miếu vượng ban ngày (Mão, Ngọ) thì sáng, hãm địa ban đêm (Dậu, Tuất) thì mờ — người Thái Dương hãm dễ bị che khuất tài năng, vất vả vì danh tiếng.`,

    'Vũ Khúc': `Vũ Khúc là sao của tài chính, sự cương nghị và tính quyết đoán. Đây là sao "thực" nhất — chủ về tiền bạc, tài sản, khả năng hành động dứt khoát, và cũng là sao của người ít nói nhưng làm nhiều.\n\nNgười Vũ Khúc miếu vượng có tài chính tốt, biết kiếm tiền, quyết đoán, không ủy mị, hợp làm kinh doanh, tài chính, kỹ thuật. Nhưng cũng cứng nhắc, ít mềm dẻo, khó biểu đạt tình cảm, dễ cô độc vì quá thực tế.\n\nVũ Khúc thuộc hành Kim — sắc bén, cứng rắn. Cần sao nhu (Thiên Đồng, Thái Âm) chế hóa bớt cứng. Miếu vượng thì giàu có danh tiếng, hãm địa thì tiền bạc hay thất thoát, tính tình khó gần.`,

    'Thiên Đồng': `Thiên Đồng là sao của phúc khí, sự ôn hòa và khả năng hưởng thụ. Đây là sao "dễ chịu" nhất — chủ về sự an nhàn, duyên phận, ít tranh đấu, và cũng là sao của người hay ỷ lại, lười biếng, hưởng thụ quá độ.\n\nNgười Thiên Đồng miếu vượng có cuộc sống an lành, ít sóng gió, được hưởng phúc, hợp làm việc nhẹ nhàng, chăm sóc, dịch vụ. Nhưng cũng dễ bị ỷ lại, thiếu chí tiến thủ, mãn nguyện với hiện tại.\n\nThiên Đồng thuộc hành Thủy — mềm mại, chảy xuôi. Cần sao mạnh (Vũ Khúc, Thất Sát) thúc đẩy mới có chí. Miếu vượng thì phúc thọ, hãm địa thì ỷ lại, hưởng thụ vô độ, dễ bị lợi dụng.`,

    'Liêm Trinh': `Liêm Trinh là sao của tài nghệ, sự tinh tế và cũng là sao của thị phi, hình tù. Đây là sao "đa năng" — chủ về khả năng nghệ thuật, chính trị, quan lộc, nhưng cũng là sao dễ vướng thị phi, dễ bị ghen ghét, hay gặp thị phi pháp lý.\n\nNgười Liêm Trinh miếu vượng có tài nghệ xuất chúng, khéo léo, tham chính trị được, hợp làm nghệ sĩ, chính trị gia, doanh nhân. Nhưng cũng hay bị thị phi, ganh ghét, hoặc phải trải qua kiện tụng, tù tội nếu không giữ được mình.\n\nLiêm Trinh thuộc hành Hỏa — sắc sảo, tinh tế nhưng cũng dễ cháy. Cần sao ổn định chế hóa. Miếu vượng thì quyền quý, hãm địa thì thị phi, hình thương, hoặc tài nghệ bị chôn vùi.`,

    'Thiên Phủ': `Thiên Phủ là sao của kho tàng, sự ổn trọng và khả năng tích lũy. Đây là sao "kho" — chủ về tài sản, điền sản, khả năng giữ của, và cũng là sao của người an phận, bảo thủ, ít mạo hiểm.\n\nNgười Thiên Phủ miếu vượng có tài chính vững, biết tích lũy, giữ của giỏi, hợp làm quản lý tài sản, ngân hàng, bất động sản. Nhưng cũng bảo thủ, ít đổi mới, dễ mãn nguyện với hiện tại.\n\nThiên Phủ thuộc hành Thổ — vững chãi, bao dung. Đây là sao "đỡ" cho nhiều sao khác, nhưng bản thân nó cần sao mạnh thúc đẩy mới phát triển. Miếu vượng thì phú quý, hãm địa thì giữ của không tốt, hay bị lừa đảo.`,

    'Thái Âm': `Thái Âm là sao của nhu mỹ, sự giàu sang và khả năng tích lũy điền sản. Đây là sao "mềm" nhất — chủ về sắc đẹp, sự tinh tế, khả năng làm giàu từ điền sản, và cũng là sao của người hay lo nghĩ, đa sầu đa cảm.\n\nNgười Thái Âm miếu vượng có nhan sắc, phong thái, giàu sang từ từ, hợp làm nghệ sĩ, nhà thiết kế, hoặc kinh doanh điền sản. Nhưng cũng hay lo âu, đa nghi, khó quyết đoán vì quá tinh tế.\n\nThái Âm thuộc hành Thủy — nhu nhược, sâu sắc. Miếu vượng ban đêm (Tý, Sửu, Dần) thì giàu có, hãm địa ban ngày (Ngọ, Mùi) thì mờ nhạt. Cần sao mạnh chế hóa mới phát huy.`,

    'Tham Lang': `Tham Lang là sao của dục vọng, tài năng và cũng là sao của đào hoa, thị phi. Đây là sao "đa năng" nhất — chủ về nhiều năng khiếu, ham học hỏi, ham vui chơi, và cũng là sao của người dễ sa đọa, ham mê, thị phi tình ái.\n\nNgười Tham Lang miếu vượng có nhiều tài năng, đa dạng sở thích, duyên người tốt, hợp làm nghệ sĩ, kinh doanh, hoặc bất cứ việc gì cần "đa năng". Nhưng cũng dễ ham mê, dễ sa đọa, hay vướng thị phi tình ái.\n\nTham Lang thuộc hành Mộc — sinh sôi, phát triển nhưng cũng dễ lan man. Cần sao ổn định chế hóa dục vọng. Miếu vượng thì giàu sang đa năng, hãm địa thì sa đọa, thị phi, hoặc tài năng bị lãng phí.`,

    'Cự Môn': `Cự Môn là sao của khẩu thiệt, sự tranh luận và khả năng thuyết phục. Đây là sao "miệng" — chủ về khả năng ăn nói, tranh luận, nghiên cứu, luật pháp, và cũng là sao của người hay gây thị phi, khẩu thiệt, thị phi pháp lý.\n\nNgười Cự Môn miếu vượng có tài ăn nói, giỏi tranh luận, hợp làm luật sư, nhà báo, giáo viên, nghiên cứu. Nhưng cũng hay gây thị phi, khẩu thiệt, hoặc phải trải qua kiện tụng nếu không giữ được lời nói.\n\nCự Môn thuộc hành Thủy — sâu sắc, thuyết phục nhưng cũng dễ ngập. Cần sao ổn định chế hóa khẩu thiệt. Miếu vượng thì học thuật, hãm địa thì khẩu thiệt, thị phi, hoặc tài năng bị chôn vùi.`,

    'Thiên Tướng': `Thiên Tướng là sao của phụ tá, sự hành chính và khả năng cân bằng. Đây là sao "trợ" — chủ về khả năng phụ tá, quản lý, hành chính, và cũng là sao của người hay bị lợi dụng, thiếu chủ kiến, dễ theo người khác.\n\nNgười Thiên Tướng miếu vượng có khả năng quản lý, hành chính tốt, hợp làm công chức, quản lý, hoặc phụ tá cho người tài giỏi. Nhưng cũng thiếu chủ kiến, dễ bị lợi dụng, hoặc phải sống nhờ người khác.\n\nThiên Tướng thuộc hành Thủy — mềm mại, cân bằng. Cần sao mạnh thúc đẩy mới có chủ kiến. Miếu vượng thì quan lộc vững, hãm địa thì bị lợi dụng, thiếu tự chủ.`,

    'Thiên Lương': `Thiên Lương là sao của che chở, y dược và khả năng từ thiện. Đây là sao "bảo" — chủ về khả năng che chở người khác, y dược, tôn giáo, từ thiện, và cũng là sao của người hay lo cho người khác quên mình, dễ bị lợi dụng lòng tốt.\n\nNgười Thiên Lương miếu vượng có lòng từ thiện, hợp làm y dược, tôn giáo, giáo dục, hoặc bất cứ việc gì cần "che chở". Nhưng cũng hay lo cho người khác quên mình, dễ bị lợi dụng, hoặc phải gánh vác quá nhiều.\n\nThiên Lương thuộc hành Thổ — vững chãi, bao dung. Miếu vượng thì phúc thọ, hãm địa thì bị lợi dụng lòng tốt, hoặc phải gánh vác quá nhiều.`,

    'Thất Sát': `Thất Sát là sao của quyết đoán, sự cô độc và khả năng cách mạng. Đây là sao "tướng" — chủ về khả năng quyết đoán, độc lập, cách mạng, và cũng là sao của người cô độc, phá phách, khó gần.\n\nNgười Thất Sát miếu vượng có khả năng quyết đoán, độc lập, hợp làm tướng lĩnh, doanh nhân, hoặc bất cứ việc gì cần "dứt khoát". Nhưng cũng cô độc, phá phách, khó gần, dễ bị hiểu lầm.\n\nThất Sát thuộc hành Kim — sắc bén, cứng rắn. Cần sao mềm chế hóa bớt cô độc. Miếu vượng thì uy quyền, hãm địa thì cô đơn, phá phách, hoặc tài năng bị lãng phí.`,

    'Phá Quân': `Phá Quân là sao của khai phá, sự biến động và khả năng phá cũ dựng mới. Đây là sao "phá" — chủ về khả năng khai phá, biến động, cách mạng, và cũng là sao của người hay phá hoại, biến động, khó ổn định.\n\nNgười Phá Quân miếu vượng có khả năng khai phá, biến động, hợp làm doanh nhân, cách mạng, hoặc bất cứ việc gì cần "phá cũ dựng mới". Nhưng cũng hay phá hoại, biến động, khó ổn định, dễ bị hiểu lầm.\n\nPhá Quân thuộc hành Thủy — sâu sắc, biến động. Cần sao ổn định chế hóa bớt phá hoại. Miếu vượng thì thành tựu lớn sau biến động, hãm địa thì phá hoại, biến động, hoặc tài năng bị lãng phí.`,
  };

  /* ============ Phụ tinh — ý nghĩa ngắn ============ */
  var MINOR_INFO = {
    'Tả Phù': 'Tả Phù — quý nhân bên trái, người giúp đỡ, sự nâng đỡ từ người khác',
    'Hữu Bật': 'Hữu Bật — quý nhân bên phải, người phụ tá, sự nâng đỡ từ người khác',
    'Văn Xương': 'Văn Xương — văn tinh, khả năng văn chương, thi cử, học thuật',
    'Văn Khúc': 'Văn Khúc — khúc tinh, khả năng nghệ thuật, âm nhạc, thi ca',
    'Thiên Khôi': 'Thiên Khôi — quý tinh, người quý phái, sự nâng đỡ từ trên',
    'Thiên Việt': 'Thiên Việt — việt tinh, người phụ tá, sự nâng đỡ từ dưới',
    'Lộc Tồn': 'Lộc Tồn — lộc tinh, khả năng tích lũy, giữ của',
    'Thiên Mã': 'Thiên Mã — mã tinh, di chuyển, thay đổi, đi xa',
    'Kình Dương': 'Kình Dương — dương tinh, sự cương nghị, quyết đoán, cũng là sao hung',
    'Đà La': 'Đà La — la tinh, sự trì trệ, chậm chạp, cũng là sao hung',
    'Hỏa Tinh': 'Hỏa Tinh — hỏa tinh, sự nóng nảy, quyết đoán, cũng là sao hung',
    'Linh Tinh': 'Linh Tinh — linh tinh, sự linh hoạt, quyết đoán, cũng là sao hung',
    'Địa Không': 'Địa Không — không tinh, sự trống rỗng, mất mát, cũng là sao hung',
    'Địa Kiếp': 'Địa Kiếp — kiếp tinh, sự mất mát, cướp đoạt, cũng là sao hung',
    'Hồng Loan': 'Hồng Loan — đào hoa tinh, duyên tình, hôn nhân',
    'Thiên Hỷ': 'Thiên Hỷ — hỷ tinh, niềm vui, hạnh phúc',
    'Quả Tú': 'Quả Tú — tú tinh, sự tinh tế, thẩm mỹ',
    'Thiên Đức': 'Thiên Đức — đức tinh, sự từ thiện, phúc đức',
    'Nguyệt Đức': 'Nguyệt Đức — đức tinh, sự từ thiện, phúc đức',
    'Tam Thai': 'Tam Thai — tam tinh, sự ổn định, phúc đức',
    'Bát Tọa': 'Bát Tọa — tọa tinh, sự ổn định, phúc đức',
    'Ân Quang': 'Ân Quang — ân tinh, sự ân huệ, phúc đức',
    'Thiên Quý': 'Thiên Quý — quý tinh, sự quý phái, phúc đức',
    'Đường Phù': 'Đường Phù — phù tinh, sự bình an, phúc đức',
    'Phong Cáo': 'Phong Cáo — cáo tinh, sự thông suốt, phúc đức',
    'Thiên Hình': 'Thiên Hình — hình tinh, sự hình phạt, thị phi',
    'Thiên Nguyệt': 'Thiên Nguyệt — nguyệt tinh, sự biến động, thị phi',
    'Cô Thần': 'Cô Thần — cô tinh, sự cô độc, lẻ loi',
    'Thiên Khốc': 'Thiên Khốc — khốc tinh, sự đau khổ, thị phi',
    'Thiên Hư': 'Thiên Hư — hư tinh, sự trống rỗng, mất mát',
  };

  /* ============ Độ sáng — ý nghĩa ============ */
  var BRIGHT_LONG = {
    'Miếu': 'Miếu địa — sao đạt cực điểm, phát huy tối đa sức mạnh, tính cách và vận mệnh đều tốt',
    'Vượng': 'Vượng địa — sao rất mạnh, phát huy tốt, vận mệnh thuận lợi',
    'Đắc': 'Đắc địa — sao phát huy tốt, vận mệnh ổn định',
    'Lợi': 'Lợi địa — sao phát huy trung bình, vận mệnh bình thường',
    'Bình': 'Bình địa — sao phát huy trung bình, vận mệnh bình thường',
    'Bất': 'Bất địa — sao phát huy kém, vận mệnh có trở ngại',
    'Nhàn': 'Nhàn địa — sao phát huy kém, vận mệnh có trở ngại',
    'Hãm': 'Hãm địa — sao đạt cực điểm xấu, tính cách và vận mệnh đều xấu',
    'Địa': 'Địa địa — sao phát huy kém, vận mệnh có trở ngại',
  };

  /* ============ Tứ hóa — ý nghĩa ============ */
  var SIHUA_LONG = {
    'Hóa Lộc': 'Hóa Lộc — sao này được hóa thành sao Lộc, chủ về tài lộc, hưởng thụ, sự phát triển',
    'Hóa Quyền': 'Hóa Quyền — sao này được hóa thành sao Quyền, chủ về quyền lực, sự quyết đoán, sự kiểm soát',
    'Hóa Khoa': 'Hóa Khoa — sao này được hóa thành sao Khoa, chủ về danh tiếng, sự nổi tiếng, sự công nhận',
    'Hóa Kỵ': 'Hóa Kỵ — sao này được hóa thành sao Kỵ, chủ về thị phi, sự trở ngại, sự mất mát',
  };

  /* ============ Cung không — mượn sao ============ */
  var EMPTY_PALACE_TEXT = `Cung này không có chính tinh tọa thủ (cung không) — vận mệnh của cung này phải "mượn" sao từ cung đối diện để luận. Điều này có nghĩa là phương diện đời sống này ít chủ kiến riêng, dễ bị ảnh hưởng bởi môi trường bên ngoài, nhưng cũng có thể phát triển tốt nếu được cung đối chiếu tốt.`;

  /* ============ Lời khuyên theo cung ============ */
  var PALACE_ADVICE = {
    'Mệnh': 'Lời khuyên: Hãy phát huy điểm mạnh của chính tinh tọa thủ, đồng thời học cách chế hóa điểm yếu. Cung Mệnh mạnh thì hãy dùng trí tuệ để lãnh đạo, cung Mệnh yếu thì hãy học cách phục tùng và hợp tác.',
    'Phụ Mẫu': 'Lời khuyên: Hãy tôn trọng cha mẹ và người lớn, nhưng cũng đừng để kỳ vọng của họ đè nặng lên mình. Cung này tốt thì hãy dùng nó để nâng đỡ người khác, cung này xấu thì hãy học cách tự lập.',
    'Phúc Đức': 'Lời khuyên: Hãy chăm sóc tâm linh và phúc phần của mình. Cung này tốt thì hãy dùng nó để tu hành và giúp người, cung này xấu thì hãy học cách an lạc và buông bỏ.',
    'Điền Trạch': 'Lời khuyên: Hãy tích lũy tài sản và xây dựng tổ ấm. Cung này tốt thì hãy dùng nó để an cư lập nghiệp, cung này xấu thì hãy học cách giữ gìn và không tham lam.',
    'Quan Lộc': 'Lời khuyên: Hãy phát triển sự nghiệp và công danh. Cung này tốt thì hãy dùng nó để thăng tiến, cung này xấu thì hãy học cách kiên nhẫn và không nản chí.',
    'Nô Bộc': 'Lời khuyên: Hãy xây dựng quan hệ tốt với bạn bè và người dưới quyền. Cung này tốt thì hãy dùng nó để hợp tác và giúp đỡ, cung này xấu thì hãy học cách đề phòng tiểu nhân.',
    'Thiên Di': 'Lời khuyên: Hãy ra ngoài và trải nghiệm thế giới. Cung này tốt thì hãy dùng nó để phát triển và mở rộng, cung này xấu thì hãy học cách thích nghi và không sợ thay đổi.',
    'Tật Ách': 'Lời khuyên: Hãy chăm sóc sức khỏe và phòng bệnh. Cung này tốt thì hãy dùng nó để rèn luyện và giữ gìn, cung này xấu thì hãy học cách sống điều độ và không lạm dụng.',
    'Tài Bạch': 'Lời khuyên: Hãy quản lý tiền bạc và tài chính. Cung này tốt thì hãy dùng nó để tích lũy và đầu tư, cung này xấu thì hãy học cách tiết kiệm và không tham lam.',
    'Tử Tức': 'Lời khuyên: Hãy chăm sóc con cái và sáng tạo. Cung này tốt thì hãy dùng nó để nuôi dạy và sáng tạo, cung này xấu thì hãy học cách chấp nhận và không ép buộc.',
    'Phu Thê': 'Lời khuyên: Hãy xây dựng hôn nhân và tình duyên. Cung này tốt thì hãy dùng nó để vun đắp và giữ gìn, cung này xấu thì hãy học cách tha thứ và không ghen tuông.',
    'Huynh Đệ': 'Lời khuyên: Hãy duy trì quan hệ tốt với anh chị em và bạn bè. Cung này tốt thì hãy dùng nó để san sẻ và giúp đỡ, cung này xấu thì hãy học cách tha thứ và không ganh đua.',
  };

  /* ============ Góc nhìn sao theo lĩnh vực cung ============
   * self = Mệnh/Phúc Đức/Tật Ách • rel = Phu Thê/Tử Tức/Huynh Đệ/Nô Bộc/Phụ Mẫu
   * mat  = Tài Bạch/Điền Trạch • car = Quan Lộc/Thiên Di */
  var STAR_DOMAIN = {
    'Tử Vi': {
      self: 'Tại cung bản thân, Tử Vi cho khí chất quý phái, tự trọng, có bản năng lãnh đạo và ghét bị sai khiến. Người này hợp vai trò chủ trì, quyết sách; cần học cách lắng nghe để không thành độc đoán.',
      rel: 'Tại cung quan hệ, Tử Vi chủ về các mối quan hệ có tính chất "đế vương" — bạn muốn là người quyết định trong gia đình/đối tác. Hợp người biết tôn trọng và phụng sự; kỵ người thích tranh quyền.',
      mat: 'Tại cung vật chất, Tử Vi chủ về tài sản lớn, điền sản rộng, khả năng giữ của bền. Tiền đến từ địa vị và quyền lực hơn là buôn bán nhỏ; cần kiên nhẫn tích lũy lâu dài.',
      car: 'Tại cung sự nghiệp/di chuyển, Tử Vi cho địa vị cao, được kính trọng, hợp lãnh đạo, quản trị, chính trị. Ra ngoài có uy tín; nhưng dễ bị ghen ghét vì khí chất quá mạnh.'
    },
    'Thiên Cơ': {
      self: 'Tại cung bản thân, Thiên Cơ cho đầu óc nhanh, ham học, giỏi phân tích và lập kế hoạch. Điểm yếu là hay thay đổi ý kiến, đa nghi, khó yên — cần rèn tính kiên định.',
      rel: 'Tại cung quan hệ, Thiên Cơ cho mối quan hệ nhiều tính toán, ít bộc trực. Bạn dễ phân tích người khác hơn là yêu thương chân thành; cần học cách tin tưởng đơn giản.',
      mat: 'Tại cung vật chất, Thiên Cơ cho khả năng kiếm tiền bằng trí tuệ — kinh doanh, môi giới, phân tích, tư vấn. Tiền đến nhanh nhưng cũng đi nhanh nếu thiếu kỷ luật giữ của.',
      car: 'Tại cung sự nghiệp, Thiên Cơ hợp nghề trí tuệ: kỹ sư, phân tích, chiến lược, giáo dục, IT. Hay đổi việc hoặc đổi hướng; cần một lĩnh vực đủ sâu để phát huy.'
    },
    'Thái Dương': {
      self: 'Tại cung bản thân, Thái Dương cho tinh thần lạc quan, hào phóng, được nhiều người quý mến. Bạn là kiểu người "mặt trời" — sưởi ấm cho người khác nhưng cũng dễ kiệt sức vì cho đi quá nhiều.',
      rel: 'Tại cung quan hệ, Thái Dương cho duyên tình tốt, được người khác giới mến mộ vì nhiệt tình. Trong gia đình bạn là người hay gánh vác, che chở; cần học cách nhận lại sự chăm sóc.',
      mat: 'Tại cung vật chất, Thái Dương cho khả năng kiếm tiền nhờ danh tiếng và sự rộng lượng — hợp nghề giáo dục, y tế, từ thiện, quản lý. Tiền đến từ "ánh sáng" cá nhân.',
      car: 'Tại cung sự nghiệp, Thái Dương hợp nghề cần danh tiếng và sự công khai: giáo dục, truyền thông, luật, chính trị, kinh doanh lớn. Miếu vượng thì vang danh, hãm thì bị che khuất.'
    },
    'Vũ Khúc': {
      self: 'Tại cung bản thân, Vũ Khúc cho tính cách cương nghị, ít nói, quyết đoán, thực tế. Bạn làm nhiều hơn nói, ghét sự mơ hồ; cần học cách mềm dẻo trong giao tiếp để không bị coi là cứng nhắc.',
      rel: 'Tại cung quan hệ, Vũ Khúc cho mối quan hệ thẳng thắn, ít hoa mỹ, trọng thực tế hơn tình cảm. Bạn ít biểu lộ yêu thương nhưng hành động thay lời nói; dễ bị hiểu lầm là lạnh lùng.',
      mat: 'Tại cung vật chất, Vũ Khúc là sao tài chính số một — giỏi kiếm tiền, quản lý tiền, đầu tư. Nhưng cũng hay mất vì quá tin vào con số, cần sao mềm chế hóa tính cứng.',
      car: 'Tại cung sự nghiệp, Vũ Khúc hợp tài chính, ngân hàng, kỹ thuật, thương mại, quân đội. Quyết đoán nhanh, làm việc thực tế; cần tránh độc đoán và cô lập đồng nghiệp.'
    },
    'Thiên Đồng': {
      self: 'Tại cung bản thân, Thiên Đồng cho tính cách ôn hòa, dễ chịu, ít tranh đấu, biết hưởng thụ. Điểm yếu là ỷ lại, thiếu chí tiến thủ — cần sao mạnh thúc đẩy mới thành đại sự.',
      rel: 'Tại cung quan hệ, Thiên Đồng cho mối quan hệ êm ả, ít xung đột, bạn là người biết chiều chuộng và được chiều chuộng. Nhưng cũng dễ bị lợi dụng lòng tốt nếu không biết từ chối.',
      mat: 'Tại cung vật chất, Thiên Đồng cho khả năng kiếm tiền ổn định nhưng không lớn — lương, dịch vụ, nghề nhẹ nhàng. Tiền đến đều nhưng ít khi đột phá; cần kỷ luật đầu tư.',
      car: 'Tại cung sự nghiệp, Thiên Đồng hợp nghề nhẹ nhàng, chăm sóc, dịch vụ, giáo dục, y tế. Ít tham vọng quyền lực nhưng được lòng người; cần đặt mục tiêu rõ để không mãn nguyện.'
    },
    'Liêm Trinh': {
      self: 'Tại cung bản thân, Liêm Trinh cho tài nghệ đa dạng, sự tinh tế và khát khao hoàn mỹ. Bạn có năng khiếu nghệ thuật/chính trị nhưng cũng dễ vướng thị phi nếu không giữ được mình.',
      rel: 'Tại cung quan hệ, Liêm Trinh cho mối quan hệ phức tạp, nhiều thị phi, ghen ghét. Bạn thu hút người khác nhưng cũng dễ bị đố kỵ; cần chọn lọc bạn bè và giữ khoảng cách đúng mức.',
      mat: 'Tại cung vật chất, Liêm Trinh cho khả năng kiếm tiền từ tài nghệ và quan hệ — nghệ thuật, chính trị, kinh doanh nhạy cảm. Tiền đến từ "tài" hơn là "sức"; cần tránh đường tắt mờ ám.',
      car: 'Tại cung sự nghiệp, Liêm Trinh hợp nghệ thuật, chính trị, quản lý, kinh doanh có yếu tố sáng tạo. Miếu vượng thì quyền quý, hãm thì thị phi pháp lý — cần giữ thanh danh sạch.'
    },
    'Thiên Phủ': {
      self: 'Tại cung bản thân, Thiên Phủ cho tính cách ổn trọng, bao dung, biết giữ của, ít mạo hiểm. Bạn là kiểu người đáng tin, nhưng cũng bảo thủ, khó thay đổi thói quen đã có.',
      rel: 'Tại cung quan hệ, Thiên Phủ cho mối quan hệ bền vững, trọng nghĩa khí, biết vun đắp lâu dài. Bạn là người đáng tin trong gia đình và bạn bè; nhưng đôi khi quá cứng nhắc trong nguyên tắc.',
      mat: 'Tại cung vật chất, Thiên Phủ là sao kho tàng — giỏi tích lũy, giữ của, quản lý tài sản. Tiền đến từ điền sản, tích trữ, đầu tư dài hạn; hợp nghề ngân hàng, bất động sản, quản trị.',
      car: 'Tại cung sự nghiệp, Thiên Phủ hợp quản lý, hành chính, tài chính, bất động sản. Vững vàng, đáng tin nhưng ít đột phá; cần sao mạnh thúc đẩy mới phát triển nhanh.'
    },
    'Thái Âm': {
      self: 'Tại cung bản thân, Thái Âm cho nhan sắc, phong thái, sự tinh tế và khả năng cảm nhận sâu sắc. Bạn là kiểu người "nguyệt" — dịu dàng, giàu sang từ từ, nhưng cũng hay lo nghĩ, đa nghi.',
      rel: 'Tại cung quan hệ, Thái Âm cho duyên tình tốt, được người khác giới mến mộ vì dịu dàng và tinh tế. Trong gia đình bạn là người chu đáo, hay lo lắng cho người thân; cần học cách tin tưởng.',
      mat: 'Tại cung vật chất, Thái Âm cho khả năng làm giàu từ điền sản, thẩm mỹ, nghệ thuật — hợp nghề thiết kế, bất động sản, kinh doanh tinh tế. Tiền đến từ "phẩm" hơn là "lượng".',
      car: 'Tại cung sự nghiệp, Thái Âm hợp nghệ thuật, thiết kế, bất động sản, giáo dục, y tế. Miếu vượng ban đêm thì giàu có, hãm ban ngày thì mờ nhạt — cần môi trường phù hợp để phát huy.'
    },
    'Tham Lang': {
      self: 'Tại cung bản thân, Tham Lang cho tính cách đa năng, ham học hỏi, ham vui chơi, nhiều năng khiếu. Bạn là kiểu người "không biết đủ" — luôn muốn khám phá, nhưng cũng dễ sa đọa nếu không có định hướng.',
      rel: 'Tại cung quan hệ, Tham Lang cho mối quan hệ phức tạp, nhiều đào hoa, thị phi tình ái. Bạn thu hút người khác nhưng cũng dễ vướng lụy tình; cần học cách tiết chế dục vọng.',
      mat: 'Tại cung vật chất, Tham Lang cho khả năng kiếm tiền đa dạng — kinh doanh, nghệ thuật, môi giới, giải trí. Tiền đến từ "đa năng" nhưng cũng dễ thất thoát vì ham mê; cần kỷ luật giữ của.',
      car: 'Tại cung sự nghiệp, Tham Lang hợp nghệ thuật, giải trí, kinh doanh đa ngành, giáo dục. Miếu vượng thì giàu sang đa năng, hãm thì sa đọa, thị phi — cần định hướng rõ ràng.'
    },
    'Cự Môn': {
      self: 'Tại cung bản thân, Cự Môn cho tài ăn nói, khả năng tranh luận và thuyết phục. Bạn là kiểu người "miệng" — giỏi phân tích, nghiên cứu, nhưng cũng hay gây thị phi nếu không giữ được lời nói.',
      rel: 'Tại cung quan hệ, Cự Môn cho mối quan hệ nhiều tranh luận, thị phi, ghen ghét. Bạn thu hút người khác bằng tài ăn nói nhưng cũng dễ bị ghét vì khẩu thiệt; cần học cách nói ít lại.',
      mat: 'Tại cung vật chất, Cự Môn cho khả năng kiếm tiền từ miệng lưỡi — luật sư, nhà báo, giáo viên, tư vấn, nghiên cứu. Tiền đến từ "khẩu" nhưng cũng dễ mất vì thị phi; cần giữ thanh danh.',
      car: 'Tại cung sự nghiệp, Cự Môn hợp luật sư, nhà báo, giáo viên, nghiên cứu, tư vấn. Miếu vượng thì học thuật, hãm thì khẩu thiệt, thị phi — cần chọn nghề phù hợp với tài ăn nói.'
    },
    'Thiên Tướng': {
      self: 'Tại cung bản thân, Thiên Tướng cho tính cách phụ tá, cân bằng, thiếu chủ kiến. Bạn là kiểu người "trợ" — giỏi quản lý, hành chính, nhưng cũng dễ bị lợi dụng nếu không có chính kiến.',
      rel: 'Tại cung quan hệ, Thiên Tướng cho mối quan hệ phụ tá, cân bằng, ít xung đột. Bạn là người biết chiều chuộng và được chiều chuộng; nhưng cũng dễ bị lợi dụng lòng tốt nếu không biết từ chối.',
      mat: 'Tại cung vật chất, Thiên Tướng cho khả năng quản lý tiền bạc, tài sản — hợp nghề ngân hàng, quản lý, hành chính. Tiền đến từ "quản" nhưng cũng dễ mất vì thiếu chủ kiến; cần học cách quyết đoán.',
      car: 'Tại cung sự nghiệp, Thiên Tướng hợp công chức, quản lý, hành chính, phụ tá. Vững vàng, đáng tin nhưng ít đột phá; cần sao mạnh thúc đẩy mới phát triển nhanh.'
    },
    'Thiên Lương': {
      self: 'Tại cung bản thân, Thiên Lương cho lòng từ thiện, khả năng che chở và sự bao dung. Bạn là kiểu người "bảo" — hay lo cho người khác, nhưng cũng dễ bị lợi dụng lòng tốt nếu không biết từ chối.',
      rel: 'Tại cung quan hệ, Thiên Lương cho mối quan hệ che chở, từ thiện, ít xung đột. Bạn là người hay gánh vác cho người khác; nhưng cũng dễ bị lợi dụng nếu không biết đặt giới hạn.',
      mat: 'Tại cung vật chất, Thiên Lương cho khả năng kiếm tiền từ y dược, tôn giáo, giáo dục, từ thiện — hợp nghề cần "che chở". Tiền đến từ "đức" nhưng cũng dễ mất vì quá cho đi; cần học cách giữ gìn.',
      car: 'Tại cung sự nghiệp, Thiên Lương hợp y dược, tôn giáo, giáo dục, từ thiện, quản lý. Miếu vượng thì phúc thọ, hãm thì bị lợi dụng lòng tốt — cần chọn nghề phù hợp với lòng từ thiện.'
    },
    'Thất Sát': {
      self: 'Tại cung bản thân, Thất Sát cho tính cách quyết đoán, độc lập, cô độc, phá phách. Bạn là kiểu người "tướng" — dứt khoát, không khuất phục, nhưng cũng khó gần và dễ bị hiểu lầm.',
      rel: 'Tại cung quan hệ, Thất Sát cho mối quan hệ độc lập, ít phụ thuộc, nhiều xung đột. Bạn thu hút người khác bằng khí chất mạnh nhưng cũng dễ bị ghét vì quá cứng; cần học cách mềm dẻo.',
      mat: 'Tại cung vật chất, Thất Sát cho khả năng kiếm tiền bằng quyết đoán và độc lập — kinh doanh, đầu tư, quân đội. Tiền đến từ "sức" nhưng cũng dễ mất vì quá liều; cần kỷ luật giữ của.',
      car: 'Tại cung sự nghiệp, Thất Sát hợp tướng lĩnh, doanh nhân, quân đội, thể thao. Miếu vượng thì uy quyền, hãm thì cô đơn, phá phách — cần học cách hợp tác và không độc đoán.'
    },
    'Phá Quân': {
      self: 'Tại cung bản thân, Phá Quân cho tính cách khai phá, biến động, phá cũ dựng mới. Bạn là kiểu người "phá" — dám nghĩ dám làm, nhưng cũng dễ phá hoại nếu không có định hướng.',
      rel: 'Tại cung quan hệ, Phá Quân cho mối quan hệ biến động, nhiều thay đổi, ít ổn định. Bạn thu hút người khác bằng sự mới mẻ nhưng cũng dễ bị ghét vì quá phá phách; cần học cách kiên nhẫn.',
      mat: 'Tại cung vật chất, Phá Quân cho khả năng kiếm tiền bằng khai phá và biến động — kinh doanh, đầu tư, bất động sản. Tiền đến từ "phá" nhưng cũng dễ mất vì quá liều; cần kỷ luật giữ của.',
      car: 'Tại cung sự nghiệp, Phá Quân hợp doanh nhân, cách mạng, kinh doanh, bất động sản. Miếu vượng thì thành tựu lớn sau biến động, hãm thì phá hoại, biến động — cần học cách ổn định.'
    },
  };

  /* ============ Cách cục thường gặp ============ */
  var COMBO_HINTS = {
    'Tử Vi': 'Tử Vi tọa Mệnh miếu vượng là cách "quân vương" — phú quý song toàn, có bản lĩnh lãnh đạo. Kỵ hãm hoặc bị Không Kiếp phá thì thành cô độc, kiêu ngạo, mất phương hướng.',
    'Thiên Cơ': 'Thiên Cơ tọa Mệnh miếu vượng là cách "trí tuệ" — thông minh, cơ mưu, giỏi phân tích. Hãm thì thành mưu sĩ đa nghi, hay thay đổi, khó thành đại sự.',
    'Thái Dương': 'Thái Dương tọa Mệnh miếu vượng là cách "quang minh" — danh tiếng, quan lộc, được kính trọng. Hãm thì bị che khuất tài năng, vất vả vì danh tiếng.',
    'Vũ Khúc': 'Vũ Khúc tọa Mệnh miếu vượng là cách "tài chính" — giàu có, quyết đoán, giỏi kinh doanh. Hãm thì tiền bạc hay thất thoát, tính tình khó gần.',
    'Thiên Đồng': 'Thiên Đồng tọa Mệnh miếu vượng là cách "phúc thọ" — an nhàn, hưởng phúc, ít tranh đấu. Hãm thì ỷ lại, hưởng thụ quá độ, thiếu chí tiến thủ.',
    'Liêm Trinh': 'Liêm Trinh tọa Mệnh miếu vượng là cách "tài nghệ" — quyền quý, nghệ thuật, chính trị. Hãm thì thị phi, hình thương, hoặc tài nghệ bị chôn vùi.',
    'Thiên Phủ': 'Thiên Phủ tọa Mệnh miếu vượng là cách "kho tàng" — phú quý, ổn trọng, biết tích lũy. Hãm thì giữ của không tốt, hay bị lừa đảo.',
    'Thái Âm': 'Thái Âm tọa Mệnh miếu vượng là cách "nguyệt tinh" — giàu sang, điền sản, nhan sắc. Hãm thì mờ nhạt, lo nghĩ, đa nghi.',
    'Tham Lang': 'Tham Lang tọa Mệnh miếu vượng là cách "đa năng" — giàu sang, nhiều tài năng, duyên người. Hãm thì sa đọa, thị phi, hoặc tài năng bị lãng phí.',
    'Cự Môn': 'Cự Môn tọa Mệnh miếu vượng là cách "học thuật" — giỏi ăn nói, nghiên cứu, luật pháp. Hãm thì khẩu thiệt, thị phi, hoặc tài năng bị chôn vùi.',
    'Thiên Tướng': 'Thiên Tướng tọa Mệnh miếu vượng là cách "phụ tá" — quan lộc vững, quản lý tốt, cân bằng. Hãm thì bị lợi dụng, thiếu tự chủ.',
    'Thiên Lương': 'Thiên Lương tọa Mệnh miếu vượng là cách "che chở" — phúc thọ, từ thiện, y dược. Hãm thì bị lợi dụng lòng tốt, hoặc phải gánh vác quá nhiều.',
    'Thất Sát': 'Thất Sát tọa Mệnh miếu vượng là cách "tướng tinh" — uy quyền, quyết đoán, cách mạng. Hãm thì cô đơn, phá phách, hoặc tài năng bị lãng phí.',
    'Phá Quân': 'Phá Quân tọa Mệnh miếu vượng là cách "khai phá" — thành tựu lớn sau biến động, doanh nhân. Hãm thì phá hoại, biến động, hoặc tài năng bị lãng phí.',
  };

  /* ============ API ============ */
  window.ZiweiTexts = {
    DOMAIN: DOMAIN,
    PALACE_LONG: PALACE_LONG,
    STAR_LONG: STAR_LONG,
    STAR_DOMAIN: STAR_DOMAIN,
    MINOR_INFO: MINOR_INFO,
    BRIGHT_LONG: BRIGHT_LONG,
    SIHUA_LONG: SIHUA_LONG,
    EMPTY_PALACE_TEXT: EMPTY_PALACE_TEXT,
    PALACE_ADVICE: PALACE_ADVICE,
    COMBO_HINTS: COMBO_HINTS,
  };
})();
