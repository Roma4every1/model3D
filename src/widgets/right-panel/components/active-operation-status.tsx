import { useTranslation } from 'react-i18next';
import { saveAs } from '@progress/kendo-file-saver';
import { showNotification } from 'entities/notification';
import { Res, fileExtensionIconDict, defaultFileIcon } from 'shared/lib';
import { reportAPI } from 'entities/report/lib/report.api';


/** Форматирование даты. */
const formatter = new Intl.DateTimeFormat('ru', {dateStyle: 'long', timeStyle: 'short'});

/** Информация о состоянии активной операции. */
export const ActiveOperationStatus = ({status}: {status: OperationStatus}) => {
  const { t } = useTranslation();
  const file = status.file;
  const hasFile = file?.extension;

  const timestamp = formatter.format(status.timestamp);
  const progressStringData = {order: status.queueNumber, progress: status.progress};

  const fileImage = hasFile
    ? fileExtensionIconDict[file.extension] || defaultFileIcon
    : defaultFileIcon;

  const download = hasFile ? () => {
    reportAPI.downloadFile(file.path).then((res: Res<Blob>) => {
      if (res.ok) {
        saveAs(res.data, file.name);
      } else {
        showNotification(t('report.download-error'));
      }
    });
  } : undefined;

  const operationHeader = hasFile ? (
    <div className={'operation-header operation-file'} title={t('base.save')} onClick={download}>
      {file.name}
    </div>
  ) : (
    <div className={'operation-header'}>
      {status.defaultResult}
    </div>
  );

  return (
    <section className={'active-operation'}>
      <img src={fileImage} alt={'file'} width={28} height={28}/>
      <div>
        {operationHeader}
        <div>
          {t('report.operation-progress', progressStringData)}
        </div>
        <div>
          {t('report.operation-timestamp', {timestamp})}
        </div>
        {status.comment &&
          <div className={'operation-description'}>
            {t('report.operation-comment', {comment: status.comment})}
          </div>}
        {status.error &&
          <div className={'operation-error'}>
            {t('report.operation-error', {error: status.error})}
          </div>}
      </div>
    </section>
  );
};
