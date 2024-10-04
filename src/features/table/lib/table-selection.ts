import type { MouseEvent } from 'react';


/** Состояние выделения записей таблицы. */
export class TableSelection {
  /** Множество индексов выделенных строк. */
  private rows: Set<number>;
  /** Индекс опорной строки при выделении через Shift. */
  private anchorRow: number | null;
  /** Контроллер выделения записей через курсор. */
  public cursor: CursorSelectionController;

  constructor() {
    this.rows = new Set();
    this.anchorRow = null;
    this.cursor = new CursorSelectionController(this);
  }

  public [Symbol.iterator](): IterableIterator<number> {
    return this.rows[Symbol.iterator]();
  }

  public setAnchorRow(row: number): void {
    this.anchorRow = row;
  }

  public has(row: number): boolean {
    return this.rows.has(row);
  }

  public is(row: number): boolean {
    return this.rows.size === 1 && this.rows.has(row);
  }

  public empty(): boolean {
    return this.rows.size === 0;
  }

  public add(row: number): void {
    this.rows.add(row);
  }

  public delete(row: number): void {
    this.rows.delete(row);
    if (this.anchorRow === row) this.anchorRow = null;
  }

  public reset(rows: number[] | number): void {
    if (Array.isArray(rows)) {
      this.rows = new Set(rows);
      this.anchorRow = null;
    } else {
      this.rows = new Set([rows]);
      this.anchorRow = rows;
    }
  }

  public resetWithRange(start: number, end: number | null): void {
    this.rows = new Set([start]);
    if (start === end || end === null) return;

    if (end < start) {
      for (let i = end; i < start; ++i) this.rows.add(i);
    } else {
      for (let i = start + 1; i <= end; ++i) this.rows.add(i);
    }
  }

  public resetWithAnchor(row: number): void {
    this.resetWithRange(row, this.anchorRow);
  }

  public clear(): void {
    this.rows.clear();
    this.anchorRow = null;
  }
}

export class CursorSelectionController {
  private readonly selection: TableSelection;
  private r1: number | null;
  private r2: number | null;

  public check: boolean;
  public active: boolean;

  constructor(selection: TableSelection) {
    this.selection = selection;
    this.r1 = null; this.r2 = null;
    this.check = false; this.active = false;
  }

  public start(e: MouseEvent): void {
    const rowIndex = this.getRowIndex(e);
    this.r1 = rowIndex;
    this.r2 = rowIndex;

    this.active = true;
    this.selection.reset(rowIndex);
  }

  public stop(): void {
    this.r1 = null; this.r2 = null;
    this.check = false; this.active = false;
  }

  public handleMove(e: MouseEvent): boolean {
    const rowIndex = this.getRowIndex(e);
    if (rowIndex === null || this.r2 === rowIndex) return false;
    this.r2 = rowIndex;
    this.selection.resetWithRange(this.r1, this.r2);
    return true;
  }

  private getRowIndex(e: MouseEvent): number | null {
    const cell = e.target as HTMLTableCellElement;
    if (cell.localName !== 'td') return null;

    const attribute = cell.parentElement.getAttribute('data-index');
    return Number(attribute);
  }
}
