import { type Component, Switch, Match } from 'solid-js';
import { Play, RotateCw, Sparkles } from 'lucide-solid';
import { useGame } from '../../store/GameContext';
import { BLACK } from '../../game/types';
import { SideSelector } from '../SideSelector';
import { ResignUndoControls } from './ResignUndoControls';
import { ResultBanner } from './ResultBanner';

export const CampaignControls: Component = () => {
  const store = useGame();

  const nextSideText = () =>
    store.nextSeriesPlayerSide() ? 'Bạn cầm Đen' : 'Bot cầm Đen';

  return (
    <Switch>
      {/* GIAI ĐOẠN 1: READY (Chưa chọn bên mở màn) */}
      <Match when={store.matchStage() === 'ready'}>
        <div class="flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 shadow-lg animate-fade-in">
          <SideSelector
            onSelectSide={(isBlack) => store.startNewSeries(isBlack)}
            theme="indigo"
            label="Chọn lượt đi trước để bắt đầu:"
            blackSubtext="Bạn cầm quân Đen (●)"
            whiteSubtext="Bot cầm quân Đen (●)"
          />
        </div>
      </Match>

      {/* GIAI ĐOẠN 2: PLAYING (Đang trong trận đấu) */}
      <Match when={store.matchStage() === 'playing'}>
        <div class="flex flex-col gap-3 animate-fade-in">
          <ResignUndoControls undoLabel="Đi Lại" />

          {/* Thông tin ván đấu */}
          <div class="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
            <span class="flex items-center gap-1.5 text-amber-400/90">
              <Sparkles size={13} />
              <span>Ván #{store.seriesGameNumber() || 1}</span>
            </span>
            <span>
              {store.playerColor() === BLACK ? 'Bạn cầm Đen' : 'Bạn cầm Trắng'}
            </span>
          </div>
        </div>
      </Match>

      {/* GIAI ĐOẠN 3: GAME_OVER (Ván đấu kết thúc) */}
      <Match when={store.matchStage() === 'game_over'}>
        <div class="flex flex-col gap-2.5 animate-fade-in">
          {/* Huy hiệu thông báo kết quả inline */}
          <ResultBanner />

          <button
            type="button"
            onClick={() => store.startNextGame()}
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer animate-start-pulse"
          >
            <Play size={16} fill="currentColor" />
            <span>Ván Tiếp Theo</span>
          </button>

          <div class="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-1.5 text-slate-300 text-center sm:text-left">
              <RotateCw size={13} class="text-indigo-400 shrink-0" />
              <span>
                Lượt đi: <strong class="text-indigo-300 font-semibold">{nextSideText()}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => store.resetSeries()}
              class="text-[11px] text-slate-400 hover:text-indigo-300 hover:underline transition-all cursor-pointer"
            >
              Chọn lại lượt đi
            </button>
          </div>
        </div>
      </Match>
    </Switch>
  );
};
