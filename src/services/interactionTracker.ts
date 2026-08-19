/**
 * Service theo dõi và đánh giá tần suất tương tác của người dùng
 * (Phát hiện spam thao tác, chuỗi hành động nhanh, cờ trạng thái tạm thời)
 */
export class InteractionTracker {
  private timestamps: Map<string, number[]> = new Map();
  private flags: Map<string, boolean> = new Map();

  /**
   * Ghi nhận một hành động vừa xảy ra và trả về số lần hành động đó diễn ra trong khoảng thời gian windowMs
   */
  record(actionKey: string, windowMs: number = 5000): number {
    const now = Date.now();
    const history = (this.timestamps.get(actionKey) || []).filter(t => now - t < windowMs);
    history.push(now);
    this.timestamps.set(actionKey, history);
    return history.length;
  }

  /**
   * Kiểm tra xem một hành động có đang bị spam (vượt ngưỡng threshold trong khoảng windowMs) hay không
   */
  isSpammed(actionKey: string, threshold: number = 4, windowMs: number = 3000): boolean {
    const now = Date.now();
    const history = (this.timestamps.get(actionKey) || []).filter(t => now - t < windowMs);
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
   * Reset toàn bộ trạng thái và lịch sử theo dõi
   */
  resetAll(): void {
    this.timestamps.clear();
    this.flags.clear();
  }
}

export const interactionTracker = new InteractionTracker();
