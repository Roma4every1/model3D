import {useDispatch} from "react-redux";
import {setActiveFile} from "../store/file-list.actions";

interface FileListItemProps {
  formId: FormID,
  filename: string,
}

export const FileListItem = ({formId, filename}: FileListItemProps) => {
  const dispatch = useDispatch();

  const onClick = () => {
    dispatch(setActiveFile(formId, filename));
  }

  return (
    <button disabled={false} onClick={onClick}>
      <span>{filename}</span>
    </button>
  );
};
