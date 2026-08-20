import { type Component } from 'solid-js';
import type { LevelConfig } from '../game/types';
import { BotAvatar } from './BotAvatar';

interface BotPreviewCardProps {
  bot: LevelConfig;
  theme?: 'indigo' | 'amber' | 'emerald' | 'purple' | 'cyan';
}

export const BotPreviewCard: Component<BotPreviewCardProps> = (props) => {
  const theme = () => props.theme || 'amber';
  const nameColor = () => {
    if (theme() === 'indigo') return 'text-indigo-300';
    if (theme() === 'purple') return 'text-purple-300';
    if (theme() === 'emerald') return 'text-emerald-300';
    if (theme() === 'cyan') return 'text-cyan-300';
    return 'text-amber-300';
  };
  const tagBadge = () => {
    if (theme() === 'indigo') return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    if (theme() === 'purple') return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    if (theme() === 'emerald') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    if (theme() === 'cyan') return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3 text-xs shadow-inner">
      <BotAvatar name={props.bot.avatar} class="text-2xl shrink-0 mt-0.5 select-none" />
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
