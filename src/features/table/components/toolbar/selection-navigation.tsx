import { TFunction } from 'react-i18next';
import { ToolbarActions } from '../../lib/types';
import { ButtonIconStock } from 'shared/ui';


interface SelectionNavigationProps {
  selectedRecords: TableRecordID[],
  actions: ToolbarActions,
  total: number,
  t: TFunction,
}


export const SelectionNavigation = ({selectedRecords, actions, total, t}: SelectionNavigationProps) => {
  const selectedLength = selectedRecords.length;
  const minRecord = selectedLength ? Math.min(...selectedRecords) : undefined;
  const maxRecord = selectedLength ? Math.max(...selectedRecords) : undefined;

  const toPrevious = () => actions.moveCellVertical(-1);
  const previousDisabled = selectedLength === 0 || minRecord <= 0;

  const toNext = () => actions.moveCellVertical(1);
  const nextDisabled = selectedLength === 0 || maxRecord >= total - 1;

  const toStartDisabled = selectedLength === 1 && selectedRecords[0] === 0;
  const toEndDisabled = selectedLength === 1 && selectedRecords[0] === total - 1;

  return (
    <>
      <ButtonIconStock
        icon={'arrow-seek-up'} title={t('table.toolbar.to-start')}
        action={actions.toStart} disabled={toStartDisabled}
      />
      <ButtonIconStock
        icon={'arrow-seek-down'} title={t('table.toolbar.to-end')}
        action={actions.toEnd} disabled={toEndDisabled}
      />
      <ButtonIconStock
        icon={'arrow-60-up'} title={t('table.toolbar.previous')}
        action={toPrevious} disabled={previousDisabled}
      />
      <ButtonIconStock
        icon={'arrow-60-down'} title={t('table.toolbar.next')}
        action={toNext} disabled={nextDisabled}
      />
    </>
  );
};
