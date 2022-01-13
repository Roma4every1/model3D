import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Checkbox } from "@progress/kendo-react-inputs";
import DownloadFileItem from './DownloadFileItem';
import { Button } from "@progress/kendo-react-buttons";
import clearReports from '../../../../../store/actionCreators/clearReports';

export default function DownloadFiles(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId } = props;
    const [filterByPresentation, setFilterByPresentation] = React.useState(true);
    const activeChild = useSelector((state) => state.childForms[formId].activeChildren[0]);
    const reports = useSelector((state) => Object.values(state.reports)).reverse();
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);

    const deleteReports = async () => {
        var presentationId = filterByPresentation ? activeChild : null;
        await sessionManager.fetchData(`clearReports?sessionId=${sessionId}&presentationId=${presentationId}`);
        dispatch(clearReports(presentationId));
    };

    return (
        <div className="font-10">
            <div className="reportsHeaderString">
                <div className="reportsFilter">
                    <Checkbox
                        id="downloadFiles"
                        name="downloadFiles"
                        label={t('downloadFiles.filter')}
                        value={filterByPresentation}
                        onChange={(event) => {
                            setFilterByPresentation(event.target.value)
                        }}
                    />
                </div>
                <div className="reportsDelete">
                    <Button className="k-button k-button-clear" onClick={deleteReports}>
                        <img src={window.location.pathname + 'images/report_delete.png'} alt={t('downloadFiles.clear')} title={t('downloadFiles.clear')} />
                    </Button>
                </div>
            </div>
            {filterByPresentation ?
                reports.filter(r => r.ID_PR === activeChild).map(r => <DownloadFileItem key={r.Id} operationData={r} />) :
                reports.map(r => <DownloadFileItem key={r.Id} operationData={r} />)}
        </div>);
}
