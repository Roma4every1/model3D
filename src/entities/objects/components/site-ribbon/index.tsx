import { useTranslation } from 'react-i18next';
import { useSiteState } from '../../store/objects.store';
import { SiteManageSection } from './section-manage';
import { SiteEditSection } from './section-edit';


export const SiteRibbon = ({hasMap}: {hasMap: boolean}) => {
  const state = useSiteState();
  const { t } = useTranslation();

  return (
    <div className={'menu'}>
      <SiteManageSection state={state} t={t} hasMap={hasMap}/>
      <SiteEditSection state={state} t={t}/>
    </div>
  );
};
