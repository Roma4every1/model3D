import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox } from 'antd';
import { ExpansionPanel, ExpansionPanelContent } from '@progress/kendo-react-layout';
import { setProfileStrata } from '../store/profile.actions';


interface ProfileStrataViewProps {
  id: FormID;
  strata: GMMOPlJobDataItem[];
}
interface ProfileStratumViewProps {
  stratum: GMMOPlJobDataItem;
  changeChecked: (checked: boolean, stratum: string) => void;
}


export const ProfileStrataView = ({id, strata}: ProfileStrataViewProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [activeStrata, setActiveStrata] = useState<string[]>([]);

  const changeChecked = (checked: boolean, stratum: string) => {
    if (checked) {
      setActiveStrata(prev => prev.filter(p => p !== stratum));
    } else if (!(stratum in activeStrata)) {
      setActiveStrata(prev => [...prev, stratum]);
    }
  };

  const items = strata?.length ? strata.map(s =>
    <ProfileStratumView key={s.name} stratum={s} changeChecked={changeChecked}/>
  ) : <></>;

  return (
    <ExpansionPanel
      expanded={expanded} style={{fontSize: '14px'}}
      title={'Пласты'} tabIndex={0}
      onAction={() => setExpanded(!expanded)}
    >
      {expanded && !!strata?.length && <ExpansionPanelContent>
        {items}
        <Button onClick={() => setProfileStrata(id, activeStrata)}>
          {t('base.apply')}
        </Button>
      </ExpansionPanelContent>}
    </ExpansionPanel>
  );
};

const ProfileStratumView = ({stratum, changeChecked}: ProfileStratumViewProps) => {
  const [checked, setChecked] = useState(false);

  const onCheckBoxChange = () => {
    changeChecked(checked, stratum.code);
    setChecked(!checked);
  };

  return (
    <div className={'profile-stratum'}>
      <Checkbox checked={checked} onChange={onCheckBoxChange}/>
      <span>{stratum.name}</span>
    </div>
  );
};
