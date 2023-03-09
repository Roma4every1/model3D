import { TFunction } from 'react-i18next';
import { ToolbarActions } from '../../lib/types';
import { ButtonIconStock } from 'shared/ui';


interface TableToolbarEditButtonsProps {
  state: TableState,
  actions: ToolbarActions,
  selectedRecords: TableRecordID[],
  t: TFunction,
}


/** Кнопки, отвечающие за редактирование. */
export const EditButtons = ({state, actions, selectedRecords, t}: TableToolbarEditButtonsProps) => {
  const rowAdding = state.edit.isNew;
  const endEditDisabled = !state.edit.modified && !state.activeCell.edited;
  const deleteDisabled = selectedRecords.length < 1 || rowAdding;

  return (
    <>
      <ButtonIconStock
        icon={'plus-outline'} title={t('table.toolbar.add')}
        action={() => actions.addRecord(false)} disabled={!state.tableID || rowAdding}
      />
      <ButtonIconStock
        icon={'minus-outline'} title={t('table.toolbar.remove')}
        action={actions.deleteRecords} disabled={deleteDisabled}
      />
      <ButtonIconStock
        icon={'check-outline'} title={t('table.toolbar.accept')}
        action={actions.acceptEdit} disabled={endEditDisabled}
      />
      <ButtonIconStock
        icon={'close-outline'} title={t('table.toolbar.reject')}
        action={actions.cancelEdit} disabled={endEditDisabled}
      />
    </>
  );
};
