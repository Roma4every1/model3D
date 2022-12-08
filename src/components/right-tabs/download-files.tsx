import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { actions, selectors } from "../../store";
import DownloadFileItem from "../forms/dock/plugins/download-file-item";
import reportDeleteIcon from "../../static/images/report_delete.png";


const reportsSelector = (state: WState) => Object.values<any>(state.reports).reverse();
const mapReports = (report: any) => <DownloadFileItem key={report.Id} operationData={report} />;

export default function DownloadFiles({formID}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filterByPresentation, setFilterByPresentation] = useState(true);

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);
  const reports = useSelector(reportsSelector);
  const activeChildID: FormID = useSelector(selectors.activeChildID.bind(formID));

  const deleteReports = async () => {
    const presentationID = filterByPresentation ? activeChildID : null;
    const path = `clearReports?sessionId=${sessionID}&presentationId=${presentationID}`;
    await sessionManager.fetchData(path);
    dispatch(actions.clearReports(presentationID));
  };

  return (
    <div className={'font-10'}>
      <div className={'reportsHeaderString'}>
        <div className={'reportsFilter'}>
          <Checkbox
            id={'downloadFiles'} name={'downloadFiles'}
            label={t('downloadFiles.filter')}
            value={filterByPresentation}
            onChange={(e) => {setFilterByPresentation(Boolean(e.target.value))}}
          />
        </div>
        <div className={'reportsDelete'}>
          <Button className={'k-button k-button-clear'} onClick={deleteReports}>
            <img
              src={reportDeleteIcon} alt={t('downloadFiles.clear')}
              title={t('downloadFiles.clear')}
            />
          </Button>
        </div>
      </div>
      {filterByPresentation
        ? reports.filter(r => r.ID_PR === activeChildID).map(mapReports)
        : reports.map(mapReports)}
    </div>
  );
}
