export {};
// import { polylineType } from '../../map/components/edit-panel/selecting/selecting-utils';
//
//
// export interface CaratRenderData {
//   wellID: string,
//   columns: CaratColumn[],
// }
//
//
// /** Отрисовщик каротажной диаграммы. */
// export class CaratDrawer {
//   private canvas: HTMLCanvasElement;
//   private ctx: CanvasRenderingContext2D;
//   private width: number;
//   private height: number;
//   private ratio: number = window.devicePixelRatio;
//
//   private w: number;
//   private fillTemplate: CanvasPattern;
//   private renderData: CaratRenderData;
//
//   constructor() {
//     polylineType.getPattern('grids-10', '#0d5b5b', '#90d291').then(data => {
//       this.fillTemplate = this.ctx.createPattern(data, 'repeat');
//     });
//   }
//
//   private updateSize(): void {
//     const width = this.canvas.clientWidth * this.ratio;
//     const height = this.canvas.clientHeight * this.ratio;
//
//     if (this.canvas.width !== width) {
//       this.canvas.width = width;
//       this.width = width;
//     }
//     if (this.canvas.height !== height) {
//       this.canvas.height = height;
//       this.height = height;
//     }
//   }
//
//   public setCanvas(canvas: HTMLCanvasElement): void {
//     this.canvas = canvas;
//     this.ctx = canvas.getContext('2d');
//   }
//
//   /* --- Rendering --- */
//
//   public render(renderData: CaratRenderData): void {
//     if (!this.ctx) return;
//     this.renderData = renderData;
//     this.updateSize();
//     this.ctx.clearRect(0, 0, this.width, this.height);
//
//     this.renderHeader();
//     this.renderAxes();
//
//     this.w = 0;
//     renderData.columns.forEach((column) => this.renderColumn(column));
//   }
//
//   private renderHeader(): void {
//     this.ctx.lineWidth = 1;
//     this.ctx.textAlign = 'center';
//     this.ctx.font = 'bold 24px "Segoe UI", Roboto';
//     this.ctx.fillStyle = '#000000';
//     this.ctx.fillText(this.renderData.wellID, this.width / 2, 28);
//
//     this.ctx.strokeStyle = '#363636';
//     this.ctx.strokeRect(5, 5, this.width - 10, 30);
//   }
//
//   private renderAxes(): void {
//     this.ctx.beginPath();
//     this.ctx.lineWidth = 2;
//     this.ctx.strokeStyle = '#303030';
//     this.ctx.moveTo(0, 100);
//     this.ctx.lineTo(this.width, 100);
//     this.ctx.stroke();
//   }
//
//   private renderColumn(column: CaratColumn): void {
//     const columnWidth = column.columnSettings.width * this.ratio;
//     this.w += columnWidth;
//     this.ctx.beginPath();
//     this.ctx.lineWidth = 2;
//     this.ctx.moveTo(this.w, 100);
//     this.ctx.lineTo(this.w, this.height);
//     this.ctx.stroke();
//
//     const zonesCount = column.zones?.length;
//     if (zonesCount) { // typeof zonesCount === 'number' && zonesCount > 0
//       const zoneWidth = Math.floor(columnWidth / zonesCount);
//       this.ctx.beginPath();
//       this.ctx.lineWidth = 1;
//       for (let i = 1; i < zonesCount; i++) {
//         const x = this.w + i * zoneWidth;
//         this.ctx.moveTo(x, 100);
//         this.ctx.lineTo(x, this.height);
//       }
//       this.ctx.stroke();
//     }
//   }
// }
