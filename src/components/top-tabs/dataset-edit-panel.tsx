import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { MenuSkeleton, MenuSection, BigButton } from "../common/menu-ui";
import { ColumnSettings } from "../forms/dataset/plugins/column-settings";
import { ColumnsVisibility } from "../forms/dataset/plugins/columns-visibility";
import { ColumnHeaderSetter } from "../forms/dataset/plugins/column-header-setter";
import { ColumnSettingsAnalyzer } from "../forms/dataset/plugins/column-settings-analyzer";
import { actions, sessionManager } from "../../store";
import { tableSelectAllIcon, exportToExcelIcon, statisticsIcon, reloadIcon } from "../../dicts/images";


function formRefSelector(this: FormID, state: WState) {
  return state.formRefs[this]?.current;
}

export function DataSetEditPanel({formID}: PropsFormID) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const formRef: any = useSelector(formRefSelector.bind(formID));

  const getStat = () => {
    const cell = formRef.activeCell();
    const tableID = formRef.tableId();
    if (!cell) return;

    sessionManager.channelsManager.getStatistics(tableID, cell.column).then((data) => {
      if (typeof data !== 'object') return;
      const listItems: JSX.Element[] = [];
      for (const key in data.Values) {
        listItems.push(<li key={key}>{key}: {data.Values[key]}</li>);
      }
      const header = t('pluginNames.statistics');
      dispatch(actions.setWindowInfo(<ul>{listItems}</ul>, null, header));
    });
  };

  if (!formRef) return <MenuSkeleton template={['175px', '165px', '115px']}/>;

  const excelExport = () => { formRef.excelExport(); }
  const selectAll = () => { formRef.selectAll(); }

  const excelExportTitle = t('pluginNames.exportToExcel');
  const statTitle = t('pluginNames.statistics');
  const selectTitle = t('pluginNames.selectAllRec');

  return (
    <div className={'menu'}>
      <MenuSection header={'Функции'} className={'map-actions'}>
        <BigButton text={'Обновить'} icon={reloadIcon} action={formRef.reload}/>
        <BigButton text={excelExportTitle} icon={exportToExcelIcon} action={excelExport}/>
        <BigButton text={statTitle} icon={statisticsIcon} action={getStat}/>
      </MenuSection>
      <MenuSection header={'Выделение'} className={'map-actions'}>
        <BigButton text={selectTitle} icon={tableSelectAllIcon} action={selectAll}/>
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
