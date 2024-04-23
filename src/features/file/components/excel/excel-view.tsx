import { useEffect, useState } from 'react';
import { ExcelSheetTable } from './excel-sheet-table';
import './excel-view.scss';


export const ExcelView = ({content}: FileViewModel<FileModelExcel>) => {
  const sheets = content.sheets;

  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  useEffect(() => {
    setActiveSheetIndex(0);
  }, [sheets]);

  const activeSheet = sheets[activeSheetIndex]

  return (
    <div className={'excelRendererContainer'}>
      <div className={'excelRendererTableContainer'}>
        <ExcelSheetTable key={activeSheet.key} sheet={activeSheet}/>
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
