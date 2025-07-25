import type { EditorProps } from './editor-dict';
import type { ChangeEvent, ClipboardEvent } from 'react';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { showNotification } from 'entities/notification';
import { programAPI } from 'entities/program/lib/program.api';
import { Button, Input } from 'antd';
import { CloseOutlined, FolderOpenOutlined } from '@ant-design/icons';


export const FilesEditor = ({parameter, update}: EditorProps<'stringArray'>) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>();
  const timer = useRef<number>(null);
  const controllerRef = useRef<AbortController>();

  const upload = async (files: FileList): Promise<void> => {
    const controller = new AbortController();
    controllerRef.current = controller;
    timer.current = window.setTimeout(() => setLoading(true), 500);

    const uploadFile = async (file: File): Promise<string | null> => {
      const fileData = await file.arrayBuffer();
      const { ok, data } = await programAPI.uploadFile(file.name, fileData, controller.signal);
      return ok && data ? data : null;
    };

    try {
      const result = await Promise.all([...files].map(uploadFile));
      const resources = result.filter(Boolean);

      if (result.length === resources.length) {
        update(resources);
      } else {
        showNotification(t('editors.files-upload-error'));
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
    const files = e.target.files;
    if (files.length > 0) upload(files).then();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const files = e.clipboardData.files;
    if (files.length > 0) upload(files).then();
  };

  const clearFiles = () => {
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
    const paths = parameter.getValue();
    if (paths) {
      inputText = paths.map(p => p.substring(p.lastIndexOf('\\') + 1)).join(', ');
      inputTitle = inputText;
    } else {
      inputText = t('editors.files-not-selected');
    }
  }
  const addon = (
    <>
      <Button
        style={{background: 'transparent'}} icon={<CloseOutlined/>} tabIndex={-1}
        onClick={clearFiles}
      />
      <Button
        style={{background: 'transparent'}} icon={<FolderOpenOutlined/>} tabIndex={-1}
        onClick={openFiles} disabled={parameter.editor.disabled || loading}
      />
    </>
  );

  return (
    <div className={'file-text-editor'}>
      <input type={'file'} onChange={onChange} ref={inputRef} multiple={true}/>
      <Input
        value={inputText} title={inputTitle} readOnly={true} addonAfter={addon}
        onPaste={onPaste} disabled={parameter.editor.disabled}
      />
    </div>
  );
};
