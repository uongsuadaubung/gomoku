import { Component, Show } from 'solid-js';
import { MessageSquareQuote } from 'lucide-solid';
import type { GameStore } from '../store/gameStore';
import type { BotMood } from '../services/tauntService';

interface ModalBotTauntProps {
  store: GameStore;
}

export const getMoodEmoji = (mood: BotMood, defaultAvatar: string = '🙄'): string => {
  switch (mood) {
    case 'disdain':
      return '😒';
    case 'smug':
      return '😏';
    case 'laugh':
      return '🤣';
    case 'clown':
      return '🤡';
    case 'detective':
      return '🧐';
    case 'bored':
      return '🥱';
    case 'sleepy':
      return '😴';
    case 'thinking':
      return '🤔';
    case 'evil':
      return '😈';
    case 'lightning':
      return '⚡';
    case 'cool':
      return '😎';
    case 'panic':
      return '😱';
    case 'chill':
      return '☕';
    case 'rage':
      return '🤬';
    case 'party':
      return '🥳';
    case 'angry':
      return '😤';
    case 'shush':
      return '🤫';
    default:
      return defaultAvatar;
  }
};

export const ModalBotTaunt: Component<ModalBotTauntProps> = props => {
  const { store } = props;
  const taunt = () => store.tauntState();
  const config = () => store.currentLevelConfig();

  return (
    <Show when={taunt().visible}>
      <div class="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm border-2 border-amber-300 shadow-xl shadow-amber-950/40 flex items-center gap-3 animate-scale-in">
        <div class="w-10 h-10 rounded-xl bg-slate-950/20 border border-slate-950/30 flex items-center justify-center text-2xl shrink-0">
          {getMoodEmoji(taunt().mood, config().avatar)}
        </div>
        <span class="leading-snug flex-1">{taunt().text}</span>
      </div>
    </Show>
  );
};
