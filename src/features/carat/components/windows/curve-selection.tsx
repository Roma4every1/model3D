import type { CaratCurveModel } from '../../lib/types';
import type { DateRangePickerChangeEvent } from '@progress/kendo-react-dateinputs';
import type { TreeViewCheckChangeEvent, TreeViewExpandChangeEvent } from '@progress/kendo-react-treeview';

import { useEffect } from 'react';
import { useRerender } from 'shared/react';
import { useTranslation } from 'react-i18next';
import { round } from 'shared/lib';
import { updateWindow } from 'entities/window';

import { Button } from '@progress/kendo-react-buttons';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import { DateRangePicker } from '@progress/kendo-react-dateinputs';
import { TreeView } from '@progress/kendo-react-treeview';
import { TextInfo } from 'shared/ui';

import './curve-selection.scss';
import { CaratStage } from '../../rendering/stage';
import { CurveManager } from '../../lib/curve-manager';
import { loadCaratCurves } from '../../store/carat.actions';


interface CurveSelectionWindowProps {
  id: FormID;
  stage: CaratStage;
  onClose: () => void;
}
interface CurveFiltersProps {
  manager: CurveManager;
  signal: () => void;
}


export const CurveSelectionWindow = ({id, stage, onClose}: CurveSelectionWindowProps) => {
  const { t } = useTranslation();
  const rerender = useRerender();

  const track = stage.getActiveTrack();
  const curveGroup = track.getCurveGroup();
  const curveManager: CurveManager = curveGroup?.getCurveColumn().curveManager;
  const tree = curveManager?.getCurveTree() ?? [];

  useEffect(() => {
    stage.subscribe('track', rerender);
    return () => stage.unsubscribe('track', rerender);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  // обновление заголовка окна при смене активного трека
  useEffect(() => {
    const title = t('carat.selection.window-title', {well: track.wellName});
    updateWindow('curve-selection', {title});
  }, [track.wellName, t]);

  const onExpandChange = (event: TreeViewExpandChangeEvent) => {
    event.item.expanded = !event.item.expanded;
    rerender();
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
    rerender();
  };

  const onSetDefault = () => {
    for (const curveTreeGroup of tree) {
      for (const item of curveTreeGroup.children) {
        item.checked = item.value.defaultLoading;
      }
      curveTreeGroup.checked = curveTreeGroup.children.some(item => item.checked);
    }
    rerender();
  };

  const onSubmit = () => {
    onClose();
    loadCaratCurves(id, curveGroup).then();
  };

  return (
    <div className={'curve-selection-window'}>
      <div>
        <section>
          <h5>{t('carat.selection.curves')}</h5>
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
          <h5>{t('carat.selection.filters')}</h5>
          <CurveFilters manager={curveManager} signal={rerender}/>
        </section>
      </div>
      <div>
        <Button onClick={onSetDefault}>{t('carat.selection.default')}</Button>
        <Button style={{width: 50}} onClick={onSubmit}>{t('base.ok')}</Button>
      </div>
    </div>
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
      <span>{`${round(curve.top, 1)} - ${round(curve.bottom, 1)}`}</span>
      <span title={curve.description}>{curve.description}</span>
    </>
  );
};
