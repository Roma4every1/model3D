import type { TFunction } from 'react-i18next';
import { useRender } from 'shared/react'
import { round } from 'shared/lib';
import { InputNumber, Select, Switch } from 'antd';
import { FieldValueModeProvider } from '../../modes';
import './field-value.scss';


interface FieldValueWindowProps {
  stage: IMapStage;
  provider: FieldValueModeProvider;
  t: TFunction;
}

export const FieldValueWindow = ({stage, provider, t}: FieldValueWindowProps) => {
  const render = useRender();
  const state = provider.state;
  provider.updateWindow = render;

  const onLayerChange = (id: string) => {
    const layer = stage.getMapData()?.layers.find(l => l.id === id) ?? null;
    if (layer) {
      if (!layer.visible) layer.visible = true;
      provider.setLayer(layer);
      stage.setActiveLayer(layer);
      stage.render();
    } else {
      provider.setLayer(null);
    }
    render();
  };
  const onModeChange = () => {
    provider.moveMode = !provider.moveMode;
    render();
  };

  const fieldLayers = stage.getMapData()?.layers.filter(l => l.elementType === 'field') ?? [];
  const layerOptions = fieldLayers.map(l => ({value: l.id, label: l.displayName}));

  let x: number, y: number, value: number;
  if (state.point) {
    x = Math.round(state.point.x);
    y = -Math.round(state.point.y);
  }
  if (state.value !== undefined) {
    value = round(state.value, 3);
  }

  return (
    <div className={'field-value-container'}>
      <section>
        <div>
          <span>{t('map.field-value.layer')}</span>
          <Select
            style={{width: 270, marginBottom: 5}}
            options={layerOptions} value={provider.getLayer()?.id} onChange={onLayerChange}
          />
        </div>
      </section>
      <section>
        <div>
          <div>{t('map.field-value.x-node')}</div>
          <InputNumber style={{width: 115}} value={state.xNode} controls={false} readOnly={true}/>
        </div>
        <div>
          <div>{t('map.field-value.x')}</div>
          <InputNumber style={{width: 145}} value={x} controls={false} readOnly={true}/>
        </div>
      </section>
      <section>
        <div>
          <div>{t('map.field-value.y-node')}</div>
          <InputNumber style={{width: 115}} value={state.yNode} controls={false} readOnly={true}/>
        </div>
        <div>
          <div>{t('map.field-value.y')}</div>
          <InputNumber style={{width: 145}} value={y} controls={false} readOnly={true}/>
        </div>
      </section>
      <section style={{gridTemplateColumns: '125px 135px'}}>
        <div>
          <div>{t('map.field-value.value')}</div>
          <InputNumber style={{width: 115}} value={value} controls={false} readOnly={true}/>
        </div>
        <div>
          <div>{t('map.field-value.move-mode')}</div>
          <Switch style={{marginTop: 4}} checked={provider.moveMode} onChange={onModeChange}/>
        </div>
      </section>
    </div>
  );
};
