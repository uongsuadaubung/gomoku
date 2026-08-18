import { Component, Show } from 'solid-js';
import { Sparkles, Lock, Flame } from 'lucide-solid';
import { GameStore } from '../store/gameStore';
import { AI_LEVELS } from '../game/constants';

interface LevelBadgeProps {
  store: GameStore;
}

export const LevelBadge: Component<LevelBadgeProps> = props => {
  const { store } = props;
  const config = () => store.currentLevelConfig();
  const stats = () => store.stats();

  // Tính toán tiến trình lên cấp tiếp theo
  const nextLevel = () => {
    const currentId = config().id;
    if (currentId >= AI_LEVELS.length) return null;
    return AI_LEVELS[currentId];
  };

  const progressData = () => {
    const next = nextLevel();
    if (!next) return { percent: 100, text: 'Đã đạt cấp độ tối đa (Bất Khả Chiến Bại)' };

    const winsNeeded = next.minWins - config().minWins;
    const winsAchieved = stats().wins - config().minWins;
    const clampedWins = Math.max(0, Math.min(winsAchieved, winsNeeded));
    const percent = Math.round((clampedWins / winsNeeded) * 100);

    return {
      percent,
      text: `${clampedWins}/${winsNeeded} ván thắng để lên Level ${next.id}: ${next.vietnameseName}`,
    };
  };

  return (
    <div class="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Level Info */}
        <div class="flex items-center space-x-3.5">
          <div class={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border ${config().badgeBg}`}>
            {config().avatar}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
                Level {config().id}
              </span>
              <span class={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${config().badgeBg}`}>
                {config().vietnameseName}
              </span>
              <Show
                when={stats().manualLevel === null}
                fallback={
                  <span class="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <Lock size={10} class="mr-1" /> Thủ công
                  </span>
                }
              >
                <span class="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <Sparkles size={10} class="mr-1" /> Tự động thăng cấp
                </span>
              </Show>
            </div>
            <p class="text-xs text-slate-300 font-medium mt-0.5">
              {config().description}
            </p>
          </div>
        </div>

        {/* Right: Streak if active */}
        <Show when={stats().currentStreak > 1}>
          <div class="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold self-end sm:self-center">
            <Flame size={14} class="animate-bounce" />
            <span>Chuỗi {stats().currentStreak}</span>
          </div>
        </Show>
      </div>

      {/* Progress Bar (chỉ hiện khi ở chế độ tự động) */}
      <Show when={stats().manualLevel === null && nextLevel()}>
        <div class="mt-3 pt-3 border-t border-slate-800/80">
          <div class="flex justify-between items-center text-[11px] text-slate-400 mb-1.5 font-medium">
            <span>Tiến trình mở khóa sức mạnh Bot</span>
            <span class="text-slate-300 font-bold">{progressData().text}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              class={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${config().gradient}`}
              style={{ width: `${progressData().percent}%` }}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};
