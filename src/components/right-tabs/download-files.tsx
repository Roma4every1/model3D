import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { actions, selectors } from "../../store";
import { API } from "../../api/api";
import DownloadFileItem from "../forms/dock/download-file-item";
import reportDeleteIcon from "../../static/images/report_delete.png";


const reportsSelector = (state: WState) => Object.values<Report>(state.reports).reverse();
const mapReports = (report: Report, i: number) => <DownloadFileItem key={i} report={report}/>;

export function DownloadFiles() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filterByPresentation, setFilterByPresentation] = useState(true);

  const rootFormID = useSelector(selectors.rootFormID);
  const reports = useSelector(reportsSelector);
  const activeChildID: FormID = useSelector(selectors.activeChildID.bind(rootFormID));

  const deleteReports = () => {
    const presentationID = filterByPresentation ? activeChildID : null;
    API.programs.clearReports(presentationID).then();
    dispatch(actions.clearReports(presentationID));
  };

  return (
    <>
      <div className={'reports-header'}>
        <Checkbox
          id={'downloadFiles'} name={'downloadFiles'}
          label={t('downloadFiles.filter')}
          value={filterByPresentation}
          onChange={(e) => {setFilterByPresentation(Boolean(e.target.value))}}
        />
        <Button className={'k-button k-button-clear'} onClick={deleteReports}>
          <img
            src={reportDeleteIcon} alt={t('downloadFiles.clear')}
            title={t('downloadFiles.clear')}
          />
        </Button>
      </div>
      {filterByPresentation
        ? reports.filter(report => report.ID_PR === activeChildID).map(mapReports)
        : reports.map(mapReports)}
    </>
  );
}
