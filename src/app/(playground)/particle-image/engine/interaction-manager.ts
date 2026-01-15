export class InteractionManager {
  private canvas: HTMLCanvasElement;
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  private isThrottled: boolean = false;

  private onMouseMoveCallback: (x: number, y: number) => void;
  private onMouseDownCallback: (x: number, y: number) => void;
  private onMouseUpCallback: () => void;
  private onDoubleClickCallback: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    onMouseMove: (x: number, y: number) => void,
    onMouseDown: (x: number, y: number) => void,
    onMouseUp: () => void,
    onDoubleClick: () => void
  ) {
    this.canvas = canvas;
    this.onMouseMoveCallback = onMouseMove;
    this.onMouseDownCallback = onMouseDown;
    this.onMouseUpCallback = onMouseUp;
    this.onDoubleClickCallback = onDoubleClick;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUpCallback);
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
    this.canvas.addEventListener("dblclick", this.handleDoubleClick.bind(this));

    // Touch events (map to mouse equivalents)
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: false, // Allow preventDefault
    });
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.canvas.addEventListener("touchend", this.onMouseUpCallback);
  }

  private handleDoubleClick(): void {
    this.onDoubleClickCallback();
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;

    // Throttle updates to every frame (60fps max)
    if (!this.isThrottled) {
      this.isThrottled = true;
      requestAnimationFrame(() => {
        this.onMouseMoveCallback(this.mousePos.x, this.mousePos.y);
        this.isThrottled = false;
      });
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.onMouseDownCallback(x, y);
  }

  private handleMouseLeave(): void {
    // Reset mouse position when leaving canvas
    this.mousePos = { x: -999999, y: -999999 };
    this.onMouseMoveCallback(this.mousePos.x, this.mousePos.y);
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault(); // Prevent scrolling

    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = touch.clientX - rect.left;
      this.mousePos.y = touch.clientY - rect.top;

      // Same throttling as mouse
      if (!this.isThrottled) {
        this.isThrottled = true;
        requestAnimationFrame(() => {
          this.onMouseMoveCallback(this.mousePos.x, this.mousePos.y);
          this.isThrottled = false;
        });
      }
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.onMouseDownCallback(x, y);
    }
  }

  public destroy(): void {
    // Remove all event listeners
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.onMouseUpCallback);
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
    this.canvas.removeEventListener("dblclick", this.handleDoubleClick);
    this.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.canvas.removeEventListener("touchend", this.onMouseUpCallback);
  }
}
