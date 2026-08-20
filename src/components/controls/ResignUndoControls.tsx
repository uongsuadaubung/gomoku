import { type Component, Show } from 'solid-js';
import { Flag, RotateCcw } from 'lucide-solid';
import { useGame } from '../../store/GameContext';

export interface ResignUndoControlsProps {
  undoTitle?: string;
  undoLabel?: string;
  resignTitle?: string;
  resignLabel?: string;
  onUndo?: () => void;
  onResign?: () => void;
  showUndo?: boolean;
}

export const ResignUndoControls: Component<ResignUndoControlsProps> = (props) => {
  const store = useGame();

  const canUndo = () => {
    return (
      store.matchStage() === 'playing' &&
      !store.isAiThinking() &&
      store.currentStrategy().canUndo() &&
      store.moveHistory().some(m => m.player === store.playerColor())
    );
  };

  let undoHoverStartTime = 0;
  let lastUndoHesitationTime = 0;

  const handleUndoMouseEnter = () => {
    if (!canUndo()) return;
    undoHoverStartTime = Date.now();
  };

  const handleUndoMouseLeave = () => {
    const now = Date.now();
    if (
      undoHoverStartTime > 0 &&
      now - undoHoverStartTime >= 2000 &&
      now - lastUndoHesitationTime > 45000 &&
      store.matchStage() === 'playing'
    ) {
      store.triggerTaunt('HOVER_UNDO_HESITATION', 200);
      lastUndoHesitationTime = now;
    }
    undoHoverStartTime = 0;
  };

  const handleResign = () => {
    if (props.onResign) {
      props.onResign();
    } else {
      store.resignGame();
    }
  };

  const handleUndo = () => {
    if (props.onUndo) {
      props.onUndo();
    } else {
      store.undoMove();
    }
  };

  const showUndo = () => props.showUndo !== false;

  return (
    <div class={showUndo() ? 'grid grid-cols-2 gap-2.5' : 'w-full'}>
      {/* Nút Nhận Thua */}
      <button
        type="button"
        onClick={handleResign}
        class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-sm shadow-md shadow-rose-950/40 active:scale-95 transition-all cursor-pointer"
        title={props.resignTitle || 'Đầu hàng và nhận thua ván đấu'}
      >
        <Flag size={16} />
        <span>{props.resignLabel || 'Nhận Thua'}</span>
      </button>

      {/* Nút Đi Lại (Undo) */}
      <Show when={showUndo()}>
        <button
          type="button"
          onClick={handleUndo}
          disabled={!canUndo()}
          onMouseEnter={handleUndoMouseEnter}
          onMouseLeave={handleUndoMouseLeave}
          class={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
            canUndo()
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95 cursor-pointer'
              : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
          }`}
          title={props.undoTitle || 'Đi lại nước cờ'}
        >
          <RotateCcw size={16} />
          <span>{props.undoLabel || 'Đi Lại (Undo)'}</span>
        </button>
      </Show>
    </div>
  );
};
