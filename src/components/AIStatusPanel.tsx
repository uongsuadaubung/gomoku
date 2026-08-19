import { Component, Show } from 'solid-js';
import { Cpu, Zap, Activity, Clock, ShieldAlert } from 'lucide-solid';
import { useGame } from '../store/GameContext';
import { BLACK, WHITE } from '../game/types';

export const AIStatusPanel: Component = () => {
  const store = useGame();

  const isPlayerTurn = () => store.currentTurn() === store.playerColor() && store.matchStage() === 'playing';
  const isAiTurn = () => store.currentTurn() === store.aiColor() && store.matchStage() === 'playing';
  const playerStoneName = () => (store.playerColor() === BLACK ? 'Quân Đen (●)' : 'Quân Trắng (○)');
  const aiStoneName = () => (store.aiColor() === BLACK ? 'Quân Đen (●)' : 'Quân Trắng (○)');

  // Tỷ lệ phần trăm thắng chính xác của Bot (0 - 100%)
  const botWinRate = () => {
    const status = store.gameStatus();
    const playerWins =
      (status === 'black_win' && store.playerColor() === BLACK) ||
      (status === 'white_win' && store.playerColor() === WHITE);
    const botWins =
      (status === 'black_win' && store.aiColor() === BLACK) ||
      (status === 'white_win' && store.aiColor() === WHITE);

    if (playerWins) return 0;   // Người chơi thắng -> Bot 0%
    if (botWins) return 100;    // Bot thắng -> Bot 100%
    if (status === 'draw') return 50;

    const stats = store.aiStats();
    if (!stats) return 50;

    return Math.min(100, Math.max(0, stats.winProbability));
  };

  // Tỷ lệ phần trăm thắng của Người chơi
  const playerWinRate = () => 100 - botWinRate();

  const formattedNodes = () => {
    const count = store.isAiThinking()
      ? store.aiThinkingProgress().nodes
      : store.aiStats()?.nodesEvaluated || 0;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return `${count}`;
  };

  const currentDepth = () => {
    if (store.isAiThinking()) {
      return store.aiThinkingProgress().depth || store.currentLevelConfig().depth;
    }
    return store.aiStats()?.depth || store.currentLevelConfig().depth;
  };

  const getTurnStatusText = () => {
    const status = store.gameStatus();
    if (status === 'idle') return 'Chưa bắt đầu';
    if (status === 'draw') return 'Hòa cờ';
    const isPlayerWin =
      (status === 'black_win' && store.playerColor() === BLACK) ||
      (status === 'white_win' && store.playerColor() === WHITE);
    return isPlayerWin ? 'Bạn Thắng 🎉' : 'Bot Thắng';
  };

  return (
    <div class="w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3.5">
      {/* Top: Current Turn Indicator */}
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div
            class={`w-4 h-4 rounded-full border border-slate-600 shadow-sm ${
              store.currentTurn() === BLACK ? 'stone-black' : 'stone-white'
            }`}
          />
          <div>
            <span class="text-xs font-semibold text-slate-400 block">Lượt hiện tại</span>
            <span class="text-sm font-bold text-white">
              <Show
                when={isPlayerTurn()}
                fallback={
                  <Show
                    when={isAiTurn()}
                    fallback={getTurnStatusText()}
                  >
                    <span class="text-rose-400 flex items-center gap-1.5">
                      <Cpu size={14} class="animate-spin text-rose-400" /> Bot ({aiStoneName()})
                    </span>
                  </Show>
                }
              >
                <span class="text-emerald-400">Bạn ({playerStoneName()})</span>
              </Show>
            </span>
          </div>
        </div>

        {/* Bot Thinking Status Badge */}
        <div>
          <Show
            when={store.isAiThinking()}
            fallback={
              <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-400 text-xs font-medium border border-slate-700">
                <span class="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Sẵn sàng</span>
              </div>
            }
          >
            <div class="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 text-xs font-bold border border-rose-500/30 animate-pulse">
              <Activity size={13} class="animate-pulse" />
              <span>Bot đang tính...</span>
            </div>
          </Show>
        </div>
      </div>

      {/* Bot Live Radar / Metrics */}
      <div class="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <div class="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50">
          <div class="flex items-center space-x-1 text-slate-400 text-[11px] mb-0.5 font-medium">
            <Zap size={12} class="text-amber-400" />
            <span>Tầm nhìn</span>
          </div>
          <span class="text-sm font-bold text-amber-300 font-mono">
            {currentDepth()} nước
          </span>
        </div>

        <div class="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50">
          <div class="flex items-center space-x-1 text-slate-400 text-[11px] mb-0.5 font-medium">
            <Activity size={12} class="text-sky-400" />
            <span>Thế cờ quét</span>
          </div>
          <span class="text-sm font-bold text-sky-300 font-mono">
            {formattedNodes()}
          </span>
        </div>

        <div class="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50">
          <div class="flex items-center space-x-1 text-slate-400 text-[11px] mb-0.5 font-medium">
            <Clock size={12} class="text-purple-400" />
            <span>Thời gian tính</span>
          </div>
          <span class="text-sm font-bold text-purple-300 font-mono">
            {store.aiStats()?.timeMs || 0}ms
          </span>
        </div>
      </div>

      {/* Sát cục Alert */}
      <Show when={store.aiStats()?.vcfFound}>
        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold animate-bounce">
          <ShieldAlert size={14} class="text-red-400" />
          <span>Bot phát hiện đòn Sát Cục liên hoàn kết liễu!</span>
        </div>
      </Show>

      {/* Win Probability Bar */}
      <div>
        <div class="flex justify-between items-center text-[11px] text-slate-400 mb-1 font-semibold">
          <span class="text-emerald-400">Bạn: {playerWinRate()}%</span>
          <span class="text-slate-500 font-mono text-[10px]">TƯƠNG QUAN THẾ TRẬN</span>
          <span class="text-rose-400">Bot: {botWinRate()}%</span>
        </div>
        <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            class="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${playerWinRate()}%` }}
          />
          <div
            class="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${botWinRate()}%` }}
          />
        </div>
      </div>
    </div>
  );
};
