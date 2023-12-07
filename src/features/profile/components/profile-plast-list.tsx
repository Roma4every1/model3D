import {useState} from "react";
import {ExpansionPanel, ExpansionPanelContent} from "@progress/kendo-react-layout";
import ProfilePlastItem from "./profile-plast-item.tsx";
import {Button} from "@progress/kendo-react-buttons";
import {useTranslation} from "react-i18next";
import {useDispatch} from "../../../shared/lib";
import {setProfilePlastList} from "../store/profile.actions.ts";

interface ProfilePlastListProps {
  id: FormID;
  plastList: GMMOPlJobDataItem[];
}

export const ProfilePlastList = ({id, plastList}: ProfilePlastListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [expanded, setExpanded] = useState(false);
  const [activePlastList, setActivePlastList] = useState<string[]>([]);

  const changeChecked = (checked: boolean, plast: string) => {
    if (!checked) {
      if (!(plast in activePlastList))
        setActivePlastList(prev => [...prev, plast]);
    } else {
      setActivePlastList(prev => prev.filter(p => p !== plast));
    }
  }

  const apply = () => {
    dispatch(setProfilePlastList(id, activePlastList));
  }

  const items = plastList?.length ? plastList.map(p =>
    <ProfilePlastItem plast={p} changeChecked={changeChecked} key={p.name}/>
  ) : <></>;

  return (
    <ExpansionPanel
      expanded={expanded} style={{fontSize: '14px'}}
      title={'Пласты'} tabIndex={0}
      onAction={() => {setExpanded(!expanded)}}
    >
      {expanded && !!plastList?.length && <ExpansionPanelContent>
        {items}
          <Button onClick={apply}>
            {t('base.apply')}
          </Button>
      </ExpansionPanelContent>}
    </ExpansionPanel>
  );
};
