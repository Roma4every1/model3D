import { CSSProperties, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions, selectors } from '../../../../store';


interface ButtonProps {
  icon: string,
  title: string,
  onClick: () => void,
}
type ColumnMoveType = 'start' | 'left' | 'right' | 'end';


/** Меняет индексы колонок, чтобы выбранная ушла в начало, а другие сместились. */
const toStart = (colSettings, cell, index: number, count: number) => {
  if (!(index > count && index < colSettings.length)) return;
  colSettings[index].displayIndex = count;
  for(let i = count; i < index; i++) colSettings[i].displayIndex++;
}

/** Меняет индексы колонок, чтобы выбранная ушла на 1 шаг влево. */
const toLeft = (colSettings, cell, index: number, count: number) => {
  if (!(index > count && index < colSettings.length)) return;
  colSettings[index].displayIndex--;
  colSettings[index - 1].displayIndex++;
}

/** Меняет индексы колонок, чтобы выбранная ушла на 1 шаг вправо. */
const toRight = (colSettings, cell, index: number, count: number) => {
  if (!(index >= count && index < colSettings.length)) return;
  colSettings[index].displayIndex++;
  colSettings[index + 1].displayIndex--;
}

/** Меняет индексы колонок, чтобы выбранная ушла в конец, а другие сместились. */
const toEnd = (colSettings, cell, index: number, count: number) => {
  if (!(index >= count && index < colSettings.length)) return;
  colSettings[index].displayIndex = colSettings.length - 1;
  for(let i = index + 1; i < colSettings.length; i++) colSettings[i].displayIndex--;
}

const dict = {'start': toStart, 'left': toLeft, 'right': toRight, 'end': toEnd};
const style: CSSProperties = {display: 'flex', gridGap: '6px', padding: '4px'};


export function ColumnSettings({formID}: PropsFormID) {
  const dispatch = useDispatch();
  const formRef = useSelector((state: WState) => state.formRefs[formID]);
  const tableSettings: any = useSelector(selectors.formSettings.bind(formID));

  const setFrozenCount = useCallback(() => {
    tableSettings.columns.frozenColumnCount = 1 + tableSettings.columns.columnsSettings.findIndex((c) => {
      return c.channelPropertyName === formRef.current.activeCell().column;
    });
    dispatch(actions.setFormSettings(formID, {...tableSettings}));
  }, [tableSettings, formRef, formID, dispatch]);

  const moveColumnTo = useCallback((where: ColumnMoveType) => {
    const cell = formRef.current.activeCell();
    const colSettings = tableSettings.columns.columnsSettings;
    if (!colSettings || !cell) return;

    const index = colSettings.findIndex(c => c.channelPropertyName === cell.column);
    const count = tableSettings.columns.frozenColumnCount;

    colSettings.forEach((c, i) => c.displayIndex = i);
    dict[where](colSettings, cell, index, count);

    dispatch(actions.setFormSettings(formID, {...tableSettings}));
  }, [tableSettings, formRef, formID, dispatch]);

  return (
    <div style={style}>
      <Button icon={'arrow-double-60-left'} title={'В начало'} onClick={() => moveColumnTo('start')}/>
      <Button icon={'arrow-60-left'} title={'Влево'} onClick={() => moveColumnTo('left')}/>
      <Button icon={'arrow-60-right'} title={'Вправо'} onClick={() => moveColumnTo('right')}/>
      <Button icon={'arrow-double-60-right'} title={'В конец'} onClick={() => moveColumnTo('end')}/>
      <Button icon={'pin'} title={'Закрепить столбцы до выбранного'} onClick={() => setFrozenCount()}/>
    </div>
  );
}

const Button = ({icon, title, onClick}: ButtonProps) => {
  return (
    <button className={'k-button k-button-clear'} title={title} onClick={onClick}>
      <span className={`k-icon k-i-${icon}`} />
    </button>
  );
}
