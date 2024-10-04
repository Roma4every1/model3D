import { TableData } from './table-data';
import { TableColumns } from './table-columns';
import { scrollWidth, rowHeight } from './constants';


/** Состояние области просмотра для виртуального скролла. */
export interface TableVirtualViewport {
  /** Общая высота контейнера таблицы. */
  height: number;
  /** Смещение элемента таблицы. */
  offset: number;
  /** Индекс первой записи, которая монтируется в DOM. */
  start: number;
  /** Индекс последней записи, которая монтируется в DOM. */
  end: number;
}

/** Контроллер вьюпорта таблицы. */
export class TableViewportController {
  /** Контейнер шапки таблицы. */
  public headContainer: HTMLDivElement;
  /** Контейнер тела таблицы. */
  public bodyContainer: HTMLDivElement;
  /** Контейнер элемента для управления горизонтальным скроллом. */
  public scrollerContainer: HTMLDivElement;

  /** Состояние области просмотра для виртуального скролла. */
  public virtual: TableVirtualViewport;
  /** Ссылка на модель данных. */
  private readonly data: TableData;
  /** Ссылка на модель колонок. */
  private readonly columns: TableColumns;

  constructor(data: TableData, columns: TableColumns) {
    this.virtual = null;
    this.data = data;
    this.columns = columns;
  }

  /** Обработка изменения датасета. */
  public handleDataChange(): void {
    const total = this.data.records.length;
    if (total > 200) {
      this.virtual = {offset: 0, height: total * rowHeight, start: 0, end: 100};
      if (this.bodyContainer) this.handleVerticalScroll();
    } else {
      this.virtual = null;
    }
  }

  /** Установка фокуса на контейнер формы. */
  public focusRoot(): void {
    const cb = () => this.bodyContainer?.parentElement.parentElement.focus();
    setTimeout(cb, 50);
  }

  /** Возвращает номер строки, который нужно выставить при нажатии на `PageUp` или `PageDown`. */
  public getPageRow(prev: boolean): number | null {
    const containerHeight = this.bodyContainer.clientHeight;
    const pageSize = Math.ceil(containerHeight / rowHeight);
    const currentRow = this.data.activeCell.row;

    if (currentRow === null) {
      if (this.bodyContainer.scrollTop !== 0) return null;
      return prev ? 0 : pageSize;
    }
    const currentPage = Math.floor(currentRow / pageSize);
    let row = (currentPage + (prev ? -1 : 1)) * pageSize;

    const maxRow = this.data.records.length - 1;
    if (row < 0) row = 0;
    if (row > maxRow) row = maxRow;
    return row === currentRow ? null : row;
  }

  /** Обработка события горизонтального скролла. */
  public handleHorizontalScroll(): void {
    const left = this.scrollerContainer.scrollLeft;
    this.headContainer.scrollLeft = left;
    this.bodyContainer.scrollLeft = left;
  }

  /** Обработка события вертикального скролла. */
  public handleVerticalScroll(onPageChange?: () => void, onLimitChange?: () => void): void {
    if (!this.bodyContainer) return;
    const scrollTop = this.bodyContainer.scrollTop;
    const containerHeight = this.bodyContainer.clientHeight;

    const firstRow = Math.floor(scrollTop / rowHeight);
    const visibleRowCount = Math.ceil(containerHeight / rowHeight);
    const lastRow = firstRow + visibleRowCount;

    const dataPart = this.data.dataPart;
    const total = this.data.records.length;
    if (total - lastRow < 20 && dataPart && onLimitChange) onLimitChange();

    const v = this.virtual;
    if (!v || firstRow - v.start > 10 && v.end - lastRow > 10) return;

    let start = firstRow - 20;
    if (start < 0) start = 0;
    if (start % 2 === 1) ++start; // for alternate
    let end = start + visibleRowCount + 40;
    if (end > total) end = total;

    if (start === v.start && end === v.end) return;
    v.start = start;
    v.end = end;
    v.offset = start * rowHeight;
    if (onPageChange) onPageChange();
  }

  /** Перемещает вьюпорт таблицы чтобы указанная ячейка была полностью видна. */
  public scrollCellIntoView(row: number, col: PropertyName): void {
    const column = this.columns.dict[col];
    if (!column.visible || !this.bodyContainer) return;

    let cellRect: DOMRect;
    let { x: cx, y: cy, width, height } = this.bodyContainer.getBoundingClientRect();

    if (this.virtual) {
      const tr = this.bodyContainer.firstElementChild.lastElementChild.firstElementChild;
      cellRect = tr.children[column.displayIndex].getBoundingClientRect();
      cellRect.y += (row - this.virtual.start) * rowHeight;
    } else {
      const tr = this.bodyContainer.firstElementChild.lastElementChild.children[row];
      cellRect = tr.children[column.displayIndex].getBoundingClientRect();
    }

    const fixedCount = this.columns.fixedColumnCount;
    if (fixedCount && !this.columns.dict[col].fixed) {
      const lastFixed = this.columns.leafs[fixedCount - 1];
      const delta = (lastFixed.cellStyle.left as number) + lastFixed.width;
      cx += delta; width -= delta;
    }

    let top = 0, left = 0;
    const topDelta = cy - cellRect.y;
    const leftDelta = cx - cellRect.x;

    if (topDelta > 0) {
      top = -topDelta;
    } else {
      const bottomDelta = (cellRect.y + cellRect.height) - (cy + height);
      if (bottomDelta > 0) top = bottomDelta;
    }
    if (leftDelta > 0) {
      left = -leftDelta;
    } else {
      const rightDelta = (cellRect.x + cellRect.width) - (cx + width);
      if (rightDelta > -scrollWidth) left = rightDelta + scrollWidth;
    }

    if (top === 0 && left === 0) return;
    const behavior: ScrollBehavior = 'smooth';
    if (left) this.scrollerContainer.scrollBy({left, behavior});
    if (top) this.bodyContainer.scrollBy({top, behavior});
  }
}
