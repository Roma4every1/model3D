import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TextInfo } from 'shared/ui';
import { useChannelDict } from 'entities/channel';
import { useModelState } from '../store/model.store';
import { updateModel } from '../store/model.thunks';
import { setModelCanvas } from '../store/model.actions';
import './model.scss'
// import { setModelCanvas } from '../store/model.actions';

export const Model = ({ id }: { id: FormID }) => {
  const { status, usedChannels, stage, parsedModel, geomFiles, canvas } = useModelState(id);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const channelDict = useChannelDict(usedChannels);
  const channel = Object.values(channelDict).find(ch => ch.name === 'ModelZones');

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onStart = () => setBusy(true);
    const onEnd = () => setBusy(false);

    stage.subscribe('render-start', onStart);
    stage.subscribe('render-end', onEnd);

    return () => {
      stage.unsubscribe('render-start', onStart);
      stage.unsubscribe('render-end', onEnd);
    };
  }, [stage]);

  // загружаем модель при изменении канала
  useEffect(() => {
    if (channel) updateModel(id, channel);
  }, [channel, id]);

  // привязка canvas после рендера
  useLayoutEffect(() => {
    const currentCanvas = canvasRef.current;
    if (currentCanvas === canvas) return;
    if (canvasRef.current) {
      stage.attachTo(canvasRef.current);
      setModelCanvas(id, canvasRef.current)
    }
  },);

  // передаём данные в сцену
  useEffect(() => {
    if (parsedModel && geomFiles) {
      stage.setData(parsedModel, geomFiles);
    }
  }, [parsedModel, geomFiles, stage]);

  if (status !== 'ok') return <TextInfo text={'model.' + status} />;
  return (
    <div className="model-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {busy && (
        <div className="model-overlay">
          <div className="spinner" /> 
        </div>
      )}
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

