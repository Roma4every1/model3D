export const CsvView = ({content: tableData}: FileViewModel<FileModelCSV>) => {
  return (
    <div className={'excelRendererContainer'}>
      <div className={'excelRendererTableContainer'}>
        <table>
          <tbody>{tableData?.map(rowToElement)}</tbody>
        </table>
      </div>
    </div>
  );
};

function rowToElement(row: string[], rowIndex: number) {
  const cellToElement = (cell: string, columnIndex: number) => {
    return <td key={`row_${rowIndex}_column_${columnIndex}`}>{cell}</td>;
  };
  return <tr key={`row_${rowIndex}`}>{row.map(cellToElement)}</tr>;
}
