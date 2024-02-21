export class ImageViewport {
  public x: number;
  public y: number;

  public scalePow: number;
  public scaleMultiplier: number;

  private baseWidth: number;
  private isOnMove: boolean;
  private readonly imageStyle: CSSStyleDeclaration;

  constructor(image: HTMLImageElement, scaleMultiplier: number = 1.25) {
    this.imageStyle = image.style;
    this.y = image.offsetTop;
    this.x = image.offsetLeft;
    this.scalePow = 0;
    this.scaleMultiplier = scaleMultiplier;

    image.onload = () => {
      image.removeAttribute('style');
      this.y = image.offsetTop;
      this.x = image.offsetLeft;
      this.baseWidth = image.getBoundingClientRect().width;
      this.scalePow = 0;

      setTimeout(() => {
        this.imageStyle.position = 'absolute';
        this.imageStyle.maxWidth = 'unset';
        this.imageStyle.maxHeight = 'unset';
        this.imageStyle.top = this.y + 'px';
        this.imageStyle.left = this.x + 'px';
        this.imageStyle.width = this.baseWidth + 'px';
      }, 0);
    };
  }

  /* --- Listener Handlers --- */

  /** Слушатель должен быть подключён к контейнеру. */
  public handleWheel(e: WheelEvent): void {
    let k;
    if (e.deltaY > 0) {
      k = 1 / this.scaleMultiplier;
      this.scalePow--;
    } else {
      k = this.scaleMultiplier;
      this.scalePow++;
    }

    const { x, y } = this;
    const { offsetX, offsetY } = e;
    this.x = offsetX + k * (x - offsetX);
    this.y = offsetY + k * (y - offsetY);

    this.imageStyle.top = this.y + 'px';
    this.imageStyle.left = this.x + 'px';
    this.imageStyle.width = this.baseWidth * Math.pow(this.scaleMultiplier, this.scalePow) + 'px';
  }

  public handleMouseDown(): void {
    this.isOnMove = true;
  }

  public handleMouseUpOrLeave(): void {
    this.isOnMove = false;
  }

  public handleMouseMove(e: MouseEvent): void {
    if (!this.isOnMove) return;
    this.x += e.movementX;
    this.y += e.movementY;
    this.imageStyle.top = this.y + 'px';
    this.imageStyle.left = this.x + 'px';
  }
}
