import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { channelSelector, setChannelActiveRow } from 'entities/channels';

import './file-list.scss';
import { TextInfo } from 'shared/ui';
import { FileListItem } from './file-list-item';


/** Список файлов. */
export const FileListView = ({channels}: FormState) => {
  const dispatch = useDispatch();
  const nameIndexRef = useRef(-1);

  const channelName = channels[0]?.name;
  const info = channels[0]?.columnInfo;
  const channel: Channel = useSelector(channelSelector.bind(channelName));
  const channelData = channel?.data;

  const rows = channelData?.rows ?? [];
  if (rows.length === 0 || !info) return <TextInfo text={'file-view.no-files'}/>;

  if (nameIndexRef.current === -1) {
    const columnName = info.fileName.name;
    nameIndexRef.current = channel.data.columns.findIndex(c => c.name === columnName);
  }

  const rowToItem = (row: ChannelRow, i: number) => {
    const fileName = row.Cells[nameIndexRef.current];
    const active = row === channelData.activeRow;
    const onClick = () => dispatch(setChannelActiveRow(channelName, row));
    return <FileListItem key={i} fileName={fileName} active={active} onClick={onClick}/>;
  };
  return <div className={'file-list'}>{rows.map(rowToItem)}</div>;
};
