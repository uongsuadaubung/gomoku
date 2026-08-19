import { BoardMatrix, ActivePlayer, EMPTY } from '../game/types';
import { checkWin } from '../game/board';
import {
  type TauntEvent,
  type BotMood,
  type TauntItem,
  type TauntDefinition,
  TAUNT_REGISTRY,
  TAUNT_DATABASE,
} from '../data/taunts';

export type { TauntEvent, BotMood, TauntItem, TauntDefinition };
export { TAUNT_REGISTRY, TAUNT_DATABASE };

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
}


