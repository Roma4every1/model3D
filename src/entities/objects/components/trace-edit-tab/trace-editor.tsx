import { useTranslation } from 'react-i18next';
import { useTraceManager } from '../../store/objects.store';
import { setCurrentTrace } from '../../store/objects.actions';
import { deleteTrace } from '../../store/trace.thunks';
import { useMapState } from 'features/map';

import './traces-edit-tab.scss';
import { TraceChangeName } from './trace-change-name';
import { TraceNodes } from './trace-nodes';
import { TraceAddNode } from './trace-add-node';


interface TraceEditorProps {
  /** ID формы карты. */
  id: FormID;
}


/** Правая панель редактирования трассы. */
export const TraceEditor = ({id}: TraceEditorProps) => {
  const { t } = useTranslation();
  const { model, oldModel, creating } = useTraceManager();
  const mapState = useMapState(id);

  if (!model) return <div/>;
  const mapPoints = mapState?.stage.getMapData()?.points;

  // задание недостающих координат и имён
  if (mapPoints) {
    for (const node of model.nodes) {
      if (node.name !== null && node.x !== null && node.y !== null) continue;
      const point = mapPoints.find(p => p.UWID === node.id);
      if (!point) continue;

      if (node.x === null) node.x = point.x;
      if (node.y === null) node.y = point.y;
      if (node.name === null) node.name = point.name;
    }
  }

  const onClick = () => {
    if (creating) {
      deleteTrace().then();
    } else {
      setCurrentTrace(oldModel, false, false);
    }
  };

  return (
    <section className={'trace-edit-tab'}>
      <div className={'trace-edit-tab__header'}>
        <div className={'title'}>
          <div>{t('trace.edit-panel')}</div>
        </div>
        <span className={'k-clear-value'}>
        <span className={'k-icon k-i-close'} onClick={onClick}/>
      </span>
      </div>
      <div className={'trace-edit-tab__body'}>
        <TraceChangeName model={model}/>
        <TraceNodes model={model}/>
        <TraceAddNode model={model} mapPoints={mapPoints}/>
      </div>
    </section>
  );
};
