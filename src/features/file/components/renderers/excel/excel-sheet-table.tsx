import Excel from "exceljs";
import {getSheetMergesMasterCells} from "../../../lib/utils.ts";
import {ExcelTableRow} from "./excel-table-row.tsx";
import {ExcelTableHeadRow} from "./excel-table-head-row.tsx";

interface ExcelSheetTableProps {
  sheet: Excel.Worksheet,
  clrSchemeColors: string[]
}

export const ExcelSheetTable = ({sheet, clrSchemeColors}: ExcelSheetTableProps) => {
  const mergeMasterCells = getSheetMergesMasterCells(sheet);

  const rowCount = sheet.rowCount;
  const columnCount = sheet.columnCount;

  const sheetRows = [];
  for (let i = 1; i <= rowCount; i++) {
    const row = sheet.getRow(i);
    sheetRows.push(<ExcelTableRow key={`row_${i}`}
                                  row={row}
                                  rowIndex={i}
                                  clrSchemeColors={clrSchemeColors}
                                  mergeMasterCells={mergeMasterCells}
                                  columnCount={columnCount} />
    )
  }

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
