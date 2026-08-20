import { type Component, Show, Switch, Match, createMemo } from 'solid-js';
import {
  RotateCcw,
  Play,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Trophy,
} from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK, WHITE } from '../../game/types';
import { GameOverPresentationContext } from '../../game/strategies/types';
import { AI_LEVELS } from '../../game/constants';
import { BotPreviewCard } from '../BotPreviewCard';
import { OpponentSelect } from '../OpponentSelect';
import { ResignUndoControls } from './ResignUndoControls';

export const TutorControls: Component = () => {
  const store = useGame();

  const isPlayerWinner = () => {
    const status = store.gameStatus();
    const player = store.playerColor();
    return (status === 'black_win' && player === BLACK) || (status === 'white_win' && player === WHITE);
  };

  const isDraw = () => store.gameStatus() === 'draw';

  const highestUnlockedLevel = () => store.stats().tutor?.highestLevel || 1;

  const presentationCtx = createMemo<GameOverPresentationContext>(() => ({
    won: isPlayerWinner(),
    draw: isDraw(),
    lastResigned: store.lastResigned(),
    botConfig: store.currentLevelConfig(),
  }));

  // Tiêu đề kết quả trận đấu
  const titleInfo = createMemo<{ text: string; color: string }>(() => {
    return store.currentStrategy().getGameOverTitle(presentationCtx());
  });

  return (
    <Switch>
      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 1: READY (Chuẩn bị vào trận - Chọn đối thủ & Bấm nút Bắt đầu) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'ready'}>
        <div class="w-full flex flex-col gap-3 p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl animate-fade-in select-none">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles size={14} class="text-amber-400" />
              <span>Thiết lập ván đấu cùng Gia Sư:</span>
            </span>
          </div>

          {/* Chọn đối thủ đã mở khóa */}
          <OpponentSelect
            value={store.selectedOpponentLevel()}
            onChange={lvl => store.setOpponentLevel(lvl)}
            maxUnlockedLevel={highestUnlockedLevel()}
            theme="amber"
            label="Chọn đối thủ đã mở:"
            icon={<GraduationCap size={13} />}
            layout="stacked"
            size="md"
            optionFormat="full"
          />

          {/* Thẻ xem trước đối thủ được chọn */}
          <BotPreviewCard
            bot={AI_LEVELS[store.selectedOpponentLevel() - 1] || AI_LEVELS[0]}
            theme="amber"
          />

          {/* Nút Bắt Đầu Trận Đấu */}
          <button
            onClick={() => store.startTutorMatch(store.selectedOpponentLevel())}
            class="w-full mt-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer animate-subtle-glow"
          >
            <Play size={16} fill="currentColor" />
            <span>Bắt Đầu Trận Đấu</span>
            <ChevronRight size={16} />
          </button>

          {/* Nút Trở Về Menu */}
          <button
            onClick={() => store.goToMainMenu()}
            class="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          >
            <span>Trở Về Menu Chính</span>
          </button>
        </div>
      </Match>

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 2: PLAYING (Đang trong trận đấu - Ẩn chọn bot để tập trung) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'playing'}>
        <div class="flex flex-col gap-2.5 animate-fade-in select-none">
          <ResignUndoControls undoTitle="Đi lại nước cờ để sửa sai cùng Gia sư" />

          {/* Dòng trạng thái đối thủ hiện tại */}
          <div class="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-medium">
            <span class="flex items-center gap-1.5 text-amber-300">
              <GraduationCap size={13} />
              <span>Đối thủ: Bot {store.currentLevelConfig().vietnameseName}</span>
            </span>
            <span class="font-bold text-amber-400/90 font-mono">
              Cấp {store.currentLevelConfig().id}
            </span>
          </div>
        </div>
      </Match>

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 3: GAME OVER (Kết thúc trận - Hiện Tổng kết & Mới hiện chọn Bot) */}
      {/* ========================================================================= */}
      <Match when={store.matchStage() === 'game_over'}>
        <div class="w-full flex flex-col gap-3 animate-fade-in select-none">
          <Show
            when={store.tutorMatchReview()}
            fallback={
              <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold text-slate-400">Kết quả trận đấu</div>
                  <div class={`text-sm font-extrabold ${isPlayerWinner() ? 'text-emerald-400' : isDraw() ? 'text-slate-300' : 'text-rose-400'}`}>
                    {isPlayerWinner() ? '🎉 Bạn Đã Thắng Đối Thủ!' : isDraw() ? '🤝 Hòa Cờ' : '💥 Đối Thủ Chiến Thắng'}
                  </div>
                </div>
                <Show when={isPlayerWinner()}>
                  <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <Trophy size={18} />
                  </div>
                </Show>
              </div>
            }
          >
            {review => (
              <div class="w-full flex flex-col gap-2.5 rounded-3xl bg-slate-900/95 border border-amber-500/30 p-3.5 sm:p-4 shadow-xl">
                {/* 1. Header Tutor Review */}
                <div class="border-b border-slate-800/80 pb-2">
                  <div class="text-left">
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="text-[11px] font-black text-amber-300">Gia Sư Gomo</span>
                      <span class="text-[9px] text-slate-400 font-medium">• Tổng Kết Ván Đấu</span>
                    </div>
                    <h3 class={`text-base font-black truncate ${titleInfo().color}`}>
                      {titleInfo().text}
                    </h3>
                  </div>
                </div>

                {/* 2. Accuracy & Grade Card */}
                <div class="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-2.5 flex items-center justify-between shadow-inner">
                  <div class="flex flex-col text-left pl-1">
                    <span class="text-[10px] font-semibold text-slate-400">Độ Chính Xác Nước Cờ</span>
                    <span class="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
                      {review().accuracy}%
                    </span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class={`text-[11px] font-black px-2.5 py-1 rounded-full border shadow-sm ${review().gradeBadgeClass}`}>
                      Hạng {review().grade} • {review().gradeTitle}
                    </span>
                  </div>
                </div>

                {/* 3. 4-Stat Tactical Grid */}
                <div class="w-full grid grid-cols-2 gap-1.5 text-xs">
                  <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/70">
                    <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-amber-400">🌟</span> Nước Vàng
                    </span>
                    <span class="font-bold text-amber-300 font-mono text-xs">{review().brilliantMoves}</span>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/70">
                    <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-emerald-400">✨</span> Nước Tốt
                    </span>
                    <span class="font-bold text-emerald-300 font-mono text-xs">{review().goodMoves}</span>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/70">
                    <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-rose-400">⚠️</span> Sơ Hở
                    </span>
                    <span class={`font-bold font-mono text-xs ${review().blunders > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {review().blunders}
                    </span>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/70">
                    <span class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span class="text-sky-400">🎯</span> Sát Cục
                    </span>
                    <span class={`font-bold font-mono text-xs ${review().missedWins > 0 ? 'text-sky-400' : 'text-slate-400'}`}>
                      {review().missedWins}
                    </span>
                  </div>
                </div>

                {/* 4. Lời Khuyên Của Gia Sư Gomo */}
                <div class="w-full text-left p-2.5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950/80 to-slate-900/80 border border-amber-500/25 shadow-inner">
                  <div class="flex items-center gap-1 text-[10px] font-bold text-amber-400 mb-1">
                    <Sparkles size={11} /> Lời Khuyên Của Gia Sư:
                  </div>
                  <p class="text-[11px] text-amber-100/90 leading-relaxed font-medium">
                    {review().summaryAdvice}
                  </p>
                </div>

                {/* 5. Chọn đổi đối thủ đã mở khóa cho ván tiếp theo */}
                <div class="w-full pt-1">
                  <OpponentSelect
                    value={store.selectedOpponentLevel()}
                    onChange={lvl => store.setOpponentLevel(lvl)}
                    maxUnlockedLevel={highestUnlockedLevel()}
                    theme="amber"
                    label="Chọn đối thủ cho ván mới:"
                    icon={<GraduationCap size={13} />}
                    layout="inline"
                    size="sm"
                  />
                </div>

                {/* 6. Nút Thao Tác Sau Trận */}
                <div class="w-full flex flex-col gap-2 pt-1">
                  <Show
                    when={isPlayerWinner()}
                    fallback={
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => store.startTutorMatch(store.selectedOpponentLevel())}
                          class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                        >
                          <RotateCcw size={14} />
                          <span>Bắt Đầu Ván Mới</span>
                        </button>
                        <button
                          onClick={() => store.goToMainMenu()}
                          class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                        >
                          <span>Trở Về Menu</span>
                        </button>
                      </div>
                    }
                  >
                    <button
                      onClick={() => store.nextTutorLevel()}
                      class="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer animate-subtle-glow"
                    >
                      <Play size={15} fill="currentColor" />
                      <span>Tiến Lên Cấp Tiếp Theo ({Math.min(12, store.selectedOpponentLevel() + 1)})</span>
                      <ChevronRight size={15} />
                    </button>

                    <div class="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => store.startTutorMatch(store.selectedOpponentLevel())}
                        class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-amber-300 font-bold text-xs border border-slate-700/60 transition-all cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Đấu Cấp Đã Chọn</span>
                      </button>
                      <button
                        onClick={() => store.goToMainMenu()}
                        class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold text-xs border border-slate-700/60 transition-all cursor-pointer"
                      >
                        <span>Trở Về Menu</span>
                      </button>
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </Show>
        </div>
      </Match>
    </Switch>
  );
};
