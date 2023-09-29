import { CSSProperties } from 'react';
import { Workbook, Cell, Worksheet } from 'exceljs';
import { xml2js } from 'xml-js';
import { excelIndexedColors } from './constants.ts'


export async function excelParser(data: Blob): Promise<FileModelExcel> {
  const buffer = await data.arrayBuffer();
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  const themeXML = Object.values(workbook.model.themes)[0];
  return {sheets: workbook.worksheets, colorScheme: parseThemeColorsXML(themeXML)};
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
