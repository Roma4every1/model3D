import type { TFunction } from 'react-i18next';
import type { MapState } from '../../lib/types';
import { jsPDF } from 'jspdf';
import { useEffect } from 'react';
import { useRender } from 'shared/react';
import { saveMap } from '../../store/map.thunks';
import { MapStage } from '../../lib/map-stage';
import { closeMapFieldValueWindow, showMapFieldValueWindow } from '../../store/map-window.actions';

import { MenuSection, BigButton, IconRow, IconRowButton } from 'shared/ui';
import { RadarChartOutlined } from '@ant-design/icons';
import saveMapIcon from 'assets/map/save-map.png';
import exportToPDFIcon from 'assets/map/pdf.png';
import measurerIcon from 'assets/map/distance-measurer.svg';


interface MapOtherSectionProps {
  state: MapState;
  t: TFunction;
}
interface MapFeatureButtonsProps {
  stage: MapStage;
  t: TFunction;
}

export const MapOtherSection = ({state, t}: MapOtherSectionProps) => {
  const { canvas, stage, status } = state;
  const mapData = stage.getMapData();

  const exportToPDF = () => {
    const format = [canvas.width, canvas.height];
    const doc = new jsPDF({unit: 'px', orientation: 'l', format});
    const imgData = canvas.toDataURL('image/png', 1.0);

    doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    if (mapData.date) doc.text(mapData.date, 5, 15);
    if (mapData.mapName) doc.save(mapData.mapName + '.pdf');
  };

  return (
    <MenuSection className={'big-buttons'} header={t('map.section-other.header')}>
      <MapFeatureButtons stage={stage} t={t}/>
      <BigButton
        text={t('map.section-other.export-pdf')} icon={exportToPDFIcon}
        onClick={exportToPDF} disabled={status !== 'ok' || !mapData}
      />
      <BigButton
        text={t('map.section-other.save')} icon={saveMapIcon}
        onClick={() => saveMap(state.id)}
        disabled={!state.edit || !state.edit.modified}
      />
    </MenuSection>
  );
};

const MapFeatureButtons = ({stage, t}: MapFeatureButtonsProps) => {
  const render = useRender();

  useEffect(() => {
    stage.subscribe('mode', render);
    return () => stage.unsubscribe('mode', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFieldValueMode = () => {
    if (stage.getMode() !== 'show-field-value') {
      showMapFieldValueWindow(stage);
      stage.setMode('show-field-value');
    } else {
      closeMapFieldValueWindow();
    }
    render();
  };

  const fieldActive = stage.getMode() === 'show-field-value';
  const fieldDisabled = stage.hasExtraObject('incl') || (!fieldActive && !mapHasFields(stage));

  return (
    <IconRow className={'map-feature-buttons'}>
      <IconRowButton
        icon={measurerIcon} title={t('map.section-other.distance-measurer-hint')}
        active={false} disabled={true}
      />
      <IconRowButton
        icon={<RadarChartOutlined/>} title={t('map.section-other.field-value-hint')}
        active={fieldActive} onClick={toggleFieldValueMode} disabled={fieldDisabled}
      />
    </IconRow>
  );
};

function mapHasFields(stage: MapStage): boolean {
  const data = stage.getMapData();
  return data && data.layers.some(l => l.elementType === 'field');
}
