import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { MenuSkeleton, MenuSection, BigButton } from "../common/menu-ui";
import { ColumnStatistics } from "../forms/dataset/plugins/column-statistics";
import { ColumnSettings } from "../forms/dataset/plugins/column-settings";
import { ColumnsVisibility } from "../forms/dataset/plugins/columns-visibility";
import { ColumnHeaderSetter } from "../forms/dataset/plugins/column-header-setter";
import { ColumnSettingsAnalyzer } from "../forms/dataset/plugins/column-settings-analyzer";
import { tableSelectAllIcon, exportToExcelIcon, reloadIcon } from "../../dicts/images";


function formRefSelector(this: FormID, state: WState) {
  return state.formRefs[this]?.current;
}

export const DataSetEditPanel = ({formID}: PropsFormID) => {
  const { t } = useTranslation();
  const formRef: any = useSelector(formRefSelector.bind(formID));
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
        <ColumnsVisibility formID={formID}/>
      </MenuSection>
      <MenuSection header={'Колонка'}>
        <ColumnSettings formID={formID}/>
        <ColumnHeaderSetter formID={formID}/>
        <ColumnSettingsAnalyzer formID={formID}/>
      </MenuSection>
    </div>
  );
};
