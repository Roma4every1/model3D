import { BigButton } from 'shared/ui';
import exportToExcelIcon from 'assets/images/dataset/export-to-excel.png';


export const ExcelExport = () => {
  return <BigButton text={'Экспорт в Excel'} icon={exportToExcelIcon} action={() => {}}/>;
};
