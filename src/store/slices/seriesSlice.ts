import { createSignal } from 'solid-js';
import { CustomGameConfig } from '../../game/types';

export function createSeriesSlice() {
  const [isSeriesActive, setIsSeriesActive] = createSignal<boolean>(false);
  const [seriesGameNumber, setSeriesGameNumber] = createSignal<number>(0);
  const [lastResigned, setLastResigned] = createSignal<boolean>(false);
  const [customConfig, setCustomConfig] = createSignal<CustomGameConfig | undefined>(undefined);

  const nextSeriesPlayerSide = () => {
    return seriesGameNumber() % 2 === 0;
  };

  return {
    isSeriesActive,
    seriesGameNumber,
    lastResigned,
    customConfig,
    setIsSeriesActive,
    setSeriesGameNumber,
    setLastResigned,
    setCustomConfig,
    nextSeriesPlayerSide,
  };
}
