import { type Component, Show, Switch, Match } from 'solid-js';
import {
  RotateCcw,
  Flag,
  Sparkles,
  Swords,
  User,
  Bot,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE } from '../../game/types';
import { AI_LEVELS } from '../../game/constants';
import { BotPreviewCard } from '../BotPreviewCard';
import { OpponentSelect } from '../OpponentSelect';

export const CustomControls: Component = () => {
  const store = useGame();

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => store.gameStatus() === 'draw';

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

  const currentBotLevel = () => {
    return store.customConfig()?.botLevel || store.currentLevelConfig().id;
  };

  const maxUnlockedLevel = () => {
    return store.campaignLevelConfig().id || 1;
  };

  return (
    <Switch>
      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 1: READY (Thiết lập Đấu Tập - Chọn đối thủ & Chọn bên đi trước) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'ready'}>
        <div class="w-full flex flex-col gap-3 p-4 rounded-3xl bg-slate-900/95 border border-purple-500/30 shadow-xl animate-fade-in select-none">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Swords size={14} class="text-purple-400" />
              <span>Thiết lập ván Đấu Tập:</span>
            </span>
          </div>

          {/* Chọn đối thủ đã mở khóa */}
          <OpponentSelect
            value={currentBotLevel()}
            onChange={lvl => store.setCustomBotLevel(lvl)}
            maxUnlockedLevel={maxUnlockedLevel()}
            theme="purple"
            label="Chọn đối thủ đã mở:"
            icon={<Swords size={13} />}
            layout="stacked"
            size="md"
            optionFormat="full"
          />

          {/* Thẻ xem trước đối thủ được chọn */}
          <BotPreviewCard
            bot={AI_LEVELS[currentBotLevel() - 1] || AI_LEVELS[0]}
            theme="purple"
          />

          {/* Chọn bên đi trước & Bắt đầu trận đấu */}
          <div class="flex flex-col gap-1.5 pt-1">
            <span class="text-[11px] font-bold text-slate-300">Chọn bên đi trước để bắt đầu:</span>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => store.startCustomMatch(currentBotLevel(), true)}
                class="flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-emerald-500/50 hover:border-emerald-400 text-xs font-bold shadow-md active:scale-95 transition-all group animate-glow-emerald cursor-pointer"
              >
                <div class="flex items-center gap-1.5">
                  <User size={15} class="group-hover:scale-110 transition-transform text-emerald-400 group-hover:text-slate-950" />
                  <span>Bạn Đi Trước</span>
                </div>
                <span class="text-[10px] opacity-75 font-normal">Quân Đen (●)</span>
              </button>

              <button
                onClick={() => store.startCustomMatch(currentBotLevel(), false)}
                class="flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-slate-800/90 hover:bg-purple-500 hover:text-slate-950 text-slate-200 border border-purple-500/50 hover:border-purple-400 text-xs font-bold shadow-md active:scale-95 transition-all group animate-glow-purple cursor-pointer"
              >
                <div class="flex items-center gap-1.5">
                  <Bot size={15} class="group-hover:scale-110 transition-transform text-purple-400 group-hover:text-slate-950" />
                  <span>Bot Đi Trước</span>
                </div>
                <span class="text-[10px] opacity-75 font-normal">Bot cầm Đen (●)</span>
              </button>
            </div>
          </div>

          {/* Nút Trở Về Menu */}
          <button
            onClick={() => store.goToMainMenu()}
            class="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer mt-0.5"
          >
            <span>🏠 Trở Về Menu</span>
          </button>
        </div>
      </Match>

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 2: PLAYING (Đang trong trận đấu tùy chọn) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'playing'}>
        <div class="flex flex-col gap-3 animate-fade-in">
          <div class="grid grid-cols-2 gap-2.5">
            {/* Nút Nhận Thua */}
            <button
              onClick={() => store.resignGame()}
              class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40 font-bold text-sm shadow-md shadow-rose-950/40 active:scale-95 transition-all cursor-pointer"
              title="Đầu hàng và nhận thua ván đấu"
            >
              <Flag size={16} />
              <span>Nhận Thua</span>
            </button>

            {/* Nút Đi Lại (Undo) */}
            <button
              onClick={() => {
                undoHoverStartTime = 0;
                store.undoMove();
              }}
              onMouseEnter={handleUndoMouseEnter}
              onMouseLeave={handleUndoMouseLeave}
              disabled={!canUndo()}
              class={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                canUndo()
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
            >
              <RotateCcw size={16} />
              <span>Đi Lại</span>
            </button>
          </div>

          {/* Thông tin ván đấu */}
          <div class="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-medium">
            <span class="flex items-center gap-1.5 text-purple-300">
              <Swords size={13} />
              <span>Đối thủ: Bot {store.currentLevelConfig().vietnameseName}</span>
            </span>
            <span class="font-bold text-purple-400/90 font-mono">
              {store.playerColor() === BLACK ? 'Bạn cầm Đen (●)' : 'Bạn cầm Trắng (○)'}
            </span>
          </div>
        </div>
      </Match>

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 3: GAME_OVER (Ván đấu kết thúc) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'game_over'}>
        <div class="flex flex-col gap-2.5 animate-fade-in p-3 rounded-2xl bg-slate-950/80 border border-purple-500/20 shadow-xl">
          {/* Huy hiệu thông báo kết quả inline */}
          <div
            class={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm ${
              isPlayerWinner()
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-emerald-950/30'
                : isDraw()
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-rose-950/30'
            }`}
          >
            <Show
              when={isPlayerWinner()}
              fallback={
                <Show when={isDraw()} fallback={<span>💥 {store.lastResigned() ? 'Bạn đã nhận thua ván này' : 'Bot đã giành chiến thắng'}</span>}>
                  <span>🤝 Trận đấu hòa cờ!</span>
                </Show>
              }
            >
              <span>🎉 Xuất sắc! Bạn đã chiến thắng!</span>
            </Show>
          </div>

          {/* Đấu lại cùng cấu hình */}
          <button
            onClick={() => store.startCustomMatch(currentBotLevel(), store.playerColor() === BLACK)}
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Đấu Lại Trận Này</span>
          </button>

          <div class="grid grid-cols-2 gap-2">
            <button
              onClick={() => store.enterCustomMode(currentBotLevel())}
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-purple-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Swords size={13} />
              <span>Đổi Đối Thủ</span>
            </button>

            <button
              onClick={() => store.goToMainMenu()}
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🏠 Về Menu</span>
            </button>
          </div>
        </div>
      </Match>
    </Switch>
  );
};
