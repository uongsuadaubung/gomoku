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
}


