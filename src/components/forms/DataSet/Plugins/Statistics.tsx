import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@progress/kendo-react-buttons";
import { selectors } from "../../../../store";


export default function Statistics({formId}) {
  const { t } = useTranslation();
  const formRef = useSelector((state: WState) => state.formRefs[formId]);
  const sessionManager = useSelector(selectors.sessionManager);

  const getStat = async () => {
    const cell = formRef.current.activeCell();
    if (!cell) return;
    const tableID = formRef.current.tableId();
    const data = await sessionManager.channelsManager.getStatistics(tableID, cell.column);
    const result = data.Values.map(x => x.Key + ': ' + x.Value).map(v => <div>{v}</div>);
    sessionManager.handleWindowInfo(<div>{result}</div>, null, t('pluginNames.statistics'));
  };

  return (
    <Button className={'actionbutton'} onClick={getStat}>
      {t('pluginNames.statistics')}
    </Button>
  );
}
