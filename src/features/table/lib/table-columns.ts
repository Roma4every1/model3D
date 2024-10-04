import type { TableColumnModel, TableColumnDict, TableColumnGroupDict, HeaderSetterRule, TableHeadLayout } from './types';
import { TableColumnTree } from './table-column-tree';
import { calcColumnAutoWidth } from './utils';
import { createHeadLayout } from './tree-utils';


/** Обёртка для колонок таблицы. */
export class TableColumns {
  /** Настройки групп колонок. */
  public readonly groupSettings: TableColumnGroupDict;
  /** Правила установки заголовков колонок. */
  public readonly headerSetters: HeaderSetterRule[];
  /** ID параметров для заголовков колонок. */
  public readonly headerParameterIDs: ParameterID[];

  /** Словарь всех колонкок. */
  public readonly dict: TableColumnDict;
  /** Список всех колонок. */
  public readonly list: TableColumnModel[];
  /** Упорядоченный список листьев дерева. */
  public leafs: TableColumnModel[];
  /** Дерево колонок. */
  public tree: TableColumnTree;

  /** Ширина всех видимых колонок. */
  public totalWidth: number;
  /** Количество зафиксированных колонок. */
  public fixedColumnCount: number;
  /** Макет заголовка таблицы. */
  public headLayout: TableHeadLayout;

  constructor(columns: TableColumnModel[], groups: TableColumnGroupDict, setters: HeaderSetterRule[]) {
    this.groupSettings = groups;
    this.headerSetters = setters;
    this.headerParameterIDs = setters.map(rule => rule.id);

    this.dict = {};
    this.list = columns;
    this.leafs = columns.filter(c => c.visible);
    this.tree = new TableColumnTree(columns, groups);

    this.list.forEach((c: TableColumnModel) => { this.dict[c.id] = c; });
    this.leafs.forEach((c: TableColumnModel, i: number) => { c.displayIndex = i; });
  }

  public createInitLayout(fixedColumnCount: number): void {
    this.totalWidth = 0;
    this.fixedColumnCount = 0;
    const mockRecords: TableRecord[] = [];

    for (const column of this.leafs) {
      if (column.autoWidth) column.width = calcColumnAutoWidth(column, mockRecords);
      this.totalWidth += column.width;
    }
    this.setFixedColumnCount(fixedColumnCount);
    this.headLayout = createHeadLayout(this.leafs, this.groupSettings);
  }

  public setHeaderValues(values: ParameterValueMap['tableRow'][]): void {
    this.headerSetters.forEach((rule: HeaderSetterRule, i: number) => {
      const column = this.dict[rule.property];
      const value = values[i] ? values[i][rule.column]?.value : null;
      column.displayName = value ?? column.staticDisplayName;
    });
  }

  /* --- Column Width --- */

  public setColumnWidth(id: PropertyName, width: number, records?: TableRecord[]): void {
    const column = this.dict[id];
    const oldWidth = column.width;

    if (width === -1) {
      column.width = calcColumnAutoWidth(column, records);
      column.autoWidth = true;
    } else {
      column.width = width;
      column.autoWidth = false;
    }
    if (column.width !== oldWidth) {
      this.totalWidth += column.width - oldWidth;
      this.updateFixedColumnPositions();
    }
  }

  public updateAutoWidth(records: TableRecord[]): void {
    this.totalWidth = 0;
    for (const column of this.list) {
      if (column.visible) {
        if (column.autoWidth) column.width = calcColumnAutoWidth(column, records);
        this.totalWidth += column.width;
      } else if (column.autoWidth) {
        column.width = undefined;
      }
    }
    this.updateFixedColumnPositions();
  }

  /* --- Column Visibility & Order --- */

  public setVisibleColumns(ids: PropertyName[], records: TableRecord[]): void {
    this.leafs = [];
    this.totalWidth = 0;
    let displayIndex = 0;
    let fixedColumnCount = 0;

    for (const column of this.list) {
      if (ids.includes(column.id)) {
        column.visible = true;
        column.displayIndex = displayIndex++;
        if (column.fixed) ++fixedColumnCount;
        if (!column.width) column.width = calcColumnAutoWidth(column, records);
        this.leafs.push(column);
        this.totalWidth += column.width;
      } else {
        column.visible = false;
        column.displayIndex = null;
        if (column.fixed) this.unfixColumn(column);
      }
    }
    this.setFixedColumnCount(fixedColumnCount);
    this.headLayout = createHeadLayout(this.leafs, this.groupSettings);
  }

  public moveColumn(id: PropertyName, to: string): void {
    const target = this.dict[id];
    const targetDisplay = target.displayIndex;

    if (to === 'left') {
      const prev = this.leafs[targetDisplay - 1];
      this.swapColumns(target, prev);

      if (prev.fixed) {
        if (target.fixed) {
          this.setFixedColumnCount(this.fixedColumnCount);
        } else {
          this.setFixedColumnCount(this.fixedColumnCount + 1);
        }
      }
    } else if (to === 'right') {
      const next = this.leafs[targetDisplay + 1];
      this.swapColumns(target, next);

      if (target.fixed) {
        if (next.fixed) {
          this.setFixedColumnCount(this.fixedColumnCount);
        } else {
          this.setFixedColumnCount(this.fixedColumnCount - 1);
        }
      }
    } else if (to === 'start') {
      this.leafs.splice(targetDisplay, 1);
      this.list.splice(target.orderIndex, 1);

      if (this.fixedColumnCount === 0 || targetDisplay <= this.fixedColumnCount) {
        this.list.unshift(target);
        this.leafs.unshift(target);

        if (targetDisplay === this.fixedColumnCount) {
          this.setFixedColumnCount(this.fixedColumnCount + 1);
        } else {
          this.setFixedColumnCount(this.fixedColumnCount);
        }
      } else {
        this.leafs.splice(this.fixedColumnCount, 0, target);
        this.list.splice(this.leafs[this.fixedColumnCount - 1].orderIndex, 0, target);
      }
      this.updateIndexes();
    }
    else if (to === 'end') {
      this.leafs.splice(targetDisplay, 1);
      this.list.splice(target.orderIndex, 1);
      this.list.push(target);
      this.leafs.push(target);

      if (target.fixed) this.setFixedColumnCount(this.fixedColumnCount - 1);
      this.updateIndexes();
    }
    if (this.headLayout.length > 1) {
      this.headLayout = createHeadLayout(this.leafs, this.groupSettings);
    }
  }

  private swapColumns(a: TableColumnModel, b: TableColumnModel): void {
    const { displayIndex: aDisplay, orderIndex: aOrder } = a;
    const { displayIndex: bDisplay, orderIndex: bOrder } = b;

    this.leafs[aDisplay] = b;
    this.leafs[bDisplay] = a;
    a.displayIndex = bDisplay;
    b.displayIndex = aDisplay;

    this.list[aOrder] = b;
    this.list[bOrder] = a;
    a.orderIndex = bOrder;
    b.orderIndex = aOrder;
  }

  /* --- Column Fixation --- */

  public setColumnFixed(id: PropertyName, fixed: boolean): void {
    const column = this.dict[id];
    if (column.fixed === fixed) return;

    if (fixed) {
      if (column.displayIndex !== this.fixedColumnCount) this.moveColumn(id, 'start');
      this.setFixedColumnCount(this.fixedColumnCount + 1);
    } else {
      const lastFixed = this.fixedColumnCount - 1;
      if (column.displayIndex < lastFixed) {
        this.leafs.splice(column.displayIndex, 1);
        this.list.splice(column.orderIndex, 1);
        this.leafs.splice(lastFixed, 0, column);
        this.list.splice(this.leafs[lastFixed - 1].orderIndex, 0, column);
        this.updateIndexes();
      }
      if (this.headLayout.length > 1) {
        this.headLayout = createHeadLayout(this.leafs, this.groupSettings);
      }
      this.setFixedColumnCount(lastFixed);
    }
  }

  public setFixedColumnCount(count: number): void {
    if (this.fixedColumnCount > 0) {
      for (const column of this.leafs) {
        if (column.fixed) this.unfixColumn(column);
      }
    }
    this.fixedColumnCount = count;
    if (count === 0) return;

    let fixedPosition = 0;
    for (let i = 0; i < count; ++i) {
      const column = this.leafs[i];
      column.fixed = true;

      const { cellStyle, headerStyle } = column;
      cellStyle.left = fixedPosition;
      headerStyle.left = fixedPosition;
      headerStyle.zIndex = count - i;
      fixedPosition += column.width;
    }
    const lastFixedColumn = this.leafs[count - 1];
    lastFixedColumn.cellStyle.borderRight = '2px solid rgba(0,0,0,0.4)';
    lastFixedColumn.headerStyle.borderRight = '2px solid rgba(0,0,0,0.4)';
  }

  /* --- Utils --- */

  private updateIndexes(): void {
    this.leafs.forEach((c: TableColumnModel, i: number) => { c.displayIndex = i; });
    this.list.forEach((c: TableColumnModel, i: number) => { c.orderIndex = i; });
  }

  private updateFixedColumnPositions(): void {
    let fixedPosition = 0;
    for (const column of this.leafs) {
      if (!column.fixed) break;
      column.headerStyle.left = fixedPosition;
      column.cellStyle.left = fixedPosition;
      fixedPosition += column.width;
    }
  }

  private unfixColumn(column: TableColumnModel): void {
    column.fixed = false;
    const { cellStyle, headerStyle } = column;

    delete cellStyle.left;
    delete headerStyle.left;
    delete headerStyle.zIndex;

    delete cellStyle.borderRight;
    delete headerStyle.borderRight;
  }
}
