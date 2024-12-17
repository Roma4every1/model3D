import type { TFunction } from 'react-i18next';
import type { MapState } from '../../lib/types';
import { useEffect } from 'react';
import { useRender } from 'shared/react';
import { Checkbox } from 'antd';
import { ElementSelectModeProvider } from '../../modes';
import { cancelMapEditing } from '../../store/map-edit.actions';
import selectingIcon from 'assets/map/selecting-mode.png';


interface MapSelectSectionProps {
  state: MapState;
  t: TFunction;
}

export const MapSelectSection = ({state, t}: MapSelectSectionProps) => {
  const render = useRender();
  const stage = state.stage;

  const mode = stage.getMode();
  const selectMode = mode === 'element-select';
  const provider = stage.getModeProvider('element-select') as ElementSelectModeProvider;

  useEffect(() => {
    stage.subscribe('mode', render);
    return () => stage.unsubscribe('mode', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleType = (type: MapElementType) => {
    provider.setTypeSelect(type, !provider.types[type]);
    render();
  };
  const toggleOnlyActiveLayer = () => {
    provider.setActiveLayerSelect(!provider.onlyActiveLayer);
    render();
  };

  const toggleSelecting = () => {
    if (selectMode && stage.getActiveElement()) {
      stage.clearSelect();
      stage.render();
    }
    if (state.edit.editing || state.edit.creating) cancelMapEditing(state.id);
    stage.setMode(selectMode ? 'default' : 'element-select');
  };
  const canToggleSelecting = state.status === 'ok' && !stage.hasExtraObject('incl')
    && (mode === 'default' || selectMode);

  return (
    <section className={'map-selecting'}>
      <div className={'menu-header'}>{t('map.selecting.header')}</div>
      <div className={'map-panel-main'}>
        <div>
          <button
            disabled={!canToggleSelecting}
            className={'map-panel-button' + (selectMode ? ' active' : '')}
            onClick={toggleSelecting} title={t('map.selecting.button-hint')}
          >
            <img src={selectingIcon} alt={'selecting'}/>
          </button>
        </div>
        <div>
          <Checkbox
            title={t('map.selecting.polyline-hint')}
            checked={provider.types.polyline} onClick={() => toggleType('polyline')}
          >
            {t('map.selecting.polyline')}
          </Checkbox>
          <Checkbox
            title={t('map.selecting.sign-hint')}
            checked={provider.types.sign} onClick={() => toggleType('sign')}
          >
            {t('map.selecting.sign')}
          </Checkbox>
          <Checkbox
            title={t('map.selecting.label-hint')}
            checked={provider.types.label} onClick={() => toggleType('label')}
          >
            {t('map.selecting.label')}
          </Checkbox>
          <Checkbox
            title={t('map.selecting.field-hint')}
            checked={provider.types.field} onClick={() => toggleType('field')}
          >
            {t('map.selecting.field')}
          </Checkbox>
          <Checkbox
            title={t('map.selecting.layer-hint')}
            checked={provider.onlyActiveLayer} onClick={toggleOnlyActiveLayer}
          >
            {t('map.selecting.layer')}
          </Checkbox>
          <Checkbox
            title={t('map.selecting.pieslice-hint')}
            checked={provider.types.pieslice} onClick={() => toggleType('pieslice')}
          >
            {t('map.selecting.pieslice')}
          </Checkbox>
        </div>
      </div>
    </section>
  );
};
