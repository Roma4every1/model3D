import { useDispatch, useSelector } from 'react-redux';
import { channelSelector, setChannelActiveRow } from 'entities/channels';

import './file-list.scss';
import { TextInfo } from 'shared/ui';
import { FileListItem } from './file-list-item';


/** Список файлов. */
export const FileListView = ({channels}: FormState) => {
  const dispatch = useDispatch();
  const channel: Channel = useSelector(channelSelector.bind(channels[0]));

  const rows = channel.data?.rows ?? [];
  const activeRow = channel.data?.activeRow;
  if (rows.length === 0) return <TextInfo text={'Файлы отсутствуют'}/>;

  const rowToItem = (row: ChannelRow, i: number) => {
    const fileName = row.Cells[0];
    const active = row === activeRow;

    const onClick = () => {
      dispatch(setChannelActiveRow(channel.name, row));
    }
    return <FileListItem key={i} fileName={fileName} active={active} onClick={onClick}/>;
  };
  return <div className={'file-list'}>{rows.map(rowToItem)}</div>;
};
