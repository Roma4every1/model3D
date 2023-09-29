import { Worksheet } from 'exceljs';
import { useEffect, useState } from 'react';
import { ExcelSheetTable } from './excel-sheet-table.tsx';
import './excel-view.scss';


export const ExcelView = ({content}: FileViewModel<FileModelExcel>) => {
  const colorScheme = content.colorScheme;
  const sheets: Worksheet[] = content.sheets;

  const [tables, setTables] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  useEffect(() => {
    setActiveSheetIndex(0);
  }, [sheets]);

  useEffect(() => {
    const sheetTables = [];
    sheets?.forEach((sheet, sheetIndex) => {
      const key = `sheet_${sheetIndex}`;
      sheetTables.push(<ExcelSheetTable key={key} sheet={sheet} colorScheme={colorScheme}/>);
    });
    setTables(sheetTables);
  }, [sheets, colorScheme]);

  return (
    <div className={'excelRendererContainer'}>
      <div className={'excelRendererTableContainer'}>
        {tables[activeSheetIndex]}
      </div>
      <div className={'excelRendererFooter'}>
        {sheets.length ? sheets.map((el, i) =>
            <button
              className={'changeExcelSheetButton' + (activeSheetIndex === i ? ' active' : '')}
              key={i}
              onClick={() => setActiveSheetIndex(i)}
              disabled={i === activeSheetIndex}
            >
              <span>{sheets ? sheets[i]?.name : <></>}</span>
            </button>
          ) : <></>}
      </div>
    </div>
  );
};
