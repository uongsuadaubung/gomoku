import { LevelConfig } from './types';

export const STAR_POINTS: [number, number][] = [
  [3, 3],
  [3, 11],
  [7, 7],
  [11, 3],
  [11, 11],
];

// Hệ thống cấp độ AI thăng tiến theo số trận thắng (mỗi level ~ 4 trận thắng)
export const AI_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Novice',
    vietnameseName: 'Tập Sự',
    tag: 'Dễ tiếp cận',
    minWins: 0,
    maxWins: 3,
    depth: 1,
    candidateCount: 8,
    randomness: 0.35, // Chọn ngẫu nhiên mềm giữa top 3 nước tốt
    vcfEnabled: false,
    color: '#22c55e',
    gradient: 'from-emerald-500 to-green-600',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    avatar: '🙄',
    description: 'Nắm vững luật cơ bản, ưu tiên tấn công và phòng ngự trực diện, lối đánh phóng khoáng.',
    tactics: 'Đòn đánh đơn giản, dễ tiếp cận.',
  },
  {
    id: 2,
    name: 'Casual',
    vietnameseName: 'Nghiệp Dư',
    tag: 'Cảnh giác cao',
    minWins: 4,
    maxWins: 7,
    depth: 2,
    candidateCount: 10,
    randomness: 0.15,
    vcfEnabled: false,
    color: '#0ea5e9',
    gradient: 'from-sky-500 to-blue-600',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    avatar: '🙄',
    description: 'Biết phán đoán nước cờ tiếp theo, chủ động phong tỏa các thế 3 mở của bạn.',
    tactics: 'Phòng thủ cảnh giác, hạn chế sơ hở.',
  },
  {
    id: 3,
    name: 'Adept',
    vietnameseName: 'Cao Thủ',
    tag: 'Gài bẫy khéo léo',
    minWins: 8,
    maxWins: 11,
    depth: 3,
    candidateCount: 12,
    randomness: 0.05,
    vcfEnabled: false,
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-600',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    avatar: '🙄',
    description: 'Tính trước nhiều nước đi, biết gài các thế đôi 3-3, 4-3 hiểm hóc để giành thế chủ động.',
    tactics: 'Gài bẫy tấn công chủ động.',
  },
  {
    id: 4,
    name: 'Master',
    vietnameseName: 'Kiện Tướng',
    tag: 'Phòng thủ & Phản công',
    minWins: 12,
    maxWins: 15,
    depth: 4,
    candidateCount: 14,
    randomness: 0,
    vcfEnabled: false,
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    avatar: '🙄',
    description: 'Kỹ năng toàn diện, nhìn thấu các đòn bẫy từ xa, chuyển đổi phòng thủ sang phản công sắc bén.',
    tactics: 'Phòng ngự phản công chuẩn xác.',
  },
  {
    id: 5,
    name: 'Grandmaster',
    vietnameseName: 'Đại Kiện Tướng',
    tag: 'Bao quát toàn cục',
    minWins: 16,
    maxWins: 19,
    depth: 5,
    candidateCount: 16,
    randomness: 0,
    vcfEnabled: true,
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    avatar: '🙄',
    description: 'Bao quát toàn bộ bàn cờ, khống chế các điểm giao thoa chiến lược, thế trận chặt chẽ.',
    tactics: 'Chiến thuật bao quát toàn cục.',
  },
  {
    id: 6,
    name: 'Unbeatable God',
    vietnameseName: 'Thần Cờ (Bất Khả Chiến Bại)',
    tag: 'Hoàn hảo tuyệt đối',
    minWins: 20,
    maxWins: 9999,
    depth: 6,
    candidateCount: 20,
    randomness: 0,
    vcfEnabled: true,
    color: '#ef4444',
    gradient: 'from-red-500 via-rose-600 to-purple-700',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-500/20',
    avatar: '🙄',
    description: 'Tính toán chuẩn xác không sơ hở, phát hiện chuỗi kết liễu trận đấu ngay lập tức.',
    tactics: 'Tuyệt đối không có sơ hở.',
  },
];

export function getLevelConfigByWins(wins: number, manualLevel: number | null = null): LevelConfig {
  if (manualLevel !== null && manualLevel >= 1 && manualLevel <= 6) {
    return AI_LEVELS[manualLevel - 1];
  }
  for (const lvl of AI_LEVELS) {
    if (wins >= lvl.minWins && wins <= lvl.maxWins) {
      return lvl;
    }
  }
  return AI_LEVELS[AI_LEVELS.length - 1];
}

// Điểm đánh giá các hình thái thế cờ Gomoku
export const SCORES = {
  FIVE: 10000000,          // 5 liên tiếp (thắng ngay)
  OPEN_FOUR: 1000000,      // 4 mở 2 đầu (chắc chắn thắng ở nước kế)
  BLOCKED_FOUR: 100000,    // 4 chặn 1 đầu (bắt buộc phải đỡ)
  OPEN_THREE: 100000,      // 3 mở 2 đầu (hiểm họa lớn, chuẩn bị thành 4 mở)
  BLOCKED_THREE: 10000,    // 3 chặn 1 đầu
  OPEN_TWO: 10000,         // 2 mở 2 đầu
  BLOCKED_TWO: 1000,       // 2 chặn 1 đầu
  SINGLE: 100,             // 1 quân đơn lẻ
};
