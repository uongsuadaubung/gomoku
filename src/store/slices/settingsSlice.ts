import { createSignal } from 'solid-js';
import { BoardStyle, LevelConfig, ThemeType, UserStats } from '../../game/types';
import { StorageService } from '../../services/storageService';
import { soundService } from '../../services/soundService';

export function createSettingsSlice() {
  const [stats, setStats] = createSignal<UserStats>(StorageService.getStats());
  const [theme, setThemeState] = createSignal<ThemeType>(StorageService.getTheme());
  const [boardStyle, setBoardStyleState] = createSignal<BoardStyle>(StorageService.getBoardStyle());
  const [showStepNumbers, setShowStepNumbersState] = createSignal<boolean>(StorageService.getShowStepNumbers());
  const [isMuted, setIsMutedState] = createSignal<boolean>(soundService.getMuted());
  const [enableTaunts, setEnableTauntsState] = createSignal<boolean>(StorageService.getEnableTaunts());

  // Modal Visibility States
  const [showStatsModal, setShowStatsModal] = createSignal<boolean>(false);
  const [showBotModal, setShowBotModal] = createSignal<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = createSignal<boolean>(false);
  const [showLevelUpAlert, setShowLevelUpAlert] = createSignal<LevelConfig | null>(null);

  function setTheme(newTheme: ThemeType) {
    setThemeState(newTheme);
    StorageService.setTheme(newTheme);
    soundService.playClickSound();
  }

  function setBoardStyle(newStyle: BoardStyle) {
    setBoardStyleState(newStyle);
    StorageService.setBoardStyle(newStyle);
    soundService.playClickSound();
  }

  function toggleStepNumbers() {
    const next = !showStepNumbers();
    setShowStepNumbersState(next);
    StorageService.setShowStepNumbers(next);
  }

  function toggleSound(onUnmute?: () => void) {
    const next = !isMuted();
    setIsMutedState(next);
    soundService.setMuted(next);
    if (!next && onUnmute) {
      onUnmute();
    }
  }

  function toggleEnableTaunts() {
    const next = !enableTaunts();
    setEnableTauntsState(next);
    StorageService.setEnableTaunts(next);
    soundService.playClickSound();
  }

  function setManualLevel(levelId: number | null) {
    StorageService.setManualLevel(levelId);
    setStats(prev => ({
      ...prev,
      manualLevel: levelId,
    }));
  }

  function resetAllStats() {
    StorageService.resetStats();
    setStats(StorageService.getStats());
  }

  return {
    // Signals
    stats,
    theme,
    boardStyle,
    showStepNumbers,
    isMuted,
    enableTaunts,
    showStatsModal,
    showBotModal,
    showSettingsModal,
    showLevelUpAlert,

    // Setters
    setStats,
    setShowStatsModal,
    setShowBotModal,
    setShowSettingsModal,
    setShowLevelUpAlert,

    // Actions
    setTheme,
    setBoardStyle,
    toggleStepNumbers,
    toggleSound,
    toggleEnableTaunts,
    setManualLevel,
    resetAllStats,
  };
}
