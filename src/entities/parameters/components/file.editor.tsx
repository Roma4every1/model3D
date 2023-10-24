import { EditorProps } from './base-editor';
import { ChangeEvent, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@progress/kendo-react-buttons';
import { showNotification } from 'entities/notifications';
import { reportsAPI } from '../../reports/lib/report.api.ts';


export const FileEditor = ({parameter, update}: EditorProps<ParamString>) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  let value = parameter.value;
  if (value) value = value.substring(value.lastIndexOf('\\') + 1);

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileData = await file.arrayBuffer();
    const { ok, data: resourceID } = await reportsAPI.uploadFile(file.name, fileData);

    if (ok && resourceID.endsWith(file.name)) {
      update(resourceID);
    } else {
      await showNotification(t('editors.file-upload-error'))(dispatch);
      update(t('base.error'));
    }
  };

  const inputRef = useRef<HTMLInputElement>();
  const clearFile = () => { if (value !== null) update(null); }
  const openFiles = () => { inputRef.current.click(); };

  return (
    <div className={'file-text-editor'}>
      <input
        type={'file'} accept={'.xls,.xlsx,.xlsm,.xlsb,.xlam,.xltx,.xltm'}
        value={value ? undefined : ''} onChange={onChange} ref={inputRef}
      />
      <span title={value}>{value || t('editors.file-not-selected')}</span>
      <div>
        <Button onClick={clearFile} style={{paddingLeft: 4}}>
          <span className={'k-icon k-i-close'}/>
        </Button>
        <Button onClick={openFiles}>
          <span className={'k-icon k-i-folder-open'}/>
        </Button>
      </div>
    </div>
  );
};
