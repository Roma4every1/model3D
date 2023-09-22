import React, {useState} from 'react';
import {parseCSV} from "../../../lib/utils.ts";

export const CsvRenderer = ({model}: FileRendererProps) => {
  const [csvTableData, setCsvTableData] = useState(null);

  const fr = new FileReader();
  fr.onload = function() {
    const csvText = fr.result.toString();
    setCsvTableData(parseCSV(csvText));
  };
  fr.readAsText(model.data);

  return (
    <div className={'excelRendererContainer'}>
      <div className={'excelRendererTableContainer'}>
        <table>
          <tbody>
            {csvTableData?.map((r :string[], rowIndex: number) => (
              <tr key={`row_${rowIndex}`}>
                {
                  r.map((c, columnIndex) =>
                  <td key={`row_${rowIndex}_column_${columnIndex}`}>{c}</td>)
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
