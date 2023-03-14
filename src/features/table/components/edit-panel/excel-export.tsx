import { TFunction } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { exportTableToExcel } from '../../store/tables.thunks';
import { BigButton } from 'shared/ui';
import exportToExcelIcon from 'assets/images/dataset/export-to-excel.png';


export const ExcelExport = ({id, t}: {id: FormID, t: TFunction}) => {
  const dispatch = useDispatch();
  const action = () => dispatch(exportTableToExcel(id));

  const text = t('table.panel.functions.export');
  return <BigButton text={text} icon={exportToExcelIcon} action={action}/>;
};
