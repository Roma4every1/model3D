import { useTranslation } from 'react-i18next';
import { useSelectionState } from '../../store/objects.store';
import { SelectionManageSection } from './section-manage';
import { SelectionCreateSection } from './section-create';


export const SelectionRibbon = ({hasMap}: {hasMap: boolean}) => {
  const { t } = useTranslation();
  const state = useSelectionState();

  return (
    <div className={'menu'}>
      <SelectionManageSection state={state} t={t}/>
      <SelectionCreateSection hasMap={hasMap} t={t}/>
    </div>
  );
};
