import { type Component, Switch, Match } from 'solid-js';
import { RotateCcw, Swords } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK } from '../../game/types';
import { AI_LEVELS } from '../../game/constants';
import { BotPreviewCard } from '../BotPreviewCard';
import { OpponentSelect } from '../OpponentSelect';
import { SideSelector } from '../SideSelector';
import { ResignUndoControls } from './ResignUndoControls';
import { ResultBanner } from './ResultBanner';

export const CustomControls: Component = () => {
  const store = useGame();

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
          <SideSelector
            onSelectSide={(isBlack) => store.startCustomMatch(currentBotLevel(), isBlack)}
            theme="purple"
          />

          {/* Nút Trở Về Menu */}
          <button
            type="button"
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
          <ResignUndoControls undoLabel="Đi Lại" />

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
          <ResultBanner />

          {/* Đấu lại cùng cấu hình */}
          <button
            type="button"
            onClick={() => store.startCustomMatch(currentBotLevel(), store.playerColor() === BLACK)}
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Đấu Lại Trận Này</span>
          </button>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => store.enterCustomMode(currentBotLevel())}
              class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-purple-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Swords size={13} />
              <span>Đổi Đối Thủ</span>
            </button>

            <button
              type="button"
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
