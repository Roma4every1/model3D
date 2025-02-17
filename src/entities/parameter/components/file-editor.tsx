import type { EditorProps } from './editor-dict';
import type { ChangeEvent, ClipboardEvent } from 'react';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { showNotification } from 'entities/notification';
import { programAPI } from 'entities/program/lib/program.api';
import { Button, Input } from 'antd';
import { CloseOutlined, FolderOpenOutlined } from '@ant-design/icons';


export const FileEditor = ({parameter, update}: EditorProps<'string'>) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>();
  const timer = useRef<number>(null);
  const controllerRef = useRef<AbortController>();

  const upload = async (file: File): Promise<void> => {
    const controller = new AbortController();
    controllerRef.current = controller;
    timer.current = window.setTimeout(() => setLoading(true), 500);

    try {
      const fileData = await file.arrayBuffer();
      const { ok, data } = await programAPI.uploadFile(file.name, fileData, controller.signal);

      if (ok && data) {
        update(data);
      } else {
        showNotification(t('editors.file-upload-error'));
        update(null);
      }
    } catch {
      // без catch в консоли будет ошибка
    } finally {
      window.clearTimeout(timer.current);
      timer.current = null;
      controllerRef.current = null;
      setLoading(false);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) upload(file).then();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const file = e.clipboardData.files[0];
    if (file) upload(file).then();
  };

  const clearFile = () => {
    if (loading && controllerRef.current) {
      controllerRef.current.abort();
      setLoading(false);
    }
    update(null);
  };
  const openFiles = () => {
    inputRef.current.click();
  };

  let inputText: string;
  let inputTitle: string;

  if (loading) {
    inputText = t('base.loading');
  } else {
    const path = parameter.getValue();
    if (path) {
      inputText = path.substring(path.lastIndexOf('\\') + 1);
      inputTitle = inputText;
    } else {
      inputText = t('editors.file-not-selected');
    }
  }
  const addon = (
    <>
      <Button
        style={{background: 'transparent'}} icon={<CloseOutlined/>} tabIndex={-1}
        onClick={clearFile}
      />
      <Button
        style={{background: 'transparent'}} icon={<FolderOpenOutlined/>} tabIndex={-1}
        onClick={openFiles} disabled={parameter.editor.disabled || loading}
      />
    </>
  );

  return (
    <div className={'file-text-editor'}>
      <input type={'file'} onChange={onChange} ref={inputRef}/>
      <Input
        value={inputText} title={inputTitle} readOnly={true} addonAfter={addon}
        onPaste={onPaste} disabled={parameter.editor.disabled}
      />
    </div>
  );
};
