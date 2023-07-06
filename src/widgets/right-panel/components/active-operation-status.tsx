import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { saveAs } from '@progress/kendo-file-saver';
import { showNotification } from 'entities/notifications';
import { reportsAPI } from 'entities/reports/lib/reports.api';
import { fileExtensionDict, extensions } from '../lib/file-extension-dict';
import defaultFileIcon from 'assets/images/reports/default.png';


/** Форматирование даты. */
const formatter = new Intl.DateTimeFormat('ru', {dateStyle: 'long', timeStyle: 'short'});

/** Информация о состоянии активной операции. */
export const ActiveOperationStatus = ({status}: {status: OperationStatus}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const file = status.file;
  const hasFile = file?.extension && extensions.includes(file.extension);

  const date = formatter.format(status.timestamp);
  const progressStringData = {order: status.queueNumber, progress: status.progress};

  const fileImage = hasFile
    ? fileExtensionDict[file.extension] || defaultFileIcon
    : defaultFileIcon;

  const download = hasFile ? () => {
    reportsAPI.downloadFile(file.path).then((res: Res<Blob>) => {
      if (res.ok) {
        saveAs(res.data, file.name);
      } else {
        dispatch(showNotification('Ошибка при скачивании файла'));
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
          {t('downloadFiles.inOrderAndProgress', progressStringData)}
        </div>
        <div>
          {t('downloadFiles.date', {date})}
        </div>
        {status.description &&
          <div className={'operation-description'}>
            {t('downloadFiles.comment', {comment: status.description})}
          </div>}
        {status.error &&
          <div className={'operation-error'}>
            {t('downloadFiles.error', {error: status.error})}
          </div>}
      </div>
    </section>
  );
};
