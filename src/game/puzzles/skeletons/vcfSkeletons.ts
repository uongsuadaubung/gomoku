import { BLACK, WHITE } from '../../types';
import { SkeletonPoolByStars } from '../types';

/**
 * Bộ khung hạt giống chiến thuật chuẩn Tsume-Renju & Gomoku cho từng cấp độ (1 - 7 sao) VCF
 */
export const BASE_VCF_SKELETON_POOLS: SkeletonPoolByStars = {
  1: [
    [
      { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK },
      { r: 0, c: 1, player: BLACK }, { r: 0, c: 2, player: BLACK },
      { r: 0, c: -3, player: WHITE }, { r: 0, c: 3, player: WHITE },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK },
      { r: 0, c: -1, player: BLACK }, { r: 0, c: 1, player: BLACK },
      { r: 0, c: -4, player: WHITE }, { r: 0, c: 2, player: WHITE },
      { r: -1, c: 0, player: WHITE }, { r: 1, c: -2, player: WHITE },
    ],
    [
      { r: -2, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK },
      { r: 1, c: 1, player: BLACK }, { r: 2, c: 2, player: BLACK },
      { r: -3, c: -3, player: WHITE }, { r: 3, c: 3, player: WHITE },
      { r: 0, c: 1, player: WHITE }, { r: 1, c: 0, player: WHITE },
    ],
    [
      { r: -3, c: 0, player: BLACK }, { r: -1, c: 0, player: BLACK },
      { r: 0, c: 0, player: BLACK }, { r: 1, c: 0, player: BLACK },
      { r: -4, c: 0, player: WHITE }, { r: 2, c: 0, player: WHITE },
      { r: 0, c: -1, player: WHITE }, { r: -1, c: 1, player: WHITE },
    ],
    [
      { r: -2, c: 2, player: BLACK }, { r: -1, c: 1, player: BLACK },
      { r: 1, c: -1, player: BLACK }, { r: 2, c: -2, player: BLACK },
      { r: -3, c: 3, player: WHITE }, { r: 3, c: -3, player: WHITE },
      { r: 0, c: -1, player: WHITE }, { r: -1, c: 0, player: WHITE },
    ],
    [
      { r: 0, c: -1, player: BLACK }, { r: 0, c: 1, player: BLACK },
      { r: 0, c: 2, player: BLACK }, { r: 0, c: 3, player: BLACK },
      { r: 0, c: -2, player: WHITE }, { r: 0, c: 4, player: WHITE },
      { r: -1, c: 1, player: WHITE }, { r: 1, c: 2, player: WHITE },
    ],
  ],
  2: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: 4, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
    ],
    [
      { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: 1, player: BLACK }, { r: 0, c: -3, player: WHITE }, { r: 0, c: 2, player: WHITE },
      { r: -1, c: 0, player: BLACK }, { r: 1, c: 0, player: BLACK }, { r: 2, c: 0, player: BLACK }, { r: -2, c: 0, player: WHITE }, { r: 3, c: 0, player: WHITE },
    ],
    [
      { r: -2, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK }, { r: 1, c: 1, player: BLACK }, { r: -3, c: -3, player: WHITE }, { r: 2, c: 2, player: WHITE },
      { r: -2, c: 2, player: BLACK }, { r: -1, c: 1, player: BLACK }, { r: 1, c: -1, player: BLACK }, { r: -3, c: 3, player: WHITE }, { r: 2, c: -2, player: WHITE },
    ],
    [
      { r: -1, c: -3, player: BLACK }, { r: -1, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK }, { r: -1, c: -4, player: WHITE },
      { r: 1, c: -1, player: BLACK }, { r: 2, c: -1, player: BLACK }, { r: 3, c: -1, player: BLACK }, { r: 0, c: -1, player: WHITE }, { r: 4, c: -1, player: WHITE },
      { r: -1, c: 1, player: WHITE },
    ],
    // Mẫu 2-Star bổ sung: Ngang chuyển Chéo chính
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 2, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 4, c: 4, player: BLACK }, { r: -1, c: -1, player: WHITE }, { r: 5, c: 5, player: WHITE },
      { r: 1, c: 0, player: WHITE },
    ],
    // Mẫu 2-Star bổ sung: Ngang chuyển Chéo phụ
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: -2, player: BLACK }, { r: 3, c: -3, player: BLACK }, { r: 4, c: -4, player: BLACK }, { r: -1, c: 1, player: WHITE }, { r: 5, c: -5, player: WHITE },
      { r: 1, c: 0, player: WHITE },
    ],
    // Mẫu 2-Star bổ sung: Dọc chuyển Ngang
    [
      { r: -3, c: 0, player: BLACK }, { r: -2, c: 0, player: BLACK }, { r: -1, c: 0, player: BLACK }, { r: -4, c: 0, player: WHITE },
      { r: 0, c: 2, player: BLACK }, { r: 0, c: 3, player: BLACK }, { r: 0, c: 4, player: BLACK }, { r: 0, c: -1, player: WHITE }, { r: 0, c: 5, player: WHITE },
      { r: 1, c: 1, player: WHITE },
    ],
    // Mẫu 2-Star: Song Tứ Chữ Thập (Double Four Cross)
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: -3, c: 0, player: BLACK }, { r: -2, c: 0, player: BLACK }, { r: -1, c: 0, player: BLACK }, { r: -4, c: 0, player: WHITE },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
    // Mẫu 2-Star: Song Tứ Chéo (Diagonal Double Four)
    [
      { r: -3, c: -3, player: BLACK }, { r: -2, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK }, { r: -4, c: -4, player: WHITE },
      { r: -3, c: 3, player: BLACK }, { r: -2, c: 2, player: BLACK }, { r: -1, c: 1, player: BLACK }, { r: -4, c: 4, player: WHITE },
      { r: 1, c: 0, player: WHITE }, { r: -1, c: 0, player: WHITE },
    ],
    // Mẫu 2-Star: Khóa Mép Bàn Cờ (Edge Pinning VCF)
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: 4, c: 0, player: BLACK }, { r: 5, c: 0, player: WHITE },
      { r: 1, c: 1, player: WHITE }, { r: 1, c: -1, player: WHITE },
    ],
    // Mẫu 2-Star: Cầu Nối Song Tứ Tầm Xa (Long-Range Bridge Double Four)
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: -3, c: 3, player: BLACK }, { r: -2, c: 2, player: BLACK }, { r: -1, c: 1, player: BLACK }, { r: -4, c: 4, player: WHITE },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
  ],
  3: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
      { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: 3, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
      { r: 2, c: 1, player: WHITE },
    ],
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 4, c: 0, player: WHITE },
      { r: 3, c: -2, player: BLACK }, { r: 4, c: -3, player: BLACK }, { r: 5, c: -4, player: BLACK }, { r: 6, c: -5, player: WHITE },
      { r: 2, c: -1, player: WHITE },
    ],
    // Mẫu 3-Star: Sát cục bậc thang (Staircase Cascade)
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: 0, player: BLACK }, { r: 2, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 4, c: 0, player: WHITE },
      { r: 3, c: 1, player: BLACK }, { r: 3, c: 2, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 3, c: -1, player: WHITE }, { r: 3, c: 5, player: WHITE },
      { r: 1, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE },
    ],
  ],
  4: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
      { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
      { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 4, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
      { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE },
    ],
  ],
  5: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
      { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
      { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
      { r: 4, c: 1, player: BLACK }, { r: 4, c: 2, player: BLACK }, { r: 4, c: 5, player: BLACK }, { r: 4, c: -1, player: WHITE }, { r: 4, c: 6, player: WHITE },
      { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE }, { r: 3, c: 2, player: WHITE },
      { r: -2, c: 2, player: WHITE }, { r: 5, c: -2, player: WHITE }, { r: 3, c: 4, player: WHITE }, { r: 2, c: 4, player: WHITE },
    ],
  ],
  6: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
      { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
      { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
      { r: 4, c: 1, player: BLACK }, { r: 4, c: 2, player: BLACK }, { r: 4, c: 5, player: WHITE }, { r: 4, c: -2, player: WHITE },
      { r: -2, c: 0, player: BLACK }, { r: -3, c: 0, player: WHITE },
      { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE }, { r: 3, c: 2, player: WHITE },
      { r: -2, c: 2, player: WHITE }, { r: 5, c: -2, player: WHITE }, { r: 3, c: 4, player: WHITE }, { r: 2, c: 4, player: WHITE }, { r: 2, c: -1, player: WHITE },
    ],
  ],
  7: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE }, { r: 5, c: 0, player: WHITE },
      { r: 1, c: 1, player: BLACK }, { r: 1, c: 2, player: BLACK }, { r: 1, c: -1, player: WHITE }, { r: 1, c: 5, player: WHITE },
      { r: 2, c: 3, player: BLACK }, { r: 3, c: 3, player: BLACK }, { r: 0, c: 3, player: WHITE }, { r: 6, c: 3, player: WHITE },
      { r: 4, c: 1, player: BLACK }, { r: 4, c: 2, player: BLACK }, { r: 4, c: 5, player: WHITE }, { r: 4, c: -2, player: WHITE },
      { r: 3, c: -1, player: BLACK }, { r: 1, c: -3, player: BLACK }, { r: 5, c: 1, player: WHITE },
      { r: 2, c: 1, player: WHITE }, { r: 2, c: 2, player: WHITE }, { r: 3, c: 1, player: WHITE }, { r: 3, c: 2, player: WHITE },
      { r: -2, c: 2, player: WHITE }, { r: 5, c: -2, player: WHITE }, { r: 3, c: 4, player: WHITE }, { r: 2, c: 4, player: WHITE },
      { r: 2, c: -1, player: WHITE }, { r: 3, c: -3, player: WHITE },
    ],
  ],
};
