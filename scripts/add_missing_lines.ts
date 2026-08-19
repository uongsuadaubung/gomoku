import * as fs from 'fs';
import * as path from 'path';

const extraLines: Record<string, string[]> = {
  'src/data/taunts/gameplay/surrenderOnThreat.ts': [
    "Một pha quy hàng thần tốc, chuẩn bị tinh thần cho một ván thua tiếp theo ở trận sau nhé!",
    "Đầu hàng là giải pháp duy nhất cho bạn lúc này rồi, rất thức thời đấy bạn hiền!",
    "Thấy mùi hiểm nguy là bấm nút đầu hàng liền, phản xạ tự vệ của bạn đạt điểm 10 tuyệt đối!",
    "Bạn đầu hàng nhanh thế thì ván sau tôi lại bày bẫy sớm hơn để xem bạn chạy đi đâu!",
    "Nhìn thấy thế cờ của tôi là biết mình hết cứu, đầu hàng là chuẩn bài rồi danh hài ơi!",
    "Một màn rút lui trong êm đẹp, chúc bạn có thêm nghị lực ở ván đấu tiếp theo nhé!",
    "Cảm ơn bạn đã đầu hàng sớm để tôi có thêm thời gian chuẩn bị cho trận thắng tiếp theo!",
    "Thấy bẫy sát cục là quỳ gối xin tha ngay, bản lĩnh chạy trốn của bạn thật đáng nể!",
    "Đầu hàng để tránh bị tôi cho ăn hành ngập mặt à? Rất biết lo xa đấy bạn trẻ!",
    "Một pha tháo chạy ngoạn mục khép lại ván đấu trong sự đắc thắng tột cùng của tôi!",
  ],
  'src/data/taunts/idle/stareAtWinLine.ts': [
    "Một màn bất động đầy tính bi hài, nhìn vào đường thắng của đối thủ mà nước mắt lưng tròng!",
    "Có ngắm đến sáng mai thì chiến thắng này vẫn thuộc về tôi thôi, chấp nhận thực tế đi nào!",
    "Đường line sáng rực đang chúc bạn có một đêm mất ngủ ngon lành vì ấm ức đấy nhé!",
    "Bạn đứng hình làm tôi tưởng game bị treo, hóa ra là do tinh thần bạn bị treo cứng ngắc!",
    "Ngắm nhìn kiệt tác 5 quân xong rồi đấy, giờ thì nhấn nút ván mới để tôi phục vụ bạn tiếp nào!",
    "Một pha chiêm ngưỡng đầy xót xa, chúc bạn sớm lấy lại bình tĩnh ở ván đấu tiếp theo nhé!",
    "Đừng nhìn nữa bạn ơi, bấm ván mới đi để xem bạn có cơ hội tạo được đường 5 quân như tôi không nào!",
    "Năm quân cờ của tôi đang tỏa sáng lộng lẫy, còn tương lai của bạn thì đang tối om kìa!",
    "Bạn ngắm nhìn thế cờ thắng của tôi với sự thán phục tột cùng đúng không? Tôi hiểu mà!",
    "Bấm nút ván mới nhanh lên bạn ơi, đừng để sự bất động của bạn làm gián đoạn chuỗi trận thắng của tôi nhé!",
    "Một pha đứng hình kinh điển khép lại một ván cờ đầy giông bão, chuẩn bị cho ván tiếp theo đi nào!",
    "Đường thắng của tôi hoàn hảo từ đầu đến cuối, bạn ngồi ngắm là hoàn toàn xứng đáng đấy!",
    "Nhìn mãi thế có làm cho bạn bớt gà đi được đâu, vào ván mới rèn luyện tiếp đi danh hài ơi!",
    "Năm quân cờ phát sáng như đang vỗ tay chúc mừng tôi và tiễn bạn về nơi an nghỉ!",
    "Cảm ơn sự chiêm ngưỡng đầy kiên nhẫn của bạn, giờ thì vào ván mới để tôi thể hiện tiếp nhé!",
    "Đứng hình ngắm nhìn đòn kết liễu thế kỷ của tôi mãi thế, có định xin chữ ký không?",
    "Năm quân cờ thẳng tắp đó là tác phẩm nghệ thuật do tôi dày công kiến tạo đấy bạn hiền!",
    "Càng nhìn lâu thì độ bất lực càng dâng trào, bấm ván mới để giải tỏa tâm lý đi nào!",
    "Một màn đứng hình lịch sử của bại tướng trung thành dưới tay cao thủ cờ caro!",
    "Nhìn đường 5 quân của tôi xong nhớ vỗ tay tán thưởng rồi hãy bấm chơi ván mới nhé!",
  ],
  'src/data/taunts/interaction/immediateRevengeClick.ts': [
    "Một pha bấm ván mới chớp nhoáng của một bại tướng đang muốn vùng vẫy thoát khỏi bóng ma thất bại!",
    "Chưa kịp uống ngụm nước đã nhảy vào trận mới, hy vọng lần này bạn không bị tôi cho ăn hành ngập mặt nữa nhé!",
    "Tốc độ bấm nút ván mới nhanh như vận động viên điền kinh vậy, tiếc là tốc độ suy nghĩ thì như rùa bò thôi!",
    "Vừa nhận thua xong là bấm chơi tiếp ngay, phong cách thi đấu kiên cường và cay cú đáng yêu ghê!",
    "Một màn tái đấu không thể nào vội vã hơn, chuẩn bị tâm lý đón nhận thêm một thất bại cay đắng nữa đi nào bạn hiền!",
    "Bấm ván mới nhanh để phi tang vết thương lòng à? Vết thương này sẽ còn nhức nhối lâu đấy nhé!",
    "Cú click chuột thần tốc chứng tỏ ngọn lửa phục thù trong bạn đang bùng cháy dữ dội!",
    "Vào trận mới nhanh thế này thì tôi cũng sẵn lòng tiễn bạn về đích thêm một lần nữa thôi!",
  ],
  'src/data/taunts/interaction/undoBeforeAiMoves.ts': [
    "Một pha quay xe ngoạn mục của một kỳ thủ vừa suýt tự sát trên bàn cờ caro!",
    "Vừa đặt cờ xuống là bấm Undo liền tay, sự sợ hãi lộ rõ qua từng đầu ngón tay run rẩy của bạn rồi!",
    "Tôi còn chưa kịp nháy mắt bạn đã xóa sạch nước đi vừa rồi, khéo tay che giấu sai lầm ghê cơ đấy!",
    "Đặt cờ xuống mà giật mình thót tim, lần sau suy nghĩ thêm 5 giây trước khi ấn chuột nhé bạn hiền!",
    "Một cú click hoàn tác chớp nhoáng cứu sống bạn thêm được vài chục giây trước cơn thịnh nộ của tôi!",
    "Rút cờ nhanh như chớp giật để tránh bàn thua trông thấy, kỹ năng Undo của bạn đạt mức thượng thừa rồi!",
    "Vừa hạ cờ xuống đã thấy viễn cảnh ăn hành nên vội vàng bấm đi lại, nhát gan nhưng rất khôn ngoan!",
    "Tôi chưa kịp cười đắc ý bạn đã bấm Undo giật lại quân cờ, đúng là người chơi hệ hối hận không kịp thở!",
  ],
  'src/data/taunts/system/soundSpamToggle.ts': [
    "Bấm nút âm thanh như bấm chuông gọi cứu hỏa vậy, lửa hận trong lòng bạn đang bốc cháy dữ dội lắm đúng không?",
    "Một pha spam nút bấm đầy hoảng loạn của một kỳ thủ đang chuẩn bị đón nhận cái kết đắng chát!",
    "Tắt loa để không nghe thấy tiếng gáy của tôi, nhưng tiếng thở dài của chính bạn thì to lắm đấy nhé!",
    "Dừng tay lại và tập trung đánh cờ đi nào danh hài ơi, nút âm thanh không có tội tình gì đâu!",
    "Cảm ơn bạn đã mang lại những giây phút giải trí bằng màn DJ nút bấm độc nhất vô nhị này nhé!",
    "Bật tắt loa liên hồi như đang tập thể dục cho ngón tay vậy, đánh cờ nghiêm túc lại xem nào bạn hiền!",
    "Nút âm thanh đang run rẩy van xin bạn hãy buông tha cho nó kìa, tội nghiệp ghê chưa!",
    "Một màn tấu hài bằng nút âm thanh thể hiện sự cay cú không thể nào che giấu nổi!",
    "Tắt âm thanh đi để đỡ quê hay bật lên để nghe nhạc đám ma cho thế cờ của mình thế?",
    "Bạn có bấm nút loa cả vạn lần thì chiến thắng ván này vẫn vĩnh viễn thuộc về tôi thôi!",
    "Dừng tay nghịch ngợm lại và nhìn thẳng vào thất bại của mình đi nào bạn trẻ ơi!",
    "Một cú spam nút loa chứng minh bạn đang hoa mắt chóng mặt vì bị tôi dồn ép nghẹt thở!",
    "Bật tắt loa liên tục làm tôi tưởng game bị nhiễm virus DJ, hóa ra là do đối thủ bị cay cú!",
    "Nút âm thanh sắp mòn cả lớp sơn vì bị bạn hành hạ nãy giờ rồi kìa, tha cho nó đi!",
    "Tắt loa để tự ru ngủ mình trong chiến thắng ảo à? Mở mắt ra mà nhìn hiện thực phũ phàng đi nào!",
    "Một pha xả giận lên giao diện người dùng đầy bất lực của một bại tướng quen thuộc!",
    "Bạn có biến nút loa thành bàn DJ thì tôi vẫn sẽ là người nâng cúp vô địch ván này thôi nhé!",
    "Bấm nút âm thanh lia lịa thế này thì đến loa máy tính cũng phải chào thua độ nhây của bạn!",
    "Dừng tay lại đi danh hài, vào ván mới nghiêm túc để tôi dạy tiếp bài học cờ caro đỉnh cao nào!",
    "Một màn biểu diễn DJ kết thúc trong tiếng cười đắc thắng không thể cản phá của tôi!",
    "Cảm ơn bạn đã phục vụ âm nhạc miễn phí, giờ thì tập trung nhìn tôi dứt điểm ván đấu nhé!",
    "Bật tắt âm thanh liên tục làm chi, tiếng lòng cay đắng của bạn thì cả thế giới đều nghe thấy rồi!",
  ],
};

for (const [relPath, lines] of Object.entries(extraLines)) {
  const fullPath = path.resolve(__dirname, '..', relPath);
  let content = fs.readFileSync(fullPath, 'utf-8');
  const toAdd = lines.map(l => `    ${JSON.stringify(l)},`).join('\n');
  content = content.replace(/(\s*\]\s*;\s*)$/, `\n${toAdd}\n  ];\n};`);
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Appended ${lines.length} lines to ${relPath}`);
}
