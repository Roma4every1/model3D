import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Window } from '@progress/kendo-react-dialogs';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { DateRangePicker, DateRangePickerChangeEvent } from '@progress/kendo-react-dateinputs';
import { TreeView, TreeViewCheckChangeEvent, TreeViewExpandChangeEvent } from '@progress/kendo-react-treeview';

import { CaratCurveModel } from '../../lib/types';
import { CurveManager } from '../../lib/curve-manager';
import { setOpenedWindow } from 'entities/windows';
import './curve-selection-window.scss';


interface CurveSelectionWindowProps {
  activeGroup: ICaratColumnGroup,
}


export const CurveSelectionWindow = ({activeGroup}: CurveSelectionWindowProps) => {
  const dispatch = useDispatch();

  const selection: CurveManager = activeGroup?.curveManager;
  const [curves, setCurves] = useState(selection?.getAllCurves() ?? []);

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    event.item.expanded = !event.item.expanded;
    setCurves(curves);
  };

  const onCheckChange = (event: TreeViewCheckChangeEvent) => {
    event.item.checked = !event.item.checked;
    setCurves(curves);
  };

  const data = useMemo(() => {
    return createCurveTree(curves);
  }, [curves]);

  const onClose = () => {
    dispatch(setOpenedWindow('curve-selection', false, null));
  };

  return (
    <Window
      title={'Выбор каротажных кривых'} maximizeButton={() => null}
      width={720} height={480} resizable={false} style={{zIndex: 99}} onClose={onClose}
    >
      <div className={'curve-selection-window'}>
        <TreeView
          data={data} childrenField={'children'} item={CurveTreeItem}
          expandIcons={true} onExpandChange={onExpandChange}
          checkboxes={true} onCheckChange={onCheckChange}
        />
        <div>
          <CurveFilters selection={selection}/>
          <div>
            <button>Ок</button>
          </div>
        </div>
      </div>
    </Window>
  );
};

const CurveFilters = ({selection}: {selection: CurveManager}) => {
  const initStart = typeof selection.start === 'string' ? new Date() : selection.start;
  const [start, setStart] = useState(initStart);

  const initEnd = typeof selection.end === 'string' ? new Date() : selection.end;
  const [end, setEnd] = useState(initEnd);

  const onStartChange = (e: DateRangePickerChangeEvent) => {
    const { start, end } = e.value;
    selection.start = start; selection.end = end;
    setStart(start); setEnd(end);
  };

  return (
    <>
      <div>
        <ul>
          {selection.selectors.map(s => <li>{s.regExp.source + ' ' + s.selected}</li>)}
        </ul>
      </div>
      <div>
        <LocalizationProvider language={'ru-RU'}>
          <IntlProvider locale={'ru'}>
            <DateRangePicker value={{start, end}} onChange={onStartChange}/>
          </IntlProvider>
        </LocalizationProvider>
      </div>
    </>
  );
};

function createCurveTree(curves: CaratCurveModel[]) {
  const map: Map<number, CaratCurveModel[]> = new Map();
  for (const curve of curves) {
    const time = curve.date.getTime();
    if (!map.has(time)) map.set(time, []);
    map.get(time).push(curve);
  }
  const tree = [];
  for (const list of map.values()) {
    const children = list.map((curve) => ({value: curve, checked: true}));
    tree.push({value: list[0].date.toLocaleDateString(), expanded: false, checked: true, children});
  }
  return tree;
}

const CurveTreeItem = ({item}) => {
  if (typeof item.value === 'string') return item.value as any;
  const curve = item.value;

  return (
    <>
      <span>{curve.type}</span>
      <span>{`${Math.round(curve.top)} - ${Math.round(curve.bottom)}`}</span>
    </>
  );
}
