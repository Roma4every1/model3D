import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { saveAs } from "@progress/kendo-file-saver";
import { webFetch } from "../../../../../api/initialization";
import { toDate } from "../../../../../utils/utils";
import { filesDict } from "../../../../dicts/images";


const extensions = [
  'csv', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'xlsmx',
  'zip', 'ppt', 'pptx', 'txt', 'html', 'pdf'
];

export default function DownloadFileItem({operationData}) {
  const { t } = useTranslation();
  const sessionID = useSelector((state) => state.sessionId);

  const ext = operationData.Path?.split('.').pop();
  const needShowResult = ext && extensions.includes(ext);

  const displayName = needShowResult
    ? operationData.Path.split('\\').pop().split('/').pop()
    : operationData.Path ?? operationData.DefaultResult;

  const downloadFile = async (path) => {
    const response = await webFetch(`downloadResource?resourceName=${path}&sessionId=${sessionID}`);
    const data = await response.blob();
    const fileExactName = path.split('\\').pop().split('/').pop();
    saveAs(data, fileExactName);
  }

  return (
    <div key={operationData.Id} className={'horizontalHeader'}>
      <div key={operationData.Id + 'image'} className={'horizontalFixed'}>
        {needShowResult
          ? <img src={filesDict[ext] || filesDict['default']} alt={'logo'} />
          : <img src={operationData.DisplayType === 4 ? filesDict['import'] : filesDict['default']} alt={'logo'} />
        }
      </div>
      <div key={operationData.Id + 'body'} className={'horizontal'}>
        <div
          key={operationData.Id + 'displayName'}
          className={needShowResult ? 'cursor-pointer colored-blue' : 'colored-gray'}
          onClick={() => { if (needShowResult) downloadFile(operationData.Path) }}
        >
          {displayName}
        </div>
        {t('downloadFiles.inOrderAndProgress', { order: operationData.Ord, progress: operationData.Progress })}
        <br />
        {t('downloadFiles.date', { date: toDate(operationData.Dt).toLocaleString() })}
        {(operationData.Comment) &&
          <div
            key={operationData.Id + 'comment'} className={'colored-lightgray'}
            style={{ visibility: operationData.Comment ? 'visible' : 'hidden' }}
          >
            {t('downloadFiles.comment', { comment: operationData.Comment })}
          </div>
        }
        {(operationData.Error) &&
          <div
            key={operationData.Id + 'error'} className={'colored-orangered'}
            style={{ visibility: operationData.Error ? 'visible' : 'hidden' }}
          >
            {t('downloadFiles.error', { error: operationData.Error })}
          </div>
        }
      </div>
    </div>
  );
}
