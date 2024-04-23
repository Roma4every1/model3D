import { EditPanelItemProps } from '../../lib/types';
import { BigButton } from 'shared/ui';
import { exportTableToExcel } from '../../store/table.thunks';
import exportToExcelIcon from 'assets/images/dataset/export-to-excel.png';


export const ExcelExport = ({id, t}: EditPanelItemProps) => {
  const action = () => exportTableToExcel(id);
  const text = t('table.panel.functions.export');
  return <BigButton text={text} icon={exportToExcelIcon} action={action}/>;
};
