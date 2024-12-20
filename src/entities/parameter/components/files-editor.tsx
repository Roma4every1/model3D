import { EditorProps } from './editor-dict';
import { ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showNotification } from 'entities/notification';
import { programAPI } from 'entities/program/lib/program.api';
import { Button } from 'antd';
import { CloseOutlined, FolderOpenOutlined, LoadingOutlined } from '@ant-design/icons';

export const FilesEditor = ({ parameter, update }: EditorProps<'stringArray'>) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState(null);
  const timer = useRef<number>();

  let values = parameter.getValue() || [];
  if(values) values = values.map(id => id.substring(id.lastIndexOf('\\') + 1));

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files.length === 0) return;
    const controller = new AbortController();

    setSignal(controller);
    timer.current = window.setTimeout(() => setLoading(true), 500);

    try {
      const resourceIDs = await Promise.all(Array.from(files).map(async (file) => {
        const fileData = await file.arrayBuffer();
        const { ok, data } = await programAPI.uploadFile(file.name, fileData, controller.signal);
        return ok && data ? data : null;
      }));

      if (resourceIDs !== null) {
        update(resourceIDs);
      } else {
        showNotification(t('editors.file-upload-error'));
        update(null);
      }
    } finally {
      window.clearTimeout(timer.current);
      setLoading(false);
      setSignal(null);
    }
  }

  const inputRef = useRef<HTMLInputElement>();
  const clearFiles = () => {
    if (loading && signal ) {
      signal.abort();
      setLoading(false);
    } else {
      update(null);
    }
  };
  const openFiles = () => {inputRef.current.click()};

  const filesInfo = loading
    ? <span>Загрузка <LoadingOutlined /></span>
    : (values.length > 0 ? values.join(', ') : t('editors.files-not-selected'));

  return (
    <div className={'file-text-editor'}>
      <input
        type={'file'} accept={'.xls,.xlsx,.xlsm,.xlsb,.xlam,.xltx,.xltm'}
        onChange={onChange} ref={inputRef} multiple
      />
      <span title={values.join(', ')}>{filesInfo}</span>
      <div>
        <Button onClick={clearFiles} style={{width: 18, marginRight: 2, padding: 0, background: 'transparent'}}
          icon={<CloseOutlined />} />
        <Button onClick={openFiles} style={{width: 18, padding: 0, background: 'transparent'}}
          icon={<FolderOpenOutlined />} disabled={parameter.editor.disabled || loading}/>
      </div>
    </div>
  );
};
