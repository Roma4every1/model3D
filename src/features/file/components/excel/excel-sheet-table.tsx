import { Worksheet } from 'exceljs';
import { ExcelTableRow } from './excel-table-row.tsx';
import { ExcelTableHeadRow } from './excel-table-head-row.tsx';
import { getSheetMergesMasterCells } from '../../lib/excel-parser.ts';


interface ExcelSheetTableProps {
  sheet: Worksheet;
  colorScheme: string[];
}


export const ExcelSheetTable = ({sheet, colorScheme}: ExcelSheetTableProps) => {
  const mergeMasterCells = getSheetMergesMasterCells(sheet);

  const rowCount = sheet.rowCount;
  const columnCount = sheet.columnCount;

  const sheetRows = [];
  for (let i = 1; i <= rowCount; i++) sheetRows.push(
    <ExcelTableRow
      key={`row_${i}`} row={sheet.getRow(i)} rowIndex={i}
      colorScheme={colorScheme}
      mergeMasterCells={mergeMasterCells}
      columnCount={columnCount}
    />
  );

  return (
    <table key={sheet.name}>
      <thead>
        <ExcelTableHeadRow sheet={sheet}/>
      </thead>
      <tbody>
        {sheetRows}
      </tbody>
    </table>
  );
};
