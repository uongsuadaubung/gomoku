import { createSignal } from 'solid-js';
import { UserStats } from '../../game/types';
import { StorageService } from '../../services/storageService';
import { generateTacticalScenario, PuzzleScenario } from '../../game/puzzleGenerator';

interface PuzzleSliceDeps {
  stats: () => UserStats;
}

export function createPuzzleSlice(deps: PuzzleSliceDeps) {
  const [currentPuzzle, setCurrentPuzzle] = createSignal<PuzzleScenario | null>(StorageService.getActivePuzzle());

  function getOrGeneratePuzzle(stars?: number, forceNew: boolean = false): PuzzleScenario {
    let scenario: PuzzleScenario | null = null;

    if (!forceNew) {
      scenario = StorageService.getActivePuzzle();
    }

    if (!scenario) {
      const maxUnlocked = Math.max(1, deps.stats().puzzle?.currentLevel || 1);
      let targetStars = stars;
      if (targetStars === undefined) {
        targetStars = Math.floor(Math.random() * maxUnlocked) + 1;
      }
      scenario = generateTacticalScenario({ stars: targetStars });
      StorageService.saveActivePuzzle(scenario);
    }

    setCurrentPuzzle(scenario);
    return scenario;
  }

  function clearActivePuzzle() {
    StorageService.saveActivePuzzle(null);
    setCurrentPuzzle(null);
  }

  return {
    currentPuzzle,
    setCurrentPuzzle,
    getOrGeneratePuzzle,
    clearActivePuzzle,
  };
}
