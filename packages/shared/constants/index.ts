export const XP_PER_LEVEL = 1000;

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  return currentLevel * XP_PER_LEVEL - currentXp;
}

export function levelProgress(currentXp: number): number {
  return (currentXp % XP_PER_LEVEL) / XP_PER_LEVEL;
}
