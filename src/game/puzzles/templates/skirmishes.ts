import { ActivePlayer, BLACK, WHITE } from '../../types';

export interface SkirmishDelta {
  dr: number;
  dc: number;
  player: ActivePlayer;
}

export type SkirmishTemplate = SkirmishDelta[];

/**
 * 42 Mẫu giao tranh trung cuộc và khai cuộc kinh điển đã khóa (Neutralized / Settled Formations)
 */
export const REALISTIC_SKIRMISH_TEMPLATES: SkirmishTemplate[] = [
  [
    { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 0, dc: 2, player: WHITE },
  ],
  [
    { dr: -1, dc: 0, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: BLACK }, { dr: 2, dc: 0, player: WHITE },
  ],
  [
    { dr: -1, dc: -1, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 2, dc: 2, player: WHITE },
  ],
  [
    { dr: -1, dc: 1, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: -1, player: BLACK }, { dr: 2, dc: -2, player: WHITE },
  ],
  [
    { dr: 0, dc: -1, player: BLACK }, { dr: 0, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 0, dc: 2, player: BLACK },
  ],
  [
    { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 2, player: BLACK }, { dr: 0, dc: 3, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 1, dc: 2, player: WHITE }, { dr: -1, dc: -1, player: WHITE }, { dr: 0, dc: 2, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 1, dc: 1, player: BLACK }, { dr: 2, dc: 0, player: BLACK }, { dr: -1, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: -1, dc: 0, player: WHITE }, { dr: 1, dc: 0, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 0, dc: 2, player: WHITE }, { dr: 1, dc: 0, player: WHITE }, { dr: 1, dc: 1, player: WHITE }, { dr: 1, dc: -1, player: BLACK },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 2, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 2, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: 1, dc: 0, player: WHITE }, { dr: 1, dc: 1, player: BLACK }, { dr: 1, dc: 2, player: WHITE }, { dr: 2, dc: 1, player: BLACK },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: -1, dc: 0, player: WHITE }, { dr: 2, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 2, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: -1, dc: 1, player: BLACK }, { dr: 2, dc: 2, player: WHITE }, { dr: -2, dc: 2, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 0, dc: -1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: 2, dc: 1, player: WHITE }, { dr: -1, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 1, dc: 2, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 2, dc: 1, player: WHITE }, { dr: 1, dc: 3, player: WHITE }, { dr: 1, dc: -1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: -1, dc: 2, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: -2, dc: 2, player: WHITE }, { dr: 1, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 0, dc: 2, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 3, player: WHITE }, { dr: 2, dc: 1, player: WHITE }, { dr: 1, dc: 0, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 2, dc: 0, player: BLACK }, { dr: -1, dc: -1, player: WHITE }, { dr: 3, dc: 0, player: WHITE }, { dr: 1, dc: 0, player: WHITE }, { dr: 0, dc: 2, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: -1, dc: -1, player: BLACK }, { dr: 1, dc: 2, player: BLACK }, { dr: -2, dc: -2, player: WHITE }, { dr: 2, dc: 3, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 1, dc: 0, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 1, dc: 2, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: 2, dc: 3, player: WHITE }, { dr: -1, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 2, dc: 1, player: BLACK }, { dr: 0, dc: 1, player: WHITE }, { dr: 3, dc: 1, player: WHITE }, { dr: 1, dc: 0, player: WHITE }, { dr: 2, dc: 2, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 1, dc: -1, player: BLACK }, { dr: 2, dc: 2, player: WHITE }, { dr: 2, dc: -2, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 0, dc: -1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 2, dc: 1, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: 3, dc: 1, player: WHITE }, { dr: 1, dc: 0, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 2, dc: 2, player: BLACK }, { dr: -1, dc: -1, player: WHITE }, { dr: 3, dc: 3, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 2, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 0, dc: 2, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 3, player: WHITE }, { dr: 1, dc: 1, player: WHITE }, { dr: -1, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: BLACK }, { dr: -1, dc: 0, player: WHITE }, { dr: 2, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: 1, dc: 0, player: WHITE },
  ],
  [
    { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 0, dc: 2, player: BLACK }, { dr: 0, dc: 3, player: WHITE },
  ],
  [
    { dr: -1, dc: 0, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: BLACK }, { dr: 2, dc: 0, player: BLACK }, { dr: 3, dc: 0, player: WHITE },
  ],
  [
    { dr: 0, dc: -1, player: BLACK }, { dr: 0, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: 0, dc: 3, player: BLACK },
  ],
  [
    { dr: -1, dc: -1, player: WHITE }, { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 2, dc: 2, player: BLACK }, { dr: 3, dc: 3, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: WHITE }, { dr: 1, dc: 0, player: BLACK },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: WHITE }, { dr: 1, dc: 0, player: WHITE }, { dr: 1, dc: 1, player: BLACK },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: WHITE }, { dr: 1, dc: 0, player: WHITE }, { dr: 1, dc: -1, player: BLACK },
  ],
  [
    { dr: 0, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 0, dc: 2, player: BLACK }, { dr: 1, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: 1, dc: 2, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: BLACK }, { dr: 2, dc: 0, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 0, dc: 2, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 1, dc: 1, player: BLACK }, { dr: -1, dc: -1, player: WHITE }, { dr: 2, dc: 2, player: WHITE }, { dr: 0, dc: 1, player: WHITE }, { dr: 1, dc: 0, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: WHITE }, { dr: -1, dc: 0, player: BLACK }, { dr: 1, dc: 0, player: BLACK }, { dr: 0, dc: -1, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: -1, dc: -1, player: WHITE }, { dr: 1, dc: 1, player: WHITE },
  ],
  [
    { dr: 0, dc: 0, player: BLACK }, { dr: 0, dc: 1, player: BLACK }, { dr: 0, dc: -1, player: WHITE }, { dr: 0, dc: 2, player: WHITE }, { dr: -1, dc: 0, player: WHITE }, { dr: 1, dc: 1, player: WHITE },
  ],
];
