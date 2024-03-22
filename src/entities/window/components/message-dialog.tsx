import { useTranslation } from 'react-i18next';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';

import infoIcon from 'assets/images/common/info.svg';
import warningIcon from 'assets/images/common/warning.svg';
import errorIcon from 'assets/images/common/error.svg';


/** Словарь иконок по типу сообщения. */
const messageIconDict: Record<MessageDialogType, string> = {
  'info': infoIcon,
  'warning': warningIcon,
  'error': errorIcon,
};

/** Диалоговое окно сообщения. */
export const MessageDialog = ({type, title, style, content, onClose}: MessageDialogProps) => {
  const { t } = useTranslation();
  const iconSource = messageIconDict[type];

  return (
    <Dialog title={title ?? t('base.' + type)} width={style ? undefined: 400} onClose={onClose}>
      <div className={'message-dialog-content'}>
        <img src={iconSource} alt={type}/>
        <div style={style}>{content}</div>
      </div>
      <DialogActionsBar>
        <Button onClick={onClose}>{t('base.ok')}</Button>
      </DialogActionsBar>
    </Dialog>
  );
};
