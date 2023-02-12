import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MenuSkeleton, MenuSection, BigButton } from 'shared/ui';
import { ColumnStatistics } from '../plugins/column-statistics';
import { ColumnSettings } from '../plugins/column-settings';
import { ColumnsVisibility } from '../plugins/columns-visibility';
import { ColumnHeaderSetter } from '../plugins/column-header-setter';
import { ColumnSettingsAnalyzer } from '../plugins/column-settings-analyzer';
import { formRefValueSelector } from '../store/datasets.selectors';

import tableSelectAllIcon from 'assets/images/dataset/select-all.png';
import exportToExcelIcon from 'assets/images/dataset/export-to-excel.png';
import reloadIcon from 'assets/images/dataset/reload.png';


export const DataSetEditPanel = ({id}: FormEditPanelProps) => {
  const { t } = useTranslation();
  const formRef: any = useSelector(formRefValueSelector.bind(id));
  if (!formRef) return <MenuSkeleton template={['175px', '165px', '115px']}/>;

  const excelExportTitle = t('pluginNames.exportToExcel');
  const selectTitle = t('pluginNames.selectAllRec');

  return (
    <div className={'menu'}>
      <MenuSection header={'Функции'} className={'map-actions'}>
        <BigButton text={'Обновить'} icon={reloadIcon} action={formRef.reload}/>
        <BigButton text={excelExportTitle} icon={exportToExcelIcon} action={formRef.excelExport}/>
        <ColumnStatistics formRef={formRef} t={t}/>
      </MenuSection>
      <MenuSection header={'Выделение'} className={'map-actions'}>
        <BigButton text={selectTitle} icon={tableSelectAllIcon} action={formRef.selectAll}/>
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
