import { Component, Show } from 'solid-js';
import { Sparkles, Trophy, Swords, Puzzle, Flame } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';

export const LevelBadge: Component = () => {
  const store = useGame();
  const config = () => store.currentLevelConfig();
  const campaignConfig = () => store.campaignLevelConfig();
  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;
  const streak = () => {
    if (store.gameMode() === 'campaign') return store.stats().campaign?.currentStreak ?? store.stats().currentStreak;
    if (store.gameMode() === 'puzzle') return store.stats().puzzle?.currentStreak ?? 0;
    return store.stats().custom?.currentStreak ?? 0;
  };

  // Tiến trình lên cấp tiếp theo trong Chiến Dịch
  const nextCampaignLevel = () => {
    const currentId = campaignConfig().id;
    if (currentId >= AI_LEVELS.length) return null;
    return AI_LEVELS[currentId];
  };

  const campaignProgressData = () => {
    const next = nextCampaignLevel();
    if (!next) return { percent: 100, text: 'Đã mở khóa toàn bộ đối thủ!' };

    const winsNeeded = next.minWins - campaignConfig().minWins;
    const winsAchieved = campaignWins() - campaignConfig().minWins;
    const clampedWins = Math.max(0, Math.min(winsAchieved, winsNeeded));
    const percent = Math.round((clampedWins / winsNeeded) * 100);

    return {
      percent,
      text: `${clampedWins}/${winsNeeded} ván thắng để mở khóa đối thủ tiếp theo`,
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
              <span class={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${config().badgeBg}`}>
                Bot {config().vietnameseName}
              </span>

              {/* Mode indicator badge */}
              <Show when={store.gameMode() === 'campaign'}>
                <span class="inline-flex items-center text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold">
                  <Trophy size={10} class="mr-1" /> Chiến Dịch
                </span>
              </Show>
              <Show when={store.gameMode() === 'custom'}>
                <span class="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                  <Swords size={10} class="mr-1" /> Đấu Tập
                </span>
              </Show>
              <Show when={store.gameMode() === 'puzzle'}>
                <span class="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  <Puzzle size={10} class="mr-1" /> Sát Cục
                </span>
              </Show>
            </div>
            <p class="text-xs text-slate-300 font-medium mt-0.5">
              {config().description}
            </p>
          </div>
        </div>

        {/* Right: Streak if active */}
        <Show when={streak() > 1}>
          <div class="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold self-end sm:self-center">
            <Flame size={14} class="animate-bounce" />
            <span>Chuỗi {streak()}</span>
          </div>
        </Show>
      </div>

      {/* Progress Bar (Chỉ hiện khi ở chế độ Chiến Dịch) */}
      <Show when={store.gameMode() === 'campaign' && nextCampaignLevel()}>
        <div class="mt-3 pt-3 border-t border-slate-800/80">
          <div class="flex justify-between items-center text-[11px] text-slate-400 mb-1.5 font-medium">
            <span class="flex items-center gap-1">
              <Sparkles size={11} class="text-indigo-400" />
              <span>Tiến trình mở khóa cấp độ kế tiếp</span>
            </span>
            <span class="text-slate-300 font-bold">{campaignProgressData().text}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              class={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${campaignConfig().gradient}`}
              style={{ width: `${campaignProgressData().percent}%` }}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};
