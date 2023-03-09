import { useDispatch } from 'react-redux';
import { exportTableToExcel } from '../../store/tables.thunks';
import { BigButton } from 'shared/ui';
import exportToExcelIcon from 'assets/images/dataset/export-to-excel.png';


export const ExcelExport = ({id}: {id: FormID}) => {
  const dispatch = useDispatch();
  const action = () => dispatch(exportTableToExcel(id));

  return <BigButton text={'Экспорт в Excel'} icon={exportToExcelIcon} action={action}/>;
};
