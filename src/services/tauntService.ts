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

export class TauntService {
  /**
   * Lấy một câu thoại ngẫu nhiên theo sự kiện:
   * - Độ phức tạp O(1), Zero-Allocation (không dùng .filter() tạo mảng rác)
   * - Tự động lấy BotMood từ định nghĩa sự kiện (không dùng giant switch-case)
   */
  static getTaunt(event: TauntEvent): TauntItem {
    const def = TAUNT_REGISTRY[event] || TAUNT_REGISTRY.BOT_WIN;
    const list = def.texts;
    const len = list.length;

    if (len === 0) {
      return { text: '...', mood: def.mood };
    }

    let nextIndex = Math.floor(Math.random() * len);
    const lastIndex = lastIndexMap[event];

    if (len > 1 && nextIndex === lastIndex) {
      // Nhảy sang một index khác trong tập (len - 1) phần tử còn lại
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (len - 1))) % len;
    }

    lastIndexMap[event] = nextIndex;

    return {
      text: list[nextIndex],
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
   * Kiểm tra xem Bot vừa chặn đứng một đòn đe dọa (nước 4 hoặc nước 3) của Người chơi hay không
   */
  static isBotBlockThreat(
    board: BoardMatrix,
    playerColor: ActivePlayer,
    botRow: number,
    botCol: number
  ): boolean {
    // Thử đặt quân người chơi vào vị trí Bot vừa đánh để xem người chơi có tạo được nước thắng/đe dọa không
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
}
