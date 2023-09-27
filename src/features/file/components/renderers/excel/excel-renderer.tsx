import Excel from 'exceljs'
import {useEffect, useState} from "react";
import './../renderers.scss';
import {parseThemeColorsXML} from "../../../lib/utils.ts";
import {ExcelSheetTable} from "./excel-sheet-table.tsx";

export const ExcelRenderer = ({model}: FileRendererProps) => {
  const [worksheets, setWorkSheets] = useState<Excel.Worksheet[]>([]);
  const [sheets, setSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [clrSchemeColors, setClrSchemeColors] = useState([]);

  useEffect(() => {
    model.data.arrayBuffer().then((res) => {
      const workbook = new Excel.Workbook();
      workbook.xlsx.load(res).then(() => {
        setWorkSheets(workbook.worksheets);
        setActiveSheetIndex(0);

        const themeXML = Object.values(workbook.model.themes)[0];
        setClrSchemeColors(parseThemeColorsXML(themeXML));
      });
    });
  }, [model.data, model.fileType]);

  useEffect(() => {
    if (!worksheets) return;
    const sheetTables = [];
    worksheets.forEach((sheet, sheetIndex) => {
      sheetTables.push(
        <ExcelSheetTable key={`sheet_${sheetIndex}`}
                         sheet={sheet}
                         clrSchemeColors={clrSchemeColors}
        />
      );
    })
    setSheets(sheetTables);
  }, [worksheets, clrSchemeColors]);

  return (
    <div className={'excelRendererContainer'}>
      <div className={'excelRendererTableContainer'}>
        {sheets[activeSheetIndex]}
      </div>
      <div className={'excelRendererFooter'}>
        {
          sheets.length ? sheets.map((el, i) =>
            <button
              className={'changeExcelSheetButton' + (activeSheetIndex === i ? ' active' : '')}
              key={i}
              onClick={() => setActiveSheetIndex(i)}
              disabled={i == activeSheetIndex}
            >
              <span>{worksheets ? worksheets[i]?.name : <></>}</span>
            </button>
          ) : <></>
        }
      </div>
    </div>
  )
}
