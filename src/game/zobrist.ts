import { BOARD_SIZE, BLACK, WHITE, BoardMatrix, ActivePlayer } from './types';

// Bảng băm Zobrist 15x15 x 2 (Black, White)
class ZobristTable {
  private table: number[][][];

  constructor() {
    this.table = [];
    // Khởi tạo các số ngẫu nhiên 32-bit không dấu
    for (let r = 0; r < BOARD_SIZE; r++) {
      this.table[r] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        this.table[r][c] = [
          0, // EMPTY
          this.random32(), // BLACK
          this.random32(), // WHITE
        ];
      }
    }
  }

  private random32(): number {
    return Math.floor(Math.random() * 0xffffffff);
  }

  /**
   * Tính hash ban đầu cho toàn bộ bàn cờ
   */
  public computeHash(board: BoardMatrix): number {
    let hash = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = board[r][c];
        if (p === BLACK || p === WHITE) {
          hash ^= this.table[r][c][p];
        }
      }
    }
    return hash;
  }

  /**
   * Cập nhật hash tức thời O(1) khi đặt/bỏ quân cờ
   */
  public togglePiece(hash: number, row: number, col: number, player: ActivePlayer): number {
    return hash ^ this.table[row][col][player];
  }
}

export const zobrist = new ZobristTable();

export interface TTEntry {
  depth: number;
  score: number;
  flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND';
  bestMove?: { row: number; col: number };
}

// Bảng nhớ trạng thái thế cờ (Transposition Table)
export class TranspositionTable {
  private map: Map<number, TTEntry>;
  private maxEntries: number;

  constructor(maxEntries = 100000) {
    this.map = new Map();
    this.maxEntries = maxEntries;
  }

  public get(hash: number): TTEntry | undefined {
    return this.map.get(hash);
  }

  public set(hash: number, entry: TTEntry): void {
    if (this.map.size >= this.maxEntries) {
      // Xóa bớt phần tử cũ nếu bảng quá đầy
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) {
        this.map.delete(firstKey);
      }
    }
    this.map.set(hash, entry);
  }

  public clear(): void {
    this.map.clear();
  }
}
