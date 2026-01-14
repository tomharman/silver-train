import { Direction } from "../types/game";

/**
 * Input manager for keyboard and touch controls
 * Handles arrow keys and WASD
 */
export class InputManager {
  private keys: Set<string> = new Set();
  private currentDirection: Direction = Direction.None;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default for arrow keys (avoid page scrolling)
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }

    this.keys.add(event.key);
    this.updateCurrentDirection();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.key);
    this.updateCurrentDirection();
  }

  /**
   * Update current direction based on pressed keys
   * Priority: Up > Down > Left > Right (last key has priority)
   */
  private updateCurrentDirection(): void {
    if (this.keys.has("ArrowUp") || this.keys.has("w") || this.keys.has("W")) {
      this.currentDirection = Direction.Up;
    } else if (this.keys.has("ArrowDown") || this.keys.has("s") || this.keys.has("S")) {
      this.currentDirection = Direction.Down;
    } else if (this.keys.has("ArrowLeft") || this.keys.has("a") || this.keys.has("A")) {
      this.currentDirection = Direction.Left;
    } else if (this.keys.has("ArrowRight") || this.keys.has("d") || this.keys.has("D")) {
      this.currentDirection = Direction.Right;
    } else {
      this.currentDirection = Direction.None;
    }
  }

  /**
   * Get current input direction
   */
  public getDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Check if a specific direction key is pressed
   */
  public isDirectionPressed(direction: Direction): boolean {
    switch (direction) {
      case Direction.Up:
        return this.keys.has("ArrowUp") || this.keys.has("w") || this.keys.has("W");
      case Direction.Down:
        return this.keys.has("ArrowDown") || this.keys.has("s") || this.keys.has("S");
      case Direction.Left:
        return this.keys.has("ArrowLeft") || this.keys.has("a") || this.keys.has("A");
      case Direction.Right:
        return this.keys.has("ArrowRight") || this.keys.has("d") || this.keys.has("D");
      default:
        return false;
    }
  }

  /**
   * Clear all inputs
   */
  public clear(): void {
    this.keys.clear();
    this.currentDirection = Direction.None;
  }

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
    this.clear();
  }
}
