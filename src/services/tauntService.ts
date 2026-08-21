import { BoardMatrix, ActivePlayer, Player, EMPTY } from '../game/types';
import { checkWin } from '../game/board';
import {
  type TauntEvent,
  type BotMood,
  type TauntItem,
  type TauntDefinition,
  TAUNT_REGISTRY,
} from '../data/taunts';

export type { TauntEvent, BotMood, TauntItem, TauntDefinition };
export { TAUNT_REGISTRY };

const MOOD_EMOJI_MAP: Record<BotMood, string> = {
  disdain: '😒',
  smug: '😏',
  laugh: '🤣',
  clown: '🤡',
  detective: '🧐',
  bored: '🥱',
  sleepy: '😴',
  thinking: '🤔',
  evil: '😈',
  lightning: '⚡',
  cool: '😎',
  panic: '😱',
  chill: '☕',
  rage: '🤬',
  party: '🥳',
  angry: '😤',
  shush: '🤫',
};

/**
 * Ánh xạ tâm trạng Bot thành Emoji biểu cảm tương ứng
 */
export function getMoodEmoji(mood: BotMood, defaultAvatar: string = 'eye_roll'): string {
  return MOOD_EMOJI_MAP[mood] || defaultAvatar;
}

// Lưu index câu thoại vừa nói để tránh lặp lại câu trước đó với chi phí O(1)
const lastIndexMap: Partial<Record<TauntEvent, number>> = {};

export interface TauntContext {
  undoCount?: number;
  botWins?: number;
  playerWins?: number;
  thinkSeconds?: number;
}

export class TauntService {
  /**
   * Lấy một câu thoại ngẫu nhiên theo sự kiện kết hợp ngữ cảnh động (Trí nhớ thông minh):
   * - Độ phức tạp O(1), Zero-Allocation
   * - Tự động lấy BotMood từ định nghĩa sự kiện
   * - Tự động lồng ghép trí nhớ động (số lần Undo, tỷ số trận đấu)
   */
  static getTaunt(event: TauntEvent, context?: TauntContext): TauntItem {
    let targetEvent: TauntEvent = event;

    // 1. Tự động chuyển sang sự kiện PLAYER_WIN_WITH_UNDO nếu người chơi thắng sau khi đã Undo
    if (event === 'PLAYER_WIN' && context?.undoCount && context.undoCount > 0) {
      if (Math.random() < 0.75) {
        targetEvent = 'PLAYER_WIN_WITH_UNDO';
      }
    }

    // 2. Tự động chuyển sang sự kiện BOT_WIN_LEADING_SCORE nếu Bot đang dẫn trước
    if (
      event === 'BOT_WIN' &&
      context?.botWins &&
      context.botWins >= 2 &&
      context?.playerWins !== undefined &&
      context.botWins > context.playerWins
    ) {
      if (Math.random() < 0.5) {
        targetEvent = 'BOT_WIN_LEADING_SCORE';
      }
    }

    const def = TAUNT_REGISTRY[targetEvent] || TAUNT_REGISTRY[event] || TAUNT_REGISTRY.BOT_WIN;
    const list = def.texts;
    const len = list.length;

    if (len === 0) {
      return { text: '...', mood: def.mood };
    }

    let nextIndex = Math.floor(Math.random() * len);
    const lastIndex = lastIndexMap[targetEvent];

    if (len > 1 && nextIndex === lastIndex) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (len - 1))) % len;
    }

    lastIndexMap[targetEvent] = nextIndex;

    let rawText = list[nextIndex];

    // Thay thế các biến động trong câu thoại
    if (context) {
      if (context.undoCount !== undefined) {
        rawText = rawText.replace(/\{undo_count\}/g, String(context.undoCount));
      }
      if (context.botWins !== undefined) {
        rawText = rawText.replace(/\{bot_score\}/g, String(context.botWins));
      }
      if (context.playerWins !== undefined) {
        rawText = rawText.replace(/\{player_score\}/g, String(context.playerWins));
      }
    }

    return {
      text: rawText,
      mood: def.mood,
    };
  }

  /**
   * Chuyển đổi một câu thoại thành chuỗi ký tự kiểm duyệt (!@#$%^&*) khi người chơi tắt cà khịa
   */
  static censorToGrawlix(text: string): string {
    const GRAWLIX_CHARS = ['!', '@', '#', '$', '%', '^', '&', '*'];
    return text
      .split(' ')
      .map(word => {
        let endingPunctuation = '';
        let cleanWord = word;
        while (cleanWord.length > 0 && /[.?!,;:~]/.test(cleanWord[cleanWord.length - 1])) {
          endingPunctuation = cleanWord[cleanWord.length - 1] + endingPunctuation;
          cleanWord = cleanWord.slice(0, -1);
        }

        if (cleanWord.length === 0) return endingPunctuation;

        let grawlix = '';
        for (let i = 0; i < cleanWord.length; i++) {
          const charCode = cleanWord.charCodeAt(i);
          const charIdx = (charCode + i * 3) % GRAWLIX_CHARS.length;
          grawlix += GRAWLIX_CHARS[charIdx];
        }
        return grawlix + endingPunctuation;
      })
      .join(' ');
  }


  /**
   * Kiểm tra xem người chơi vừa đi một nước ngáo (bỏ sót nước 4 hoặc 3 mở của Bot) không
   */
  static isPlayerBlunder(
    board: BoardMatrix,
    botPlayer: ActivePlayer,
    lastPlayerRow: number,
    lastPlayerCol: number
  ): boolean {
    const size = board.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === EMPTY) {
          board[r][c] = botPlayer;
          const win = checkWin(board);
          board[r][c] = EMPTY;
          if (win && win.winner === botPlayer) {
            // Bot có nước thắng ngay nhưng người chơi nước trước không chặn vào ô đó
            if (r !== lastPlayerRow || c !== lastPlayerCol) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra xem Người chơi có nước thắng ngay trên bàn cờ nhưng lại đi ô khác không
   */
  static hasMissedWinningMove(
    board: BoardMatrix,
    playerColor: ActivePlayer,
    chosenRow: number,
    chosenCol: number
  ): boolean {
    const size = board.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === EMPTY) {
          board[r][c] = playerColor;
          const win = checkWin(board);
          board[r][c] = EMPTY;
          if (win && win.winner === playerColor) {
            if (r !== chosenRow || c !== chosenCol) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra xem nước đi có cách xa toàn bộ quân cờ đang có >= 5 ô không (đi đảo hoang)
   */
  static isIsolatedFarMove(
    board: BoardMatrix,
    row: number,
    col: number,
    minStonesOnBoard: number = 3
  ): boolean {
    const size = board.length;
    let totalStones = 0;
    let minDistance = 999;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] !== EMPTY && !(r === row && c === col)) {
          totalStones++;
          const dist = Math.max(Math.abs(r - row), Math.abs(c - col));
          if (dist < minDistance) {
            minDistance = dist;
          }
        }
      }
    }

    return totalStones >= minStonesOnBoard && minDistance >= 5;
  }

  /**
   * Kiểm tra xem Bot vừa chặn đứng một đòn đe dọa (nước 4 hoặc nước 3) của Người chơi hay không
   */
  static isBotBlockThreat(
    board: BoardMatrix,
    playerColor: ActivePlayer,
    botRow: number,
    botCol: number
  ): boolean {
    board[botRow][botCol] = playerColor;
    const win = checkWin(board);
    board[botRow][botCol] = EMPTY;
    return !!(win && win.winner === playerColor);
  }

  /**
   * Kiểm tra xem người chơi vừa tạo được một thế đe dọa thắng (nước 4 chuẩn bị thắng)
   */
  static isPlayerThreatMove(
    board: BoardMatrix,
    playerColor: ActivePlayer
  ): boolean {
    const size = board.length;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === EMPTY) {
          board[r][c] = playerColor;
          const win = checkWin(board);
          board[r][c] = EMPTY;
          if (win && win.winner === playerColor) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra xem người chơi vừa tạo được thế đôi nguy hiểm (3-3, 4-3, có >= 2 điểm thắng cùng lúc)
   */
  static isPlayerDoubleThreat(
    board: BoardMatrix,
    playerColor: ActivePlayer
  ): boolean {
    const size = board.length;
    let winThreatCount = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === EMPTY) {
          board[r][c] = playerColor;
          const win = checkWin(board);
          board[r][c] = EMPTY;
          if (win && win.winner === playerColor) {
            winThreatCount++;
            if (winThreatCount >= 2) return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra xem người chơi vừa đánh nước đối xứng sao chép nước đi trước đó của Bot
   */
  static isMirrorMove(
    botRow: number,
    botCol: number,
    playerRow: number,
    playerCol: number,
    size: number = 15
  ): boolean {
    const centerSymmetric = playerRow === size - 1 - botRow && playerCol === size - 1 - botCol;
    const vertSymmetric = playerRow === botRow && playerCol === size - 1 - botCol;
    const horizSymmetric = playerRow === size - 1 - botRow && playerCol === botCol;
    return centerSymmetric || vertSymmetric || horizSymmetric;
  }

  /**
   * Kiểm tra xem nước cờ của người chơi có tạo thành hàng 4 chết (bị chặn cả 2 đầu) không
   */
  static isDeadFourBlocked(
    board: BoardMatrix,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    const size = board.length;
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of directions) {
      let countForward = 0;
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) {
        countForward++;
        r += dr;
        c += dc;
      }
      const endFBlocked = r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== EMPTY;

      let countBackward = 0;
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) {
        countBackward++;
        r -= dr;
        c -= dc;
      }
      const endBBlocked = r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== EMPTY;

      const totalStones = 1 + countForward + countBackward;
      if (totalStones === 4 && endFBlocked && endBBlocked) {
        return true;
      }
    }
    return false;
  }

  /**
   * Kiểm tra xem nước cờ của người chơi có vô tình tự chặn mất đầu phát triển của nhánh 3 quân khác của mình không
   */
  static hasAccidentalSelfBlock(
    board: BoardMatrix,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    const size = board.length;
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    // Kiểm tra các hướng xuất phát từ ô vừa đánh (row, col)
    for (const [dr, dc] of directions) {
      for (const step of [1, -1]) {
        const nr = row + dr * step;
        const nc = col + dc * step;
        // Nếu ô liền kề là quân của chính mình
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === playerColor) {
          // Đếm chuỗi quân nối tiếp từ ô liền kề đó
          let chainLength = 0;
          let r = nr;
          let c = nc;
          while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) {
            chainLength++;
            r += dr * step;
            c += dc * step;
          }
          // Nếu nhánh đó có đúng 3 quân và ô phía bên kia của (row, col) bị chặn (hoặc không cùng hướng)
          if (chainLength === 3) {
            const oppositeR = row - dr * step;
            const oppositeC = col - dc * step;
            const isOppositeBlocked =
              oppositeR < 0 ||
              oppositeR >= size ||
              oppositeC < 0 ||
              oppositeC >= size ||
              board[oppositeR][oppositeC] !== EMPTY;
            if (isOppositeBlocked) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra xem Bot hiện có nước đe dọa thắng trực tiếp (nước 4 hoặc 3 mở) trên bàn cờ hay không
   */
  static hasBotActiveThreat(
    board: BoardMatrix,
    botColor: ActivePlayer
  ): boolean {
    return this.isPlayerThreatMove(board, botColor);
  }

  /**
   * Kiểm tra xem người chơi có cản trượt đòn nĩa đôi (4-3 hoặc 3-3) của Bot hay không
   */
  static isForkAttackDefenseFail(
    board: BoardMatrix,
    botColor: ActivePlayer,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    // Tạm xóa quân người chơi vừa đánh để kiểm tra xem trước đó Bot có bẫy đôi không
    board[row][col] = EMPTY;
    const hadDoubleThreat = this.isPlayerDoubleThreat(board, botColor);
    board[row][col] = playerColor;

    // Nếu trước đó Bot có bẫy đôi và sau khi người chơi đánh Bot vẫn còn mối đe dọa thắng
    if (hadDoubleThreat) {
      const stillHasThreat = this.hasBotActiveThreat(board, botColor);
      return stillHasThreat;
    }
    return false;
  }

  /**
   * Kiểm tra xem người chơi có đánh ôm sát liên tiếp nhiều nước với Bot hay không
   */
  static isCloseCombatHug(
    recentPlayerMoves: Array<{ row: number; col: number }>,
    recentBotMoves: Array<{ row: number; col: number }>
  ): boolean {
    if (recentPlayerMoves.length < 6 || recentBotMoves.length < 6) return false;
    const count = Math.min(recentPlayerMoves.length, recentBotMoves.length, 8);
    for (let i = 0; i < count; i++) {
      const p = recentPlayerMoves[recentPlayerMoves.length - 1 - i];
      const b = recentBotMoves[recentBotMoves.length - 1 - i];
      const dist = Math.max(Math.abs(p.row - b.row), Math.abs(p.col - b.col));
      if (dist > 1) return false;
    }
    return true;
  }

  /**
   * Kiểm tra xem 2 nước đi liên tiếp của người chơi có cách xa nhau như 2 đầu bán cầu (> 8 ô) không
   */
  static isSplitBoardExpedition(
    prevMove: { row: number; col: number } | null,
    currMove: { row: number; col: number },
    totalStones: number
  ): boolean {
    if (!prevMove || totalStones < 6) return false;
    const dist = Math.max(Math.abs(prevMove.row - currMove.row), Math.abs(prevMove.col - currMove.col));
    return dist >= 8;
  }

  /**
   * Kiểm tra xem nước cờ vừa đánh có tạo thành cụm tam giác 3 ô bo kín (nhầm sang cờ vây) không
   */
  static isTriangleFormation(
    board: BoardMatrix,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    const size = board.length;
    // Kiểm tra 4 góc vuông tam giác 2x2 liền kề
    const cornerOffsets = [
      [[-1, 0], [0, -1]], // Trên & Trái
      [[-1, 0], [0, 1]],  // Trên & Phải
      [[1, 0], [0, -1]],  // Dưới & Trái
      [[1, 0], [0, 1]],   // Dưới & Phải
    ];

    for (const [o1, o2] of cornerOffsets) {
      const r1 = row + o1[0];
      const c1 = col + o1[1];
      const r2 = row + o2[0];
      const c2 = col + o2[1];
      if (
        r1 >= 0 && r1 < size && c1 >= 0 && c1 < size && board[r1][c1] === playerColor &&
        r2 >= 0 && r2 < size && c2 >= 0 && c2 < size && board[r2][c2] === playerColor
      ) {
        return true;
      }
    }
    return false;
  }
  /**
   * Kiểm tra xem người chơi vừa chặn đòn sát cục của Bot đồng thời tạo nước 4 đe dọa thắng ngược lại
   */
  static isBlockAndCounterFour(
    previousBoard: BoardMatrix,
    currentBoard: BoardMatrix,
    botColor: ActivePlayer,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    // 1. Kiểm tra xem ô (row, col) trước đó có phải là điểm thắng của Bot không
    previousBoard[row][col] = botColor;
    const botWin = checkWin(previousBoard);
    previousBoard[row][col] = EMPTY;

    if (!botWin || botWin.winner !== botColor) return false;

    // 2. Kiểm tra xem nước đi của Người chơi có tạo thành đòn đe dọa thắng (nước 4) của Người chơi không
    return this.isPlayerThreatMove(currentBoard, playerColor);
  }

  /**
   * Kiểm tra xem người chơi có bắt chước đối xứng 4 nước đầu rồi bất ngờ bẻ lái ở nước thứ 5 hay không
   */
  static isSymmetryBreakSurprise(
    history: Array<{ row: number; col: number; player: ActivePlayer }>,
    row: number,
    col: number,
    playerColor: ActivePlayer,
    botColor: ActivePlayer
  ): boolean {
    const playerMoves = history.filter(h => h.player === playerColor);
    const botMoves = history.filter(h => h.player === botColor);

    // Kiểm tra đúng nước thứ 5 của người chơi
    if (playerMoves.length !== 5 || botMoves.length < 4) return false;

    // 4 nước đầu của người chơi có phải đều là đối xứng với nước đi trước đó của bot không
    for (let i = 0; i < 4; i++) {
      const pm = playerMoves[i];
      const bm = botMoves[i];
      if (!this.isMirrorMove(bm.row, bm.col, pm.row, pm.col)) {
        return false;
      }
    }

    // Nước thứ 5 hiện tại không còn là đối xứng nữa
    const lastBotMove = botMoves[botMoves.length - 1];
    const isStillMirror = this.isMirrorMove(lastBotMove.row, lastBotMove.col, row, col);
    return !isStillMirror;
  }

  /**
   * Kiểm tra xem nước cờ vừa đánh có tạo thành bẫy ba nhảy cách (tam tử cách ô: X_XX hoặc XX_X thoáng 2 đầu)
   */
  static isJumpThreeTrap(board: BoardMatrix, playerColor: ActivePlayer, row: number, col: number): boolean {
    const size = board.length;
    const directions = [
      [0, 1],   // Ngang
      [1, 0],   // Dọc
      [1, 1],   // Chéo chính
      [1, -1],  // Chéo phụ
    ];

    for (const [dr, dc] of directions) {
      // Quét chuỗi 6 ô liên tiếp chứa (row, col)
      for (let offset = -4; offset <= 0; offset++) {
        const pattern: (Player | 'OUT')[] = [];
        let containsCurrent = false;

        for (let i = 0; i < 6; i++) {
          const r = row + (offset + i) * dr;
          const c = col + (offset + i) * dc;
          if (r === row && c === col) containsCurrent = true;
          if (r < 0 || r >= size || c < 0 || c >= size) {
            pattern.push('OUT');
          } else {
            pattern.push(board[r][c]);
          }
        }

        if (!containsCurrent) continue;

        // Mẫu 1: _ X _ X X _
        const isPattern1 =
          pattern[0] === EMPTY &&
          pattern[1] === playerColor &&
          pattern[2] === EMPTY &&
          pattern[3] === playerColor &&
          pattern[4] === playerColor &&
          pattern[5] === EMPTY;

        // Mẫu 2: _ X X _ X _
        const isPattern2 =
          pattern[0] === EMPTY &&
          pattern[1] === playerColor &&
          pattern[2] === playerColor &&
          pattern[3] === EMPTY &&
          pattern[4] === playerColor &&
          pattern[5] === EMPTY;

        if (isPattern1 || isPattern2) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra xem người chơi có mải mê tấn công (tạo nước 3 hoặc 4) khi Bot đã có nước 4 sát cục mười mươi không
   */
  static isOverconfidentBlindAttack(
    previousBoard: BoardMatrix,
    currentBoard: BoardMatrix,
    botColor: ActivePlayer,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    // 1. Kiểm tra xem Bot ở thế cờ trước có điểm thắng sát cục mà KHÔNG PHẢI ô (row, col) không
    const size = previousBoard.length;
    let botHadWinningMove = false;

    for (let r = 0; r < size && !botHadWinningMove; r++) {
      for (let c = 0; c < size; c++) {
        if (previousBoard[r][c] === EMPTY) {
          previousBoard[r][c] = botColor;
          const win = checkWin(previousBoard);
          previousBoard[r][c] = EMPTY;
          if (win && win.winner === botColor && (r !== row || c !== col)) {
            botHadWinningMove = true;
            break;
          }
        }
      }
    }

    if (!botHadWinningMove) return false;

    // 2. Người chơi không chặn điểm thắng của Bot mà lại đánh nước tấn công (tạo nước 3 hoặc 4 của mình)
    return this.isPlayerThreatMove(currentBoard, playerColor);
  }

  /**
   * Kiểm tra xem người chơi có chiếm từ 4 ô trở lên trong 8 ô bao quanh tâm Thiên Nguyên (7,7) khi ván còn sớm không
   */
  static isBoxSurroundCenter(board: BoardMatrix, playerColor: ActivePlayer, totalMoves: number): boolean {
    if (totalMoves > 20) return false;
    const centerNeighbors = [
      [6, 6], [6, 7], [6, 8],
      [7, 6],         [7, 8],
      [8, 6], [8, 7], [8, 8],
    ];
    let count = 0;
    for (const [r, c] of centerNeighbors) {
      if (board[r][c] === playerColor) count++;
    }
    return count >= 4;
  }

  /**
   * Kiểm tra xem người chơi có chặn nhầm một đầu khi đối thủ có thế 3 mở cả 2 đầu không
   */
  static isBlockWrongEnd(
    prevBoard: BoardMatrix,
    nextBoard: BoardMatrix,
    botColor: ActivePlayer,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    const size = prevBoard.length;
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of directions) {
      // Kiểm tra xem ô (row, col) người chơi vừa đánh có tiếp giáp với 1 chuỗi 3 quân của Bot không
      let countForward = 0;
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < size && c >= 0 && c < size && prevBoard[r][c] === botColor) {
        countForward++;
        r += dr;
        c += dc;
      }

      let countBackward = 0;
      let br = row - dr;
      let bc = col - dc;
      while (br >= 0 && br < size && bc >= 0 && bc < size && prevBoard[br][bc] === botColor) {
        countBackward++;
        br -= dr;
        bc -= dc;
      }

      // Nếu ô người chơi vừa chặn nằm ở 1 đầu của chuỗi 3 quân của Bot
      if (countForward === 3 && countBackward === 0) {
        // Đầu đối diện (r, c) trước đó có trống không?
        const otherEndEmpty = r >= 0 && r < size && c >= 0 && c < size && nextBoard[r][c] === EMPTY;
        if (otherEndEmpty) return true;
      } else if (countBackward === 3 && countForward === 0) {
        const otherEndEmpty = br >= 0 && br < size && bc >= 0 && bc < size && nextBoard[br][bc] === EMPTY;
        if (otherEndEmpty) return true;
      }
    }
    return false;
  }

  /**
   * Kiểm tra lối đánh phòng thủ thụ động kiểu "rùa rụt cổ" (co cụm bám sát đối thủ, không tự tạo thế)
   */
  static isTurtleDefense(
    board: BoardMatrix,
    playerColor: ActivePlayer,
    botColor: ActivePlayer,
    history: Array<{ row: number; col: number; player: ActivePlayer }>
  ): boolean {
    if (history.length < 12) return false;

    const playerMoves = history.filter(m => m.player === playerColor);
    if (playerMoves.length < 6) return false;

    // Lấy 4 nước gần nhất của người chơi
    const recentPlayerMoves = playerMoves.slice(-4);

    // Kiểm tra xem cả 4 nước gần nhất có đều dính sát (khoảng cách Chebyshev = 1) vào ít nhất 1 quân của Bot không
    const size = board.length;
    for (const move of recentPlayerMoves) {
      let adjacentToBot = false;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = move.row + dr;
          const nc = move.col + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === botColor) {
            adjacentToBot = true;
            break;
          }
        }
        if (adjacentToBot) break;
      }
      if (!adjacentToBot) return false;
    }

    // Và người chơi không có bất kỳ đe dọa mở 3 hoặc 4 nào
    return !this.isPlayerThreatMove(board, playerColor);
  }

  /**
   * Kiểm tra xem người chơi có liên tiếp xếp từ 4 quân trở lên nối dài trên cùng 1 đường chéo lớn không
   */
  static isFullDiagonalHighway(board: BoardMatrix, playerColor: ActivePlayer, row: number, col: number): boolean {
    const size = board.length;
    const diagDirs = [
      [1, 1],   // Chéo chính
      [1, -1],  // Chéo phụ
    ];

    for (const [dr, dc] of diagDirs) {
      let count = 1;
      // Đếm về 1 phía
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) {
        count++;
        r += dr;
        c += dc;
      }
      // Đếm về phía ngược lại
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) {
        count++;
        r -= dr;
        c -= dc;
      }

      if (count >= 4) return true;
    }
    return false;
  }

  /**
   * Kiểm tra đòn tấn công kép 4-3 (tạo nước 4 và nước 3 mở cùng lúc)
   */
  static isFourThreeAttack(board: BoardMatrix, playerColor: ActivePlayer, row: number, col: number): boolean {
    const size = board.length;
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    let fourCount = 0;
    let openThreeCount = 0;

    for (const [dr, dc] of directions) {
      let count = 1;
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) {
        count++;
        r += dr;
        c += dc;
      }
      const end1Open = r >= 0 && r < size && c >= 0 && c < size && board[r][c] === EMPTY;

      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) {
        count++;
        r -= dr;
        c -= dc;
      }
      const end2Open = r >= 0 && r < size && c >= 0 && c < size && board[r][c] === EMPTY;

      if (count === 4 && (end1Open || end2Open)) {
        fourCount++;
      } else if (count === 3 && end1Open && end2Open) {
        openThreeCount++;
      }
    }

    return fourCount >= 1 && openThreeCount >= 1;
  }

  /**
   * Kiểm tra xem người chơi có bỏ sót để đối phương tạo nước 4 mở 2 đầu không
   */
  static isOpenFourBlunder(
    prevBoard: BoardMatrix,
    nextBoard: BoardMatrix,
    botColor: ActivePlayer,
    playerColor: ActivePlayer,
    row: number,
    col: number
  ): boolean {
    const size = prevBoard.length;
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (prevBoard[r][c] !== botColor) continue;

        for (const [dr, dc] of directions) {
          // Kiểm tra chuỗi 3 quân của Bot trong prevBoard
          if (
            r + 2 * dr < size &&
            r + 2 * dr >= 0 &&
            c + 2 * dc < size &&
            c + 2 * dc >= 0 &&
            prevBoard[r + dr][c + dc] === botColor &&
            prevBoard[r + 2 * dr][c + 2 * dc] === botColor
          ) {
            const beforeR = r - dr;
            const beforeC = c - dc;
            const afterR = r + 3 * dr;
            const afterC = c + 3 * dc;

            // Nếu trong prevBoard, cả 2 đầu đều trống
            const prevOpen1 = beforeR >= 0 && beforeR < size && beforeC >= 0 && beforeC < size && prevBoard[beforeR][beforeC] === EMPTY;
            const prevOpen2 = afterR >= 0 && afterR < size && afterC >= 0 && afterC < size && prevBoard[afterR][afterC] === EMPTY;

            if (prevOpen1 && prevOpen2) {
              // Người chơi không đánh vào bất kỳ đầu nào trong 2 đầu
              const blockedEnd1 = row === beforeR && col === beforeC;
              const blockedEnd2 = row === afterR && col === afterC;
              if (!blockedEnd1 && !blockedEnd2) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Kiểm tra thế cờ chữ thập chéo X (2 đường chéo giao nhau tạo thành hình chữ X lớn)
   */
  static isDiagonalCrossFormation(board: BoardMatrix, playerColor: ActivePlayer, row: number, col: number): boolean {
    const size = board.length;

    // Đếm quân trên đường chéo chính [1, 1]
    let mainDiagCount = 1;
    let r = row + 1, c = col + 1;
    while (r < size && c < size && board[r][c] === playerColor) { mainDiagCount++; r++; c++; }
    r = row - 1; c = col - 1;
    while (r >= 0 && c >= 0 && board[r][c] === playerColor) { mainDiagCount++; r--; c--; }

    // Đếm quân trên đường chéo phụ [1, -1]
    let antiDiagCount = 1;
    r = row + 1; c = col - 1;
    while (r < size && c >= 0 && board[r][c] === playerColor) { antiDiagCount++; r++; c--; }
    r = row - 1; c = col + 1;
    while (r >= 0 && c < size && board[r][c] === playerColor) { antiDiagCount++; r--; c++; }

    // Cả 2 đường chéo đều có ít nhất 3 quân giao nhau tại (row, col)
    return mainDiagCount >= 3 && antiDiagCount >= 3;
  }

  /**
   * Kiểm tra thế cờ hình chữ T vuông góc (T-junction)
   */
  static isTShapeFormation(board: BoardMatrix, playerColor: ActivePlayer, row: number, col: number): boolean {
    const size = board.length;

    // Đếm quân ngang [0, 1]
    let leftCount = 0, rightCount = 0;
    let c = col - 1;
    while (c >= 0 && board[row][c] === playerColor) { leftCount++; c--; }
    c = col + 1;
    while (c < size && board[row][c] === playerColor) { rightCount++; c++; }
    const horizTotal = leftCount + rightCount + 1;

    // Đếm quân dọc [1, 0]
    let upCount = 0, downCount = 0;
    let r = row - 1;
    while (r >= 0 && board[r][col] === playerColor) { upCount++; r--; }
    r = row + 1;
    while (r < size && board[r][col] === playerColor) { downCount++; r++; }
    const vertTotal = upCount + downCount + 1;

    // Hình chữ T: Một nhánh là thanh ngang/dọc (>= 3 quân cả 2 phía), nhánh vuông góc bắt đầu từ điểm giao (1 phía >= 2 quân, phía kia = 0)
    const isHorizT = horizTotal >= 3 && leftCount >= 1 && rightCount >= 1 && ((upCount >= 2 && downCount === 0) || (downCount >= 2 && upCount === 0));
    const isVertT = vertTotal >= 3 && upCount >= 1 && downCount >= 1 && ((leftCount >= 2 && rightCount === 0) || (rightCount >= 2 && leftCount === 0));

    return isHorizT || isVertT;
  }

  /**
   * Kiểm tra chuỗi nước đi hình zic-zắc tia chớp
   */
  static isZigzagLightning(history: Array<{ row: number; col: number; player: ActivePlayer }>, playerColor: ActivePlayer): boolean {
    const playerMoves = history.filter(h => h.player === playerColor);
    if (playerMoves.length < 4) return false;

    const last4 = playerMoves.slice(-4);
    // Tính vector giữa các nước đi liên tiếp
    const v1 = { dr: last4[1].row - last4[0].row, dc: last4[1].col - last4[0].col };
    const v2 = { dr: last4[2].row - last4[1].row, dc: last4[2].col - last4[1].col };
    const v3 = { dr: last4[3].row - last4[2].row, dc: last4[3].col - last4[2].col };

    // Kiểm tra tính zic-zắc: đổi hướng liên tục qua các vector
    const isZic1 = (v1.dr * v2.dr < 0 && v2.dr * v3.dr < 0) || (v1.dc * v2.dc < 0 && v2.dc * v3.dc < 0);
    const isNearby = Math.abs(v1.dr) <= 2 && Math.abs(v1.dc) <= 2 && Math.abs(v2.dr) <= 2 && Math.abs(v2.dc) <= 2;

    return isZic1 && isNearby;
  }

  /**
   * Kiểm tra thế song tứ tử (tạo 2 hàng 4 quân nhưng CẢ HAI đều bị chặn kín 2 đầu)
   */
  static isDoubleDeadFour(board: BoardMatrix, playerColor: ActivePlayer, row: number, col: number): boolean {
    const size = board.length;
    const directions = [
      [0, 1],   // Ngang
      [1, 0],   // Dọc
      [1, 1],   // Chéo chính
      [1, -1],  // Chéo phụ
    ];

    let deadFourCount = 0;

    for (const [dr, dc] of directions) {
      let count = 1;
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) { count++; r += dr; c += dc; }
      const end1Blocked = r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== EMPTY;

      r = row - dr; c = col - dc;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === playerColor) { count++; r -= dr; c -= dc; }
      const end2Blocked = r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== EMPTY;

      if (count === 4 && end1Blocked && end2Blocked) {
        deadFourCount++;
      }
    }

    return deadFourCount >= 2;
  }

  /**
   * Kiểm tra góc chết 3x3 ở 4 góc bàn cờ (Corner Death Trap)
   */
  static isCornerDeathTrap(row: number, col: number): boolean {
    const isTopCorner = row <= 2;
    const isBottomCorner = row >= 12;
    const isLeftCorner = col <= 2;
    const isRightCorner = col >= 12;

    return (isTopCorner || isBottomCorner) && (isLeftCorner || isRightCorner);
  }

  /**
   * Kiểm tra đánh so le xen kẽ kiểu bàn cờ vua liên tiếp (Checkerboard Weave)
   */
  static isCheckerboardWeave(history: Array<{ row: number; col: number; player: ActivePlayer }>): boolean {
    if (history.length < 6) return false;
    const last6 = history.slice(-6);

    // Kiểm tra tính kề cạnh hoặc so le parity
    for (let i = 1; i < last6.length; i++) {
      const dist = Math.abs(last6[i].row - last6[i - 1].row) + Math.abs(last6[i].col - last6[i - 1].col);
      if (dist > 2 || dist === 0) return false;
    }
    return true;
  }
}


