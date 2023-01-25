import { Toolbar } from '@progress/kendo-react-buttons';


interface EditToolbarProps {
  edited: boolean,
  adding: boolean,
  add: () => void,
  drop: () => void,
  apply: () => void,
  cancel: () => void,
}


const kBtn = 'k-button k-button-clear';

export const DataSetEditToolbar = ({edited, adding, add, drop, apply, cancel}: EditToolbarProps) => {
  const applyDisabled = !edited && !adding;

  return (
    <div className={'blockheader'}>
      <Toolbar className={'blockheadertoolbar'}>
        <button className={kBtn} onClick={add} disabled={adding} title={'Добавить запись'}>
          <span className={'k-icon k-i-plus'}/>
        </button>
        <button className={kBtn} onClick={drop} title={'Удалить запись'}>
          <span className={'k-icon k-i-minus'}/>
        </button>
        <button className={kBtn} onClick={apply} disabled={applyDisabled} title={'Применить изменения'}>
          <span className={'k-icon k-i-check'}/>
        </button>
        <button className={kBtn} onClick={cancel} title={'Отменить изменения'}>
          <span className={'k-icon k-i-cancel'}/>
        </button>
      </Toolbar>
    </div>
  );
};
