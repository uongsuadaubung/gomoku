import { type Component } from 'solid-js';
import type { LevelConfig } from '../game/types';

interface BotPreviewCardProps {
  bot: LevelConfig;
  theme?: 'indigo' | 'amber' | 'emerald';
}

export const BotPreviewCard: Component<BotPreviewCardProps> = (props) => {
  const theme = () => props.theme || 'amber';
  const nameColor = () => (theme() === 'indigo' ? 'text-indigo-300' : 'text-amber-300');
  const tagBadge = () =>
    theme() === 'indigo'
      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
      : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3 text-xs shadow-inner">
      <span class="text-2xl shrink-0 mt-0.5 select-none">
        {props.bot.avatar}
      </span>
      <div class="space-y-1 flex-1 min-w-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class={`font-extrabold ${nameColor()}`}>
            Bot {props.bot.vietnameseName}
          </span>
          <span class={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${tagBadge()}`}>
            {props.bot.tag}
          </span>
        </div>
        <p class="text-[11px] text-slate-300 leading-relaxed font-medium">
          {props.bot.description}
        </p>
      </div>
    </div>
  );
};
