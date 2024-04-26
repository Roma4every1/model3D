import { useRef } from 'react';
import { useChannel, setChannelActiveRow } from 'entities/channel';

import './file-list.scss';
import { TextInfo } from 'shared/ui';
import { FileListItem } from './file-list-item';


/** Список файлов. */
export const FileListView = ({channels}: SessionClient) => {
  const nameIndexRef = useRef(-1);
  const channelName = channels[0]?.name;
  const info = channels[0]?.info;
  const channel = useChannel(channelName);
  const channelData = channel?.data;

  const rows = channelData?.rows ?? [];
  if (rows.length === 0 || !info) return <TextInfo text={'file-view.no-files'}/>;

  if (nameIndexRef.current === -1) {
    const columnName = info.fileName.columnName;
    nameIndexRef.current = channel.data.columns.findIndex(c => c.name === columnName);
  }

  const toElement = (row: ChannelRow, i: number) => {
    const fileName = row[nameIndexRef.current];
    const active = row === channelData.activeRow;
    const onClick = () => setChannelActiveRow(channelName, row);
    return <FileListItem key={i} fileName={fileName} active={active} onClick={onClick}/>;
  };
  return <div className={'file-list'}>{rows.map(toElement)}</div>;
};
