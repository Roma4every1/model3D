import { useSelector } from 'react-redux';
import { fileViewStateSelector } from '../store/file-view.selectors';
import {channelSelector} from "../../../entities/channels";

export const FileView = ({id, channels}: FormState) => {
  const state = useSelector(fileViewStateSelector.bind(id));
  console.log(state)

  const channel: Channel = useSelector(channelSelector.bind(channels[0]));
  const files = channel.data?.rows ?? [];
  console.log(files)

  return (
    <div>file</div>
  );
};
