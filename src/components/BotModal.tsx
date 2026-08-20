import { type Component, For, Show } from 'solid-js';
import {
  Bot,
  Swords,
  Trophy,
  CircleCheck,
  Lock,
  Flame,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';
import { BotAvatar } from './BotAvatar';
import { BaseModal } from './BaseModal';

export const BotModal: Component = () => {
  const store = useGame();

  const campaignConfig = () => store.campaignLevelConfig();
  const campaignWins = () => store.stats().campaign?.wins ?? store.stats().wins;

  // Tính toán tiến trình lên cấp tiếp theo trong Chiến Dịch
  const nextCampaignLevel = () => {
    const currentId = campaignConfig().id;
    if (currentId >= AI_LEVELS.length) return null;
    return AI_LEVELS[currentId];
  };

  const campaignProgress = () => {
    const next = nextCampaignLevel();
    if (!next) return { percent: 100, text: 'Đã mở khóa toàn bộ đối thủ!', needed: 0, current: 0 };

    const winsNeeded = next.minWins - campaignConfig().minWins;
    const winsAchieved = campaignWins() - campaignConfig().minWins;
    const clampedWins = Math.max(0, Math.min(winsAchieved, winsNeeded));
    const percent = Math.round((clampedWins / winsNeeded) * 100);

    return {
      percent,
      text: `${clampedWins}/${winsNeeded} ván thắng để mở khóa đối thủ tiếp theo`,
      needed: winsNeeded,
      current: clampedWins,
    };
  };

  const handleStartCustomMatchWithBot = (levelId: number) => {
    store.setShowBotModal(false);
    store.enterCustomMode(levelId);
  };

  return (
    <BaseModal
      isOpen={store.showBotModal()}
      onClose={() => store.setShowBotModal(false)}
      title="Danh Sách Đối Thủ Bot"
      subtitle="Hồ sơ các đối thủ kỳ nghệ và tiến trình Chiến Dịch"
      icon={<Bot size={22} />}
      iconColorClass="bg-sky-500/20 text-sky-400 border-sky-500/30"
      maxWidth="max-w-2xl"
    >
      {/* 🌟 TIẾN TRÌNH CHIẾN DỊCH LEO CẤP */}
      <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-950/70 to-slate-950/70 border border-indigo-500/30">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <Trophy size={16} class="text-amber-400" />
            <span class="text-xs font-bold text-white">Tiến trình Chiến Dịch Leo Cấp</span>
          </div>
          <span class="text-xs font-black text-indigo-300 font-mono">
            {campaignProgress().percent}%
          </span>
        </div>

        <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative mb-2">
          <div
            class={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${campaignConfig().gradient}`}
            style={{ width: `${campaignProgress().percent}%` }}
          />
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-300 font-medium">
          <span>{campaignProgress().text}</span>
          <span class="font-bold text-amber-300 font-mono">Tổng: {campaignWins()} trận thắng</span>
        </div>
      </div>

      {/* Danh sách toàn bộ các cấp độ Bot */}
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Cẩm Nang Đối Thủ Kỳ Nghệ
          </h3>
          <span class="text-[11px] text-slate-500 font-medium">
            Bấm "Đấu Tập" để thử sức ngay
          </span>
        </div>

        <div class="space-y-2.5">
          <For each={AI_LEVELS}>
            {level => {
              const isCampaignCurrent = () => campaignConfig().id === level.id;
              const isCampaignUnlocked = () => campaignWins() >= level.minWins;
              const unlocked = isCampaignUnlocked();
              const isMatchCurrent = () => {
                if (!unlocked || store.matchStage() === 'ready') return false;
                return store.currentLevelConfig().id === level.id;
              };

              return (
                <div
                  class={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isMatchCurrent()
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : unlocked
                      ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-950/30 border-slate-900 opacity-60'
                  }`}
                >
                  {/* Avatar & Title */}
                  <div class="flex items-start space-x-3">
                    <div class="text-2xl mt-0.5 select-none shrink-0">
                      {unlocked ? <BotAvatar name={level.avatar} /> : '🔒'}
                    </div>
                    <div class="space-y-0.5 min-w-0 flex-1">
                      <div class="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span class="text-xs font-black text-white">
                          {unlocked ? `Bot ${level.vietnameseName}` : 'Đối Thủ Bí Ẩn'}
                        </span>
                        
                        <Show when={isMatchCurrent()}>
                          <span class="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                            <Flame size={10} /> Đang Đấu
                          </span>
                        </Show>

                        <Show when={isCampaignCurrent() && !isMatchCurrent()}>
                          <span class="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/40">
                            Cấp độ hiện tại
                          </span>
                        </Show>

                        <Show when={!unlocked}>
                          <span class="text-[10px] text-slate-500 font-bold bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
                            <Lock size={10} /> Cần vượt qua đối thủ trước
                          </span>
                        </Show>
                      </div>

                      <p class="text-[11px] text-slate-400 leading-relaxed">
                        {unlocked
                          ? level.description
                          : 'Đối thủ bí ẩn đang ẩn mình. Hãy chinh phục các bậc Chiến Dịch trước để giải mã danh tính và phong cách đánh của đối thủ này!'}
                      </p>

                      <Show when={unlocked}>
                        <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono flex-wrap">
                          <span class="text-slate-400">{level.tag}</span>
                          <span>•</span>
                          <span>Độ sâu AI: {level.depth} bước</span>
                          <Show when={level.vcfDepth > 0}>
                            <span>•</span>
                            <span class="text-rose-400 font-bold">VCF Sát cục {level.vcfDepth} tầng</span>
                          </Show>
                          <Show when={level.vctDepth > 0}>
                            <span>•</span>
                            <span class="text-purple-400 font-bold">VCT Đòn bẫy {level.vctDepth} tầng</span>
                          </Show>
                        </div>
                      </Show>
                      
                      <Show when={!unlocked}>
                        <div class="mt-1 text-[10px] text-amber-500/80 font-medium">
                          <span>Cần thêm {Math.max(0, level.minWins - campaignWins())} ván thắng trong Chiến Dịch để mở khóa</span>
                        </div>
                      </Show>
                    </div>
                  </div>

                  {/* Action: Thử sức đấu tập ngay (Chỉ cho phép khi đã mở khóa) */}
                  <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Show
                      when={unlocked}
                      fallback={
                        <span class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-900/60 border border-slate-900 flex items-center gap-1 select-none">
                          <Lock size={12} />
                          <span>Bị Khóa</span>
                        </span>
                      }
                    >
                      <button
                        type="button"
                        onClick={() => handleStartCustomMatchWithBot(level.id)}
                        class={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 cursor-pointer ${
                          isMatchCurrent()
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-sm font-black'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                        title={`Bắt đầu trận Đấu Tập với Level ${level.id}`}
                      >
                        <Swords size={13} />
                        <span>{isMatchCurrent() ? 'Đang Đấu' : 'Đấu Tập'}</span>
                      </button>
                    </Show>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </BaseModal>
  );
};
