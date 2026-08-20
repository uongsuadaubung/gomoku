import { BLACK, WHITE } from '../../game/types';
import { buildBoard } from './lessons';
import type { PresetBoard } from './types';

export const PRESET_BOARDS: PresetBoard[] = [
  // ==========================================
  // 1. KHAI CUỘC TRỰC TIẾP (DIRECT OPENINGS)
  // ==========================================
  {
    id: 'opening_huayue',
    category: 'opening_direct',
    categoryName: 'Khai Cuộc Trực Tiếp',
    name: 'Hoa Nguyệt (Huayue - Direct 1)',
    vietnameseName: 'Thế Hoa Nguyệt (Đen áp đảo)',
    description: 'Thế cờ góc vuông chữ L ôm sát Trắng. Đen chiếm ưu thế bành trướng tuyệt đối.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 7, c: 8, p: WHITE }, // I8
      { r: 8, c: 8, p: BLACK }, // I7
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 6, col: 7 }, // H9
    tacticalNote: 'Trắng nên đánh vào H9 hoặc H7 để kiềm tỏa các tuyến ngang dọc của Đen.',
  },
  {
    id: 'opening_puyue',
    category: 'opening_direct',
    categoryName: 'Khai Cuộc Trực Tiếp',
    name: 'Phố Nguyệt (Puyue - Direct 2)',
    vietnameseName: 'Thế Phố Nguyệt (Gọng kìm 2 hướng)',
    description: 'Nước 3 của Đen đặt ở H7, tạo thành góc kẹp mở ra 2 hướng tấn công song song.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 7, c: 8, p: WHITE }, // I8
      { r: 8, c: 7, p: BLACK }, // H7
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 8, col: 8 }, // I7
    tacticalNote: 'Trắng đánh I7 để khóa cứng góc vuông của Đen và giữ vững trung tâm.',
  },
  {
    id: 'opening_yuyue',
    category: 'opening_direct',
    categoryName: 'Khai Cuộc Trực Tiếp',
    name: 'Vũ Nguyệt (Yuyue - Rain Moon)',
    vietnameseName: 'Thế Vũ Nguyệt (Đòn thẳng uy lực)',
    description: 'Nước 3 của Đen kéo dài cùng trục với nước 1, tạo chuỗi 2 quân thẳng hàng xuyên tâm.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 7, c: 8, p: WHITE }, // I8
      { r: 7, c: 6, p: BLACK }, // G8
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 7, col: 5 }, // F8
    tacticalNote: 'Trắng cần phong tỏa ngay đầu còn lại của hàng 8 tại F8 để ngăn Đen tạo 3 mở.',
  },
  {
    id: 'opening_gingetsu',
    category: 'opening_direct',
    categoryName: 'Khai Cuộc Trực Tiếp',
    name: 'Ngân Nguyệt (Gingetsu - Silver Moon)',
    vietnameseName: 'Thế Ngân Nguyệt (Nhảy cóc đắc địa)',
    description: 'Đen đặt quân thứ 3 tại J7, tạo thế nhảy cóc chéo ôm trọn lấy quân Trắng.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 7, c: 8, p: WHITE }, // I8
      { r: 8, c: 9, p: BLACK }, // J7
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 8, col: 8 }, // I7
    tacticalNote: 'Trắng chen vào giữa tại I7 để chia cắt sự liên lạc của 2 quân Đen.',
  },
  {
    id: 'opening_kyogetsu',
    category: 'opening_direct',
    categoryName: 'Khai Cuộc Trực Tiếp',
    name: 'Hạp Nguyệt (Kyogetsu - Valley Moon)',
    vietnameseName: 'Thế Hạp Nguyệt (Thung lũng gài bẫy)',
    description: 'Đen xếp nước 3 tại H9, tạo thành thế 2 quân dọc bao vây sườn trên của Trắng.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 7, c: 8, p: WHITE }, // I8
      { r: 6, c: 7, p: BLACK }, // H9
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 8, col: 7 }, // H7
    tacticalNote: 'Trắng nên kéo dài phòng tuyến xuống H7 để ngăn Đen chiếm trục dọc cột H.',
  },

  // ==========================================
  // 2. KHAI CUỘC GIÁN TIẾP (INDIRECT OPENINGS)
  // ==========================================
  {
    id: 'opening_qiuyue',
    category: 'opening_indirect',
    categoryName: 'Khai Cuộc Gián Tiếp',
    name: 'Khâu Nguyệt (Qiuyue - Indirect 1)',
    vietnameseName: 'Thế Khâu Nguyệt (Đường chéo cân bằng)',
    description: 'Trắng đi chéo I9, Đen đặt I7 mở toang đường chéo chính phía Nam.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 6, c: 8, p: WHITE }, // I9
      { r: 8, c: 8, p: BLACK }, // I7
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 7, col: 8 }, // I8
    tacticalNote: 'Trắng chiếm I8 để kết nối 2 quân và bịt góc trên của Đen.',
  },
  {
    id: 'opening_xieyue',
    category: 'opening_indirect',
    categoryName: 'Khai Cuộc Gián Tiếp',
    name: 'Tà Nguyệt (Xieyue - Slanting Moon)',
    vietnameseName: 'Thế Tà Nguyệt (Nghiêng cánh biến ảo)',
    description: 'Đen đặt quân thứ 3 tại H7 tạo góc đối xứng lệch với quân Trắng.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 6, c: 8, p: WHITE }, // I9
      { r: 8, c: 7, p: BLACK }, // H7
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 6, col: 7 }, // H9
    tacticalNote: 'Trắng áp sát tại H9 để cản bước tiến dọc của Đen trên cột H.',
  },
  {
    id: 'opening_suigetsu',
    category: 'opening_indirect',
    categoryName: 'Khai Cuộc Gián Tiếp',
    name: 'Thủy Nguyệt (Suigetsu - Water Moon)',
    vietnameseName: 'Thế Thủy Nguyệt (Sóng tràn 2 bên)',
    description: 'Đen đặt nước 3 tại G9, tạo thành 2 quân đối xứng trục chéo Tây Bắc.',
    board: buildBoard([
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 6, c: 8, p: WHITE }, // I9
      { r: 6, c: 6, p: BLACK }, // G9
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 6, col: 7 }, // H9
    tacticalNote: 'Trắng cắm chốt tại H9 chen giữa 2 quân Đen trên hàng 9.',
  },

  // ==========================================
  // 3. THẾ CỜ ĐÒN BẪY KÉP (TACTICAL FORKS)
  // ==========================================
  {
    id: 'fork_four_three',
    category: 'tactical_fork',
    categoryName: 'Đòn Bẫy Kép',
    name: 'Tử Huyệt Đòn Kép 4-3',
    vietnameseName: 'Thế 4-3 Kép Kết Liễu Tuyệt Đối',
    description: 'Bàn cờ có sẵn cấu trúc 4-3 ẩn. Tìm điểm giao cắt H8 để tung đòn kết liễu không thể cản phá.',
    board: buildBoard([
      { r: 6, c: 7, p: BLACK }, // H9
      { r: 8, c: 7, p: BLACK }, // H7
      { r: 9, c: 7, p: BLACK }, // H6
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 4, c: 4, p: WHITE }, // E11
      { r: 5, c: 9, p: WHITE }, // J10
      { r: 9, c: 4, p: WHITE }, // E6
    ]),
    turnPlayer: BLACK,
    recommendedMove: { row: 7, col: 7 }, // H8
    tacticalNote: 'Đánh vào H8 tạo đồng thời Nước 4 dọc cột H và Nước 3 mở ngang hàng 8, Trắng đầu hàng 100%.',
  },
  {
    id: 'fork_double_three',
    category: 'tactical_fork',
    categoryName: 'Đòn Bẫy Kép',
    name: 'Bẫy Kép 3-3 Quá Tải',
    vietnameseName: 'Thế 3-3 Kép Song Kiếm Hợp Bích',
    description: 'Đen có 2 chuỗi 2 quân chờ kích hoạt. Đánh vào giao điểm H8 để tạo 2 nước 3 mở song hành.',
    board: buildBoard([
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 5, c: 7, p: BLACK }, // H10
      { r: 6, c: 7, p: BLACK }, // H9
      { r: 3, c: 9, p: WHITE }, // J12
      { r: 9, c: 3, p: WHITE }, // D6
    ]),
    turnPlayer: BLACK,
    recommendedMove: { row: 7, col: 7 }, // H8
    tacticalNote: 'Đánh H8 ép Trắng chỉ chặn được 1 hướng, hướng còn lại biến thành 4 mở.',
  },
  {
    id: 'fork_diagonal_cross',
    category: 'tactical_fork',
    categoryName: 'Đòn Bẫy Kép',
    name: 'Đòn Chéo Xiên Bất Ngờ',
    vietnameseName: 'Thế Chéo Kép 4-3 Ẩn Tàng',
    description: 'Kết hợp đường chéo dài và hàng ngang để giăng bẫy đối phương.',
    board: buildBoard([
      { r: 5, c: 5, p: BLACK }, // F10
      { r: 6, c: 6, p: BLACK }, // G9
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 4, c: 8, p: WHITE }, // I11
      { r: 8, c: 4, p: WHITE }, // E7
    ]),
    turnPlayer: BLACK,
    recommendedMove: { row: 7, col: 7 }, // H8
    tacticalNote: 'Giao điểm H8 kết nối đường chéo Tây Bắc và hàng ngang trung tâm.',
  },

  // ==========================================
  // 4. CHUỖI SÁT CỤC VCF / VCT (VCF/VCT CHAINS)
  // ==========================================
  {
    id: 'vcf_classic_3steps',
    category: 'vcf_chain',
    categoryName: 'Chuỗi Sát Cục',
    name: 'Sát Cục VCF 3 Nước Ép Bức',
    vietnameseName: 'Chuỗi VCF Bắt Đối Thủ Đỡ Đến Chết',
    description: 'Chuỗi nước 4 liên tiếp không cho đối thủ quyền phản kháng.',
    board: buildBoard([
      { r: 7, c: 4, p: BLACK }, // E8
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 5, c: 8, p: BLACK }, // I10
      { r: 6, c: 8, p: BLACK }, // I9
      { r: 8, c: 8, p: BLACK }, // I7
      { r: 9, c: 8, p: BLACK }, // I6
      { r: 7, c: 3, p: WHITE }, // D8
      { r: 4, c: 4, p: WHITE }, // E11
    ]),
    turnPlayer: BLACK,
    recommendedMove: { row: 7, col: 7 }, // H8
    tacticalNote: 'Bắt đầu bằng H8 tạo 4 ngang ép Trắng chặn I8, sau đó dứt điểm trên cột I.',
  },
  {
    id: 'vct_pressure_master',
    category: 'vcf_chain',
    categoryName: 'Chuỗi Sát Cục',
    name: 'Đòn Ép VCT Dồn Toàn Lực',
    vietnameseName: 'Chuỗi VCT Ép Đối Thủ Cạn Kiệt Nước Đi',
    description: 'Liên hoàn nước 3 mở chuyển hóa thành đòn 4-3 quyết định.',
    board: buildBoard([
      { r: 6, c: 6, p: BLACK }, // G9
      { r: 6, c: 7, p: BLACK }, // H9
      { r: 8, c: 6, p: BLACK }, // G7
      { r: 9, c: 6, p: BLACK }, // G6
      { r: 4, c: 9, p: WHITE }, // J11
      { r: 9, c: 9, p: WHITE }, // J6
    ]),
    turnPlayer: BLACK,
    recommendedMove: { row: 6, col: 8 }, // I9
    tacticalNote: 'Đánh I9 mở ra thế ép liên tục.',
  },

  // ==========================================
  // 5. NGHỆ THUẬT PHÒNG THỦ (MASTER DEFENSE)
  // ==========================================
  {
    id: 'defense_dual_block',
    category: 'defense_master',
    categoryName: 'Bậc Thầy Phòng Thủ',
    name: 'Nước Chặn 1 Hóa Giải 2',
    vietnameseName: 'Nước Cờ Cứu Thua Ngoạn Mục',
    description: 'Đen đang có 2 mũi nhọn nguy hiểm. Trắng đặt 1 quân tại giao điểm để triệt tiêu cả 2.',
    board: buildBoard([
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 5, c: 7, p: BLACK }, // H10
      { r: 6, c: 7, p: BLACK }, // H9
      { r: 3, c: 3, p: WHITE }, // D12
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 7, col: 7 }, // H8
    tacticalNote: 'Chiếm lấy tử huyệt H8 phá tan mưu đồ đòn kép của Đen.',
  },
  {
    id: 'defense_counter_attack',
    category: 'defense_master',
    categoryName: 'Bậc Thầy Phòng Thủ',
    name: 'Chặn Kèm Phản Công Cướp Tiên Cơ',
    vietnameseName: 'Phòng Ngự Phản Công Đẳng Cấp',
    description: 'Trắng vừa chặn nước 3 mở của Đen, vừa tạo nước 3 mở của riêng mình để lật ngược thế cờ.',
    board: buildBoard([
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 5, c: 8, p: WHITE }, // I10
      { r: 6, c: 8, p: WHITE }, // I9
      { r: 9, c: 9, p: BLACK }, // J6
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 7, col: 8 }, // I8
    tacticalNote: 'Đánh I8 cướp lại toàn bộ quyền chủ động ván cờ.',
  },
  {
    id: 'fork_double_four',
    category: 'tactical_fork',
    categoryName: 'Đòn Bẫy Kép',
    name: 'Đòn Kép 4-4 Tuyệt Đối',
    vietnameseName: 'Thế 4-4 Kép Hỏa Lực Hủy Diệt',
    description: 'Tạo đồng thời 2 Nước 4 ngang và dọc, đối thủ chỉ chặn được 1 bên và bất lực nhận thất bại.',
    board: buildBoard([
      { r: 7, c: 4, p: BLACK }, // E8
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 4, c: 7, p: BLACK }, // H11
      { r: 5, c: 7, p: BLACK }, // H10
      { r: 6, c: 7, p: BLACK }, // H9
      { r: 7, c: 3, p: WHITE }, // D8
      { r: 3, c: 7, p: WHITE }, // H12
    ]),
    turnPlayer: BLACK,
    recommendedMove: { row: 7, col: 7 }, // H8
    tacticalNote: 'Đánh H8 tạo 2 nước 4 cùng lúc, dứt điểm ván cờ.',
  },
  {
    id: 'quiet_move_master',
    category: 'tactical_fork',
    categoryName: 'Đòn Bẫy Kép',
    name: 'Nghệ Thuật Nước Chờ',
    vietnameseName: 'Nước Chờ Âm Thầm Giăng Bẫy',
    description: 'Nước cờ tĩnh lặng nhưng chiếm lĩnh vị trí huyết mạch, chuẩn bị 2-3 mối đe dọa bùng nổ ở lượt sau.',
    board: buildBoard([
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 7, c: 7, p: BLACK }, // H8
      { r: 5, c: 8, p: BLACK }, // I10
      { r: 6, c: 8, p: WHITE }, // I9
      { r: 8, c: 8, p: WHITE }, // I7
    ]),
    turnPlayer: BLACK,
    recommendedMove: { row: 7, col: 8 }, // I8
    tacticalNote: 'Đánh I8 kết nối hàng ngang và cột dọc, tạo thế tấn công toàn diện.',
  },
  {
    id: 'renju_foul_trap',
    category: 'defense_master',
    categoryName: 'Bậc Thầy Phòng Thủ',
    name: 'Bẫy Cấm Renju Foul Trap',
    vietnameseName: 'Tuyệt Kỹ Bẫy Cấm Ép Đen Tự Sát',
    description: 'Trắng tạo nước 4 ép Đen phải nhảy vào ô cấm 3-3 tại H8 khiến Đen bị xử thua ngay.',
    board: buildBoard([
      { r: 7, c: 5, p: BLACK }, // F8
      { r: 7, c: 6, p: BLACK }, // G8
      { r: 5, c: 7, p: BLACK }, // H10
      { r: 6, c: 7, p: BLACK }, // H9
      { r: 7, c: 9, p: WHITE }, // J8
      { r: 7, c: 10, p: WHITE }, // K8
      { r: 7, c: 11, p: WHITE }, // L8
    ]),
    turnPlayer: WHITE,
    recommendedMove: { row: 7, col: 8 }, // I8
    tacticalNote: 'Đánh I8 tạo nước 4 ép Đen nhảy vào ô cấm H8 tự sát theo luật Renju.',
  }
];

export function getPresetById(id: string): PresetBoard | undefined {
  return PRESET_BOARDS.find(p => p.id === id);
}
