import type { TFunction } from 'react-i18next';
import type { MeasurerState } from '../../extra-objects/measure.object';
import { useRender } from 'shared/react';
import { Button, Checkbox, InputNumber } from 'antd';
import { MapStage } from '../../lib/map-stage';
import { MeasureModeProvider } from '../../modes';
import { MapMeasureObjectProvider } from '../../extra-objects/measure.object';
import './measure-window.scss';


interface MeasurerWindowProps {
  stage: MapStage;
  t: TFunction;
}
interface DistanceFieldProps {
  title: string;
  value: number;
}
interface AngleFieldProps extends DistanceFieldProps {
  degrees: boolean;
}

export const MeasureWindow = ({stage, t}: MeasurerWindowProps) => {
  const render = useRender();
  const modeProvider = stage.getModeProvider('measure') as MeasureModeProvider;
  const objectProvider = stage.getExtraObjectProvider('measure') as MapMeasureObjectProvider;

  modeProvider.updateWindow = render;
  const drawOptions = objectProvider.drawOptions;
  const state = stage.getExtraObject('measure') as MeasurerState;

  let totalLength: number, lastSegmentLength: number, withoutLastSegmentLength: number;
  let area: number, currentAngle: number, firstAngle: number;

  if (state) {
    const nodes = state.nodes;
    const first = nodes[0];
    area = state.area;
    totalLength = state.totalLength;
    lastSegmentLength = nodes.at(-1).distance;

    if (nodes.length > 2) {
      if (drawOptions.closed) {
        totalLength += first.distance;
        lastSegmentLength = first.distance;
        currentAngle = nodes.at(-1).startAngle - nodes.at(-1).endAngle;
        firstAngle = first.startAngle - first.endAngle;
        if (firstAngle > Math.PI) firstAngle -= 2 * Math.PI;
        if (firstAngle < -Math.PI) firstAngle += 2 * Math.PI;
      } else {
        currentAngle = nodes.at(-2).startAngle - nodes.at(-2).endAngle;
        firstAngle = state.firstAngle;
      }
      if (currentAngle > Math.PI) currentAngle -= 2 * Math.PI;
      if (currentAngle < -Math.PI) currentAngle += 2 * Math.PI;
      if (firstAngle > Math.PI / 2) firstAngle = Math.PI - firstAngle;
      withoutLastSegmentLength = totalLength - lastSegmentLength;
    }
  }

  const onShowDistanceChange = () => {
    drawOptions.showDistances = !drawOptions.showDistances;
    render(); stage.render();
  };
  const onShowAngleChange = () => {
    drawOptions.showAngles = !drawOptions.showAngles;
    render(); stage.render();
  };
  const onShowLengthChange = () => {
    drawOptions.showLength = !drawOptions.showLength;
    render(); stage.render();
  };
  const onShowAreaChange = () => {
    drawOptions.showArea = !drawOptions.showArea;
    render(); stage.render();
  };
  const onDegreesChange = () => {
    modeProvider.degrees = !modeProvider.degrees;
    render();
  };
  const onClosedChange = () => {
    drawOptions.closed = !drawOptions.closed;
    render(); stage.render();
  };

  const toggleActive = () => {
    modeProvider.active = !modeProvider.active;
    render(); stage.render();
  };
  const clear = () => {
    stage.setExtraObject('measure', null);
    render(); stage.render();
  };

  return (
    <div className={'map-measure-container'}>
      <fieldset>
        <DistanceField title={t('map.measure.chain-length')} value={totalLength}/>
        <AngleField title={t('map.measure.last-angle')} value={currentAngle} degrees={modeProvider.degrees}/>
      </fieldset>
      <fieldset>
        <DistanceField title={t('map.measure.last-segment-length')} value={lastSegmentLength}/>
        <AngleField title={t('map.measure.first-angle')} value={firstAngle} degrees={modeProvider.degrees}/>
      </fieldset>
      <fieldset>
        <DistanceField title={t('map.measure.without-last-length')} value={withoutLastSegmentLength}/>
        <AreaField title={t('map.measure.area')} value={area}/>
      </fieldset>
      <div>
        <Checkbox checked={drawOptions.showDistances} onChange={onShowDistanceChange}>
          {t('map.measure.show-distances')}
        </Checkbox>
        <Checkbox checked={drawOptions.showLength} onChange={onShowLengthChange}>
          {t('map.measure.show-length')}
        </Checkbox>
        <Button onClick={toggleActive}>
          {modeProvider.active ? 'Остановить' : (state ? 'Продолжить' : 'Начать')}
        </Button>
      </div>
      <div>
        <Checkbox checked={drawOptions.showAngles} onChange={onShowAngleChange}>
          {t('map.measure.show-angles')}
        </Checkbox>
        <Checkbox checked={modeProvider.degrees} onChange={onDegreesChange}>
          {t('map.measure.angles-in-degrees')}
        </Checkbox>
        <Button onClick={clear}>{t('base.clear')}</Button>
      </div>
      <div>
        <Checkbox checked={drawOptions.showArea} onChange={onShowAreaChange}>
          {t('map.measure.show-area')}
        </Checkbox>
        <Checkbox checked={drawOptions.closed} onChange={onClosedChange}>
          {t('map.measure.closed')}
        </Checkbox>
      </div>
    </div>
  );
};

const DistanceField = ({title, value}: DistanceFieldProps) => {
  let v: number;
  let suffix: string;

  if (value !== undefined) {
    if (value > 10000) {
      v = Math.round(value / 10) / 100;
      suffix = 'км';
    } else {
      v = Math.round(value);
      suffix = 'м';
    }
  }
  return (
    <div>
      <div>{title}</div>
      <InputNumber value={v} suffix={suffix} controls={false} readOnly={true}/>
    </div>
  );
};

const AngleField = ({title, value, degrees}: AngleFieldProps) => {
  let v: number;
  let suffix: string;

  if (value !== undefined) {
    if (degrees) {
      v = Math.abs(Math.round(value * 180 / Math.PI));
      suffix = '°';
    } else {
      v = Math.abs(Math.round(value * 100) / 100);
    }
  }
  return (
    <div>
      <div>{title}</div>
      <InputNumber value={v} suffix={suffix} controls={false} readOnly={true}/>
    </div>
  );
};

const AreaField = ({title, value}: DistanceFieldProps) => {
  let v: number;
  let suffix: string;

  if (value !== undefined) {
    if (value > 1e5) {
      v = Math.round(value / 1e4) / 100;
      suffix = 'км²';
    } else {
      v = Math.round(value);
      suffix = 'м²';
    }
  }
  return (
    <div>
      <div>{title}</div>
      <InputNumber value={v} suffix={suffix} controls={false} readOnly={true}/>
    </div>
  );
};
