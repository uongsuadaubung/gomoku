import { createContext, useContext, ParentComponent } from 'solid-js';
import { createGameStore, GameStore } from './gameStore';

const GameContext = createContext<GameStore>();

export const GameProvider: ParentComponent = props => {
  const store = createGameStore();
  return <GameContext.Provider value={store}>{props.children}</GameContext.Provider>;
};

/**
 * Custom Hook truy cập GameStore từ bất kỳ component con nào mà không cần truyền Props (Eliminates Prop Drilling)
 */
export function useGame(): GameStore {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return store;
}
