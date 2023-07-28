import { useSelector } from 'react-redux';
import { channelSelector } from 'entities/channels';
import { fileListStateSelector } from '../store/file-list.selectors';


export const FileListView = ({id, channels}: FormState) => {
  const state: FileListState = useSelector(fileListStateSelector.bind(id));
  const channel: Channel = useSelector(channelSelector.bind(channels[0]));

  console.log(state);
  const files = channel.data?.rows ?? [];
  return <ul>{files.map((row, i) => <li key={i}>{row.Cells[0]}</li>)}</ul>;
};
