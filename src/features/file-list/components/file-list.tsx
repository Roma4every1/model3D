import { useChannel, setChannelActiveRow } from 'entities/channel';
import { getFileExtension, fileExtensionIconDict, defaultFileIcon } from 'shared/lib';
import { TextInfo } from 'shared/ui';
import './file-list.scss';


interface FileListItemProps {
  /** Название файла. */
  fileName: string;
  /** Является ли файл активным. */
  active: boolean;
  /** Обработчик клика. */
  onClick: () => void;
}

/** Список файлов. */
export const FileListView = ({channels}: Pick<SessionClient, 'channels'>) => {
  const channelID = channels[0]?.id;
  const channel = useChannel(channelID);

  const data = channel?.data;
  const rows = data?.rows
  if (!rows || rows.length === 0) return <TextInfo text={'file-view.no-files'}/>;

  const fileProperty = channel.config.properties.find(p => p.file?.nameFrom);
  const fileColumnName = fileProperty.file.nameFrom;
  const nameIndex = data.columns.findIndex(c => c.name === fileColumnName);

  const toElement = (row: ChannelRow, i: number) => {
    const fileName = row[nameIndex] ?? 'Файл';
    const active = row === data.activeRow;
    const onClick = () => setChannelActiveRow(channelID, row);
    return <FileListItem key={i} fileName={fileName} active={active} onClick={onClick}/>;
  };
  return <div className={'file-list'}>{rows.map(toElement)}</div>;
};

const FileListItem = ({fileName, active, onClick}: FileListItemProps) => {
  const icon = fileExtensionIconDict[getFileExtension(fileName)] || defaultFileIcon;
  const className = 'file-list-item' + (active ? ' active' : '');

  return (
    <div className={className} title={fileName} onClick={onClick}>
      <img src={icon} alt={fileName}/>
      <span>{fileName}</span>
    </div>
  );
};
