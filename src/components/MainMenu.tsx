import { Component } from 'solid-js';
import {
  Trophy,
  Swords,
  Puzzle,
  Play,
  Sparkles,
  Zap,
  GraduationCap,
  Award,
  BookOpen,
} from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { AI_LEVELS } from '../game/constants';
import { BotPreviewCard } from './BotPreviewCard';
import { ModeCard } from './ModeCard';
import { GUIDE_CHAPTERS, getAllLessons } from '../data/guide/lessons';

export const MainMenu: Component = () => {
  const store = useGame();

  const campaignLevel = () => store.campaignLevelConfig();
  const highestBlitzLevelId = () => store.stats().blitz?.highestLevel || 1;
  const highestBlitzBot = () => AI_LEVELS.find(l => l.id === highestBlitzLevelId()) || AI_LEVELS[0];

  const tutorOpponentLevelId = () => store.stats().tutor?.currentLevel || 1;
  const tutorOpponentBot = () => AI_LEVELS.find(l => l.id === tutorOpponentLevelId()) || AI_LEVELS[0];

  return (
    <div class="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center gap-4 sm:gap-6 animate-fade-in select-none">
      {/* 6 Game Mode Cards Grid - 3 items per row on large screens */}
      <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
        
        {/* 1. CHIẾN DỊCH (CAMPAIGN MODE) */}
        <ModeCard
          title="Chiến Dịch Leo Cấp"
          description="Tích lũy chiến thắng để từng bước diện kiến và giải mã 12 cao thủ kỳ nghệ!"
          badgeText="Chiến Dịch"
          theme="indigo"
          icon={<Trophy size={24} />}
          buttonText="Tiếp Tục Chiến Dịch"
          buttonIcon={<Play size={14} class="fill-white" />}
          onAction={() => store.startCampaignMode()}
        >
          <BotPreviewCard bot={campaignLevel()} theme="indigo" />
        </ModeCard>

        {/* 2. THẾ CỜ / PUZZLE (TACTICAL PUZZLE MODE) */}
        <ModeCard
          title="Giải Đố Thế Cờ"
          description="Đấu trí tìm đòn kết liễu trong những thế cờ hiểm hóc chống lại Thần Cờ!"
          badgeText="100% Map Ngẫu Nhiên"
          badgeIcon={<Sparkles size={11} />}
          theme="emerald"
          icon={<Puzzle size={24} />}
          buttonText="Vào Giải Đố"
          buttonIcon={<Sparkles size={14} />}
          onAction={() => store.startPuzzleMode()}
        >
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Puzzle size={18} />
              </div>
              <div>
                <div class="text-xs font-black text-white">
                  Giải Đố Sát Cục
                </div>
                <div class="text-[11px] text-emerald-400 font-medium">
                  Thử thách nhãn quan chiến thuật
                </div>
              </div>
            </div>
          </div>
        </ModeCard>

        {/* 3. HỌC VIỆN GOMO (TUTOR COACHING MODE) */}
        <ModeCard
          title="Học Viện Gomo"
          description="Được Gia sư Gomo kèm cặp trực tiếp, phân tích thế cờ khi leo tháp Cấp 1 - Cấp 12!"
          badgeText="Gia Sư 1-1"
          badgeIcon={<Award size={11} />}
          theme="amber"
          icon={<GraduationCap size={24} />}
          buttonText="Vào Học Viện Gomo"
          buttonIcon={<GraduationCap size={14} />}
          onAction={() => store.startTutorMode()}
        >
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-amber-400 font-bold flex items-center gap-1">
                <Sparkles size={12} /> Gia Sư:
              </span>
              <span class="text-amber-200 font-extrabold">Gia sư Gomo</span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
              <span class="text-slate-400 font-medium">Đối thủ tiếp theo:</span>
              <span class="text-slate-200 font-bold">
                Cấp {tutorOpponentLevelId()} - {tutorOpponentBot().vietnameseName}
              </span>
            </div>
          </div>
        </ModeCard>

        {/* 4. KỲ VIỆN BÁCH KHOA & GIẢ LẬP THẾ CỜ (GUIDE & SANDBOX MODE) */}
        <ModeCard
          title="Kỳ Viện Bách Khoa"
          description={`Cẩm nang ${GUIDE_CHAPTERS.length} chương ${getAllLessons().length} bài từ mở màn tới sát cục & Phòng giả lập Radar toàn diện!`}
          badgeText="Giáo Trình & Radar"
          badgeIcon={<BookOpen size={11} />}
          theme="cyan"
          icon={<BookOpen size={24} />}
          buttonText="Vào Kỳ Viện Bách Khoa"
          buttonIcon={<BookOpen size={14} />}
          onAction={() => store.startGuideMode('lessons')}
        >
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-cyan-400 font-bold flex items-center gap-1">
                <Sparkles size={12} /> Đã hoàn thành:
              </span>
              <span class="text-cyan-200 font-extrabold">
                {store.completedLessonsSet().size} / {getAllLessons().length} Bài
              </span>
            </div>
            <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
              <span class="text-slate-400 font-medium">Phòng Giả Lập:</span>
              <span class="text-slate-200 font-bold">Heatmap & What-If</span>
            </div>
          </div>
        </ModeCard>

        {/* 5. CỜ CHỚP (FLASH / BLITZ CHALLENGE) */}
        <ModeCard
          title="Cờ Chớp Thử Thách"
          description="Áp lực thời gian mỗi nước. Thắng leo cấp từ Lv 1, thua hoặc hết giờ về Menu!"
          badgeText="Sinh Tử"
          badgeIcon={<Zap size={11} />}
          theme="rose"
          icon={<Zap size={24} />}
          buttonText="Vào Thách Đấu Cờ Chớp"
          buttonIcon={<Zap size={14} class="fill-white" />}
          onAction={() => store.enterBlitzMode()}
        >
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span class="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
              <Zap size={13} /> Kỷ lục cao nhất:
            </span>
            <span class="text-rose-200 font-extrabold text-xs">
              Cấp {highestBlitzLevelId()} - {highestBlitzBot().vietnameseName}
            </span>
          </div>
        </ModeCard>

        {/* 6. ĐẤU TÙY CHỌN VỚI BOT / CUSTOM (CUSTOM MATCH) */}
        <ModeCard
          title="Đấu Tùy Chọn Với Bot"
          description="Đấu tập tự do với các đối thủ bạn đã mở khóa từ Chiến Dịch."
          badgeText="Đấu Tập Tự Do"
          theme="purple"
          icon={<Swords size={24} />}
          buttonText="Vào Đấu Tùy Chọn"
          buttonIcon={<Swords size={14} />}
          onAction={() => store.enterCustomMode()}
        >
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span class="text-purple-400 font-bold flex items-center gap-1.5 text-xs">
              <Swords size={13} /> Số đối thủ đã mở:
            </span>
            <span class="text-purple-200 font-extrabold text-xs">
              {campaignLevel().id} / {AI_LEVELS.length} Bot
            </span>
          </div>
        </ModeCard>

      </div>
    </div>
  );
};
