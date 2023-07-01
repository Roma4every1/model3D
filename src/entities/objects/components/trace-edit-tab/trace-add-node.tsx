import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { mapStateSelector } from 'features/map/store/map.selectors';
import { setCurrentTrace } from '../../store/objects.actions';

import { Button } from '@progress/kendo-react-buttons';
import { ComboBox, ComboBoxChangeEvent } from '@progress/kendo-react-dropdowns';


interface TraceAddNodeProps {
  formID: FormID,
  model: TraceModel,
}


export const TraceAddNode = ({formID, model}: TraceAddNodeProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const mapState: MapState = useSelector(mapStateSelector.bind(formID));
  const allPoints = mapState?.mapData?.points;
  const [addedPoint, setAddedPoint] = useState<MapPoint>(null);

  const traceNodeIDs = useMemo(() => {
    return new Set(model.nodes.map(node => node.id));
  }, [model.nodes]);

  const data = useMemo(() => {
    return allPoints?.filter(p => !traceNodeIDs.has(parseInt(p.UWID))) ?? [];
  }, [allPoints, traceNodeIDs]);

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

  return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
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
