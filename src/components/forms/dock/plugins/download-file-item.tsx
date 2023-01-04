import { CSSProperties, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { saveAs } from "@progress/kendo-file-saver";
import { webFetch } from "../../../../api/initialization";
import { toDate } from "../../../../utils/utils";
import { filesDict, defaultFileIcon, importFileIcon } from "../../../../dicts/images";


const extensions = [
  'csv', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'xlsmx',
  'zip', 'ppt', 'pptx', 'txt', 'html', 'pdf'
];
const styleOk: CSSProperties = {color: '#0968c5', cursor: 'pointer', fontWeight: 'bold'};
const styleError: CSSProperties = {color: 'gray'};
const dateStyle: Intl.DateTimeFormatOptions = {timeStyle: 'short', dateStyle: 'long'};

function downloadFile(resource: string, sessionID: SessionID) {
  const fileExactName = resource.split('\\').pop().split('/').pop();
  const path = `downloadResource?resourceName=${resource}&sessionId=${sessionID}`;
  webFetch(path).then(data => data.blob()).then(data => saveAs(data, fileExactName));
}

export default function DownloadFileItem({report}: {report: Report}) {
  const { t } = useTranslation();

  const ext = report.Path?.split('.').pop();
  const needShowResult = ext && extensions.includes(ext);

  const displayName = needShowResult
    ? report.Path.split('\\').pop().split('/').pop()
    : report.Path ?? report.DefaultResult;

  const fileImage = needShowResult
    ? filesDict[ext] || defaultFileIcon
    : report.DisplayType === 4 ? importFileIcon : defaultFileIcon;

  const download = () => { downloadFile(report.Path, report.SessionId); };

  const date = useMemo(() => {
    const dt = report.Dt.startsWith('/') ? toDate(report.Dt) : new Date(report.Dt);
    return dt.toLocaleString(undefined, dateStyle);
  }, [report.Dt]);

  return (
    <section className={'report-item'}>
      <img src={fileImage} alt={'file'} width={28} height={28}/>
      <div>
        {needShowResult
          ? <div style={styleOk} onClick={download} title={'Сохранить'}>{displayName}</div>
          : <div style={styleError}>{displayName}</div>}
        <div>
          {t('downloadFiles.inOrderAndProgress', {order: report.Ord, progress: report.Progress})}
        </div>
        <div>
          {t('downloadFiles.date', {date})}
        </div>
        {report.Comment &&
          <div style={{color: 'lightgray'}}>
            {t('downloadFiles.comment', {comment: report.Comment})}
          </div>}
        {report.Error &&
          <div style={{color: 'orangered'}}>
            {t('downloadFiles.error', {error: report.Error})}
          </div>}
      </div>
    </section>
  );
}
