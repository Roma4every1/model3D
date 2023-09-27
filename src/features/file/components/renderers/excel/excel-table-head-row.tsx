import Excel from "exceljs";

export const ExcelTableHeadRow = ({sheet}: {sheet: Excel.Worksheet}) => {
  const headRowCells = [];
  for (let i = 1; i <= sheet.columnCount; i++) {
    headRowCells.push(<th key={`column_${sheet.getColumn(i)['letter']}`}
                          style={{minWidth: `${sheet.getColumn(i).width / 20}in`}}
    >
      {sheet.getColumn(i)['letter']}
    </th>);
  }

  return (
    <tr>
      <th></th>
      {headRowCells}
    </tr>
  )
}
