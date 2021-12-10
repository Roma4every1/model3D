import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { saveAs } from '@progress/kendo-file-saver';
import { toDate } from '../../../../../utils';

export default function DownloadFileItem(props) {
    const { operationData } = props;
    const { t } = useTranslation();
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);

    const getImagePath = (fileType) => {
        return process.env.PUBLIC_URL + '/downloadFilesImages/' + fileType + '.png';
    }

    const extensions = ["csv", "xls", "xlsx", "zip", "xlsm", "xlsmx", "doc", "docx", "ppt", "pptx", "txt", "html", "pdf"];
    var ext = operationData.Path?.split('.').pop();
    const needShowResult = ext && extensions.includes(ext);
    const displayName = needShowResult ? operationData.Path.split('\\').pop().split('/').pop() : operationData.Path ?? operationData.DefaultResult;

    const downloadFile = async (path) => {
        const resultText = await sessionManager.fetchData(`downloadResource?resourceName=${path}&sessionId=${sessionId}`);
        const fileExactName = path.split('\\').pop().split('/').pop();
        const downloadPath = process.env.PUBLIC_URL + (process.env.RESOURCES_PATH ?? '') + '/' + resultText;
        saveAs(
            downloadPath,
            fileExactName);
    }

    return (<div key={operationData.Id} className="horizontalHeader">
        <div key={operationData.Id + "image"} className="horizontalFixed">
            {needShowResult ? <img src={getImagePath(ext)} alt="logo" /> : <img src={getImagePath(operationData.DisplayType === 4 ? "import" : "default")} alt="logo" />}
        </div>
        <div key={operationData.Id + "body"} className="horizontal">
            <div key={operationData.Id + "displayName"} className={needShowResult ? "cursor-pointer colored-blue" : "colored-gray"} onClick={() => { if (needShowResult) downloadFile(operationData.Path) }}>
                {displayName}
            </div>
            {t('downloadFiles.inOrderAndProgress', { order: operationData.Ord, progress: operationData.Progress})}
            <br />
            {t('downloadFiles.date', { date: toDate(operationData.Dt).toLocaleString() })}
            {(operationData.Comment) && <div key={operationData.Id + "comment"} className="colored-lightgray" style={{ visibility: operationData.Comment ? "visible" : "hidden" }}>
                {t('downloadFiles.comment', { comment: operationData.Comment })}
            </div>}
            {(operationData.Error) && <div key={operationData.Id + "error"} className="colored-orangered" style={{ visibility: operationData.Error ? "visible" : "hidden" }}>
                {t('downloadFiles.error', { error: operationData.Error })}
            </div>}
        </div>
    </div>);
}
