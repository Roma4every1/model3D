import type { TFunction } from 'react-i18next';
import { MenuSection, BigButton } from 'shared/ui';
import { useCurrentSite } from '../../store/objects.store';
import { createSelectionFromSite } from '../../store/selection-creating';
import createFromSiteIcon from 'assets/objects/selection-from-site.svg';


interface SelectionCreateSection {
  hasMap: boolean;
  t: TFunction;
}

export const SelectionCreateSection = ({hasMap, t}: SelectionCreateSection) => {
  const site = useCurrentSite();
  const canCreate = site && hasMap;

  return (
    <MenuSection header={t('selection.create-section')} className={'big-buttons'}>
      <BigButton
        text={t('selection.from-site')} icon={createFromSiteIcon}
        onClick={createSelectionFromSite} disabled={!canCreate}
      />
    </MenuSection>
  );
};
