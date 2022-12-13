import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectors } from "../../store";
import { dataSetIconsDict } from "../../dicts/images";
import { MenuSection } from "../common/menu-ui";
import { ColumnSettings } from "../forms/dataset/plugins/column-settings";
import { ColumnsVisibility } from "../forms/dataset/plugins/columns-visibility";
import { ColumnHeaderSetter } from "../forms/dataset/plugins/column-header-setter";
import { ColumnSettingsAnalyzer } from "../forms/dataset/plugins/column-settings-analyzer";


interface DataSetActionProps {
  title: string,
  icon: string,
  action: () => void,
}


function formRefSelector(this: FormID, state: WState) {
  return state.formRefs[this]?.current;
}

export function DataSetEditPanel({formID}: PropsFormID) {
  const { t } = useTranslation();
  const formRef: any = useSelector(formRefSelector.bind(formID));
  const sessionManager = useSelector(selectors.sessionManager);

  const getStat = useCallback(() => {
    const cell = formRef.activeCell();
    const tableID = formRef.tableId();
    if (!cell) return;

    sessionManager.channelsManager.getStatistics(tableID, cell.column).then((data) => {
      if (typeof data !== 'object') return;
      const result: JSX.Element[] = data.Values
        .map(item => item.Key + ': ' + item.Value)
        .map((value, index) => <li key={index}>{value}</li>);
      const header = t('pluginNames.statistics');
      sessionManager.handleWindowInfo(<ul>{result}</ul>, null, header);
    });
  }, [formRef, sessionManager, t]);

  if (!formRef) return null;

  const excelExport = () => { formRef.excelExport(); }
  const selectAll = () => { formRef.selectAll(); }

  const excelExportTitle = t('pluginNames.exportToExcel');
  const statTitle = t('pluginNames.statistics');
  const selectTitle = t('pluginNames.selectAllRec');

  return (
    <div className={'menu'}>
      <MenuSection header={'Функции'} className={'map-actions'}>
        <DataSetAction title={excelExportTitle} icon={'export'} action={excelExport}/>
        <DataSetAction title={statTitle} icon={'stat'} action={getStat}/>
      </MenuSection>
      <MenuSection header={'Выделение'} className={'map-actions'}>
        <DataSetAction title={selectTitle} icon={'select-all'} action={selectAll}/>
        <ColumnsVisibility formID={formID}/>
      </MenuSection>
      <MenuSection header={'Колонка'}>
        <ColumnSettings formID={formID}/>
        <ColumnHeaderSetter formID={formID}/>
        <ColumnSettingsAnalyzer formID={formID}/>
      </MenuSection>
    </div>
  );
}

function DataSetAction({title, icon, action}: DataSetActionProps) {
  return (
    <button className={'map-action'} onClick={action}>
      <div><img src={dataSetIconsDict[icon]} alt={icon}/></div>
      <div>{title}</div>
    </button>
  );
}
