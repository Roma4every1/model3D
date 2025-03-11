import type { FieldValueModeProvider, FieldValueContext } from '../../modes/field-value.mode';
import { useTranslation } from 'react-i18next';
import { useRender } from 'shared/react';
import { useGlobalVariable } from 'shared/global';
import { round } from 'shared/lib';
import { InputNumber } from 'antd';
import './field-value-window.scss';


export const FieldValueWindow = () => {
  const render = useRender();
  const { t } = useTranslation();
  const context = useGlobalVariable<FieldValueContext>('fv');

  const provider = context.stage.getModeProvider('show-field-value') as FieldValueModeProvider;
  const state = context.state;
  context.updateWindow = render;

  let x: number, y: number, value: number;
  let valueLabel = t('map.field-value.value');

  if (state.point) {
    x = Math.round(state.point.x);
    y = -Math.round(state.point.y);
  }
  if (state.value !== undefined) {
    value = round(state.value, 3);
    valueLabel = `${valueLabel} (${state.layer.displayName})`;
  }

  const onXChange = (value: number) => {
    if (y === undefined) return;
    provider.setPoint({x: value, y: -y}, context);
    render();
  };
  const onYChange = (value: number) => {
    if (x === undefined) return;
    provider.setPoint({x, y: -value}, context);
    render();
  };

  return (
    <div className={'field-value-container'}>
      <section>
        <div>
          <div>{t('map.field-value.x-node')}</div>
          <InputNumber style={{width: 115}} value={state.xNode} controls={false} readOnly={true}/>
        </div>
        <div>
          <div>{t('map.field-value.x')}</div>
          <InputNumber
            style={{width: 145}} value={x} onChange={onXChange}
            controls={false} changeOnWheel={true}
          />
        </div>
      </section>
      <section>
        <div>
          <div>{t('map.field-value.y-node')}</div>
          <InputNumber style={{width: 115}} value={state.yNode} controls={false} readOnly={true}/>
        </div>
        <div>
          <div>{t('map.field-value.y')}</div>
          <InputNumber
            style={{width: 145}} value={y} onChange={onYChange}
            controls={false} changeOnWheel={true}
          />
        </div>
      </section>
      <section style={{gridTemplateColumns: '1fr'}}>
        <div>
          <div className={'value-label'}>{valueLabel}</div>
          <InputNumber style={{width: '100%'}} value={value} controls={false} readOnly={true}/>
        </div>
      </section>
    </div>
  );
};
