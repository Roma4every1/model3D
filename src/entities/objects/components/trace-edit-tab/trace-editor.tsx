import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { mapStateSelector } from 'features/map/store/map.selectors';
import { traceStateSelector } from '../../store/objects.selectors';
import { setCurrentTrace } from '../../store/objects.actions';
import { deleteTrace } from '../../store/objects.thunks';

import './traces-edit-tab.scss';
import { TraceChangeName } from './trace-change-name';
import { TraceNodes } from './trace-nodes';
import { TraceAddNode } from './trace-add-node';


/** Правая панель редактирования трассы. */
export const TraceEditor = ({formID}: PropsFormID) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { model, oldModel, creating } = useSelector(traceStateSelector);
  const mapState: MapState = useSelector(mapStateSelector.bind(formID));
  const mapPoints = mapState?.mapData?.points;

  // задание недостающих координат и имён
  if (mapPoints) {
    for (const node of model.nodes) {
      if (node.name !== null && node.x !== null && node.y !== null) continue;
      const point = mapPoints.find(p => parseInt(p.UWID) === node.id);
      if (!point) continue;

      if (node.x === null) node.x = point.x;
      if (node.y === null) node.y = point.y;
      if (node.name === null) node.name = point.name;
    }
  }

  const onClick = () => {
    if (creating) {
      dispatch(deleteTrace());
    } else {
      dispatch(setCurrentTrace(oldModel, false, false));
    }
  };

  return (
    <section className='trace-edit-tab'>
      <div className='trace-edit-tab__header'>
        <div className='title'>
          <div>{t('trace.edit-panel')}</div>
        </div>
        <span className='k-clear-value'>
        <span className={'k-icon k-i-close'} onClick={onClick}/>
      </span>
      </div>
      <div className='trace-edit-tab__body'>
        <TraceChangeName model={model}/>
        <TraceNodes model={model}/>
        <TraceAddNode model={model} mapPoints={mapPoints}/>
      </div>
    </section>
  );
};
