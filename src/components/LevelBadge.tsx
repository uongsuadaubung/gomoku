import { Component, Show } from 'solid-js';
import { Sparkles, Trophy, Swords, Puzzle, Flame, Zap, Crown } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';

const MODE_BADGES: Record<string, { label: string; Icon: typeof Trophy; colorClass: string }> = {
  campaign: { label: 'Chiến Dịch', Icon: Trophy, colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  blitz: { label: 'Cờ Chớp', Icon: Zap, colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  puzzle: { label: 'Sát Cục', Icon: Puzzle, colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  custom: { label: 'Đấu Tập', Icon: Swords, colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

export const LevelBadge: Component = () => {
  const store = useGame();
  const config = () => store.currentLevelConfig();
  const campaignConfig = () => store.campaignLevelConfig();
  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;

  const streak = () => {
    const s = store.stats();
    switch (store.gameMode()) {
      case 'campaign':
        return s.campaign?.currentStreak ?? s.currentStreak;
      case 'blitz':
        return s.blitz?.currentStreak ?? 0;
      case 'puzzle':
        return s.puzzle?.currentStreak ?? 0;
      case 'custom':
        return s.custom?.currentStreak ?? 0;
      default:
        return 0;
    }
  };

  // Biểu cảm khuôn mặt Bot động theo chuỗi thắng thua
  const dynamicAvatar = () => {
    const s = streak();
    const lastRes = store.lastGameResult();
    if (s >= 5) return '😱';
    if (s >= 3) return '😤';
    if (s >= 2) return '😒';
    if (lastRes === 'loss') return '😏';
    return config().avatar;
  };

  // Danh hiệu phong hiệu chuỗi thắng
  const streakTitle = () => {
    const s = streak();
    if (s >= 10) return { title: 'Kỳ Thánh', icon: Crown, style: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/40 animate-pulse' };
    if (s >= 5) return { title: 'Bất Khả Chiến Bại', icon: Zap, style: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white border-pink-300 shadow-md shadow-pink-500/40 animate-pulse' };
    if (s >= 3) return { title: 'Sát Thủ Bàn Cờ', icon: Flame, style: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-300 shadow-md shadow-orange-500/30' };
    return null;
  };

  const session = () => store.sessionScore();

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
    <div class="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-lg transition-all">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Level Info & Dynamic Avatar */}
        <div class="flex items-center space-x-3.5">
          <div class={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border transition-transform duration-300 ${config().badgeBg} ${streak() >= 3 ? 'scale-105 ring-2 ring-orange-400/50' : ''}`}>
            {dynamicAvatar()}
          </div>
          <div>
            <div class="flex items-center flex-wrap gap-1.5">
              <span class={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${config().badgeBg}`}>
                Bot {config().vietnameseName}
              </span>

              {/* Mode indicator badge */}
              <Show when={MODE_BADGES[store.gameMode()]}>
                {b => {
                  const Icon = b().Icon;
                  return (
                    <span class={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-bold ${b().colorClass}`}>
                      <Icon size={10} class="mr-1" /> {b().label}
                    </span>
                  );
                }}
              </Show>

              {/* Head-to-Head Session Score */}
              <Show when={session().playerWins > 0 || session().botWins > 0}>
                <span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700/80 font-mono font-bold text-slate-300 shadow-inner">
                  <span class="text-emerald-400">{session().playerWins}</span>
                  <span class="text-slate-600">-</span>
                  <span class="text-rose-400">{session().botWins}</span>
                </span>
              </Show>
            </div>
            <p class="text-xs text-slate-300 font-medium mt-0.5">
              {config().description}
            </p>
          </div>
        </div>

        {/* Right: Streak & Special Title Badge */}
        <div class="flex items-center gap-2 self-end sm:self-center flex-wrap">
          <Show when={streakTitle()}>
            {t => {
              const Icon = t().icon;
              return (
                <div class={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-extrabold border shadow-sm ${t().style}`}>
                  <Icon size={13} class="animate-bounce" />
                  <span>{t().title}</span>
                </div>
              );
            }}
          </Show>

          <Show when={streak() > 1}>
            <div class="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
              <Flame size={14} class="animate-bounce" />
              <span>Chuỗi {streak()}</span>
            </div>
          </Show>
        </div>
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
