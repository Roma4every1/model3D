interface ExcelTableRowProps {
  row: ExcelRowModel;
}


export const ExcelTableRow = ({row}: ExcelTableRowProps) => {
  return (
    <tr key={row.key}>
      <th style={{minHeight: `${row.height}in`}}>
        {row.number}
      </th>
      {row.cells.map(c => (
        <td key={c.address}
            data-id={c.address}
            style={c.style}
            rowSpan={c.rowSpan ?? 0}
            colSpan={c.colSpan ?? 0}
        >
          {c.value}
        </td>
      ))}
    </tr>
  );
}
