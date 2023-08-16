import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { round } from 'shared/lib';
import { setOpenedWindow } from 'entities/windows';
import { Window } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { DateRangePicker, DateRangePickerChangeEvent } from '@progress/kendo-react-dateinputs';
import { TreeView, TreeViewCheckChangeEvent, TreeViewExpandChangeEvent } from '@progress/kendo-react-treeview';
import { TextInfo } from 'shared/ui';

import './curve-selection-window.scss';
import { CaratCurveModel } from '../../lib/types';
import { CurveManager } from '../../lib/curve-manager';
import { caratStateSelector } from '../../store/carat.selectors';
import { loadCaratCurves } from '../../store/carat.thunks';


interface CurveSelectionWindowProps {
  id: FormID,
}
interface CurveFiltersProps {
  manager: CurveManager,
  signal: () => void
}


export const CurveSelectionWindow = ({id}: CurveSelectionWindowProps) => {
  const dispatch = useDispatch();
  const state: CaratState = useSelector(caratStateSelector.bind(id));

  const curveGroup = state?.curveGroup;
  const curveManager: CurveManager = curveGroup?.curveManager;
  const tree = curveManager?.getCurveTree() ?? [];

  const [_signal, setSignal] = useState(false);
  const signal = () => setSignal(!_signal);

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    event.item.expanded = !event.item.expanded;
    signal();
  };

  const onCheckChange = ({item}: TreeViewCheckChangeEvent) => {
    const checked = !item.checked;
    item.checked = checked;
    if (item.children) {
      item.children.forEach(c => c.checked = checked);
    } else {
      for (const group of tree) {
        const isCurrentGroup = group.children.some(i => i === item)
        if (isCurrentGroup) group.checked = group.children.some(c => c.checked);
      }
    }
    signal();
  };

  const onSetDefault = () => {
    for (const curveTreeGroup of tree) {
      for (const item of curveTreeGroup.children) {
        item.checked = item.value.defaultLoading;
      }
      curveTreeGroup.checked = curveTreeGroup.children.some(item => item.checked);
    }
    signal();
  };

  const onClose = () => {
    dispatch(setOpenedWindow('curve-selection', false, null));
  };

  const onSubmit = () => {
    onClose();
    dispatch(loadCaratCurves(id, curveGroup));
  };

  return (
    <Window
      title={'Выбор каротажных кривых'} maximizeButton={() => null}
      width={720} height={480} resizable={false} style={{zIndex: 99}} onClose={onClose}
    >
      <div className={'curve-selection-window'}>
        <div>
          <section>
            <h5>Кривые</h5>
            {tree.length
              ? <TreeView
                  data={tree} childrenField={'children'} item={CurveTreeItem}
                  expandIcons={true} onExpandChange={onExpandChange}
                  checkboxes={true} onCheckChange={onCheckChange}
                 />
              : <TextInfo text={'carat.no-data'}/>
            }
          </section>
          <section>
            <h5>Фильтры</h5>
            <CurveFilters manager={curveManager} signal={signal}/>
          </section>
        </div>
        <div>
          <Button onClick={onSetDefault}>По умолчанию</Button>
          <Button style={{width: 50}} onClick={onSubmit}>Ок</Button>
        </div>
      </div>
    </Window>
  );
};

const CurveFilters = ({manager, signal}: CurveFiltersProps) => {
  const { start, end } = manager;
  const types = manager.getTypeSelection();

  const onCheckChange = (event: TreeViewCheckChangeEvent) => {
    event.item.checked = !event.item.checked;
    manager.setTypeSelection(types); signal();
  };

  const onRangeChange = (e: DateRangePickerChangeEvent) => {
    const { start, end } = e.value;
    manager.setRange(start, end); signal();
  };

  return (
    <div>
      <TreeView
        className={'curve-selection-types'}
        data={types} textField={'type'}
        checkboxes={true} onCheckChange={onCheckChange}
      />
      <div style={{padding: 8}}>
        <LocalizationProvider language={'ru-RU'}>
          <IntlProvider locale={'ru'}>
            <DateRangePicker value={{start, end}} onChange={onRangeChange}/>
          </IntlProvider>
        </LocalizationProvider>
      </div>
    </div>
  );
};

const CurveTreeItem = ({item}) => {
  if (typeof item.text === 'string') return item.text as any;
  const curve: CaratCurveModel = item.value;

  return (
    <>
      <span>{curve.type}</span>
      <span>{`${round(curve.top, 2)} - ${round(curve.bottom, 2)}`}</span>
      <span title={curve.description}>{curve.description}</span>
    </>
  );
};
