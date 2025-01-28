import type { Alignment, Borders, Cell, Row, Worksheet } from 'exceljs';
import type { TableColumnModel, TableGlobalSettings, TableHeadLayout, TableHeadLayoutGroup, TableState } from './types';
import { Workbook } from 'exceljs';
import { toServerColorFormat } from 'shared/lib';
import { TableData } from './table-data';
import { TableColumns } from './table-columns';


export class TableExcelCreator {
  private readonly data: TableData;
  private readonly columns: TableColumns;
  private readonly globalSettings: TableGlobalSettings;

  constructor(state: TableState) {
    this.data = state.data;
    this.columns = state.columns;
    this.globalSettings = state.globalSettings;
  }

  public createWorkbook(sheetName: string, rows: ChannelRow[]): Workbook {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    const records = rows.map((row, i) => this.data.createRecord(i, i, row));
    this.fillSheet(sheet, records);
    return workbook;
  }

  private fillSheet(sheet: Worksheet, records: TableRecord[]): void {
    const { headLayout, fixedColumnCount } = this.columns;
    this.columns.leafs.forEach((col, index) => {
      // один символ шрифта Calibri (11 пт) занимает около 7 пикселей на экране
      sheet.getColumn(index + 1).width = col.width / 7;
    });
    sheet.views = [{state: 'frozen', ySplit: headLayout.length,
      xSplit: fixedColumnCount > 0 ? fixedColumnCount : undefined,
      showGridLines: true
    }];
    this.addHeaders(sheet, headLayout);
    this.addRows(sheet, records);
  }

  private addHeaders(sheet: Worksheet, headLayout: TableHeadLayout): void {
    for (let rowIndex = 0; rowIndex < headLayout.length; ++rowIndex) {
      const headerRowData = headLayout[rowIndex];
      let currentColIndex = 0;

      for (let colIndex = 0; colIndex < headerRowData.length; ++colIndex) {
        const col = headerRowData[colIndex];
        const colGroup = col as TableHeadLayoutGroup;
        const colModel = col as TableColumnModel;
        const cell = sheet.getCell(rowIndex + 1, currentColIndex + 1);

        if (colGroup.colSpan && colGroup.colSpan > 1) {
          sheet.mergeCells(rowIndex + 1, currentColIndex + 1, rowIndex + 1,
            currentColIndex + colGroup.colSpan);
        }

        this.updateCellBorder(cell, {
          bottom: {style: 'thin', color: {argb: 'ffdddddd'}},
          right: {style: 'thin', color: {argb: 'ffdddddd'}}
        });

        if (col.displayName) {
          cell.value = col.displayName;
          this.updateCellAlignment(cell, {vertical: 'middle', horizontal: 'center', wrapText: true});
        }

        const bgColor = colGroup.style?.backgroundColor || colModel.headerStyle?.backgroundColor;
        const fillColor = bgColor ? this.setArgbColor(bgColor) : 'fff0f0f0';
        this.setCellFill(cell, fillColor);

        const borderStyle = colGroup.style?.borderRight || colModel.headerStyle?.borderRight;
        if (borderStyle) {
          const borderParts = borderStyle.toString().split(' ');
          this.updateCellBorder(cell, {right:
            {style: 'medium', color: {argb: rgbaToArgb(borderParts[2])}}}
          );
        }

        if (colGroup.style?.color || colModel.headerStyle?.color) {
          this.updateCellFont(cell,
            this.setArgbColor(colGroup.style?.color || colModel.headerStyle?.color));
        }
        currentColIndex += colGroup.colSpan || 1;
      }
    }
  }

  private addRows(sheet: Worksheet, records: TableRecord[]): void {
    records.forEach((row, rowIndex) => {
      const rowData = this.columns.leafs.map(column => row.cells[column.columnName]);
      const excelRow = sheet.addRow(rowData);

      const fillColor = (rowIndex % 2 === 0)
        ? ''
        : this.setArgbColor(this.globalSettings.alternateBackground) || 'fff0f0f0';

      if (this.globalSettings.alternate) {
        for (let cellIndex = 1; cellIndex <= this.columns.leafs.length; cellIndex++) {
          const cell = excelRow.getCell(cellIndex);
          this.setCellFill(cell, fillColor);
        }
      }
      this.setCell(row, excelRow);
    });
  }

  private setCell(record: TableRecord, row: Row): void {
    this.columns.leafs.forEach((column, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      const originalCell = record.cells[column.columnIndex];

      if (this.globalSettings.textWrap) {
        this.updateCellAlignment(cell, {wrapText: this.globalSettings.textWrap});
      }
      if (column.textWrap !== undefined) {
        this.updateCellAlignment(cell, {wrapText: column.textWrap});
      }
      if (column.cellStyle.color) {
        this.updateCellFont(cell, this.setArgbColor(column.cellStyle.color));
      }
      if (column.cellStyle.backgroundColor) {
        this.setCellFill(cell, this.setArgbColor(column.cellStyle.backgroundColor));
      }
      if (record.style?.backgroundColor) {
        this.setCellFill(cell, this.setArgbColor(record.style.backgroundColor));
      }
      this.setCellValue(cell, column.type, originalCell, column);
      this.updateCellAlignment(cell, {vertical: 'middle', horizontal: 'left'});

      this.updateCellBorder(cell, {
        bottom: {style: 'thin', color: {argb: 'ffdddddd'}},
        right: {style: 'thin', color: {argb: 'ffdddddd'}}
      });
      if (column.cellStyle.borderRight) {
        const borderStyle = column.cellStyle.borderRight;
        const borderParts = borderStyle.toString().split(' ');
        const color = {argb: rgbaToArgb(borderParts[2])};
        this.updateCellBorder(cell, {right: {style: 'medium', color}});
      }
    });
  }

  private setCellValue(cell: Cell, columnType: string, originalCell: any, column: TableColumnModel): void {
    switch (columnType) {
      case 'bool':
        cell.value = originalCell ? 1 : 0;
        break;
      case 'int':
      case 'real':
        if (originalCell !== null) {
          cell.value = originalCell;
          this.setCellFormat(column, cell);
        }
        break;
      case 'date':
        if (originalCell !== null) {
          cell.value = new Date(originalCell).toLocaleDateString();
          cell.numFmt = 'dd/mm/yyyy';
        }
        break;
      case 'color':
        cell.value = originalCell !== null ? originalCell : null;
        this.setCellFill(cell, this.setArgbColor(originalCell));
        break;
      case 'list':
      case 'tree':
        cell.value = column.lookupDict[originalCell];
        break;
      default:
        cell.value = originalCell;
        break;
    }
  }

  private setCellFormat(column: TableColumnModel, cell: Cell): void {
    if (column.formatter !== undefined) {
      const formattedValue = column.formatter(cell.value);
      if (formattedValue.endsWith('%')) {
        const valueString = formattedValue.slice(0, -1);
        const digits = (valueString.split(',')[1] || '').length;
        cell.numFmt = digits > 0 ? `0.${'0'.repeat(digits)}%` : '0%';
      } else {
        const digits = (formattedValue.split(',')[1] || '').length;
        cell.numFmt = digits > 0 ? `0.${'0'.repeat(digits)}` : '0';
      }
    }
  }

  /* --- Styles --- */

  private setArgbColor(color: string): string {
    if(color === undefined) return;
    if (color.length === 7) {
      return toServerColorFormat(color).replace('#', 'ff');
    } else {
      return toServerColorFormat(color).slice(1);
    }
  }

  private updateCellBorder (cell: Cell, update: Partial<Borders>): void {
    const currentBorders = cell.border || {};
    cell.border = {...currentBorders, ...update};
  }

  private updateCellAlignment (cell: Cell, update: Partial<Alignment>): void {
    const currentAlignment = cell.alignment || {};
    cell.alignment = {...currentAlignment, ...update};
  }

  private setCellFill (cell: Cell, color: string): void {
    cell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: color}};
  }

  private updateCellFont (cell: Cell, color: string): void {
    cell.font = {...cell.font || {}, color: {argb: color}};
  }
}

function rgbaToArgb(rgba: string): string {
  const match = rgba.match(/(\d+(\.\d+)?)/g);
  const r = Number.parseInt(match[0]);
  const g = Number.parseInt(match[1]);
  const b = Number.parseInt(match[2]);
  const a = Number.parseFloat(match[3]);

  // наложение на белый фон
  const finalR = Math.round((r * a) + (255 * (1 - a)));
  const finalG = Math.round((g * a) + (255 * (1 - a)));
  const finalB = Math.round((b * a) + (255 * (1 - a)));

  // преобразование результата в шестнадцатеричный формат
  const hexR = finalR.toString(16).padStart(2, '0');
  const hexG = finalG.toString(16).padStart(2, '0');
  const hexB = finalB.toString(16).padStart(2, '0');
  return `ff${hexR}${hexG}${hexB}`;
}
