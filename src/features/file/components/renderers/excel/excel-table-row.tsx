import { Row } from 'exceljs';
import { getCellStyles } from '../../../lib/excel-parser.ts';


interface ExcelTableRowProps {
  row: Row;
  rowIndex: number;
  colorScheme: string[];
  mergeMasterCells: any;
  columnCount: number;
}


export const ExcelTableRow = (props: ExcelTableRowProps) => {
  const { row, rowIndex, colorScheme, mergeMasterCells, columnCount } = props;
  const rowCells = [];

  for (let j = 1; j <= columnCount; j++) {
    const cell = row.getCell(j);

    if (cell?.master !== cell) continue;
    const masterMerge = mergeMasterCells.find(el => el.master === cell.address);

    const cellStyles = getCellStyles(cell, colorScheme);
    rowCells.push(
      <td key={cell.address}
          data-id={cell.address}
          style={cellStyles}
          rowSpan={masterMerge?.rowSpan || null}
          colSpan={masterMerge?.colSpan || null}
      >
        {typeof cell?.value === 'object' && cell?.value !== null
          ? (cell?.result?.toString() || 0)
          : (cell?.value?.toString() || '')}
      </td>
    );
  }

  return (
    <tr>
      <th style={{minHeight: `${row.height / 20}in`}}>
        {rowIndex}
      </th>
      {rowCells}
    </tr>
  );
}
