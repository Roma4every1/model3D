import { EditPanelItemProps } from '../../lib/types';
import { BigButton } from 'shared/ui';
import { setTableSelection } from '../../store/table.actions';
import selectAllIcon from 'assets/table/select-all.png';


export const SelectAll = ({id, state, t}: EditPanelItemProps) => {
  const disabled = state.activeCell.edited || !state.total;

  const selectAll = () => {
    const total = state.total;
    const selection: TableSelection = {};
    for (let i = 0; i < total; i++) selection[i] = true;
    setTableSelection(id, selection)
  };

  const text = t('table.panel.functions.select-all');
  return <BigButton text={text} icon={selectAllIcon} action={selectAll} disabled={disabled}/>;
};
