import { TFunction } from 'react-i18next';
import { useState } from 'react';
import { Checkbox } from '@progress/kendo-react-inputs';
import { useTraceEditing } from 'entities/objects';
import selectingIcon from 'assets/map/selecting-mode.png';


interface SelectingProps {
  mapState: MapState;
  t: TFunction;
}


export const Selecting = ({mapState, t}: SelectingProps) => {
  const traceEditing = useTraceEditing();
  const [_signal, setSignal] = useState(false);
  const signal = () => setSignal(!_signal);

  const stage = mapState.stage;
  const select = stage.select;
  stage.listeners.selectPanelChange = signal;

  const selecting = stage.getSelecting();
  const toggleSelecting = () => stage.setSelecting(!selecting);

  const toggleSelectingDisabled = stage.inclinometryModeOn || stage.isElementEditing() ||
    stage.isElementCreating() || mapState.status !== 'ok' || traceEditing;

  const toggleType = (type: MapElementType) => {
    select.types[type] = !select.types[type];
    signal();
  };
  const toggleOnlyActiveLayer = () => {
    select.onlyActiveLayer = !select.onlyActiveLayer;
    signal();
  };

  return (
    <section className={'map-selecting'}>
      <div className={'menu-header'}>{t('map.selecting.header')}</div>
      <div className={'map-panel-main'}>
        <div>
          <button
            disabled={toggleSelectingDisabled}
            className={'map-panel-button' + (selecting ? ' active' : '')}
            onClick={toggleSelecting} title={t('map.selecting.button-hint')}
          >
            <img src={selectingIcon} alt={'selecting'}/>
          </button>
        </div>
        <div>
          <Checkbox
            label={t('map.selecting.polyline')} title={t('map.selecting.polyline-hint')}
            checked={select.types.polyline} onClick={() => toggleType('polyline')}
          />
          <Checkbox
            label={t('map.selecting.sign')} title={t('map.selecting.sign-hint')}
            checked={select.types.sign} onClick={() => toggleType('sign')}
          />
          <Checkbox
            label={t('map.selecting.label')} title={t('map.selecting.label-hint')}
            checked={select.types.label} onClick={() => toggleType('label')}
          />
          <Checkbox
            label={t('map.selecting.field')} title={t('map.selecting.field-hint')}
            checked={select.types.field} onClick={() => toggleType('field')}
          />
          <Checkbox
            label={t('map.selecting.layer')} title={t('map.selecting.layer-hint')}
            checked={select.onlyActiveLayer} onClick={toggleOnlyActiveLayer}
          />
        </div>
      </div>
    </section>
  );
};
