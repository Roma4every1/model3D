import { ExcelTableRow } from './excel-table-row.tsx';
import { ExcelTableHeadRow } from './excel-table-head-row.tsx';


interface ExcelSheetTableProps {
  sheet: ExcelSheetModel;
}


export const ExcelSheetTable = ({sheet}: ExcelSheetTableProps) => {
  if (!sheet) return <></>
  return (
    <table key={sheet.name}>
      <thead>
        <ExcelTableHeadRow columns={sheet.columns} />
      </thead>
      <tbody>
        {sheet.rows.map(r => <ExcelTableRow key={r.key} row={r} />)}
      </tbody>
    </table>
  );
};
