import { useTranslation } from 'react-i18next';
import { saveAs } from '@progress/kendo-file-saver';
import { fileExtensionIconDict, defaultFileIcon, saveFile } from 'shared/lib';
import { programAPI } from 'entities/program';
import { showNotification } from 'entities/notification';


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
    if (!status.file.blob) {
      programAPI.downloadFile(file.path).then((res) => {
        if (res.ok) {
          saveAs(res.data, file.name);
        } else {
          showNotification(t('operation.download-error'));
        }
      });
    } else {
      saveFile(file.name, file.blob);
    }
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
          {t('operation.progress', progressStringData)}
        </div>
        <div>
          {t('operation.timestamp', {timestamp})}
        </div>
        {status.comment &&
          <div className={'operation-description'}>
            {t('operation.comment', {comment: status.comment})}
          </div>}
        {status.error &&
          <div className={'operation-error'}>
            {t('operation.error', {error: status.error})}
          </div>}
      </div>
    </section>
  );
};
