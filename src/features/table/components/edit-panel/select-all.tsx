import { useDispatch } from 'react-redux';
import { BigButton } from 'shared/ui';
import { setTableSelection } from '../../store/tables.actions';
import selectAllIcon from 'assets/images/dataset/select-all.png';


interface SelectAllProps {
  id: FormID,
  state: TableState,
}


export const SelectAll = ({id, state}: SelectAllProps) => {
  const dispatch = useDispatch();
  const disabled = state.activeCell.edited;

  const selectAll = () => {
    const total = state.total;
    const selection: TableSelection = {};
    for (let i = 0; i < total; i++) selection[i] = true;
    dispatch(setTableSelection(id, selection));
  };

  return <BigButton text={'Выделить всё'} icon={selectAllIcon} action={selectAll} disabled={disabled}/>;
};
