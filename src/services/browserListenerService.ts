import { TauntEvent } from '../data/taunts/types';
import { interactionTracker } from './interactionTracker';

export interface BrowserListenerOptions {
  isGamePlaying: () => boolean;
  isPlayerTurn: () => boolean;
  triggerTaunt: (event: TauntEvent, delayMs?: number) => void;
}

/**
 * Service quản lý các bộ lắng nghe sự kiện trình duyệt DOM/Window
 * (Tách biệt hoàn toàn khỏi GameStore để tuân thủ nguyên lý Single Responsibility)
 */
export class BrowserListenerService {
  /**
   * Đăng ký toàn bộ event listeners của trình duyệt và trả về hàm cleanup
   */
  static setup(options: BrowserListenerOptions): () => void {
    const { isGamePlaying, isPlayerTurn, triggerTaunt } = options;

    // Kiểm tra nếu vừa F5 reload trang khi trận đấu cũ đang dở dang (RAGE_QUIT_F5_RELOAD)
    try {
      if (sessionStorage.getItem('gomoku_active_game')) {
        sessionStorage.removeItem('gomoku_active_game');
        setTimeout(() => {
          triggerTaunt('RAGE_QUIT_F5_RELOAD', 300);
        }, 500);
      }
    } catch {
      // Bỏ qua lỗi truy cập sessionStorage
    }

    // 1. Phím tắt và spam gõ phím (CTRL_Z, DEVTOOLS, SCREENSHOT, SPACEBAR, KEYBOARD_SMASH)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGamePlaying()) return;

      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      // Bắt phím tắt DevTools (F12, Ctrl+Shift+I/J/C, Ctrl+U)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        triggerTaunt('DEVTOOLS_INSPECT_HACK', 100);
      }

      // Bắt phím tắt Ctrl+Z (Undo)
      if (e.ctrlKey && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        triggerTaunt('CTRL_Z_SHORTCUT_ATTEMPT', 100);
      }

      // Bắt phím tắt chụp màn hình (SCREENSHOT_ATTEMPT: PrintScreen, Win+Shift+S / Cmd+Shift+4)
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        ((e.key === 's' || e.key === 'S') && e.shiftKey && (e.metaKey || e.ctrlKey))
      ) {
        triggerTaunt('SCREENSHOT_ATTEMPT', 100);
      }

      // Bắt phím Spacebar đập liên hồi khi sốt ruột (SPACEBAR_SMASH)
      if (e.code === 'Space' || e.key === ' ') {
        if (interactionTracker.record('SPACEBAR_PRESS', 1500) >= 3) {
          interactionTracker.clearAction('SPACEBAR_PRESS');
          triggerTaunt('SPACEBAR_SMASH', 100);
        }
      }

      if (interactionTracker.record('KEYBOARD_PRESS', 2000) >= 6) {
        interactionTracker.clearAction('KEYBOARD_PRESS');
        triggerTaunt('KEYBOARD_SMASH_SPAM', 100);
      }
    };

    // 2. Co giãn cửa sổ trình duyệt (WINDOW_RESIZE_PANIC)
    let resizeDebounceTimer: number | null = null;
    const handleResize = () => {
      if (!isGamePlaying()) return;
      if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
      resizeDebounceTimer = window.setTimeout(() => {
        triggerTaunt('WINDOW_RESIZE_PANIC', 200);
      }, 400);
    };

    // 3. Bôi đen chọn văn bản (DRAG_SELECT_PANIC)
    let selectionDebounceTimer: number | null = null;
    const handleSelectionChange = () => {
      if (!isGamePlaying()) return;
      const sel = window.getSelection()?.toString() || '';
      if (sel.trim().length >= 8) {
        if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
        selectionDebounceTimer = window.setTimeout(() => {
          triggerTaunt('DRAG_SELECT_PANIC', 200);
        }, 500);
      }
    };

    // 4. Chuột rời màn hình quá 15s (MOUSE_LEAVE_VIEWPORT)
    let mouseLeaveTimer: number | null = null;
    const handleMouseLeave = () => {
      if (!isGamePlaying() || !isPlayerTurn()) return;
      if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
      mouseLeaveTimer = window.setTimeout(() => {
        if (isGamePlaying() && isPlayerTurn()) {
          triggerTaunt('MOUSE_LEAVE_VIEWPORT', 200);
        }
      }, 15000);
    };

    const handleMouseEnter = () => {
      if (mouseLeaveTimer) {
        clearTimeout(mouseLeaveTimer);
        mouseLeaveTimer = null;
      }
    };

    // 5. Lắc chuột liên hồi (MOUSE_JIGGLE_PANIC) - Có throttle & cooldown 45s
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastDir = 0;
    let dirChanges = 0;
    let lastCheckTime = 0;
    let lastJiggleTauntTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isGamePlaying() || !isPlayerTurn()) return;
      const now = Date.now();

      // Throttle: chỉ xử lý tối đa mỗi 50ms một lần
      if (now - lastCheckTime < 50) return;
      lastCheckTime = now;

      // Cooldown: không kích hoạt lại trong vòng 45 giây
      if (now - lastJiggleTauntTime < 45000) {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        return;
      }

      if (lastMouseX === 0 && lastMouseY === 0) {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        return;
      }

      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 35) {
        const dir = Math.atan2(dy, dx);
        // Đảo chiều chuột gắt gao (> 2.4 rad tương đương gần như quay ngoắt 180 độ)
        if (Math.abs(dir - lastDir) > 2.4) {
          dirChanges++;
          if (dirChanges >= 8) {
            dirChanges = 0;
            lastJiggleTauntTime = now;
            triggerTaunt('MOUSE_JIGGLE_PANIC', 150);
          }
        } else {
          dirChanges = Math.max(0, dirChanges - 1);
        }
        lastDir = dir;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    // Đăng ký listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('selectionchange', handleSelectionChange);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    // Trả về hàm dọn dẹp (cleanup)
    return () => {
      if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
      if (selectionDebounceTimer) clearTimeout(selectionDebounceTimer);
      if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }
}
