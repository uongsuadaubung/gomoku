import { type Component, Switch, Match } from 'solid-js';
import { useGame } from '../store/GameContext';
import { PuzzleControls } from './controls/PuzzleControls';
import { BlitzControls } from './controls/BlitzControls';
import { CampaignControls } from './controls/CampaignControls';
import { CustomControls } from './controls/CustomControls';

export const GameControls: Component = () => {
  const store = useGame();

  return (
    <div class="w-full bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col gap-3 transition-all">
      <Switch>
        {/* 1. CHẾ ĐỘ THẾ CỜ GIỮA TRẬN (PUZZLE) */}
        <Match when={store.gameMode() === 'puzzle'}>
          <PuzzleControls />
        </Match>

        {/* 2. CHẾ ĐỘ CỜ CHỚP SINH TỬ (BLITZ) */}
        <Match when={store.gameMode() === 'blitz'}>
          <BlitzControls />
        </Match>

        {/* 3. CHẾ ĐỘ CHIẾN DỊCH LEO CẤP (CAMPAIGN) */}
        <Match when={store.gameMode() === 'campaign'}>
          <CampaignControls />
        </Match>

        {/* 4. CHẾ ĐỘ ĐẤU TÙY CHỌN VỚI BOT (CUSTOM) */}
        <Match when={store.gameMode() === 'custom'}>
          <CustomControls />
        </Match>
      </Switch>
    </div>
  );
};
