import React, {useState} from 'react';
import {Checkbox} from "@progress/kendo-react-inputs";
import './profile.scss';

interface ProfilePlastItemProps {
  plast: GMMOPlJobDataItem;
  changeChecked: (checked: boolean, plast: string) => void;
}

const ProfilePlastItem = ({plast, changeChecked}: ProfilePlastItemProps) => {
  const [checked, setChecked] = useState(false);

  const onCheckBoxChange = () => {
    changeChecked(checked, plast.code);
    setChecked(!checked);
  };

  return (
    <div className={'profile-plast-list-item'}>
      <Checkbox checked={checked} onChange={onCheckBoxChange} />
      <span>{plast.name}</span>
    </div>
  );
};

export default ProfilePlastItem;
