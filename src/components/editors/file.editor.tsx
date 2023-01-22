import { EditorProps } from "./base-editor";
import { ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@progress/kendo-react-buttons";
import { Label } from "@progress/kendo-react-labels";
import { API } from "../../api/api";


export const FileEditor = ({id, valueSelector, update}: EditorProps<ParamValueString>) => {
  const { t } = useTranslation();
  let value: string | null = useSelector(valueSelector);

  const onBeforeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = async function () {
      const { data } = await API.uploadFile(file.name, reader.result);
      console.log(data);
      update(file.name);
    }
    reader.readAsArrayBuffer(file);
  };

  const openFiles = () => {
    document.getElementById('file-input-' + id).click();
    update(t("editors.filesNotSelected"));
  };

  return (
    <div>
      <input id={'file-input-' + id} type={'file'} onChange={onBeforeUpload} style={{display: 'none'}}/>
      <Label style={{float: 'left'}}>{value}</Label>
      <Button style={{float: 'right'}} onClick={openFiles}>
        <span className='k-icon k-i-folder-open'/>
      </Button>
    </div>
  );
};
