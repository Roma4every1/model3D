import { EditorProps } from "./base-editor";
import { ChangeEvent, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@progress/kendo-react-buttons";
import { showNotice } from "../../utils/notifications";
import { API } from "../../api/api";


export const FileEditor = ({valueSelector, update}: EditorProps<ParamValueString>) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  let value: string | null = useSelector(valueSelector);
  if (value) value = value.substring(value.lastIndexOf('\\') + 1)

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const { ok, data } = await API.uploadFile(file.name, reader.result);
      if (ok && data.endsWith(file.name)) return update(data);
      showNotice(dispatch, t('editors.file-upload-error'));
      update(t('base.error'))
    }
    reader.readAsArrayBuffer(file);
  };

  const inputRef = useRef<HTMLInputElement>();
  const clearFile = () => { if (value !== null) update(null); }
  const openFiles = () => { inputRef.current.click(); };

  return (
    <div className={'file-text-editor'}>
      <input type={'file'} value={value ? undefined : ''} onChange={onChange} ref={inputRef}/>
      <span>{value || t('editors.file-not-selected')}</span>
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
