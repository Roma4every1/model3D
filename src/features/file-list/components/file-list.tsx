import { useSelector } from 'react-redux';
import { channelSelector } from 'entities/channels';
import { fileListStateSelector } from '../store/file-list.selectors';
import {FileListItem} from "./file-list-item";


export const FileListView = ({id, channels}: FormState) => {
  const state: FileListState = useSelector(fileListStateSelector.bind(id));
  const channel: Channel = useSelector(channelSelector.bind(channels[0]));

  console.log(state);
  const files = channel.data?.rows ?? [];

  const filesItemsComponents = files.map((row, i) =>
    <FileListItem formId={id} filename={row.Cells[0]} key={i}/>
  );

  return <ul>{filesItemsComponents}</ul>;
};
