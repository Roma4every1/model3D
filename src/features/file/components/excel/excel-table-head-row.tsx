interface ExcelTableHeadRowProps {
  columns: ExcelColumnModel[];
}


export const ExcelTableHeadRow = ({columns}: ExcelTableHeadRowProps) => {
  if (!columns.length) return <></>
  return (
    <tr>
      <th/>
      {columns.map(c => <th key={c.key} style={{minWidth: `${c.width}in`}}>
        {c.letter}
      </th>)}
    </tr>
  );
}
