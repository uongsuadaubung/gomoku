import { BLACK, WHITE, EMPTY, type BoardMatrix } from '../../game/types';
import type { GuideChapter, GuideLesson } from './types';

// Helper tạo bàn cờ trống 15x15
export function createEmptyBoard(): BoardMatrix {
  return Array.from({ length: 15 }, () => Array(15).fill(EMPTY));
}

// Helper đặt quân cờ lên bàn cờ để tạo thế trận bài học
export function buildBoard(stones: Array<{ r: number; c: number; p: typeof BLACK | typeof WHITE }>): BoardMatrix {
  const board = createEmptyBoard();
  for (const s of stones) {
    board[s.r][s.c] = s.p;
  }
  return board;
}

export const GUIDE_CHAPTERS: GuideChapter[] = [
  // ==========================================
  // CHƯƠNG 1: KHỞI ĐẦU & NƯỚC CỜ ĐẦU TIÊN
  // ==========================================
  {
    id: 1,
    title: 'Chương 1: Khởi Đầu & Nước Cờ Đầu Tiên',
    vietnameseTitle: 'Khởi Đầu & Nước Cờ Đầu Tiên',
    badge: 'Nền Tảng',
    iconName: 'Compass',
    description: 'Hiểu rõ tại sao ô trung tâm H8 là vũ khí tối thượng của Đen, cách Trắng áp sát và nguyên tắc cự ly liên kết.',
    lessons: [
      {
        id: 'lesson_1_1',
        chapterId: 1,
        order: 1,
        title: 'Tâm Bàn Cờ (Tengen - H8)',
        subtitle: 'Vì sao nước đầu tiên luôn là trung tâm H8?',
        difficulty: 'beginner',
        durationMinutes: 2,
        description: 'Tâm bàn cờ (Tengen - H8) là giao điểm mạnh nhất với 8 hướng tỏa ra (2 ngang, 2 dọc, 4 chéo), tối đa hóa diện tích bành trướng.',
        coreConcepts: ['Trung tâm H8', '8 hướng kiểm soát', 'Quyền tiên cơ'],
        initialBoard: createEmptyBoard(),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Trong cờ Gomoku và Renju quốc tế, nước đi đầu tiên của quân Đen luôn luôn đặt tại tọa độ chính giữa bàn cờ H8 (tức hàng 8, cột H).\n\nTại sao lại như vậy?\n1. **8 Hướng Kiểm Soát**: Từ tâm cờ H8, bạn có 8 hướng phát triển tối đa (trên, dưới, trái, phải, và 4 đường chéo).\n2. **Bán Kính Bành Trướng**: Đặt ở tâm cờ H8 giúp bạn không bao giờ bị dồn vào góc hay chạm mép biên quá sớm.\n3. **Nếu đánh lệch tâm**: Bạn đã tự tước đi 50% sức mạnh tấn công và trao quyền kiểm soát cho đối phương!`,
        summaryTakeaway: 'Luôn luôn khai màn tại trung tâm H8 khi cầm quân Đen đi trước để tối đa hóa 8 hướng phát triển!',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Hãy đặt quân Đen đầu tiên vào chính giữa bàn cờ (tọa độ H8) để chiếm lĩnh thế trận!',
            initialBoard: createEmptyBoard(),
            playerColor: BLACK,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Nhìn vào tâm điểm có chấm sao ở chính giữa bàn cờ (tọa độ H8).',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Xuất sắc! Đặt tại H8 giúp quân Đen làm chủ 8 hướng chiến lược của toàn bộ bàn cờ.',
              },
              {
                row: 0,
                col: 0,
                quality: 'blunder',
                explanation: 'Đánh ở góc biên làm mất đi hoàn toàn 6 hướng phát triển, đối thủ sẽ dễ dàng phong tỏa bạn!',
                opponentResponse: { row: 7, col: 7 },
                opponentExplanation: 'Đối thủ lập tức chiếm trung tâm H8 và chiếm hoàn toàn thế chủ động ván cờ.'
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_1_2',
        chapterId: 1,
        order: 2,
        title: 'Nước Thứ 2 Của Trắng (Trực Tiếp vs Gián Tiếp)',
        subtitle: 'Cách quân Trắng giáp lá cà hoặc phân tán thế trận',
        difficulty: 'beginner',
        durationMinutes: 3,
        description: 'Khi Đen đã chiếm trung tâm H8, Trắng có 2 chiến thuật: Áp sát trực tiếp (Direct) hoặc Chặn chéo gián tiếp (Indirect).',
        coreConcepts: ['Khai cuộc Trực tiếp', 'Khai cuộc Gián tiếp', 'Hạn chế tầm với của Đen'],
        initialBoard: buildBoard([{ r: 7, c: 7, p: BLACK }]), // H8
        playerColor: WHITE,
        turnPlayer: WHITE,
        detailedArticle: `Khi Đen đã ở H8, Trắng chỉ có 2 nhóm nước đi hợp lý ở lượt thứ 2:\n1. **Trực tiếp (Direct - ví dụ I8 hoặc H9)**: Đứng sát sườn Đen theo chiều ngang hoặc dọc. Cách này lập tức chặn 1 hướng của Đen và chuẩn bị giao tranh trực diện.\n2. **Gián tiếp (Indirect - ví dụ I9 hoặc G7)**: Đứng chéo góc Đen. Cách này chặn đường chéo dài nhất của Đen và mở ra nhiều không gian linh hoạt cho Trắng.`,
        summaryTakeaway: 'Nước thứ 2 của Trắng phải đặt ngay sát Đen (trong vùng 3x3 quanh H8) để kiềm chế sức mạnh của Đen.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen vừa đánh ở H8. Hãy đặt quân Trắng sát cạnh Đen tại I8 để thực hiện Khai cuộc Trực tiếp!',
            initialBoard: buildBoard([{ r: 7, c: 7, p: BLACK }]), // H8
            playerColor: WHITE,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [{ row: 6, col: 7 }, { row: 6, col: 8 }, { row: 8, col: 8 }], // H9, I9, I7
            hint: 'Đặt ở ô liền kề bên phải quân Đen (tọa độ I8).',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Rất chuẩn! Bạn đã bịt ngay một đầu phát triển ngang của Đen và tạo thế khai cuộc Trực tiếp vững chắc tại I8.',
              },
              {
                row: 6,
                col: 8,
                quality: 'good',
                explanation: 'Tốt! Đánh tại I9 là Khai cuộc Gián tiếp, phong tỏa đường chéo huyết mạch của Đen.',
              },
              {
                row: 3,
                col: 3,
                quality: 'blunder',
                explanation: 'Đánh quá xa tâm cờ khiến Đen tự do mở rộng thế trận ở trung tâm mà không gặp bất kỳ sự kháng cự nào!',
                opponentResponse: { row: 7, col: 8 },
                opponentExplanation: 'Đen dễ dàng mở rộng thế 2 quân kiểm soát hoàn toàn trung lộ.'
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_1_3',
        chapterId: 1,
        order: 3,
        title: 'Cự Ly & Sự Liên Kết (Connectivity)',
        subtitle: 'Nguyên tắc vàng: Quân không rời rạc!',
        difficulty: 'beginner',
        durationMinutes: 3,
        description: 'Mỗi quân cờ đặt xuống phải liên kết với các quân đồng minh (cách 1 ô liền kề hoặc 2 ô nhảy cóc) để hỗ trợ lẫn nhau.',
        coreConcepts: ['Liên kết quân cờ', 'Khoảng cách hiệu quả', 'Tránh quân cô lập'],
        initialBoard: buildBoard([
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: WHITE }, // I8
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Sai lầm phổ biến nhất của người mới là rải quân khắp bàn cờ mà không có sự liên kết.\n\nTrong Gomoku:\n- **Khoảng cách 1 ô (Liền kề)**: Tạo liên kết cứng, dễ dàng nâng lên 3 mở.\n- **Khoảng cách 2 ô (Nhảy cóc - Jump)**: Tạo thế linh hoạt, đe dọa điền vào giữa bất ngờ.\n- **Khoảng cách >= 3 ô**: Hoàn toàn cô lập, không thể phối hợp tạo thành chuỗi 5 quân kịp thời trước khi đối thủ kết liễu bạn!`,
        summaryTakeaway: 'Hãy luôn đặt quân trong bán kính 1 - 2 ô so với các quân cùng màu để tạo thành khối liên kết tấn công!',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Quân Đen đang có ở H8. Hãy đặt quân Đen tiếp theo tại H7 để tạo thành thế góc L liên kết vững chắc!',
            initialBoard: buildBoard([
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: WHITE }, // I8
            ]),
            playerColor: BLACK,
            targetMove: { row: 8, col: 7 }, // H7
            alternativeGoodMoves: [{ row: 6, col: 7 }, { row: 8, col: 6 }], // H9, G7
            hint: 'Đặt ở ô ngay dưới quân Đen trung tâm (tọa độ H7).',
            feedbacks: [
              {
                row: 8,
                col: 7,
                quality: 'best',
                explanation: 'Tuyệt vời! Hai quân Đen tại H8 và H7 liên kết vuông góc cực mạnh, chuẩn bị mở ra các đòn tấn công đa hướng.',
              },
              {
                row: 11,
                col: 11,
                quality: 'blunder',
                explanation: 'Quân cờ bị cô lập ở quá xa, không thể tương trợ cho trung tâm và để mất thế trận vào tay Trắng!',
                opponentResponse: { row: 8, col: 7 },
                opponentExplanation: 'Trắng lập tức chiếm vị trí then chốt H7 và chia cắt quân Đen.'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // CHƯƠNG 2: NHẬN DIỆN HÌNH THÁI ĐE DỌA
  // ==========================================
  {
    id: 2,
    title: 'Chương 2: Nhận Diện Hình Thái Đe Dọa',
    vietnameseTitle: 'Nhận Diện Hình Thái Đe Dọa',
    badge: 'Chiến Thuật Cơ Bản',
    iconName: 'Flame',
    description: 'Nắm vững phân biệt Nước 2 tiềm năng, Nước 3 Mở vs 3 Chặn, Nước 4 Mở vs 4 Chặn và đòn 3 Nhảy cóc nguy hiểm.',
    lessons: [
      {
        id: 'lesson_2_1',
        chapterId: 2,
        order: 1,
        title: 'Các Hình Thái Nước 2 Tiềm Năng (Live Two)',
        subtitle: 'Nghệ thuật ươm mầm thế cờ từ 2 quân mở',
        difficulty: 'beginner',
        durationMinutes: 3,
        description: 'Nước 2 mở là nền tảng của mọi đòn tấn công. Có 3 dạng: Liền kề ..XX.., Nhảy 1 ô ..X.X.. và Nhảy 2 ô ..X..X..',
        coreConcepts: ['Nước 2 Mở (Live 2)', 'Nhảy cóc tiềm năng', 'Ươm mầm thế trận'],
        initialBoard: buildBoard([
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 6, c: 8, p: WHITE }, // I9
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Trước khi có Nước 3 Mở, bạn phải biết cách tạo **Nước 2 Mở (Live Two)**:\n- **Dạng 1: ..XX.. (Liền kề)**: Hai quân dính liền, rất nhanh nâng cấp lên 3 mở nhưng đối thủ dễ nhìn thấy để chặn sớm.\n- **Dạng 2: ..X.X.. (Nhảy 1 ô)**: Hai quân cách nhau 1 ô trống. Đây là cấu trúc linh hoạt nhất vì bạn có thể điền vào giữa hoặc nối 2 đầu để tạo 3 mở bất ngờ!\n- **Dạng 3: ..X..X.. (Nhảy 2 ô)**: Mở rộng không gian cực rộng.\n\nCao thủ luôn rải các Nước 2 Mở đan xen nhau để chuẩn bị kích hoạt đòn bẫy kép ở giai đoạn tiếp theo!`,
        summaryTakeaway: 'Nước 2 nhảy cóc (.X.X.) là vũ khí gián tiếp nguy hiểm nhất vì đánh lừa sự chú ý của đối phương.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen đang có quân tại H8. Hãy đánh tại F8 (cách 1 ô) để tạo cấu trúc Nước 2 Nhảy Cóc linh hoạt!',
            initialBoard: buildBoard([
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 6, c: 8, p: WHITE }, // I9
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 5 }, // F8
            alternativeGoodMoves: [{ row: 7, col: 6 }, { row: 8, col: 7 }], // G8, H7
            hint: 'Đánh vào ô F8 (cách H8 một khoảng trống G8).',
            feedbacks: [
              {
                row: 7,
                col: 5,
                quality: 'best',
                explanation: 'Nước cờ tinh tế! Cấu trúc F8 - [G8 trống] - H8 tạo ra thế 2 mở nhảy cóc đe dọa biến thành 3 mở ở cả 3 điểm F8, G8, I8!',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_2_2',
        chapterId: 2,
        order: 2,
        title: 'Nước 3 Mở (Live Three / Open Three)',
        subtitle: 'Vũ khí tạo áp lực chiến lược mạnh nhất',
        difficulty: 'beginner',
        durationMinutes: 3,
        description: 'Nước 3 mở gồm 3 quân liên tiếp và còn trống ở CẢ HAI ĐẦU (.XXX.). Chỉ cần 1 nước là biến thành 4 mở 100% thắng!',
        coreConcepts: ['3 Mở (Live 3)', 'Trống 2 đầu', 'Nguy cơ chuyển hóa 4 mở'],
        initialBoard: buildBoard([
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 6, c: 8, p: WHITE }, // I9
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Nước 3 mở (.XXX.) là hình cờ tấn công cơ bản nhưng uy lực nhất:\n- Vì trống ở cả 2 đầu, nếu đối thủ không chặn ngay, lượt sau bạn sẽ đánh vào 1 trong 2 đầu để tạo thành **Nước 4 mở (.XXXX.)**.\n- Một khi đã có Nước 4 mở, đối thủ chỉ có thể chặn 1 đầu, đầu còn lại bạn sẽ điền đủ 5 quân và chiến thắng!\n- **Quy tắc**: Bất cứ khi nào đối phương tạo Nước 3 mở, bạn PHẢI CHẶN NGAY ở 1 trong 2 đầu trừ khi bạn có đòn sát cục thắng ngay!`,
        summaryTakeaway: 'Nước 3 mở đe dọa tạo 4 mở không thể đỡ. Luôn ưu tiên tạo 3 mở và chặn 3 mở của đối phương.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen đang có 2 quân ở G8 và H8. Hãy đánh vào I8 để tạo thành Nước 3 Mở hoàn hảo!',
            initialBoard: buildBoard([
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 5, c: 5, p: WHITE }, // F10
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [{ row: 7, col: 5 }], // F8
            hint: 'Đánh vào ô bên phải của hàng ngang tại I8 hoặc bên trái tại F8.',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Chính xác! Chuỗi 3 quân Đen F8-I8 hoàn toàn thông thoáng 2 đầu, ép Trắng phải đỡ ở lượt kế tiếp!',
              },
              {
                row: 8,
                col: 8,
                quality: 'passive',
                explanation: 'Nước đi này chưa tối ưu vì bỏ lỡ cơ hội hình thành 3 mở trực tiếp trên hàng 8.',
                opponentResponse: { row: 7, col: 8 },
                opponentExplanation: 'Trắng lập tức chặn mất hướng tấn công của bạn tại I8.'
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_2_3',
        chapterId: 2,
        order: 3,
        title: 'Nước 3 Bị Chặn (Sleeping Three / Dead Three)',
        subtitle: 'Nhận biết 3 quân bị bịt 1 đầu để không lãng phí nước đi',
        difficulty: 'beginner',
        durationMinutes: 3,
        description: 'Khi 3 quân bị đối thủ chặn 1 đầu (OXXX.), nó không thể tự biến thành 4 mở. Cần biết lúc nào nên tiếp tục và lúc nào nên chuyển hướng.',
        coreConcepts: ['3 Bị Chặn (Sleeping 3)', 'Đe dọa thứ cấp', 'Chuyển hướng tấn công'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: WHITE }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: BLACK }, // I8
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Khác với Nước 3 Mở, Nước 3 Bị Chặn (OXXX.) chỉ còn 1 đầu mở:\n- Nếu bạn đánh tiếp vào đầu mở còn lại, bạn chỉ tạo ra **Nước 4 Bị Chặn (OXXXX.)**.\n- Đối thủ chỉ việc đặt quân vào đầu còn lại là triệt tiêu hoàn toàn chuỗi này của bạn.\n- Vì vậy, người chơi giỏi không bao giờ đơn độc kéo dài nước 3 bị chặn nếu nó không kết hợp với một đường tấn công khác (đòn bẫy kép 4-3)!`,
        summaryTakeaway: 'Nước 3 bị chặn không tự thắng được. Đừng vội kéo dài nó một cách vô nghĩa nếu không tạo ra đòn kép!',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Hàng ngang 8 của Đen đã bị Trắng chặn ở F8. Thay vì đâm đầu đánh tiếp J8, hãy phát triển nước 3 mở MỚI theo đường dọc tại H9!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: WHITE }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: BLACK }, // I8
              { r: 8, c: 7, p: BLACK }, // H7
            ]),
            playerColor: BLACK,
            targetMove: { row: 6, col: 7 }, // H9
            alternativeGoodMoves: [],
            hint: 'Đánh vào ô H9 để tạo thành nước 3 mở dọc nguy hiểm trên cột H.',
            feedbacks: [
              {
                row: 6,
                col: 7,
                quality: 'best',
                explanation: 'Tuyệt đỉnh! Bạn không lãng phí nước đi vào hàng ngang bị chặn mà kiến tạo ngay Nước 3 Mở dọc H7-H9 cực kỳ hiểm hóc.',
              },
              {
                row: 7,
                col: 9,
                quality: 'passive',
                explanation: 'Đánh J8 chỉ tạo nước 4 bị chặn, Trắng chỉ cần đặt quân vào là chặn đứng bạn một cách dễ dàng.',
                opponentResponse: { row: 6, col: 7 },
                opponentExplanation: 'Trắng vừa chặn bạn vừa chiếm luôn điểm then chốt H9 đường dọc!'
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_2_4',
        chapterId: 2,
        order: 4,
        title: 'Nước 4 Mở (Live Four) vs Nước 4 Bị Chặn',
        subtitle: 'Phân biệt đòn kết liễu 100% thắng và nước ép nhịp',
        difficulty: 'beginner',
        durationMinutes: 3,
        description: 'Nước 4 mở (.XXXX.) đảm bảo chiến thắng không thể cản phá. Nước 4 bị chặn (OXXXX.) dùng để ép đối thủ đi nước phòng thủ.',
        coreConcepts: ['4 Mở (Live 4)', '4 Bị Chặn (Single 4)', 'Đòn kết liễu'],
        initialBoard: buildBoard([
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: BLACK }, // I8
          { r: 5, c: 5, p: WHITE }, // F10
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Nước 4 mở (.XXXX.) là trạng thái tối thượng trong Gomoku:\n- Hai đầu đều trống, tức là có tới 2 ô để tạo thành 5 quân liên tiếp.\n- Vì mỗi lượt đối thủ chỉ được đi 1 quân, họ chặn đầu này thì bạn đánh đầu kia để thắng ngay lập tức!\n- Bất kỳ khi nào tạo được Nước 4 mở, ván đấu coi như kết thúc với chiến thắng thuộc về bạn.`,
        summaryTakeaway: 'Nước 4 mở là đích đến của mọi chuỗi tấn công: một khi xuất hiện, chiến thắng là 100%!',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen đang có Nước 3 mở ở hàng 8 (G8-H8-I8). Hãy đánh vào J8 để tạo thành Nước 4 Mở kết liễu ván đấu!',
            initialBoard: buildBoard([
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: BLACK }, // I8
              { r: 4, c: 4, p: WHITE }, // E11
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 9 }, // J8
            alternativeGoodMoves: [{ row: 7, col: 5 }], // F8
            hint: 'Đánh vào 1 trong 2 đầu còn trống của hàng 8 (tọa độ J8 hoặc F8).',
            feedbacks: [
              {
                row: 7,
                col: 9,
                quality: 'best',
                explanation: 'Chiến thắng tuyệt đối! Nước 4 mở xuất hiện tại J8, đối thủ không thể nào chặn được cả 2 đầu F8 và K8 cùng một lúc.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_2_5',
        chapterId: 2,
        order: 5,
        title: 'Nước 3 Nhảy Cóc (Jump Three - X.XX / XX.X)',
        subtitle: 'Đòn biến ảo đánh lừa thị giác',
        difficulty: 'intermediate',
        durationMinutes: 3,
        description: 'Nước 3 nhảy cóc có lỗ hổng ở giữa, khiến đối thủ ít chú ý nhưng uy lực tương đương nước 3 mở thông thường.',
        coreConcepts: ['3 Nhảy cóc', 'Điền vào chỗ trống', 'Đánh lừa thị giác'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: BLACK }, // I8
          { r: 9, c: 9, p: WHITE }, // J6
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Nước 3 nhảy cóc là hình thái gồm 3 quân có 1 khoảng trống ở giữa:\n- Dạng 1: **X.XX** (Quân - Trống - Quân - Quân)\n- Dạng 2: **XX.X** (Quân - Quân - Trống - Quân)\n\nKhi bạn điền quân vào ô trống ở giữa, nó lập tức biến thành **Nước 4 Mở** hoặc **Nước 4 Bị Chặn** kết liễu đối thủ trước khi họ kịp nhận ra!`,
        summaryTakeaway: 'Luôn chú ý những khoảng trống giữa các quân cờ để phát hiện và tận dụng đòn 3 Nhảy Cóc!',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Nhìn vào hàng 8: Đen có quân tại F8, H8, I8 với ô G8 đang trống. Hãy điền vào G8 để tạo Nước 4 Mở!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: BLACK }, // I8
              { r: 9, c: 9, p: WHITE }, // J6
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 6 }, // G8
            alternativeGoodMoves: [],
            hint: 'Đánh vào ô trống nằm giữa F8 và H8 (tọa độ G8).',
            feedbacks: [
              {
                row: 7,
                col: 6,
                quality: 'best',
                explanation: 'Chính xác! Điền vào lỗ hổng G8 biến đòn 3 nhảy cóc thành Nước 4 Mở thông 2 đầu E8 và J8 không thể ngăn cản.',
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // CHƯƠNG 3: KHAI CUỘC KINH ĐIỂN
  // ==========================================
  {
    id: 3,
    title: 'Chương 3: Khai Cuộc Kinh Điển (26 Renju Openings)',
    vietnameseTitle: 'Khai Cuộc Kinh Điển',
    badge: 'Khai Cuộc Quốc Tế',
    iconName: 'Sparkles',
    description: 'Nắm bắt các thế khai cuộc lừng danh trong 26 thế Renju: Hoa Nguyệt, Phố Nguyệt, Khâu Nguyệt và chiến thuật phá thế cho Trắng.',
    lessons: [
      {
        id: 'lesson_3_1',
        chapterId: 3,
        order: 1,
        title: 'Thế Hoa Nguyệt (Huayue) - Vua Khai Cuộc Trực Tiếp',
        subtitle: 'Thế cờ chủ động áp đảo bậc nhất của Đen',
        difficulty: 'intermediate',
        durationMinutes: 4,
        description: 'Hoa Nguyệt là thế cờ mở màn mà 3 quân Đen tạo thành hình chữ L góc vuông ôm sát Trắng, đem lại tỷ lệ thắng áp đảo cho Đen.',
        coreConcepts: ['Hoa Nguyệt (Huayue)', 'Góc L chữ nhật', 'Kiểm soát tuyệt đối'],
        initialBoard: buildBoard([
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: WHITE }, // I8
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Hoa Nguyệt (Huayue) là một trong những thế khai cuộc trực tiếp mạnh nhất trong lịch sử Renju và Gomoku:\n- Nước 1 Đen: H8\n- Nước 2 Trắng: I8\n- Nước 3 Đen: I7 (hoặc I9) tạo thành góc vuông L ôm sát quân Trắng.\n\nTừ cấu trúc này, quân Đen đồng thời mở ra cả đường ngang, dọc và chéo, tạo ra vô số biến thể tấn công mà Trắng gần như không thể chống đỡ nếu Đen chơi chính xác!`,
        summaryTakeaway: 'Khai cuộc Hoa Nguyệt tại I7 mang lại sức mạnh chủ động tuyệt đối cho Đen ngay từ nước thứ 3.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen đã ở H8 và Trắng ở I8. Hãy đặt quân Đen thứ 3 vào I7 để thiết lập thế khai cuộc Hoa Nguyệt trứ danh!',
            initialBoard: buildBoard([
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: WHITE }, // I8
            ]),
            playerColor: BLACK,
            targetMove: { row: 8, col: 8 }, // I7
            alternativeGoodMoves: [{ row: 6, col: 8 }], // I9
            hint: 'Đặt ở ô I7 ngay dưới quân Trắng.',
            feedbacks: [
              {
                row: 8,
                col: 8,
                quality: 'best',
                explanation: 'Hoàn hảo! Bạn đã hoàn thành thế cờ Hoa Nguyệt tại I7, mở toang 3 hướng công kích đè bẹp cánh phải của Trắng.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_3_2',
        chapterId: 3,
        order: 2,
        title: 'Thế Phố Nguyệt (Puyue) & Vũ Nguyệt (Yuyue)',
        subtitle: 'Thế cờ tam giác kẹp chặt và dồn ép 2 cánh',
        difficulty: 'intermediate',
        durationMinutes: 4,
        description: 'Phố Nguyệt tạo thế 3 quân kề cận hình chữ V, mở rộng song song 2 tuyến đường tấn công.',
        coreConcepts: ['Phố Nguyệt (Puyue)', 'Gọng kìm 2 cánh', 'Dồn ép đối phương'],
        initialBoard: buildBoard([
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: WHITE }, // I8
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Phố Nguyệt (Puyue) là thế khai cuộc xếp nước 3 tại H7:\n- Nước 1: Đen H8\n- Nước 2: Trắng I8\n- Nước 3: Đen H7\n\nCấu trúc này tạo thành thế gọng kìm: Đen vừa kiểm soát trục dọc cột H, vừa mở đường chéo Tây Bắc - Đông Nam đe dọa trực tiếp sườn dưới của Trắng.`,
        summaryTakeaway: 'Phố Nguyệt giúp Đen phân tán hỏa lực sang hai trục độc lập, khiến Trắng khó lòng phòng thủ toàn diện.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Hãy đặt quân Đen vào H7 để thiết lập thế cờ Phố Nguyệt!',
            initialBoard: buildBoard([
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: WHITE }, // I8
            ]),
            playerColor: BLACK,
            targetMove: { row: 8, col: 7 }, // H7
            alternativeGoodMoves: [],
            hint: 'Đặt ở ô ngay dưới quân Đen trung tâm (tọa độ H7).',
            feedbacks: [
              {
                row: 8,
                col: 7,
                quality: 'best',
                explanation: 'Chính xác! Bạn đã dựng thành công thế Phố Nguyệt tại H7 mở ra 2 hướng công kích dọc và chéo.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_3_3',
        chapterId: 3,
        order: 3,
        title: 'Thế Khâu Nguyệt (Qiuyue) - Khai Cuộc Gián Tiếp',
        subtitle: 'Nghệ thuật phát triển thế trận đường chéo linh hoạt',
        difficulty: 'intermediate',
        durationMinutes: 4,
        description: 'Khi Trắng đi gián tiếp tại I9, Đen đáp trả bằng Khâu Nguyệt I7 để khóa chặt thế cờ và bành trướng không gian.',
        coreConcepts: ['Khâu Nguyệt (Qiuyue)', 'Khai cuộc gián tiếp', 'Thế cờ cân bằng'],
        initialBoard: buildBoard([
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 6, c: 8, p: WHITE }, // I9
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Khai cuộc Gián tiếp xảy ra khi Trắng đặt quân ở đường chéo I9 thay vì trực tiếp kề cạnh.\n- Để đáp trả, thế **Khâu Nguyệt (Qiuyue)** đặt quân thứ 3 tại I7.\n- Điều này tạo ra trục đối xứng chéo cực đẹp, vừa cô lập quân Trắng ở góc trên, vừa mở rộng vùng ảnh hưởng của Đen xuống nửa dưới bàn cờ.`,
        summaryTakeaway: 'Khâu Nguyệt là giải pháp hoàn hảo để Đen duy trì ưu thế trước các nước khai cuộc chéo của Trắng.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Trắng vừa đi chéo ở I9. Hãy đặt quân Đen tại I7 để hoàn tất thế khai cuộc Khâu Nguyệt!',
            initialBoard: buildBoard([
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 6, c: 8, p: WHITE }, // I9
            ]),
            playerColor: BLACK,
            targetMove: { row: 8, col: 8 }, // I7
            alternativeGoodMoves: [{ row: 6, col: 6 }], // G9
            hint: 'Đặt ở ô đối xứng tại I7.',
            feedbacks: [
              {
                row: 8,
                col: 8,
                quality: 'best',
                explanation: 'Rất chuẩn! Thế Khâu Nguyệt được xác lập tại I7, Đen sở hữu đường chéo chính hùng mạnh.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_3_4',
        chapterId: 3,
        order: 4,
        title: 'Chiến Lược Khai Cuộc Cho Quân Trắng',
        subtitle: 'Nghệ thuật phòng ngự chuyển công cho người đi sau',
        difficulty: 'intermediate',
        durationMinutes: 4,
        description: 'Cầm quân Trắng đòi hỏi sự điềm tĩnh: chiếm điểm giao cắt hiểm yếu, chặn hướng tấn công của Đen và âm thầm tạo thế phản công.',
        coreConcepts: ['Phòng ngự chuyển công', 'Chiếm điểm giao cắt', 'Cướp quyền tiên cơ'],
        initialBoard: buildBoard([
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: WHITE }, // I8
          { r: 8, c: 7, p: BLACK }, // H7
        ]),
        playerColor: WHITE,
        turnPlayer: WHITE,
        detailedArticle: `Khi cầm quân Trắng (đi sau), bạn luôn chịu áp lực ban đầu từ Đen.\n\nChiến thuật sống còn cho Trắng:\n1. **Chặn điểm giao cắt**: Đừng chỉ chặn thụ động, hãy tìm ô cờ vừa chặn được hướng mở rộng của Đen, vừa kết nối với quân Trắng sẵn có.\n2. **Kéo giãn thế trận**: Đẩy Đen ra các hướng có biên hẹp để giảm sức sát thương.\n3. **Chờ Đen sơ hở**: Chỉ cần Đen đi 1 nước lỏng lẻo, lập tức tung đòn 3 mở để cướp lại quyền chủ động!`,
        summaryTakeaway: 'Nước đi hay nhất của Trắng luôn là nước cờ "Vừa chặn Đen, vừa tạo đà cho Trắng".',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen đang định tạo thế 2 cánh tại H8 và H7. Hãy đặt quân Trắng tại I7 để khóa chặt góc vuông của Đen và kết nối với quân Trắng I8!',
            initialBoard: buildBoard([
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: WHITE }, // I8
              { r: 8, c: 7, p: BLACK }, // H7
            ]),
            playerColor: WHITE,
            targetMove: { row: 8, col: 8 }, // I7
            alternativeGoodMoves: [{ row: 6, col: 7 }], // H9
            hint: 'Đặt ở ô I7 để bịt kín góc dưới.',
            feedbacks: [
              {
                row: 8,
                col: 8,
                quality: 'best',
                explanation: 'Nước cờ bậc thầy! Bạn đã vừa bẻ gãy cấu trúc góc của Đen, vừa tạo liên kết 2 quân Trắng tại I7-I8 vững như bàn thạch.',
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // CHƯƠNG 4: NGHỆ THUẬT TƯ DUY & ĐÒN BẪY KÉP
  // ==========================================
  {
    id: 4,
    title: 'Chương 4: Nghệ Thuật Tư Duy & Đòn Bẫy Kép (Forks & Combinations)',
    vietnameseTitle: 'Nghệ Thuật Tư Duy & Đòn Bẫy Kép',
    badge: 'Kỹ Năng Đột Phá',
    iconName: 'Zap',
    description: 'Quy trình 4 bước tư duy chọn nước tối ưu và các tuyệt chiêu Đòn Bẫy Kép 4-3, 3-3, 4-4 và đòn chéo bách chiến bách thắng.',
    lessons: [
      {
        id: 'lesson_4_1',
        chapterId: 4,
        order: 1,
        title: 'Quy Trình 4 Bước Tư Duy Chọn Nước Đi Tối Ưu',
        subtitle: 'Bộ lọc tư duy chuẩn mực của các cao thủ Gomoku',
        difficulty: 'intermediate',
        durationMinutes: 4,
        description: 'Học cách tư duy theo thứ tự ưu tiên: 1. Quét tử huyệt -> 2. Tìm đòn sát cục -> 3. Phá bẫy đối thủ -> 4. Phát triển vừa công vừa thủ.',
        coreConcepts: ['Quy trình 4 bước', 'Thứ tự ưu tiên', 'Threat Space Search'],
        initialBoard: buildBoard([
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 7, c: 8, p: BLACK }, // I8
          { r: 5, c: 7, p: WHITE }, // H10
          { r: 6, c: 7, p: WHITE }, // H9
          { r: 8, c: 7, p: WHITE }, // H7
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Trước MỖI NƯỚC ĐI, hãy tự hỏi bản thân 4 câu hỏi theo đúng thứ tự:\n\n1. **Bước 1 (Cứu nguy sinh tử)**: Đối thủ có nước 4 sắp thành 5 không? (Nếu có -> BẮT BUỘC CHẶN NGAY!)\n2. **Bước 2 (Dứt điểm trận đấu)**: Mình có nước tạo 4 mở, 4-3 hay VCF thắng ngay không? (Nếu có -> ĐÁNH ĐỂ THẮNG NGAY!)\n3. **Bước 3 (Triệt tiêu bẫy ngầm)**: Đối thủ có ô cờ nào sắp tạo đòn kép 4-3/3-3 ở lượt sau không? (Nếu có -> Chặn ô giao cắt đó).\n4. **Bước 4 (Phát triển thế trận)**: Nếu không có nguy cơ khẩn cấp, chọn ô cờ nào vừa kết nối quân mình, vừa hạn chế đối phương nhất?`,
        summaryTakeaway: 'Đừng đánh theo cảm tính! Hãy quét bàn cờ theo đúng 4 bước ưu tiên để không bao giờ bỏ lỡ chiến thắng hay dính bẫy ngớ ngẩn.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Trắng đang có Nước 3 trên cột H, nhưng Đen ĐANG CÓ NƯỚC 3 MỞ trên hàng 8. Áp dụng Bước 2: Hãy đánh J8 tạo Nước 4 Mở để THẮNG NGAY!',
            initialBoard: buildBoard([
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 7, c: 8, p: BLACK }, // I8
              { r: 5, c: 7, p: WHITE }, // H10
              { r: 6, c: 7, p: WHITE }, // H9
              { r: 8, c: 7, p: WHITE }, // H7
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 9 }, // J8
            alternativeGoodMoves: [{ row: 7, col: 5 }], // F8
            hint: 'Bạn đang có nước sát cục nhanh hơn đối thủ! Đánh J8 kết liễu.',
            feedbacks: [
              {
                row: 7,
                col: 9,
                quality: 'best',
                explanation: 'Chính xác! Bước 2 mách bảo bạn không cần lo phòng thủ vì đòn tấn công của bạn nhanh hơn 1 nhịp và quyết định trận đấu.',
              },
              {
                row: 4,
                col: 7,
                quality: 'blunder',
                explanation: 'Sai lầm! Bạn đi chặn Trắng ở H11 trong khi chính bạn có nước 4 mở thắng ngay ở hàng 8 tại J8!',
                opponentResponse: { row: 7, col: 9 },
                opponentExplanation: 'Trắng lập tức chặn mất nước thắng mười mươi của bạn tại J8.'
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_4_2',
        chapterId: 4,
        order: 2,
        title: 'Đòn Bẫy Kép 4-3 (Four-Three Fork)',
        subtitle: 'Vũ khí tối thượng - Đòn sát thương không thể cản phá',
        difficulty: 'advanced',
        durationMinutes: 4,
        description: 'Tạo ra đồng thời 1 Nước 4 (bắt đối thủ phải đỡ) và 1 Nước 3 Mở (sẽ thắng ở lượt sau). Đối thủ chỉ có thể đỡ 1 trong 2!',
        coreConcepts: ['Đòn bẫy 4-3', 'Double Threat', 'Chiến thắng tất yếu'],
        initialBoard: buildBoard([
          { r: 6, c: 7, p: BLACK }, // H9
          { r: 8, c: 7, p: BLACK }, // H7
          { r: 9, c: 7, p: BLACK }, // H6
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 5, c: 9, p: WHITE }, // J10
          { r: 8, c: 9, p: WHITE }, // J7
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Đòn 4-3 (Four-Three Fork) là chìa khóa then chốt của Gomoku:\n- Khi bạn đặt quân vào điểm giao nhau của 2 hướng, nó biến 1 hướng thành **Nước 4** và hướng kia thành **Nước 3 Mở**.\n- Ở lượt tiếp theo, đối phương BẮT BUỘC phải đỡ nước 4 (nếu không bạn sẽ đánh thành 5 quân ngay lập tức).\n- Nhưng khi họ vừa đỡ xong nước 4, nước 3 mở của bạn lại biến thành Nước 4 mở và kết thúc ván cờ!\n- Đây là đòn bẫy hoàn hảo không có bất kỳ lời giải nào cho bên phòng thủ.`,
        summaryTakeaway: 'Mọi cao thủ đều xây dựng thế cờ xoay quanh việc tìm kiếm và tạo ra Đòn Bẫy Kép 4-3.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Tìm ô cờ giao điểm tại H8: Nó vừa hoàn thành Nước 4 trên cột dọc H, vừa tạo Nước 3 Mở trên hàng ngang 8!',
            initialBoard: buildBoard([
              { r: 6, c: 7, p: BLACK }, // H9
              { r: 8, c: 7, p: BLACK }, // H7
              { r: 9, c: 7, p: BLACK }, // H6
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 5, c: 9, p: WHITE }, // J10
              { r: 8, c: 9, p: WHITE }, // J7
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Điểm giao cắt vàng ở tọa độ H8.',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Đòn 4-3 hoàn hảo! Trắng buộc phải chặn cột dọc tại H10, sau đó Đen chỉ việc đánh I8 để tạo 4 mở và chiến thắng!',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_4_3',
        chapterId: 4,
        order: 3,
        title: 'Đòn Kép 3-3 (Double Three Fork)',
        subtitle: 'Tạo 2 hướng 3 mở cùng một lúc',
        difficulty: 'advanced',
        durationMinutes: 4,
        description: 'Tạo ra 2 nước 3 mở độc lập. Vì đối thủ chỉ được đi 1 quân mỗi lượt nên họ chỉ chặn được 1 bên, bên còn lại sẽ hóa 4 mở.',
        coreConcepts: ['Đòn kép 3-3', '2 hướng tấn công', 'Quá tải phòng thủ'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 5, c: 7, p: BLACK }, // H10
          { r: 6, c: 7, p: BLACK }, // H9
          { r: 4, c: 9, p: WHITE }, // J11
          { r: 9, c: 4, p: WHITE }, // E6
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Đòn kép 3-3 (Double Three) hoạt động dựa trên nguyên lý quá tải năng lực phòng thủ của đối phương:\n- Một nước đi tạo ra 2 đường 3 mở độc lập.\n- Đối phương chỉ có 1 lượt đi, nên dù họ chặn hướng ngang thì hướng dọc của bạn vẫn thênh thang biến thành 4 mở!\n*(Lưu ý: Trong luật Renju chuyên nghiệp nước 3-3 bị cấm với quân Đen, nhưng trong luật Gomoku tự do đây là đòn kết liễu cực kỳ mạnh mẽ).*`,
        summaryTakeaway: 'Khi có 2 chuỗi 2 quân hội tụ tại 1 giao điểm, hãy đặt cờ tại đó để kích hoạt đòn kép 3-3.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Hãy đặt quân Đen tại giao điểm H8 để kích hoạt Đòn Kép 3-3 hạ gục Trắng!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 5, c: 7, p: BLACK }, // H10
              { r: 6, c: 7, p: BLACK }, // H9
              { r: 4, c: 9, p: WHITE }, // J11
              { r: 9, c: 4, p: WHITE }, // E6
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Đặt ở ô giao điểm H8.',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Xuất sắc! Bạn tạo ra 2 đường 3 mở song song tại F8-I8 và H7-H10, Trắng không thể nào chặn cả 2 đường cùng lúc!',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_4_4',
        chapterId: 4,
        order: 4,
        title: 'Đòn Bẫy Kép 4-4 (Double Four Fork)',
        subtitle: 'Hỏa lực hủy diệt tuyệt đối trong Gomoku tự do',
        difficulty: 'advanced',
        durationMinutes: 4,
        description: 'Tạo đồng thời 2 Nước 4 cùng một lúc. Đối thủ chỉ có thể đỡ được 1 nước 4, hướng còn lại bạn sẽ điền đủ 5 quân và thắng ngay.',
        coreConcepts: ['Đòn kép 4-4', 'Song sát tuyệt đối', 'Không thể chống đỡ'],
        initialBoard: buildBoard([
          { r: 7, c: 4, p: BLACK }, // E8
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 4, c: 7, p: BLACK }, // H11
          { r: 5, c: 7, p: BLACK }, // H10
          { r: 6, c: 7, p: BLACK }, // H9
          { r: 7, c: 3, p: WHITE }, // D8
          { r: 3, c: 7, p: WHITE }, // H12
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Đòn 4-4 kép (Double Four Fork) là vũ khí bạo lực nhất trong cờ Gomoku tự do:\n- Khi bạn đặt quân vào giao điểm, cả 2 hướng lập tức trở thành **Nước 4**.\n- Đối thủ rơi vào tình thế tuyệt vọng: họ chỉ có 1 lượt đi để chặn 1 hướng, hướng còn lại bạn sẽ đánh đủ 5 quân ở lượt kế tiếp và giành chiến thắng!\n- Trong Gomoku tự do, 4-4 là đòn kết liễu tối thượng và hợp lệ cho cả 2 bên.`,
        summaryTakeaway: 'Đòn 4-4 kép kết liễu trận đấu ngay lập tức vì không bên nào có thể chặn 2 nước 4 trong cùng 1 lượt.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Tìm ô cờ giao điểm tại H8: Nó vừa tạo Nước 4 trên hàng ngang 8, vừa tạo Nước 4 trên cột dọc H!',
            initialBoard: buildBoard([
              { r: 7, c: 4, p: BLACK }, // E8
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 4, c: 7, p: BLACK }, // H11
              { r: 5, c: 7, p: BLACK }, // H10
              { r: 6, c: 7, p: BLACK }, // H9
              { r: 7, c: 3, p: WHITE }, // D8
              { r: 3, c: 7, p: WHITE }, // H12
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Đặt ở ô giao điểm H8.',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Đòn 4-4 hủy diệt! Trắng chỉ chặn được 1 bên (ngang hoặc dọc), bên còn lại bạn hoàn tất 5 quân và chiến thắng!',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_4_5',
        chapterId: 4,
        order: 5,
        title: 'Đòn Chéo Xiên & Bẫy Chữ Thập (Diagonal Pinning)',
        subtitle: 'Khai thác điểm mù thị giác trên đường chéo',
        difficulty: 'advanced',
        durationMinutes: 4,
        description: 'Đường chéo là nơi người chơi dễ sơ hở nhất. Học cách giăng bẫy đòn chéo kết hợp đường thẳng để bất ngờ kết liễu đối thủ.',
        coreConcepts: ['Đòn chéo xiên', 'Điểm mù thị giác', 'Bẫy bất ngờ'],
        initialBoard: buildBoard([
          { r: 5, c: 5, p: BLACK }, // F10
          { r: 6, c: 6, p: BLACK }, // G9
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 3, c: 3, p: WHITE }, // D12
          { r: 8, c: 4, p: WHITE }, // E7
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Đa số người mới chơi chỉ tập trung nhìn hàng ngang và cột dọc mà bỏ quên đường chéo:\n- Các đòn tấn công chéo có chiều dài lớn nhất trên bàn cờ (tới 15 ô).\n- Đặt một quân tại giao điểm của 1 đường chéo và 1 đường ngang/dọc sẽ tạo ra thế trận cực kỳ khó lường, khiến đối phương không kịp trở tay.`,
        summaryTakeaway: 'Hãy luôn rèn luyện thói quen quét mắt theo các đường chéo 45 độ để phát hiện bẫy ngầm.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Quan sát đường chéo F10-G9 và hàng ngang F8-G8. Hãy đánh vào H8 để tạo đòn bẫy kép Chéo - Ngang!',
            initialBoard: buildBoard([
              { r: 5, c: 5, p: BLACK }, // F10
              { r: 6, c: 6, p: BLACK }, // G9
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 3, c: 3, p: WHITE }, // D12
              { r: 8, c: 4, p: WHITE }, // E7
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Đánh vào giao điểm H8.',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Đòn đánh sắc bén! Đường chéo F10-H8 và đường ngang F8-H8 đồng loạt bùng nổ, ép Trắng vào thế bại trận không thể cứu vãn.',
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // CHƯƠNG 5: QUẢN LÝ NHỊP ĐỘ & NƯỚC CHỜ ĐỈNH CAO
  // ==========================================
  {
    id: 5,
    title: 'Chương 5: Quản Lý Nhịp Độ & Nước Chờ (Tempo & Quiet Moves)',
    vietnameseTitle: 'Quản Lý Nhịp Độ & Nước Chờ',
    badge: 'Tư Duy Đỉnh Cao',
    iconName: 'Clock',
    description: 'Nắm vững quyền Tiên thủ (Sente) vs Hậu thủ (Gote), nghệ thuật đi "Nước chờ" (Quiet Move) và kỹ thuật đóng băng không gian đối thủ.',
    lessons: [
      {
        id: 'lesson_5_1',
        chapterId: 5,
        order: 1,
        title: 'Quyền Chủ Động: Tiên Thủ (Sente) vs Hậu Thủ (Gote)',
        subtitle: 'Kiểm soát nhịp độ - Nắm giữ linh hồn của ván cờ',
        difficulty: 'advanced',
        durationMinutes: 4,
        description: 'Tiên thủ (Sente) là nước đi ép đối phương phải đáp trả theo ý mình. Hậu thủ (Gote) là nước đi bị động chạy theo đối phương.',
        coreConcepts: ['Tiên thủ (Sente)', 'Hậu thủ (Gote)', 'Kiểm soát nhịp độ (Tempo)'],
        initialBoard: buildBoard([
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 6, c: 7, p: WHITE }, // H9
          { r: 8, c: 7, p: WHITE }, // H7
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Trong cờ đỉnh cao, thắng thua được quyết định bởi ai nắm giữ **Tiên thủ (Sente)**:\n- **Nước Tiên thủ (Sente)**: Tạo ra đe dọa trực tiếp (như 3 mở hoặc 4), buộc đối thủ phải bỏ dở mọi kế hoạch riêng để đi nước phòng thủ.\n- **Nước Hậu thủ (Gote)**: Nước đi không tạo ra đe dọa tức thì, nhường quyền chủ động tấn công cho đối phương.\n- **Nguyên tắc**: Luôn tìm cách đi những nước Tiên thủ để duy trì quyền ép đối phương phòng ngự liên tục!`,
        summaryTakeaway: 'Bên nào nắm giữ Tiên thủ (Sente) liên tục, bên đó kiểm soát 90% kết quả của ván cờ.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen đang có 2 quân tại G8-H8. Hãy đánh I8 để tạo Nước 3 Mở (Tiên thủ) ép Trắng phải đỡ!',
            initialBoard: buildBoard([
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 6, c: 7, p: WHITE }, // H9
              { r: 8, c: 7, p: WHITE }, // H7
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [{ row: 7, col: 5 }], // F8
            hint: 'Đánh vào I8 để nắm trọn Tiên thủ.',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Nắm chắc Tiên thủ! Nước đi này buộc Trắng phải phòng thủ ở lượt sau, nhường toàn bộ quyền dẫn dắt cho bạn.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_5_2',
        chapterId: 5,
        order: 2,
        title: 'Nghệ Thuật "Nước Chờ" (Quiet Move / Waiting Move)',
        subtitle: 'Âm thầm giăng lưới trước khi phát động tấn công',
        difficulty: 'master',
        durationMinutes: 4,
        description: 'Khi chưa đủ điều kiện dứt điểm ngay, đi 1 nước cờ tĩnh lặng nhưng chiếm cứ vị trí đắc địa, tạo 2-3 mối đe dọa ngầm cho lượt sau.',
        coreConcepts: ['Nước chờ (Quiet Move)', 'Chuẩn bị thế trận', 'Đòn đánh ngầm'],
        initialBoard: buildBoard([
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 5, c: 8, p: BLACK }, // I10
          { r: 6, c: 8, p: WHITE }, // I9
          { r: 8, c: 8, p: WHITE }, // I7
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Người chơi non tay thường vội vàng tung đòn tấn công khi thế cờ chưa chín muồi và dễ dàng bị đối thủ bẻ gãy.\n\nCao thủ sử dụng **"Nước Chờ" (Quiet Move)**:\n- Một nước cờ không tạo ra đe dọa lộ liễu ngay lập tức.\n- Nhưng nó âm thầm kết nối các cụm quân cờ rời rạc trên bàn cờ.\n- Đến lượt tiếp theo, nó sẽ đồng loạt phát nổ thành 2 hoặc 3 đường tấn công mà đối phương không tài nào kịp xoay sở!`,
        summaryTakeaway: 'Một "Nước chờ" xuất sắc giá trị hơn mười đòn tấn công vội vã chưa đủ điều kiện.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đánh I8 để kết nối quân hàng ngang với quân phía trên, giăng bẫy đòn kép cho lượt sau!',
            initialBoard: buildBoard([
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 5, c: 8, p: BLACK }, // I10
              { r: 6, c: 8, p: WHITE }, // I9
              { r: 8, c: 8, p: WHITE }, // I7
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [],
            hint: 'Chiếm lấy ô cờ chiến lược I8.',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Nước chờ bậc thầy! Đặt tại I8 âm thầm tạo thế 3 mở hàng ngang và mở đường liên lạc dọc, đối thủ hoàn toàn bất lực.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_5_3',
        chapterId: 5,
        order: 3,
        title: 'Kỹ Thuật Đóng Băng & Giới Hạn Không Gian',
        subtitle: 'Bóp nghẹt đường phát triển của đối phương',
        difficulty: 'master',
        durationMinutes: 4,
        description: 'Chiếm giữ những giao điểm huyết mạch để khóa chặt toàn bộ các hướng tiến công tiềm năng của đối thủ, ép họ rơi vào thế cạn kiệt nước đi.',
        coreConcepts: ['Đóng băng không gian', 'Hạn chế tầm với', 'Bóp nghẹt thế trận'],
        initialBoard: buildBoard([
          { r: 6, c: 7, p: WHITE }, // H9
          { r: 6, c: 8, p: WHITE }, // I9
          { r: 8, c: 7, p: BLACK }, // H7
          { r: 8, c: 8, p: BLACK }, // I7
          { r: 5, c: 6, p: WHITE }, // G10
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Chiến thuật Đóng Băng (Space Restriction) là nghệ thuật bóp nghẹt đối phương:\n- Thay vì chỉ phòng thủ khi đối thủ ra đòn, bạn chủ động đặt quân tại những ô cờ mà đối thủ muốn nhắm tới trong tương lai.\n- Bằng cách này, bạn vừa hạn chế bán kính hoạt động của họ, vừa mở rộng lãnh thổ an toàn cho chính mình.\n- Khi đối phương hết nước đi tốt, họ buộc phải đi những nước thụ động và dâng chiến thắng cho bạn.`,
        summaryTakeaway: 'Chiếm trước không gian phát triển của đối thủ là cách phòng ngự từ xa tối ưu nhất.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đánh G9 để đóng băng hoàn toàn hướng bành trướng phía Tây Bắc của quân Trắng!',
            initialBoard: buildBoard([
              { r: 6, c: 7, p: WHITE }, // H9
              { r: 6, c: 8, p: WHITE }, // I9
              { r: 8, c: 7, p: BLACK }, // H7
              { r: 8, c: 8, p: BLACK }, // I7
              { r: 5, c: 6, p: WHITE }, // G10
            ]),
            playerColor: BLACK,
            targetMove: { row: 6, col: 6 }, // G9
            alternativeGoodMoves: [],
            hint: 'Khóa góc tại G9.',
            feedbacks: [
              {
                row: 6,
                col: 6,
                quality: 'best',
                explanation: 'Khóa cứng hoàn hảo! Nước đi tại G9 phong tỏa toàn bộ đường phát triển hàng 9 và đường chéo của Trắng.',
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // CHƯƠNG 6: CHUỖI SÁT CỤC TUYỆT ĐỈNH (VCF & VCT)
  // ==========================================
  {
    id: 6,
    title: 'Chương 6: Chuỗi Sát Cục Tuyệt Đỉnh (VCF & VCT Masterclass)',
    vietnameseTitle: 'Chuỗi Sát Cục Tuyệt Đỉnh',
    badge: 'Đỉnh Cao Nghệ Thuật',
    iconName: 'Award',
    description: 'Bí kíp tính toán chuỗi Sát Cục VCF (Victory of Continuous Fours), Đòn Ép VCT và kỹ thuật phối hợp đan xen chuyển hóa thế cờ.',
    lessons: [
      {
        id: 'lesson_6_1',
        chapterId: 6,
        order: 1,
        title: 'Sát Cục VCF (Victory of Continuous Fours)',
        subtitle: 'Chuỗi nước 4 liên hoàn ép đối thủ đỡ đến chết',
        difficulty: 'master',
        durationMinutes: 5,
        description: 'VCF là chuỗi nước đi mà TẤT CẢ các nước của bạn đều tạo Nước 4. Đối thủ bắt buộc phải đỡ 100% cho đến khi bạn đạt 5 quân.',
        coreConcepts: ['VCF (Victory of Continuous Fours)', 'Ép nhịp tuyệt đối', 'Tính toán trước nhiều nước'],
        initialBoard: buildBoard([
          { r: 7, c: 4, p: BLACK }, // E8
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 5, c: 8, p: BLACK }, // I10
          { r: 6, c: 8, p: BLACK }, // I9
          { r: 8, c: 8, p: BLACK }, // I7
          { r: 9, c: 8, p: BLACK }, // I6
          { r: 4, c: 4, p: WHITE }, // E11
          { r: 7, c: 3, p: WHITE }, // D8
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `VCF (Victory of Continuous Fours) là đỉnh cao của tính toán chiến thuật trong Gomoku:\n- Mỗi nước đi bạn đánh đều tạo thành Nước 4.\n- Vì là nước 4, đối phương KHÔNG ĐƯỢC PHÉP đi bất cứ đâu khác ngoài việc nhảy vào ô duy nhất để chặn bạn.\n- Bạn sử dụng chính những nước 4 này để kiến tạo thêm các quân cờ hỗ trợ trên bàn cờ, dẫn thẳng tới đòn 4 mở hoặc đòn 5 quân kết liễu.\n- Khi đã vào chuỗi VCF, đối thủ chỉ có thể ngồi nhìn bạn diễn giải chiến thắng!`,
        summaryTakeaway: 'Nếu bạn có chuỗi VCF, bạn chắc chắn thắng bất kể đối thủ đang có bao nhiêu thế cờ nguy hiểm ở nơi khác!',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Bước 1 VCF: Đánh H8 tạo Nước 4 ngang ép Trắng phải chặn tại I8!',
            initialBoard: buildBoard([
              { r: 7, c: 4, p: BLACK }, // E8
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 5, c: 8, p: BLACK }, // I10
              { r: 6, c: 8, p: BLACK }, // I9
              { r: 8, c: 8, p: BLACK }, // I7
              { r: 9, c: 8, p: BLACK }, // I6
              { r: 4, c: 4, p: WHITE }, // E11
              { r: 7, c: 3, p: WHITE }, // D8
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Đánh vào H8 để tạo nước 4 ép Trắng.',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Chính xác! Trắng bị ép chặn tại I8, vô tình giúp bạn kích hoạt quân Đen trên cột I kết liễu!',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_6_2',
        chapterId: 6,
        order: 2,
        title: 'Đòn Ép VCT (Victory of Continuous Threats)',
        subtitle: 'Chuỗi đe dọa liên hoàn 3-4 cạn kiệt phòng thủ',
        difficulty: 'master',
        durationMinutes: 5,
        description: 'VCT kết hợp cả Nước 3 Mở và Nước 4 để dồn ép đối phương liên tục, cuối cùng chuyển hóa thành đòn 4-3 hạ màn ván cờ.',
        coreConcepts: ['VCT (Victory of Continuous Threats)', 'Dồn ép liên hoàn', 'Chuyển hóa thế cờ'],
        initialBoard: buildBoard([
          { r: 6, c: 6, p: BLACK }, // G9
          { r: 6, c: 7, p: BLACK }, // H9
          { r: 8, c: 6, p: BLACK }, // G7
          { r: 9, c: 6, p: BLACK }, // G6
          { r: 5, c: 9, p: WHITE }, // J10
          { r: 9, c: 9, p: WHITE }, // J6
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `VCT (Victory of Continuous Threats) là biến thể rộng hơn và nghệ thuật hơn VCF:\n- Bạn liên tục tạo ra các nước đe dọa trực tiếp (Nước 3 Mở hoặc Nước 4).\n- Mỗi nước đi buộc đối thủ phải chống đỡ trong thế bị động.\n- Chuỗi áp lực này dần dần dồn đối phương vào góc và cuối cùng kích hoạt đòn 4-3 hoặc VCF để dứt điểm trận đấu.`,
        summaryTakeaway: 'Nắm vững VCT giúp bạn kiểm soát toàn bộ nhịp độ trận đấu từ trung cuộc tới tàn cuộc.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đánh I9 tạo Nước 3 Mở ép Trắng phải chặn, mở đường cho đòn dứt điểm tiếp theo!',
            initialBoard: buildBoard([
              { r: 6, c: 6, p: BLACK }, // G9
              { r: 6, c: 7, p: BLACK }, // H9
              { r: 8, c: 6, p: BLACK }, // G7
              { r: 9, c: 6, p: BLACK }, // G6
              { r: 5, c: 9, p: WHITE }, // J10
              { r: 9, c: 9, p: WHITE }, // J6
            ]),
            playerColor: BLACK,
            targetMove: { row: 6, col: 8 }, // I9
            alternativeGoodMoves: [{ row: 6, col: 5 }], // F9
            hint: 'Tạo Nước 3 Mở trên hàng 9 tại I9.',
            feedbacks: [
              {
                row: 6,
                col: 8,
                quality: 'best',
                explanation: 'Đòn ép VCT mẫu mực! Bạn nắm trọn nhịp điệu trận đấu và đẩy Trắng vào thế sụp đổ hoàn toàn.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_6_3',
        chapterId: 6,
        order: 3,
        title: 'Phối Hợp Đan Xen VCF và VCT Chuyển Hóa Cục Diện',
        subtitle: 'Nghệ thuật chuyển đổi mượt mà giữa ép 3 và ép 4',
        difficulty: 'master',
        durationMinutes: 5,
        description: 'Sử dụng đòn VCT (Nước 3 mở) để điều phối quân đối thủ vào vị trí mong muốn, sau đó chuyển hóa sang đòn VCF (Nước 4) để dứt điểm.',
        coreConcepts: ['Phối hợp VCT-VCF', 'Điều phối quân cờ', 'Chuyển hóa thế trận'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 5, c: 8, p: BLACK }, // I10
          { r: 6, c: 8, p: BLACK }, // I9
          { r: 8, c: 8, p: BLACK }, // I7
          { r: 4, c: 4, p: WHITE }, // E11
          { r: 9, c: 9, p: WHITE }, // J6
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Trong thực chiến, rất hiếm khi bạn có sẵn chuỗi VCF từ đầu đến cuối:\n- Bạn cần khởi đầu bằng **VCT (Nước 3 Mở)** để ép đối thủ phải nhảy vào 1 ô phòng thủ.\n- Sự xuất hiện của quân phòng thủ đó vô tình tạo thành "bàn đạp" (mắt xích) để bạn kích hoạt chuỗi **VCF (Nước 4)** không thể cản phá!\n- Đây là kỹ năng phân biệt giữa kiện tướng và đại kiện tướng cờ Gomoku.`,
        summaryTakeaway: 'Dùng VCT để bẫy đối thủ vào vị trí, sau đó tung VCF để kết liễu trận đấu.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đánh H8 tạo Nước 3 Mở (F8-G8-H8) ép Trắng phải chặn I8, tạo bàn đạp cho chuỗi VCF trên cột I!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 5, c: 8, p: BLACK }, // I10
              { r: 6, c: 8, p: BLACK }, // I9
              { r: 8, c: 8, p: BLACK }, // I7
              { r: 4, c: 4, p: WHITE }, // E11
              { r: 9, c: 9, p: WHITE }, // J6
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Đánh tại H8 tạo thế ép VCT chuyển VCF.',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Tuyệt tác chiến thuật! Trắng buộc phải chặn tại I8 hoặc E8, mở đường cho đòn sát cục hoàn hảo.',
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // CHƯƠNG 7: NGHỆ THUẬT PHÒNG THỦ & PHẢN KÍCH
  // ==========================================
  {
    id: 7,
    title: 'Chương 7: Nghệ Thuật Phòng Thủ & Phản Kích (Master Defense)',
    vietnameseTitle: 'Nghệ Thuật Phòng Thủ & Phản Kích',
    badge: 'Bậc Thầy Phòng Thủ',
    iconName: 'Shield',
    description: 'Hóa giải hiểm nguy: Nước chặn "1 được 2", Chặn kèm phản công tạo 3 mở và bẻ gãy chuỗi sát cục của đối thủ.',
    lessons: [
      {
        id: 'lesson_7_1',
        chapterId: 7,
        order: 1,
        title: 'Nước Chặn "1 Hóa Giải 2" (Dual Blocking)',
        subtitle: 'Một quân chặn đứng 2 mũi giáp công nguy hiểm',
        difficulty: 'advanced',
        durationMinutes: 4,
        description: 'Khi đối thủ đang có 2 hướng đe dọa, hãy tìm đúng điểm giao nhau của 2 tuyến để 1 quân hóa giải cả 2 mũi nhọn.',
        coreConcepts: ['Chặn kép (Dual Block)', 'Điểm giao cắt phòng thủ', 'Tiết kiệm nước đi'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 5, c: 7, p: BLACK }, // H10
          { r: 6, c: 7, p: BLACK }, // H9
          { r: 3, c: 3, p: WHITE }, // D12
        ]),
        playerColor: WHITE,
        turnPlayer: WHITE,
        detailedArticle: `Khi Đen chuẩn bị tạo đòn kép 3-3 hoặc 4-3, nếu bạn chỉ chặn 1 đầu của hàng ngang thì Đen sẽ đánh hàng dọc thắng ngay.\n\nBí kíp phòng ngự:\n- Tìm **giao điểm duy nhất** mà cả 2 tuyến của Đen đang nhắm tới.\n- Đặt quân Trắng ngay tại giao điểm đó!\n- Một nước đi duy nhất này sẽ bẻ gãy đồng thời cả 2 đường tấn công của Đen, cứu vãn ván cờ cận kề thất bại.`,
        summaryTakeaway: 'Chặn tại giao điểm là nước cờ phòng thủ có giá trị gấp đôi bất kỳ nước chặn đơn lẻ nào.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen đang rình rập đòn 3-3 tại H8. Hãy đặt quân Trắng ngay tại H8 để hóa giải hoàn toàn cả 2 mũi tấn công!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 5, c: 7, p: BLACK }, // H10
              { r: 6, c: 7, p: BLACK }, // H9
              { r: 3, c: 3, p: WHITE }, // D12
            ]),
            playerColor: WHITE,
            targetMove: { row: 7, col: 7 }, // H8
            alternativeGoodMoves: [],
            hint: 'Đặt ở ô giao điểm H8 của Đen.',
            feedbacks: [
              {
                row: 7,
                col: 7,
                quality: 'best',
                explanation: 'Nước cờ phòng thủ thần sầu! Bạn đã phá nát toàn bộ kế hoạch giăng bẫy đòn kép của Đen.',
              },
              {
                row: 7,
                col: 4,
                quality: 'blunder',
                explanation: 'Chặn ở E8 chỉ đỡ được hàng ngang, Đen sẽ đánh vào H8 và thắng bằng hàng dọc cột H!',
                opponentResponse: { row: 7, col: 7 },
                opponentExplanation: 'Đen lập tức chiếm giao điểm H8 và tạo thế 3-3 thắng cuộc.'
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_7_2',
        chapterId: 7,
        order: 2,
        title: 'Chặn Kèm Phản Công (Block & Counter-Threat)',
        subtitle: 'Đỉnh cao nghệ thuật: Vừa phòng ngự vừa cướp quyền tiên cơ',
        difficulty: 'master',
        durationMinutes: 4,
        description: 'Thay vì chặn một cách thụ động, hãy chọn ô cờ vừa chặn được nước 3 của đối thủ, vừa tạo thành Nước 3 Mở của chính bạn!',
        coreConcepts: ['Phòng thủ phản công', 'Cướp Tempo', 'Chuyển bại thành thắng'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 7, c: 7, p: BLACK }, // H8
          { r: 5, c: 8, p: WHITE }, // I10
          { r: 6, c: 8, p: WHITE }, // I9
          { r: 9, c: 9, p: BLACK }, // J6
        ]),
        playerColor: WHITE,
        turnPlayer: WHITE,
        detailedArticle: `Trong Gomoku đỉnh cao, sự khác biệt giữa người chơi giỏi và bậc thầy nằm ở khả năng **Phản Công Khi Phòng Thủ**:\n- Khi đối thủ có nước 3 mở ở hàng ngang F8-H8, họ có 2 điểm chặn là E8 và I8.\n- Nếu bạn chọn I8, bạn vừa chặn được Đen, VỪA KẾT NỐI với 2 quân Trắng I10-I9 để tạo thành Nước 3 Mở của chính bạn trên cột I!\n- Đen đang từ thế tấn công bỗng nhiên bị ép phải quay về phòng ngự ở lượt kế tiếp!`,
        summaryTakeaway: 'Luôn tìm kiếm nước chặn có khả năng mở ra hướng tấn công mới cho mình để lật ngược thế cờ.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Đen có 3 mở ở hàng 8 (F8-H8). Hãy chặn tại I8 để vừa chặn Đen vừa tạo thành Nước 3 Mở cột I cho Trắng!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 7, c: 7, p: BLACK }, // H8
              { r: 5, c: 8, p: WHITE }, // I10
              { r: 6, c: 8, p: WHITE }, // I9
              { r: 9, c: 9, p: BLACK }, // J6
            ]),
            playerColor: WHITE,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [],
            hint: 'Đặt ở ô I8 giao điểm hàng 8 và cột I.',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Tuyệt tác phản đòn! Bạn vừa cứu thua ngoạn mục tại I8 vừa cướp lại hoàn toàn quyền tiên cơ để giành chiến thắng!',
              },
              {
                row: 7,
                col: 4,
                quality: 'acceptable',
                explanation: 'Nước chặn tại E8 an toàn nhưng thụ động, bạn để mất cơ hội tạo Nước 3 Mở phản công ở cột I.',
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_7_3',
        chapterId: 7,
        order: 3,
        title: 'Bẻ Gãy Chuỗi Sát Cục Của Đối Thủ',
        subtitle: 'Nhận diện mắt xích then chốt để phá bẫy từ trong trứng nước',
        difficulty: 'master',
        durationMinutes: 5,
        description: 'Khi đối thủ đang chuẩn bị khởi động chuỗi VCF, hãy nhìn thấu mắt xích trọng yếu và chặn đứng nó trước khi chuỗi bùng nổ.',
        coreConcepts: ['Phá chuỗi VCF', 'Nhận diện từ xa', 'Phòng thủ chủ động'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 6, c: 8, p: BLACK }, // I9
          { r: 8, c: 8, p: BLACK }, // I7
          { r: 4, c: 4, p: WHITE }, // E11
          { r: 4, c: 5, p: WHITE }, // F11
        ]),
        playerColor: WHITE,
        turnPlayer: WHITE,
        detailedArticle: `Chuỗi sát cục của đối thủ luôn có một "mắt xích chuyển giao" - nơi mà một nước cờ sẽ kích hoạt đồng thời nhiều tuyến sát thương.\n- Thay vì chờ đối thủ ra đòn rồi mới cuống cuồng chạy theo đỡ,\n- Hãy chủ động chiếm lấy mắt xích đó ngay khi nó còn ở dạng tiềm năng.\n- Bằng cách này, bạn triệt tiêu toàn bộ chuỗi tấn công của đối thủ khi nó chưa kịp hình thành!`,
        summaryTakeaway: 'Phòng thủ chủ động từ xa luôn hiệu quả gấp 10 lần so với việc bị động chống đỡ khi hiểm nguy đã cận kề.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Nhận diện điểm then chốt I8: Đen đang muốn đánh vào đây để kết nối cả hàng 8 và cột I. Hãy đánh Trắng vào I8 để phá nát mưu đồ này!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 6, c: 8, p: BLACK }, // I9
              { r: 8, c: 8, p: BLACK }, // I7
              { r: 4, c: 4, p: WHITE }, // E11
              { r: 4, c: 5, p: WHITE }, // F11
            ]),
            playerColor: WHITE,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [],
            hint: 'Chiếm lấy ô cờ chiến lược I8.',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Nước cờ đẳng cấp cao thủ! Bạn đã chặt đứt mắt xích sinh tử tại I8, vô hiệu hóa hoàn toàn kế hoạch sát cục của Đen.',
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // CHƯƠNG 8: CHUYÊN ĐỀ LUẬT CẤM RENJU & BẪY PHẠM QUY
  // ==========================================
  {
    id: 8,
    title: 'Chương 8: Chuyên Đề Luật Cấm Renju & Bẫy Cấm (Renju Fouls)',
    vietnameseTitle: 'Luật Cấm Renju & Bẫy Cấm',
    badge: 'Chuyên Nghiệp Quốc Tế',
    iconName: 'Shield',
    description: 'Tìm hiểu 3 điều luật cấm quốc tế đối với quân Đen (Cấm 3-3, Cấm 4-4, Cấm Quá 5) và nghệ thuật gài bẫy ép Đen tự sát cho quân Trắng.',
    lessons: [
      {
        id: 'lesson_8_1',
        chapterId: 8,
        order: 1,
        title: 'Nhận Diện 3 Luật Cấm Của Đen (Foul Rules in Renju)',
        subtitle: 'Vì sao quân Đen đi trước bị giới hạn sức mạnh?',
        difficulty: 'master',
        durationMinutes: 5,
        description: 'Để cân bằng lợi thế đi trước tuyệt đối của Đen, luật Renju quốc tế cấm Đen đi: 3-3 kép, 4-4 kép và Quá 5 (Overline >= 6 quân).',
        coreConcepts: ['Luật cấm Renju', 'Cấm 3-3 / Cấm 4-4', 'Cấm Quá 5 (Overline)'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 5, c: 7, p: BLACK }, // H10
          { r: 6, c: 7, p: BLACK }, // H9
          { r: 3, c: 3, p: WHITE }, // D12
          { r: 9, c: 9, p: WHITE }, // J6
        ]),
        playerColor: BLACK,
        turnPlayer: BLACK,
        detailedArticle: `Trong luật Renju thi đấu quốc tế, quân Đen đi trước có ưu thế quá lớn. Do đó, Đen bị áp đặt **3 điều luật cấm**:\n\n1. **Cấm 3-3 (Double Three)**: Đen không được đánh 1 quân tạo ra 2 nước 3 mở cùng lúc.\n2. **Cấm 4-4 (Double Four)**: Đen không được đánh 1 quân tạo ra 2 nước 4 cùng lúc.\n3. **Cấm Quá 5 (Overline)**: Đen xếp 6 quân trở lên thẳng hàng không được tính thắng mà bị tính là phạm quy xử thua ngay!\n\n*(Lưu ý: Quân Trắng hoàn toàn tự do, được phép đánh 3-3, 4-4 và Overline >= 6 quân vẫn được tính là thắng trận).*`,
        summaryTakeaway: 'Khi chơi luật Renju, quân Đen phải cẩn thận tránh các ô cấm 3-3, 4-4; chỉ được chiến thắng bằng đòn 4-3 hoặc 5 quân thẳng hàng chính xác.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Quan sát ô H8: Nếu Đen đánh vào đây sẽ phạm luật cấm 3-3! Hãy tránh H8 và phát triển nước 2 mở an toàn tại I8!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 5, c: 7, p: BLACK }, // H10
              { r: 6, c: 7, p: BLACK }, // H9
              { r: 3, c: 3, p: WHITE }, // D12
              { r: 9, c: 9, p: WHITE }, // J6
            ]),
            playerColor: BLACK,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [{ row: 4, col: 7 }], // H11
            hint: 'Không được đánh vào giao điểm H8 vì phạm luật cấm 3-3! Đánh vào I8.',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Nước cờ chuẩn mực luật Renju! Bạn đã tránh bẫy tự sát 3-3 tại H8 và phát triển thế cờ an toàn tại I8.',
              },
              {
                row: 7,
                col: 7,
                quality: 'blunder',
                explanation: 'Phạm luật cấm 3-3 của quân Đen trong luật Renju! Bạn sẽ bị xử thua ngay lập tức.',
                opponentResponse: { row: 7, col: 8 },
                opponentExplanation: 'Đối thủ bắt lỗi phạm quy và giành chiến thắng theo luật Renju.'
              }
            ]
          }
        ]
      },
      {
        id: 'lesson_8_2',
        chapterId: 8,
        order: 2,
        title: 'Nghệ Thuật Bẫy Cấm (Foul Trap): Ép Đen Tự Sát',
        subtitle: 'Vũ khí phản kích tối thượng của quân Trắng',
        difficulty: 'master',
        durationMinutes: 5,
        description: 'Quân Trắng có thể tạo nước 4 ép buộc quân Đen phải nhảy vào ô chặn duy nhất, nhưng ô đó lại là ô cấm 3-3/4-4 của Đen khiến Đen tự sát!',
        coreConcepts: ['Bẫy cấm (Foul Trap)', 'Ép đối thủ phạm luật', 'Nghệ thuật cầm Trắng'],
        initialBoard: buildBoard([
          { r: 7, c: 5, p: BLACK }, // F8
          { r: 7, c: 6, p: BLACK }, // G8
          { r: 5, c: 7, p: BLACK }, // H10
          { r: 6, c: 7, p: BLACK }, // H9
          { r: 7, c: 9, p: WHITE }, // J8
          { r: 7, c: 10, p: WHITE }, // K8
          { r: 7, c: 11, p: WHITE }, // L8
        ]),
        playerColor: WHITE,
        turnPlayer: WHITE,
        detailedArticle: `Bẫy Cấm (Foul Trap) là tuyệt kỹ đẹp mắt nhất của quân Trắng trong cờ Renju quốc tế:\n- Trắng nhận thấy ô H8 là điểm giao cắt tạo 3-3 của Đen (ô cấm của Đen).\n- Trắng tạo ra **Nước 4** trên hàng ngang hoặc đường chéo nhắm thẳng vào ô H8.\n- Theo luật cờ, Đen BẮT BUỘC phải chặn nước 4 của Trắng tại H8.\n- Nhưng khi Đen đặt quân vào H8, Đen lập tức phạm luật cấm 3-3 và bị xử thua ngay!\n- Đây là đòn bẫy tinh vi chỉ có trong cờ Renju đỉnh cao.`,
        summaryTakeaway: 'Dùng nước 4 để ép quân Đen phải đánh vào ô cấm 3-3 là tuyệt kỹ tối thượng của người cầm quân Trắng.',
        steps: [
          {
            stepIndex: 1,
            instruction: 'Trắng đang có 3 quân tại J8-K8-L8. Hãy đánh vào I8 để tạo Nước 4, ép Đen phải nhảy vào ô cấm H8 tự sát!',
            initialBoard: buildBoard([
              { r: 7, c: 5, p: BLACK }, // F8
              { r: 7, c: 6, p: BLACK }, // G8
              { r: 5, c: 7, p: BLACK }, // H10
              { r: 6, c: 7, p: BLACK }, // H9
              { r: 7, c: 9, p: WHITE }, // J8
              { r: 7, c: 10, p: WHITE }, // K8
              { r: 7, c: 11, p: WHITE }, // L8
            ]),
            playerColor: WHITE,
            targetMove: { row: 7, col: 8 }, // I8
            alternativeGoodMoves: [],
            hint: 'Đánh vào I8 tạo nước 4 ép Đen chặn H8.',
            feedbacks: [
              {
                row: 7,
                col: 8,
                quality: 'best',
                explanation: 'Tuyệt tác bẫy cấm Foul Trap! Đen buộc phải chặn tại H8, vô tình phạm luật cấm 3-3 và Trắng giành chiến thắng ngoạn mục!',
              }
            ]
          }
        ]
      }
    ]
  }
];

export function getAllLessons(): GuideLesson[] {
  return GUIDE_CHAPTERS.flatMap(ch => ch.lessons);
}

export function getLessonById(id: string): GuideLesson | undefined {
  return getAllLessons().find(l => l.id === id);
}

export function getChapterByLessonId(lessonId: string): GuideChapter | undefined {
  return GUIDE_CHAPTERS.find(ch => ch.lessons.some(l => l.id === lessonId));
}
