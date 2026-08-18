import { type Component, For, Show } from 'solid-js';
import {
  X,
  Bot,
  Sparkles,
  CheckCircle2,
  Play,
  Trophy,
} from 'lucide-solid';
import type { GameStore } from '../store/gameStore';
import { AI_LEVELS } from '../game/constants';
import { BLACK } from '../game/types';
import { ModalBotTaunt } from './ModalBotTaunt';

interface BotModalProps {
  store: GameStore;
}

export const BotModal: Component<BotModalProps> = props => {
  const { store } = props;

  const stats = () => store.stats();
  const config = () => store.currentLevelConfig();

  // Tính toán tiến trình lên cấp tiếp theo
  const nextLevel = () => {
    const currentId = config().id;
    if (currentId >= AI_LEVELS.length) return null;
    return AI_LEVELS[currentId];
  };

  const progressData = () => {
    const next = nextLevel();
    if (!next) return { percent: 100, text: 'Đã đạt cấp độ tối đa', needed: 0, current: 0 };

    const winsNeeded = next.minWins - config().minWins;
    const winsAchieved = stats().wins - config().minWins;
    const clampedWins = Math.max(0, Math.min(winsAchieved, winsNeeded));
    const percent = Math.round((clampedWins / winsNeeded) * 100);

    return {
      percent,
      text: `${clampedWins}/${winsNeeded} ván thắng để lên Level ${next.id}: ${next.vietnameseName}`,
      needed: winsNeeded,
      current: clampedWins,
    };
  };

  const handleSelectManualLevel = (levelId: number) => {
    store.setManualLevel(levelId);
    store.startNewGame(store.playerColor() === BLACK);
    store.setShowBotModal(false);
  };

  const handleResetToAuto = () => {
    store.setManualLevel(null);
    store.setShowBotModal(false);
  };

  return (
    <Show when={store.showBotModal()}>
      <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div class="p-5 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Bot size={22} />
              </div>
              <div>
                <h2 class="text-lg font-black text-white">Cấp Độ Đối Thủ Bot</h2>
                <p class="text-xs text-slate-400">Các cấp độ kỳ nghệ của đối thủ bạn đã mở khóa</p>
              </div>
            </div>

            <button
              onClick={() => store.setShowBotModal(false)}
              class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div class="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Lời thoại của Bot */}
            <ModalBotTaunt store={store} />
            
            {/* Mode Switch: Auto vs Manual */}
            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span class="text-xs font-bold text-white block">Cơ chế thăng cấp Bot</span>
                <span class="text-[11px] text-slate-400">
                  {stats().manualLevel === null
                    ? 'Bot đang tự động tăng cấp độ theo số ván bạn thắng'
                    : `Đang khóa cố định ở Level ${stats().manualLevel}`}
                </span>
              </div>

              <Show when={stats().manualLevel !== null}>
                <button
                  onClick={handleResetToAuto}
                  class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Bật Tự Động Thăng Cấp</span>
                </button>
              </Show>
            </div>

            {/* 🌟 TIẾN TRÌNH MỞ KHÓA SỨC MẠNH BOT */}
            <Show when={stats().manualLevel === null && nextLevel()}>
              <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950/60 to-slate-950/60 border border-amber-500/30">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <Trophy size={16} class="text-amber-400" />
                    <span class="text-xs font-bold text-white">Tiến trình mở khóa sức mạnh Bot</span>
                  </div>
                  <span class="text-xs font-black text-amber-300 font-mono">
                    {progressData().percent}%
                  </span>
                </div>

                <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative mb-2">
                  <div
                    class={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${config().gradient}`}
                    style={{ width: `${progressData().percent}%` }}
                  />
                </div>

                <p class="text-[11px] text-slate-300 font-medium">
                  {progressData().text}
                </p>
              </div>
            </Show>

            {/* Unlocked Levels List */}
            <div>
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Danh Sách Cấp Độ Đã Mở Khóa ({AI_LEVELS.filter(level => stats().wins >= level.minWins).length} / {AI_LEVELS.length})
              </h3>

              <div class="space-y-2.5">
                <For each={AI_LEVELS.filter(level => stats().wins >= level.minWins)}>
                  {level => {
                    const isCurrent = () => store.currentLevelConfig().id === level.id;
                    const isManual = () => stats().manualLevel === level.id;

                    return (
                      <div
                        class={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent()
                            ? 'bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Avatar & Title */}
                        <div class="flex items-center space-x-3">
                          <div class="text-2xl">{level.avatar}</div>
                          <div>
                            <div class="flex items-center space-x-2">
                              <span class="text-xs font-black text-white">
                                Level {level.id}: {level.vietnameseName}
                              </span>
                              <Show when={isCurrent()}>
                                <span class="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/40">
                                  {isManual() ? 'Đang chọn' : 'Hiện tại'}
                                </span>
                              </Show>
                              <Show when={!isCurrent()}>
                                <CheckCircle2 size={14} class="text-emerald-400" />
                              </Show>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-0.5">
                              {level.description}
                            </p>
                            <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                              <span>Yêu cầu: {level.minWins === 0 ? 'Cấp khởi đầu' : `${level.minWins}+ ván thắng`}</span>
                              <span>•</span>
                              <span>Độ khó: {level.id}/{AI_LEVELS.length}</span>
                              <Show when={level.vcfDepth > 0}>
                                <span>•</span>
                                <span class="text-rose-400 font-bold">Sát cục liên hoàn</span>
                              </Show>
                            </div>
                          </div>
                        </div>

                        {/* Action: Select/Practice this unlocked level (Chỉ hiện nút Đấu lại ở các level đã vượt qua) */}
                        <Show when={!isCurrent()}>
                          <div>
                            <button
                              onClick={() => handleSelectManualLevel(level.id)}
                              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95"
                              title={`Chọn đấu lại Level ${level.id}`}
                            >
                              <Play size={12} fill="currentColor" />
                              <span>Đấu lại</span>
                            </button>
                          </div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
