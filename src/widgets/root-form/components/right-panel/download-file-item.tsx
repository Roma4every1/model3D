import { CSSProperties, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { saveAs } from '@progress/kendo-file-saver';
import { reportsAPI } from '../../../../entities/reports/lib/reports.api';

import importFileIcon from 'assets/images/download-files/import.png';
import defaultFileIcon from 'assets/images/download-files/default.png';
import csvFileIcon from 'assets/images/download-files/csv.png';
import docFileIcon from 'assets/images/download-files/doc.png';
import docxFileIcon from 'assets/images/download-files/docx.png';
import xlsFileIcon from 'assets/images/download-files/xls.png';
import xlsmFileIcon from 'assets/images/download-files/xlsm.png';
import xlsxFileIcon from 'assets/images/download-files/xlsx.png';
import xlsxmFileIcon from 'assets/images/download-files/xlsxm.png';
import zipFileIcon from 'assets/images/download-files/zip.png';


const extensions = [
  'csv', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'xlsmx',
  'zip', 'ppt', 'pptx', 'txt', 'html', 'pdf'
];
const filesDict: ImageDict = {
  'csv': csvFileIcon,
  'doc': docFileIcon,
  'docx': docxFileIcon,
  'xls': xlsFileIcon,
  'xlsx': xlsxFileIcon,
  'xlsm': xlsmFileIcon,
  'xlsxm': xlsxmFileIcon,
  'zip': zipFileIcon,
};

const styleOk: CSSProperties = {color: '#0968c5', cursor: 'pointer', fontWeight: 'bold'};
const styleError: CSSProperties = {color: 'gray'};
const dateStyle: Intl.DateTimeFormatOptions = {timeStyle: 'short', dateStyle: 'long'};


export const DownloadFileItem = ({report}: {report: Report}) => {
  const { t } = useTranslation();
  const { Path: path, Dt: rawDate } = report;

  const ext = path?.split('.').pop();
  const needShowResult = ext && extensions.includes(ext);

  const displayName = needShowResult
    ? path.split('\\').pop().split('/').pop()
    : path ?? report.DefaultResult;

  const fileImage = needShowResult
    ? filesDict[ext] || defaultFileIcon
    : report.DisplayType === 4 ? importFileIcon : defaultFileIcon;

  const download = () => {
    const fileExactName = path.split('\\').pop().split('/').pop();
    reportsAPI.downloadFile(path).then((res) => { if (res.ok) saveAs(res.data, fileExactName); });
  };

  const displayDate = useMemo(() => {
    return new Date(rawDate).toLocaleString(undefined, dateStyle);
  }, [rawDate]);

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
          {t('downloadFiles.date', {date: displayDate})}
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
};
