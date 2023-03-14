import { TFunction } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { BigButton } from 'shared/ui';
import { setTableSelection } from '../../store/tables.actions';
import selectAllIcon from 'assets/images/dataset/select-all.png';


interface SelectAllProps {
  id: FormID,
  state: TableState,
  t: TFunction
}


export const SelectAll = ({id, state, t}: SelectAllProps) => {
  const dispatch = useDispatch();
  const disabled = state.activeCell.edited;

  const selectAll = () => {
    const total = state.total;
    const selection: TableSelection = {};
    for (let i = 0; i < total; i++) selection[i] = true;
    dispatch(setTableSelection(id, selection));
  };

  const text = t('table.panel.selection.select-all');
  return <BigButton text={text} icon={selectAllIcon} action={selectAll} disabled={disabled}/>;
};
