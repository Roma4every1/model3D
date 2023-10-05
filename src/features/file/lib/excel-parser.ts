import {CSSProperties} from 'react';
import {Workbook, Cell, Worksheet} from 'exceljs';
import {xml2js} from 'xml-js';
import {excelIndexedColors} from './constants.ts'


export async function excelParser(data: Blob): Promise<FileModelExcel> {
  const buffer = await data.arrayBuffer();
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  const themeXML = Object.values(workbook.model.themes)[0];
  const colorScheme = parseThemeColorsXML(themeXML);

  if (!workbook.worksheets.length) return;
  const sheets : ExcelSheetModel[] = workbook.worksheets.map((sheet, sheetIndex) => {
    const rowCount = sheet.rowCount;
    const columnCount = sheet.columnCount;
    const sheetKey = `sheet_${sheetIndex}`;

    const mergeMasterCells = getSheetMergesMasterCells(sheet);

    const sheetRows : ExcelRowModel[] = [];

    for (let i = 1; i <= rowCount; i++) {
      const row= sheet.getRow(i);
      const rowCells: ExcelCellModel[] = [];
      const rowKey= `row_${i}`;

      for (let j = 1; j <= columnCount; j++) {
        const cell = row.getCell(j);

        if (cell?.master !== cell) continue;
        const masterMerge = mergeMasterCells.find(el => el.master === cell.address);

        const cellStyles = getCellStyles(cell, colorScheme);

        const cellValue = typeof cell?.value === 'object' && cell?.value !== null ?
          (cell?.result?.toString() || 0) :
          (cell?.value?.toString() || '');

        const cellObject : ExcelCellModel = {
          address: cell.address,
          style: cellStyles,
          rowSpan: masterMerge?.rowSpan || null,
          colSpan: masterMerge?.colSpan || null,
          value: cellValue
        }

        rowCells.push(cellObject);
      }

      sheetRows.push({
        key: rowKey,
        number: i,
        height: row.height / 20,
        cells: rowCells})
    }

    const sheetColumns : ExcelColumnModel[] = sheet.columns.map((c, i) => ({
      key: `column_${i}`,
      letter: c['letter'],
      width: c.width / 20
    }))

    return {
      key: sheetKey,
      name: sheet.name,
      rows: sheetRows,
      columns: sheetColumns
    };
  });

  return {sheets};
}


/** Получает массив цветов Excel темы из XML объекта темы */
export function parseThemeColorsXML(themeXML: any): string[] {
  const themeElements = xml2js(themeXML).elements[0].elements[0];
  const clrSchemeObjects = themeElements.elements[0].elements.map(el => el.elements[0]);

  return clrSchemeObjects.map(({attributes}): string => {
    return `#${attributes?.lastClr ? attributes?.lastClr : attributes?.val}`
  });
}

/** Получает объект CSS стилей для ячейки таблицы из объекта Excel стилей ячейки */
export function getCellStyles(cell: Cell, clrSchemeColors: string[]): CSSProperties {
  const cellStyle: CSSProperties = {};
  const styles = cell.style;

  if (styles.font) {
    const fontStyles = styles.font;
    if (fontStyles.name) cellStyle.fontFamily = fontStyles.name;
    if (fontStyles.size) cellStyle.fontSize = `${fontStyles.size}px`;
    if (fontStyles.color) cellStyle.color = fontStyles.color?.theme ? clrSchemeColors[fontStyles.color.theme - 1] : fontStyles.color.argb;
    if (fontStyles.bold) cellStyle.fontWeight = fontStyles.bold ? 'bold' : 'normal';
    if (fontStyles.italic) cellStyle.fontStyle = fontStyles.italic ? 'italic' : 'normal';
    if (fontStyles['underline'] && fontStyles['underline'] !== 'none') {
      cellStyle.textDecoration = 'underline';
    }
  }

  if (styles['alignment']) {
    const alignmentStyles = styles['alignment'];
    if (alignmentStyles.horizontal) cellStyle.textAlign = (alignmentStyles.horizontal === 'fill' ||
      alignmentStyles.horizontal === 'centerContinuous' ||
      alignmentStyles.horizontal === 'distributed') ? 'center' : alignmentStyles.horizontal;

    if (alignmentStyles.vertical) cellStyle.verticalAlign = alignmentStyles.vertical;
  }

  if (styles.border) {
    const borderStyles = styles.border;
    if (borderStyles.top) cellStyle.borderTop = `${borderStyles.top.style} ${borderStyles.top.color.argb}`;
    if (borderStyles.left) cellStyle.borderLeft = `${borderStyles.left.style} ${borderStyles.left.color.argb}`;
    if (borderStyles.bottom) cellStyle.borderBottom = `${borderStyles.bottom.style} ${borderStyles.bottom.color.argb}`;
    if (borderStyles.right) cellStyle.borderRight = `${borderStyles.right.style} ${borderStyles.right.color.argb}`;
  }

  if (styles.fill) {
    const fillStyles = styles.fill;
    if (fillStyles['fgColor']?.theme) {
      const themeColorID = fillStyles['fgColor'].theme;
      cellStyle.backgroundColor = clrSchemeColors[themeColorID];
    }
    if (fillStyles['fgColor']?.indexed) {
      const indexedColorID = fillStyles['fgColor'].indexed;
      cellStyle.backgroundColor = excelIndexedColors[indexedColorID].htmlColor;
    }
    if (fillStyles['fgColor']?.argb)
      cellStyle.backgroundColor = `#${fillStyles['fgColor']?.argb?.substring(2)}`;
  }

  return cellStyle;
}

/** Приводит массив объединений ячеек Excel таблицы к удобному для
 * записи в HTML-таблицу формату. */
export function getSheetMergesMasterCells(sheet: Worksheet): any[] {
  const merges = sheet.model['merges'].map(m => m.split(':'));
  return merges.map(m => {
    const mergeMasterCell = sheet.getCell(m[0]);
    const mergeEndCell = sheet.getCell(m[1]);
    const rowSpan = +mergeEndCell.row - +mergeMasterCell.row + 1;
    const colSpan = +mergeEndCell.col - +mergeMasterCell.col + 1;
    return {master: m[0], rowSpan, colSpan};
  });
}
