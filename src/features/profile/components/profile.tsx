import { useSelector } from 'react-redux';
import { profileStateSelector } from '../store/profile.selectors.ts';
import { channelSelector } from '../../../entities/channels';


export const Profile = ({id, channels}: FormState) => {
  const state: ProfileState = useSelector(profileStateSelector.bind(id));
  const channel: Channel = useSelector(channelSelector.bind(channels[0].name));

  console.log(state);
  console.log(channel.data);
  return <div/>;
};
