import type { KeyboardEvent } from 'react';
import type { TFunction } from 'react-i18next';
import type { CaratStage } from '../../rendering/stage';
import { useState } from 'react';
import { Button, InputNumber } from 'antd';
import { inputNumberFormatter, inputNumberParser } from 'shared/locales';


interface CaratViewportSetterProps {
  stage: CaratStage;
  t: TFunction;
}

/** Компонент для перехода к заданной абсолютной отметке. */
export const CaratViewportSetter = ({stage, t}: CaratViewportSetterProps) => {
  const [value, setValue] = useState<number>(null);
  const validTracks = stage.trackList.filter(t => t.inclinometry?.hasData());

  let min = Infinity, max = -Infinity;
  for (const track of validTracks) {
    const { minMark, maxMark } = track.inclinometry;
    if (minMark < min) min = minMark;
    if (maxMark > max) max = maxMark;
  }
  const invalidValue = value !== null && (value < min || value > max);

  const apply = () => {
    if (value === null) return;
    for (const track of validTracks) {
      track.viewport.y = track.inclinometry.getDepth(value);
    }
    stage.render();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (invalidValue) return;
    if (e.key === 'Enter') apply();
  };

  return (
    <section className={'carat-viewport-setter'} title={t('carat.navigation.goto-mark')}>
      <InputNumber
        value={value} status={invalidValue ? 'error' : ''}
        onChange={setValue as (v: number) => void} onKeyDown={onKeyDown}
        parser={inputNumberParser} formatter={inputNumberFormatter}
        controls={false} changeOnWheel={true} style={{flex: 1}}
      />
      <Button onClick={apply} disabled={invalidValue}>{t('base.apply')}</Button>
    </section>
  );
};
