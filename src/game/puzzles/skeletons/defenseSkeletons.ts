import { BLACK, WHITE } from '../../types';
import { SkeletonPoolByStars } from '../types';

/**
 * Kho hạt giống thế cờ Phòng Thủ & Phản Kích (Defense & Counter-Attack)
 * Bối cảnh: Trắng đang có nguy cơ thắng trong 1-2 lượt (4 mở hoặc 3 mở), Đen phải tìm 1 nước vừa thủ vừa phản đòn
 */
export const BASE_DEFENSE_SKELETON_POOLS: SkeletonPoolByStars = {
  1: [
    // Def-1A: Trắng dọa 3 mở, Đen chặn tại giao điểm và tạo đòn 4-3 sát cục
    [
      { r: 0, c: -1, player: WHITE }, { r: 0, c: 0, player: WHITE }, { r: 0, c: 1, player: WHITE },
      { r: -3, c: 2, player: BLACK }, { r: -2, c: 2, player: BLACK }, { r: -1, c: 2, player: BLACK }, { r: -4, c: 2, player: WHITE },
      { r: 1, c: 3, player: BLACK }, { r: 2, c: 4, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
    // Def-1B: Trắng dọa nước 4 nhảy cóc, Đen chặn lỗ hổng và hoàn tất đòn 5 quân thắng ngay
    [
      { r: -1, c: -1, player: WHITE }, { r: 1, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 3, player: WHITE },
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: 1, player: BLACK },
      { r: 0, c: -4, player: WHITE }, { r: 0, c: 2, player: WHITE },
    ],
    // Def-1C: Trắng dọa 4 chéo (đã bị chặn đầu -3,-3), Đen chặn đầu còn lại tại (2,2) tạo 4 quân ngang và 3 mở dọc
    [
      { r: -3, c: -3, player: BLACK }, { r: -2, c: -2, player: WHITE }, { r: -1, c: -1, player: WHITE }, { r: 0, c: 0, player: WHITE }, { r: 1, c: 1, player: WHITE },
      { r: 2, c: -1, player: BLACK }, { r: 2, c: 0, player: BLACK }, { r: 2, c: 1, player: BLACK }, { r: 2, c: -2, player: WHITE },
      { r: 0, c: 2, player: BLACK }, { r: 1, c: 2, player: BLACK },
      { r: -2, c: 2, player: WHITE }, { r: 4, c: 2, player: WHITE },
    ],
    // Def-1D: Trắng dọa 4 dọc (đã bị chặn đầu -3,0), Đen chặn đầu còn lại tại (2,0) tạo 4 quân ngang và 3 mở chéo phụ
    [
      { r: -3, c: 0, player: BLACK }, { r: -2, c: 0, player: WHITE }, { r: -1, c: 0, player: WHITE }, { r: 0, c: 0, player: WHITE }, { r: 1, c: 0, player: WHITE },
      { r: 2, c: -3, player: BLACK }, { r: 2, c: -2, player: BLACK }, { r: 2, c: -1, player: BLACK }, { r: 2, c: -4, player: WHITE },
      { r: 3, c: 1, player: BLACK }, { r: 4, c: 2, player: BLACK },
      { r: 0, c: -2, player: WHITE }, { r: 6, c: 4, player: WHITE },
    ],
    // Def-1E: Trắng dọa 4 nhảy, Đen chặn và mở đòn Bẫy 4-3 sát cục ngay trong 1 nước
    [
      { r: -1, c: -1, player: WHITE }, { r: 1, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 3, player: WHITE },
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE },
      { r: 2, c: 1, player: BLACK }, { r: 0, c: 2, player: BLACK }, { r: 1, c: 2, player: BLACK },
      { r: 2, c: -1, player: WHITE }, { r: 2, c: 4, player: WHITE }, { r: -1, c: 2, player: WHITE }, { r: 4, c: 2, player: WHITE },
    ],
  ],
  2: [
    // Def-2A: Chặn 4 nhảy chéo Trắng -> Ép 4 ngang Đen -> Thắng 5 dọc Đen
    [
      { r: -1, c: -1, player: WHITE }, { r: 1, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 3, player: WHITE },
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: 4, c: 0, player: BLACK }, { r: 5, c: 0, player: WHITE }, { r: -2, c: 0, player: WHITE },
    ],
    // Def-2B: Chặn 4 nhảy dọc Trắng -> Ép 4 chéo Đen -> Thắng 5 ngang Đen
    [
      { r: -1, c: 0, player: WHITE }, { r: 1, c: 0, player: WHITE }, { r: 2, c: 0, player: WHITE }, { r: 3, c: 0, player: WHITE },
      { r: -3, c: -3, player: BLACK }, { r: -2, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK }, { r: -4, c: -4, player: WHITE },
      { r: 0, c: 1, player: BLACK }, { r: 0, c: 3, player: BLACK }, { r: 0, c: 4, player: BLACK }, { r: 0, c: 5, player: WHITE }, { r: 0, c: -2, player: WHITE },
    ],
  ],
};

