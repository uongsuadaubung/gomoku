import { SkeletonStone } from '../types';

/**
 * 8 phép biến đổi không gian ngẫu nhiên (Quay 0, 90, 180, 270 và Lật gương)
 */
export function applyRandomSymmetry(stones: SkeletonStone[]): SkeletonStone[] {
  const sym = Math.floor(Math.random() * 8);
  const shouldFlip = sym >= 4;
  const rot = sym % 4;

  return stones.map(s => {
    let r = s.r;
    let c = shouldFlip ? -s.c : s.c;

    if (rot === 1) [r, c] = [c, -r];
    else if (rot === 2) [r, c] = [-r, -c];
    else if (rot === 3) [r, c] = [-c, r];

    return { r, c, player: s.player };
  });
}
