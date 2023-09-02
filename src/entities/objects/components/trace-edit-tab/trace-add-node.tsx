import { KeyboardEvent, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setCurrentTrace } from '../../store/objects.actions';

import { Button } from '@progress/kendo-react-buttons';
import { ComboBox, ComboBoxChangeEvent } from '@progress/kendo-react-dropdowns';


interface TraceAddNodeProps {
  /** Модель трассы. */
  model: TraceModel;
  /** Именованные точки карты. */
  mapPoints: MapPoint[] | undefined;
}


export const TraceAddNode = ({model, mapPoints}: TraceAddNodeProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [addedPoint, setAddedPoint] = useState<MapPoint>(null);

  const traceNodeIDs = useMemo(() => {
    return new Set(model.nodes.map(node => node.id));
  }, [model.nodes]);

  const data = useMemo(() => {
    return mapPoints?.filter(p => !traceNodeIDs.has(parseInt(p.UWID))) ?? [];
  }, [mapPoints, traceNodeIDs]);

  const onChange = (event: ComboBoxChangeEvent) => {
    setAddedPoint(event.target.value);
  };

  const addPoint = () => {
    const node: TraceNode = {
      id: parseInt(addedPoint.UWID), name: addedPoint.name,
      x: addedPoint.x, y: addedPoint.y,
    };
    model.nodes = [...model.nodes, node];
    setAddedPoint(null);
    dispatch(setCurrentTrace({...model}));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.nativeEvent.key === 'Enter' && addedPoint) addPoint();
  };

  return (
    <div className={'trace-edit-tab__inner-block'} tabIndex={0} onKeyDown={onKeyDown}>
      <div className={'menu-header trace-edit-tab__title-text'}>
        {t('trace.add-point-title')}
      </div>
      <ComboBox
        style={{fontSize: '12px'}} dataItemKey={'UWID'} textField={'name'}
        data={data} value={addedPoint} onChange={onChange}
      />
      <Button style={{fontSize: '12px'}} onClick={addPoint} disabled={!addedPoint}>
        {t('trace.add-point-button')}
      </Button>
    </div>
  );
};
