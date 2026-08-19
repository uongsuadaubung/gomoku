import { BLACK, WHITE } from '../../types';
import { SkeletonPoolByStars } from '../types';

/**
 * Kho hạt giống chiến thuật chuẩn Tsume-Renju VCT (Đòn bẫy đôi 4-3, song tam 3-3)
 */
export const BASE_VCT_SKELETON_POOLS: SkeletonPoolByStars = {
  1: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: -2, c: 0, player: BLACK }, { r: -1, c: 0, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: -2, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK },
      { r: 1, c: 0, player: WHITE }, { r: 0, c: 1, player: WHITE },
    ],
    [
      { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK },
      { r: -2, c: 0, player: BLACK }, { r: -1, c: 0, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
    [
      { r: 1, c: 0, player: BLACK }, { r: 2, c: 0, player: BLACK }, { r: 3, c: 0, player: BLACK }, { r: 4, c: 0, player: WHITE },
      { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
    [
      { r: -3, c: -3, player: BLACK }, { r: -2, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK }, { r: -4, c: -4, player: WHITE },
      { r: 0, c: 1, player: BLACK }, { r: 0, c: 2, player: BLACK },
      { r: 1, c: 0, player: WHITE }, { r: -1, c: 0, player: WHITE },
    ],
    // Mẫu 1-Star VCT bổ sung: Bẫy 4-3 đường chéo phụ
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: -1, player: BLACK }, { r: 2, c: -2, player: BLACK },
      { r: -1, c: 0, player: WHITE }, { r: 1, c: 1, player: WHITE },
    ],
    // Mẫu 1G: Song Tam Chữ V (V-Shape Double Three)
    [
      { r: -2, c: -2, player: BLACK }, { r: -1, c: -1, player: BLACK },
      { r: -2, c: 2, player: BLACK }, { r: -1, c: 1, player: BLACK },
      { r: 1, c: 0, player: WHITE }, { r: -3, c: 0, player: WHITE },
    ],
    // Mẫu 1H: Bẫy 4-3 Chữ L liên tiếp chuẩn xác
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: 0, player: BLACK }, { r: 2, c: 0, player: BLACK },
      { r: -2, c: 0, player: WHITE }, { r: 4, c: 0, player: WHITE },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
    // Mẫu 1I: Bẫy 4-3 Ép Sát Mép Bàn Cờ (Edge Pinning 4-3)
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: 0, player: BLACK }, { r: 2, c: 0, player: BLACK },
      { r: 4, c: 0, player: WHITE },
      { r: -2, c: 0, player: WHITE },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: -1, player: WHITE },
    ],
  ],
  2: [
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE },
      { r: 2, c: -2, player: BLACK }, { r: 2, c: -1, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: 0, c: 2, player: WHITE }, { r: 2, c: 1, player: WHITE }, { r: 1, c: -2, player: WHITE },
    ],
    [
      { r: -3, c: 0, player: BLACK }, { r: -2, c: 0, player: BLACK }, { r: -1, c: 0, player: BLACK }, { r: -4, c: 0, player: WHITE },
      { r: 0, c: 1, player: BLACK }, { r: 0, c: -1, player: WHITE },
      { r: 1, c: 2, player: BLACK }, { r: 2, c: 2, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: -1, c: 1, player: WHITE }, { r: 0, c: 3, player: WHITE },
    ],
    // Mẫu 2-Star VCT bổ sung: Nước 4 ép chặn chuyển sang Bẫy 4-3 chéo phụ
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE },
      { r: 2, c: 1, player: BLACK }, { r: 2, c: 2, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: 0, c: 2, player: WHITE }, { r: 2, c: -1, player: WHITE },
    ],
    // Mẫu 2-Star VCT quốc tế: Đòn dọa dọc ép chặn chuyển bẫy 4-3 ngang
    [
      { r: -3, c: 0, player: BLACK }, { r: -2, c: 0, player: BLACK }, { r: -1, c: 0, player: BLACK }, { r: -4, c: 0, player: WHITE },
      { r: 0, c: 1, player: BLACK }, { r: 0, c: 2, player: BLACK }, { r: 0, c: -1, player: WHITE },
      { r: 1, c: 3, player: BLACK }, { r: -1, c: 3, player: WHITE },
      { r: 2, c: 2, player: BLACK }, { r: 2, c: 1, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: 1, c: 2, player: WHITE }, { r: 2, c: 0, player: WHITE }, { r: 3, c: 3, player: WHITE },
    ],
  ],
  3: [
    // 3A: Đòn VCT 3 nước: Four -> Three -> 4-3 Fork
    [
      { r: 0, c: -3, player: BLACK }, { r: 0, c: -2, player: BLACK }, { r: 0, c: -1, player: BLACK }, { r: 0, c: -4, player: WHITE },
      { r: 1, c: 0, player: BLACK }, { r: 2, c: 0, player: BLACK }, { r: -1, c: 0, player: WHITE },
      { r: 3, c: 1, player: BLACK }, { r: 3, c: -1, player: WHITE },
      { r: 2, c: 2, player: BLACK }, { r: 1, c: 2, player: BLACK },
      { r: 1, c: 1, player: WHITE }, { r: 2, c: 1, player: WHITE }, { r: 0, c: 2, player: WHITE }, { r: 3, c: 3, player: WHITE },
    ],
  ],
};
