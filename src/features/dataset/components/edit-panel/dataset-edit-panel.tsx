import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MenuSkeleton, MenuSection, BigButton } from 'shared/ui';
import { ColumnStatistics } from './column-statistics';
import { ColumnSettings } from './column-settings';
import { ColumnsVisibility } from './columns-visibility';
import { ColumnHeaderSetter } from './column-header-setter';
import { ColumnSettingsAnalyzer } from './column-settings-analyzer';
import { formRefValueSelector } from '../../store/datasets.selectors';

import tableSelectAllIcon from 'assets/images/dataset/select-all.png';
import exportToExcelIcon from 'assets/images/dataset/export-to-excel.png';
import reloadIcon from 'assets/images/dataset/reload.png';


export const DataSetEditPanel = ({id}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const dataSetState: any = useSelector(formRefValueSelector.bind(id));
  if (!dataSetState) return <MenuSkeleton template={['175px', '165px', '115px']}/>;

  const excelExportTitle = t('pluginNames.exportToExcel');
  const selectTitle = t('pluginNames.selectAllRec');

  return (
    <div className={'menu'}>
      <MenuSection header={'Функции'} className={'map-actions'}>
        <BigButton text={'Обновить'} icon={reloadIcon} action={dataSetState.reload}/>
        <BigButton text={excelExportTitle} icon={exportToExcelIcon} action={dataSetState.excelExport}/>
        <ColumnStatistics formRef={dataSetState} t={t}/>
      </MenuSection>
      <MenuSection header={'Выделение'} className={'map-actions'}>
        <BigButton text={selectTitle} icon={tableSelectAllIcon} action={dataSetState.selectAll}/>
        <ColumnsVisibility formID={id}/>
      </MenuSection>
      <MenuSection header={'Колонка'}>
        <ColumnSettings formID={id}/>
        <ColumnHeaderSetter formID={id}/>
        <ColumnSettingsAnalyzer formID={id}/>
      </MenuSection>
    </div>
  );
};
