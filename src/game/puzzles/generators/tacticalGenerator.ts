import { BOARD_SIZE, EMPTY, BLACK, WHITE, ActivePlayer, MoveHistoryItem, BoardMatrix } from '../../types';
import { createEmptyBoard, cloneBoard, checkWin } from '../../board';
import { PuzzleScenario, PuzzleType, PuzzleGeneratorOptions, PuzzleDensity } from '../types';
import { BASE_VCF_SKELETON_POOLS, BASE_VCT_SKELETON_POOLS, BASE_DEFENSE_SKELETON_POOLS } from '../skeletons';
import { REALISTIC_SKIRMISH_TEMPLATES, PUZZLE_TITLES } from '../templates';
import { applyRandomSymmetry } from '../utils/symmetry';
import { getVCFSolutionTrace, getVCTSolutionTrace, hasImmediateWhiteThreat } from '../utils/validator';
import { generateFallbackScenario } from './fallback';

type StoneItem = { r: number; c: number; player: ActivePlayer };

/**
 * Rải nhiễu cận kề hạt giống chiến thuật với tra cứu O(1) Set
 */
function applyProximityNoise(
  workingBoard: BoardMatrix,
  placedStones: StoneItem[],
  density: PuzzleDensity
): StoneItem[] {
  const addedStones: StoneItem[] = [];
  const neighborSet = new Set<number>();
  const neighborCells: Array<{ r: number; c: number }> = [];

  for (const s of placedStones) {
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = s.r + dr;
        const nc = s.c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          const key = nr * BOARD_SIZE + nc;
          if (workingBoard[nr][nc] === EMPTY && !neighborSet.has(key)) {
            neighborSet.add(key);
            neighborCells.push({ r: nr, c: nc });
          }
        }
      }
    }
  }

  for (let i = neighborCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [neighborCells[i], neighborCells[j]] = [neighborCells[j], neighborCells[i]];
  }

  const proximityTarget = density === 'sparse'
    ? Math.floor(Math.random() * 2) + 1
    : (density === 'dense' ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 3) + 3);
  let proximityAdded = 0;

  for (const cell of neighborCells) {
    if (proximityAdded >= proximityTarget) break;
    const tpl = REALISTIC_SKIRMISH_TEMPLATES[Math.floor(Math.random() * REALISTIC_SKIRMISH_TEMPLATES.length)];
    const candidate: StoneItem[] = [];
    let canPlace = true;

    for (const t of tpl) {
      const tr = cell.r + t.dr;
      const tc = cell.c + t.dc;
      if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE || workingBoard[tr][tc] !== EMPTY) {
        canPlace = false;
        break;
      }
      candidate.push({ r: tr, c: tc, player: t.player });
    }

    if (canPlace) {
      for (const cs of candidate) {
        workingBoard[cs.r][cs.c] = cs.player;
        addedStones.push(cs);
      }
      proximityAdded++;
    }
  }

  return addedStones;
}

/**
 * Rải cụm giao tranh vành ngoài (Outer Skirmish Noise)
 */
function applyOuterNoise(
  workingBoard: BoardMatrix,
  density: PuzzleDensity
): StoneItem[] {
  const addedStones: StoneItem[] = [];
  const sectors = [
    { r: 2, c: 2 }, { r: 2, c: 7 }, { r: 2, c: 12 },
    { r: 7, c: 2 }, { r: 7, c: 12 },
    { r: 12, c: 2 }, { r: 12, c: 7 }, { r: 12, c: 12 },
    { r: 4, c: 4 }, { r: 4, c: 10 }, { r: 10, c: 4 }, { r: 10, c: 10 },
  ];
  for (let i = sectors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sectors[i], sectors[j]] = [sectors[j], sectors[i]];
  }

  const outerTarget = density === 'sparse'
    ? Math.floor(Math.random() * 2) + 2
    : (density === 'dense' ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 4);
  let outerAdded = 0;

  for (const sector of sectors) {
    if (outerAdded >= outerTarget) break;
    const tpl = REALISTIC_SKIRMISH_TEMPLATES[Math.floor(Math.random() * REALISTIC_SKIRMISH_TEMPLATES.length)];
    const candidate: StoneItem[] = [];
    let canPlace = true;

    for (const t of tpl) {
      const tr = sector.r + t.dr;
      const tc = sector.c + t.dc;
      if (tr < 0 || tr >= BOARD_SIZE || tc < 0 || tc >= BOARD_SIZE || workingBoard[tr][tc] !== EMPTY) {
        canPlace = false;
        break;
      }
      candidate.push({ r: tr, c: tc, player: t.player });
    }

    if (canPlace) {
      for (const cs of candidate) {
        workingBoard[cs.r][cs.c] = cs.player;
        addedStones.push(cs);
      }
      outerAdded++;
    }
  }

  return addedStones;
}

/**
 * Phân tán các cặp quân nền ngẫu nhiên tạo độ dày ván cờ
 */
function applyBackgroundDensity(
  workingBoard: BoardMatrix,
  currentStoneCount: number,
  density: PuzzleDensity
): StoneItem[] {
  const addedStones: StoneItem[] = [];
  const emptyCells: Array<{ r: number; c: number }> = [];
  for (let r = 1; r < BOARD_SIZE - 1; r++) {
    for (let c = 1; c < BOARD_SIZE - 1; c++) {
      if (workingBoard[r][c] === EMPTY) emptyCells.push({ r, c });
    }
  }
  for (let i = emptyCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
  }

  const desiredTotal = density === 'sparse'
    ? Math.floor(Math.random() * 6) + 18
    : (density === 'dense' ? Math.floor(Math.random() * 10) + 52 : Math.floor(Math.random() * 8) + 36);

  let totalCount = currentStoneCount;
  for (let i = 0; i < emptyCells.length - 1; i += 2) {
    if (totalCount >= desiredTotal) break;
    const c1 = emptyCells[i];
    const c2 = emptyCells[i + 1];

    if (workingBoard[c1.r][c1.c] === EMPTY && workingBoard[c2.r][c2.c] === EMPTY) {
      workingBoard[c1.r][c1.c] = BLACK;
      workingBoard[c2.r][c2.c] = WHITE;
      addedStones.push({ r: c1.r, c: c1.c, player: BLACK });
      addedStones.push({ r: c2.r, c: c2.c, player: WHITE });
      totalCount += 2;
    }
  }

  return addedStones;
}

/**
 * Tạo lịch sử nước đi tự nhiên theo thứ tự thời gian: Khai cuộc & Ngoại vi -> Cận kề -> Sát cục trung tâm
 */
function buildNaturalMoveHistory(
  tacticalStones: StoneItem[],
  noiseStones: StoneItem[]
): MoveHistoryItem[] {
  const orderedStones = [...noiseStones, ...tacticalStones];
  const blackStones = orderedStones.filter(s => s.player === BLACK);
  const whiteStones = orderedStones.filter(s => s.player === WHITE);

  const fullHistory: MoveHistoryItem[] = [];
  const maxLen = Math.max(blackStones.length, whiteStones.length);
  let step = 1;
  const now = Date.now();

  for (let i = 0; i < maxLen; i++) {
    if (i < blackStones.length) {
      fullHistory.push({
        row: blackStones[i].r,
        col: blackStones[i].c,
        player: BLACK,
        stepNumber: step++,
        timestamp: now - (maxLen - i) * 2000,
      });
    }
    if (i < whiteStones.length) {
      fullHistory.push({
        row: whiteStones[i].r,
        col: whiteStones[i].c,
        player: WHITE,
        stepNumber: step++,
        timestamp: now - (maxLen - i) * 2000 + 1000,
      });
    }
  }

  return fullHistory;
}

/**
 * Sinh thế cờ chiến thuật trung cuộc ngẫu nhiên (hỗ trợ VCF, VCT và DEFENSE)
 */
export function generateTacticalScenario(
  optionsOrStars?: number | PuzzleGeneratorOptions,
  preferredType?: PuzzleType,
  densityOption?: PuzzleDensity
): PuzzleScenario {
  let requestedStars = 1;
  let explicitType: PuzzleType | undefined = preferredType;
  let density: PuzzleDensity = densityOption || 'normal';

  if (typeof optionsOrStars === 'object' && optionsOrStars !== null) {
    requestedStars = optionsOrStars.stars ?? 1;
    explicitType = optionsOrStars.type ?? preferredType;
    density = optionsOrStars.density ?? density;
  } else if (typeof optionsOrStars === 'number') {
    requestedStars = optionsOrStars;
  }

  const targetStars = Math.max(1, Math.min(requestedStars, 7));

  let puzzleType: PuzzleType;
  if (explicitType) {
    puzzleType = explicitType;
  } else if (targetStars === 1) {
    const rand = Math.random();
    puzzleType = rand < 0.34 ? 'DEFENSE' : (rand < 0.67 ? 'VCT' : 'VCF');
  } else if (targetStars <= 3) {
    const rand = Math.random();
    puzzleType = rand < 0.25 ? 'DEFENSE' : (rand < 0.625 ? 'VCT' : 'VCF');
  } else {
    puzzleType = 'VCF';
  }

  const candidatePool = puzzleType === 'VCT'
    ? (BASE_VCT_SKELETON_POOLS[targetStars] ?? BASE_VCF_SKELETON_POOLS[targetStars])
    : (puzzleType === 'DEFENSE'
      ? (BASE_DEFENSE_SKELETON_POOLS[targetStars] ?? BASE_VCT_SKELETON_POOLS[targetStars] ?? BASE_VCF_SKELETON_POOLS[targetStars])
      : (BASE_VCF_SKELETON_POOLS[targetStars] ?? BASE_VCF_SKELETON_POOLS[1]));

  const pool = (candidatePool && candidatePool.length > 0)
    ? candidatePool
    : BASE_VCF_SKELETON_POOLS[1];

  if (!pool || pool.length === 0) {
    return generateFallbackScenario(targetStars, puzzleType);
  }

  for (let attempt = 1; attempt <= 100; attempt++) {
    const rawStones = pool[Math.floor(Math.random() * pool.length)];
    const transformed = applyRandomSymmetry(rawStones);

    const maxOffset = targetStars >= 4 ? 1 : 2;
    const centerRow = 7 + (Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset);
    const centerCol = 7 + (Math.floor(Math.random() * (maxOffset * 2 + 1)) - maxOffset);

    const board = createEmptyBoard();
    const placedStones: StoneItem[] = [];
    let outOfBounds = false;

    for (const s of transformed) {
      const finalR = centerRow + s.r;
      const finalC = centerCol + s.c;

      if (finalR < 0 || finalR >= BOARD_SIZE || finalC < 0 || finalC >= BOARD_SIZE) {
        outOfBounds = true;
        break;
      }

      board[finalR][finalC] = s.player;
      placedStones.push({ r: finalR, c: finalC, player: s.player });
    }

    if (outOfBounds) continue;

    const baseline = (puzzleType === 'VCT' || puzzleType === 'DEFENSE')
      ? getVCTSolutionTrace(board, targetStars)
      : getVCFSolutionTrace(board, targetStars);

    if (!baseline.success || baseline.moves !== targetStars) {
      continue;
    }

    const workingBoard = cloneBoard(board);
    const firstMove = baseline.attackMoves[0];

    // 1. Phân tán nhiễu cận kề (Proximity Noise)
    const proximityStones = applyProximityNoise(workingBoard, placedStones, density);

    // 2. Phân tán nhiễu vành ngoài (Outer Skirmish Noise)
    const outerStones = applyOuterNoise(workingBoard, density);

    // 3. Phân tán quân cờ nền ngẫu nhiên tạo độ dày trận đấu
    const bgStones = applyBackgroundDensity(
      workingBoard,
      placedStones.length + proximityStones.length + outerStones.length,
      density
    );

    if (checkWin(workingBoard)) {
      continue;
    }

    if (puzzleType === 'DEFENSE') {
      if (!hasImmediateWhiteThreat(workingBoard)) {
        continue;
      }
    } else {
      if (hasImmediateWhiteThreat(workingBoard)) {
        continue;
      }
    }

    const finalTrace = (puzzleType === 'VCT' || puzzleType === 'DEFENSE')
      ? getVCTSolutionTrace(workingBoard, targetStars)
      : getVCFSolutionTrace(workingBoard, targetStars);

    if (!finalTrace.success || finalTrace.moves !== targetStars) {
      continue;
    }

    if (firstMove && finalTrace.attackMoves.length > 0) {
      if (finalTrace.attackMoves[0].r !== firstMove.r || finalTrace.attackMoves[0].c !== firstMove.c) {
        continue;
      }
    }

    const noiseStones = [...bgStones, ...outerStones, ...proximityStones];
    const fullHistory = buildNaturalMoveHistory(placedStones, noiseStones);

    const titles = PUZZLE_TITLES[targetStars] || ['Thế Cờ Chiến Thuật'];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const id = `scenario_${puzzleType.toLowerCase()}_${targetStars}star_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const desc = puzzleType === 'VCT'
      ? (targetStars === 1
          ? 'Tung đòn Bẫy Đôi 4-3 hoặc Song Tam 3-3 dứt điểm ván cờ trong 1 nước!'
          : `Tạo chuỗi đe dọa liên hoàn VCT ${targetStars} nước dứt điểm ván cờ!`)
      : (puzzleType === 'DEFENSE'
          ? 'Tìm nước cờ hóa giải đòn hiểm của đối phương và phản kích!'
          : (targetStars === 1
              ? 'Tìm đòn sát cục 4 quân dứt điểm ngay lập tức!'
              : `Tìm chuỗi đòn sát cục liên hoàn VCF ${targetStars} nước dứt điểm ván cờ!`));

    const solutionFirstMove = finalTrace.attackMoves.length > 0
      ? { row: finalTrace.attackMoves[0].r, col: finalTrace.attackMoves[0].c }
      : undefined;

    return {
      id,
      stars: targetStars,
      name: requestedStars > 7 ? `Thế Cờ Đỉnh Cao Mức ${requestedStars}` : `${title} #${Math.floor(Math.random() * 900) + 100}`,
      description: desc,
      optimalMoves: targetStars,
      initialBoard: cloneBoard(workingBoard),
      initialMoveHistory: fullHistory,
      playerColor: BLACK,
      puzzleType,
      solutionMoves: finalTrace.attackMoves.map(m => ({ row: m.r, col: m.c, player: BLACK })),
      hints: solutionFirstMove ? {
        firstMove: solutionFirstMove,
        zone: {
          minRow: Math.max(0, solutionFirstMove.row - 1),
          maxRow: Math.min(BOARD_SIZE - 1, solutionFirstMove.row + 1),
          minCol: Math.max(0, solutionFirstMove.col - 1),
          maxCol: Math.min(BOARD_SIZE - 1, solutionFirstMove.col + 1),
        }
      } : undefined,
    };
  }

  return generateFallbackScenario(targetStars, puzzleType);
}
