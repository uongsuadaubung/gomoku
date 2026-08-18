import { BoardMatrix, ActivePlayer, EMPTY } from '../game/types';
import { checkWin } from '../game/board';
import {
  type TauntEvent,
  type BotMood,
  type TauntItem,
  TAUNT_DATABASE,
} from '../data/taunts';

export type { TauntEvent, BotMood, TauntItem };
export { TAUNT_DATABASE };

// Lưu lịch sử để không bị lặp lại câu thoại vừa nói
const lastTauntMap: Record<string, string> = {};

export class TauntService {
  /**
   * Lấy một câu thoại ngẫu nhiên theo sự kiện, tránh lặp lại câu gần nhất
   */
  static getTaunt(event: TauntEvent): TauntItem {
    const list = TAUNT_DATABASE[event] || TAUNT_DATABASE.BOT_WIN;
    const last = lastTauntMap[event];
    const filtered = list.filter(item => item !== last);
    const pool = filtered.length > 0 ? filtered : list;
    const chosenText = pool[Math.floor(Math.random() * pool.length)];
    lastTauntMap[event] = chosenText;

    let mood: BotMood = 'smug';
    switch (event) {
      case 'BOT_WIN':
      case 'STREAK_LOSS':
        mood = 'laugh';
        break;
      case 'PLAYER_RESIGN':
        mood = 'salute';
        break;
      case 'PLAYER_UNDO':
      case 'MULTI_UNDO':
      case 'CORNER_MOVE':
      case 'CHANGE_BOT_LEVEL_DOWN':
      case 'RESET_STATS':
        mood = 'disdain';
        break;
      case 'BLUNDER_MOVE':
      case 'FAST_MOVE_TAUNT':
      case 'RUSH_MOVE':
      case 'CLICK_OCCUPIED_CELL':
      case 'CLICK_BEFORE_START':
      case 'CLICK_AFTER_GAME_OVER':
        mood = 'clown';
        break;

      case 'BOT_TRAP':
        mood = 'evil';
        break;
      case 'GAME_START':
      case 'SWAP_SIDE_BOT_FIRST':
      case 'CHANGE_BOT_LEVEL_UP':
        mood = 'cool';
        break;
      case 'POKE_BOT':
      case 'SPAM_POKE_BOT':
        mood = 'rage';
        break;
      case 'TAB_BLUR':
        mood = 'angry';
        break;
      case 'IDLE_THINKING':
      case 'LONG_GAME':
        mood = 'bored';
        break;
      case 'IDLE_IN_GAME':
      case 'SUPER_SLOW_MOVE':
        mood = 'sleepy';
        break;
      case 'PLAYER_GOOD_MOVE':
      case 'PLAYER_WIN':
        mood = 'shocked';
        break;
      case 'BREAK_LOSS_STREAK':
      case 'PLAYER_STREAK_WIN':
        mood = 'mindblown';
        break;
      case 'GAME_DRAW':
        mood = 'relieved';
        break;
      case 'LEVEL_UP_ALERT':
        mood = 'party';
        break;
      case 'SOUND_MUTE':
        mood = 'shush';
        break;
      case 'THEME_CHANGE':
      case 'TOGGLE_STEP_NUMBERS':
      case 'OPEN_STATS':
      case 'OPEN_RULES':
      case 'OPEN_BOT_MODAL':
      case 'BOARD_STYLE_CHANGE':
        mood = 'detective';
        break;
      case 'IDLE_PRE_GAME':
      case 'IDLE_AFTER_LOSS':
      case 'SWAP_SIDE_PLAYER_FIRST':
      case 'BOT_BLOCK_THREAT':
      case 'TAB_FOCUS':
      case 'CENTER_MOVE':
      case 'SOUND_UNMUTE':
      default:
        mood = 'smug';
        break;
    }

    return {
      text: chosenText,
      mood,
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
