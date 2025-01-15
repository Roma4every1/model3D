import type { EditorProps } from './editor-dict';
import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showNotification } from 'entities/notification';
import { programAPI } from 'entities/program/lib/program.api';
import { Button } from 'antd';
import { CloseOutlined, FolderOpenOutlined, LoadingOutlined } from '@ant-design/icons';


export const FilesEditor = ({parameter, update}: EditorProps<'stringArray'>) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>();
  const timer = useRef<number>();
  const controllerRef = useRef<AbortController>();

  const value = parameter.getValue();
  const fileNames = value ? value.map(id => id.substring(id.lastIndexOf('\\') + 1)).join(', ') : '';

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files.length === 0) return;
    const controller = new AbortController();

    controllerRef.current = controller;
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
      timer.current = null;
      controllerRef.current = null;
      setLoading(false);
    }
  };

  const clearFiles = () => {
    if (loading && controllerRef) {
      controllerRef.current.abort();
      setLoading(false);
    } else {
      update(null);
    }
  };
  const openFiles = () => {
    inputRef.current.click();
  };

  const filesInfo = loading
    ? <span>{t('base.loading')} <LoadingOutlined/></span>
    : (fileNames || t('editors.files-not-selected'));

  return (
    <div className={'file-text-editor'}>
      <input type={'file'} onChange={onChange} ref={inputRef} multiple={true}/>
      <span title={fileNames}>{filesInfo}</span>
      <div>
        <Button
          style={{width: 18, marginRight: 2, padding: 0, background: 'transparent'}}
          onClick={clearFiles} icon={<CloseOutlined/>}
        />
        <Button
          style={{width: 18, padding: 0, background: 'transparent'}}
          onClick={openFiles} icon={<FolderOpenOutlined/>}
          disabled={parameter.editor.disabled || loading}
        />
      </div>
    </div>
  );
};
