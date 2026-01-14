import type { Position } from "../types/game";
import { PACMAN_RADIUS, GHOST_RADIUS } from "../data/game-constants";

/**
 * Collision detection utilities
 */

/**
 * Check if two circular entities are colliding
 */
export function checkCircleCollision(
  pos1: Position,
  radius1: number,
  pos2: Position,
  radius2: number
): boolean {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = radius1 + radius2;

  return distance < minDistance;
}

/**
 * Check if Pacman is colliding with a ghost
 */
export function checkPacmanGhostCollision(pacmanPos: Position, ghostPos: Position): boolean {
  return checkCircleCollision(pacmanPos, PACMAN_RADIUS, ghostPos, GHOST_RADIUS);
}
