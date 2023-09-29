import { Worksheet } from "exceljs";


interface ExcelTableHeadRowProps {
  sheet: Worksheet;
}


export const ExcelTableHeadRow = ({sheet}: ExcelTableHeadRowProps) => {
  const headRowCells = [];
  for (let i = 1; i <= sheet.columnCount; i++) {
    const key = `column_${sheet.getColumn(i)['letter']}`;
    const style = {minWidth: `${sheet.getColumn(i).width / 20}in`};
    headRowCells.push(<th key={key} style={style}>{sheet.getColumn(i)['letter']}</th>);
  }

  return (
    <tr>
      <th/>
      {headRowCells}
    </tr>
  );
}
