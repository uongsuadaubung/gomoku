/**
 * Service theo dõi và đánh giá tần suất tương tác của người dùng
 * (Tối ưu Zero-GC Allocation cho các sự kiện chuột/phím tần suất cao)
 */
export class InteractionTracker {
  private timestamps: Map<string, number[]> = new Map();
  private flags: Map<string, boolean> = new Map();
  private recentCellClicks: Array<{ r: number; c: number; time: number }> = [];

  /**
   * Dọn dẹp in-place các timestamp cũ hơn windowMs để tránh tạo rác Garbage Collection
   */
  private pruneOldTimestamps(history: number[], now: number, windowMs: number): void {
    const cutoff = now - windowMs;
    let removeCount = 0;
    while (removeCount < history.length && history[removeCount] < cutoff) {
      removeCount++;
    }
    if (removeCount > 0) {
      history.splice(0, removeCount);
    }
  }

  /**
   * Ghi nhận một hành động vừa xảy ra và trả về số lần hành động đó diễn ra trong khoảng thời gian windowMs
   */
  record(actionKey: string, windowMs: number = 5000): number {
    const now = Date.now();
    let history = this.timestamps.get(actionKey);
    if (!history) {
      history = [];
      this.timestamps.set(actionKey, history);
    }

    this.pruneOldTimestamps(history, now, windowMs);
    history.push(now);

    // Giới hạn độ dài tối đa để tránh phình to bộ nhớ
    if (history.length > 50) {
      history.shift();
    }

    return history.length;
  }

  /**
   * Kiểm tra xem một hành động có đang bị spam (vượt ngưỡng threshold trong khoảng windowMs) hay không
   */
  isSpammed(actionKey: string, threshold: number = 4, windowMs: number = 3000): boolean {
    const history = this.timestamps.get(actionKey);
    if (!history || history.length === 0) return false;

    const now = Date.now();
    this.pruneOldTimestamps(history, now, windowMs);
    return history.length >= threshold;
  }

  /**
   * Lấy mốc thời gian của hành động gần nhất
   */
  getLastTimestamp(actionKey: string): number {
    const list = this.timestamps.get(actionKey);
    if (!list || list.length === 0) return 0;
    return list[list.length - 1];
  }

  /**
   * Tính khoảng cách thời gian (ms) từ lần hành động trước đến hiện tại
   */
  getTimeSinceLast(actionKey: string): number {
    const last = this.getLastTimestamp(actionKey);
    if (last === 0) return Infinity;
    return Date.now() - last;
  }

  /**
   * Xóa toàn bộ lịch sử của một hành động cụ thể
   */
  clearAction(actionKey: string): void {
    this.timestamps.delete(actionKey);
  }

  /**
   * Đặt cờ trạng thái tạm thời
   */
  setFlag(key: string, value: boolean): void {
    this.flags.set(key, value);
  }

  /**
   * Lấy giá trị cờ trạng thái (mặc định trả về false nếu chưa set)
   */
  getFlag(key: string): boolean {
    return this.flags.get(key) ?? false;
  }

  /**
   * Tiện ích kiểm tra cờ và tự động bật cờ nếu chưa được kích hoạt
   * Trả về true nếu cờ được bật lần đầu tiên, false nếu đã được bật từ trước
   */
  consumeFirstTimeFlag(key: string): boolean {
    if (!this.getFlag(key)) {
      this.setFlag(key, true);
      return true;
    }
    return false;
  }

  /**
   * Ghi nhận thao tác click vào ô bàn cờ và trả về số ô phân biệt được click trong windowMs
   */
  recordCellClick(r: number, c: number, windowMs: number = 1200): number {
    const now = Date.now();
    const cutoff = now - windowMs;

    let removeCount = 0;
    while (removeCount < this.recentCellClicks.length && this.recentCellClicks[removeCount].time < cutoff) {
      removeCount++;
    }
    if (removeCount > 0) {
      this.recentCellClicks.splice(0, removeCount);
    }

    this.recentCellClicks.push({ r, c, time: now });

    const distinct = new Set(this.recentCellClicks.map(item => `${item.r},${item.c}`));
    if (distinct.size >= 3) {
      this.recentCellClicks.length = 0;
      return distinct.size;
    }
    return distinct.size;
  }

  /**
   * Reset toàn bộ trạng thái và lịch sử theo dõi
   */
  resetAll(): void {
    this.timestamps.clear();
    this.flags.clear();
    this.recentCellClicks.length = 0;
  }
}

export const interactionTracker = new InteractionTracker();
