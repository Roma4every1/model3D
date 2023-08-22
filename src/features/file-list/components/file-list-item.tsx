import { fileExtensionDict, defaultFileIcon } from 'shared/lib';


interface FileListItemProps {
  /** Название файла. */
  fileName: string;
  /** Является ли файл активным. */
  active: boolean;
  /** Обработчик клика. */
  onClick: () => void;
}


export const FileListItem = ({fileName, active, onClick}: FileListItemProps) => {
  const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
  const icon = fileExtensionDict[extension] || defaultFileIcon;
  const className = 'file-list-item' + (active ? ' active' : '');

  return (
    <div className={className} title={fileName} onClick={onClick}>
      <img src={icon} alt={extension}/>
      <span>{fileName}</span>
    </div>
  );
};
