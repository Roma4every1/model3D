import type { TFunction } from 'react-i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Flex } from 'antd';
import { ProfileRatio } from './profile-ratio';
import { updateProfile } from '../store/profile.thunks';


interface ProfileParameterEditorProps {
  id: FormID;
  parameters: ProfileParameters;
}
interface ProfileStrataViewProps {
  parameters: ProfileParameters;
  t: TFunction;
}
interface ProfileStratumViewProps {
  stratum: ProfileStratum;
  onSelect: () => void;
}


export const ProfileParameterEditor = ({id, parameters}: ProfileParameterEditorProps) => {
  const { t } = useTranslation();
  const apply = () => updateProfile(id);

  return (
    <>
      <Flex gap={2} style={{margin: 4}}>
        <ProfileRatio parameters={parameters}/>
        <Button title={t('profile.apply')} onClick={apply}>{t('base.apply')}</Button>
      </Flex>
      <ProfileStrataView parameters={parameters} t={t}/>
    </>
  );
};

const ProfileStrataView = ({parameters, t}: ProfileStrataViewProps) => {
  const strata = parameters.strata;
  let message: string;

  if (strata === undefined) {
    message = 'profile.strata-loading';
  } else if (strata === null) {
    message = 'profile.strata-error';
  } else if (strata.length === 0) {
    message = 'profile.strata-empty';
  }
  if (message) {
    return <div style={{padding: 4}}>{t(message)}</div>;
  }

  const onSelect = () => {
    parameters.selectedStrata = strata.filter(s => s.selected).map(s => s.code);
  };
  const toElement = (s: ProfileStratum) => {
    return <ProfileStratumView key={s.code} stratum={s} onSelect={onSelect}/>;
  };
  return <ul className={'profile-strata'}>{strata.map(toElement)}</ul>;
};

const ProfileStratumView = ({stratum, onSelect}: ProfileStratumViewProps) => {
  const [checked, setChecked] = useState(false);

  const onChange = () => {
    setChecked(!checked);
    stratum.selected = !checked;
    onSelect();
  };

  return (
    <li>
      <Checkbox checked={checked} onChange={onChange}/>
      <span>{stratum.name}</span>
    </li>
  );
};
