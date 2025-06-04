import type { TFunction } from 'react-i18next';
import { BigButton, MenuSection } from 'shared/ui';
import { calcSiteReserves } from '../../store/site-reserves';
import statisticsIcon from 'assets/table/statistics.png';


interface SiteReservesSectionProps {
  state: SiteState;
  t: TFunction;
  hasMap: boolean;
}

export const SiteReservesSection = ({hasMap, state, t}: SiteReservesSectionProps) => {
  return (
    <MenuSection header={t('site.reserves-section')} className={'big-buttons'} style={{width: 75}}>
      <BigButton
        text={t('site.calc-reserves')} icon={statisticsIcon}
        onClick={calcSiteReserves} disabled={!hasMap || !state.model || state.editMode !== null}
      />
    </MenuSection>
  );
};
