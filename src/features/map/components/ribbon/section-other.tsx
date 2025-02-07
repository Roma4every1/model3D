import type { TFunction } from 'react-i18next';
import type { MapState } from '../../lib/types';
import { jsPDF } from 'jspdf';
import { useEffect } from 'react';
import { useRender } from 'shared/react';
import { MapStage } from '../../lib/map-stage';
import { DefaultModeProvider } from '../../modes';
import { saveMap } from '../../store/map.thunks';
import { MenuSection, BigButton, IconRow, IconRowButton } from 'shared/ui';
import { AlignCenterOutlined, RadarChartOutlined } from '@ant-design/icons';
import saveMapIcon from 'assets/map/save-map.png';
import exportToPDFIcon from 'assets/map/pdf.png';


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
  const provider = stage.getModeProvider('default') as DefaultModeProvider;

  useEffect(() => {
    stage.subscribe('mode', render);
    return () => stage.unsubscribe('mode', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLabelOffset = () => {
    provider.offsetLabels = !provider.offsetLabels;
    stage.render(); render();
  };
  const toggleFieldValueMode = () => {
    // ...
  };
  const canToggleFieldValueMode = stage.getMapData()?.layers.some(l => l.elementType === 'field');

  return (
    <IconRow className={'map-feature-buttons'}>
      <IconRowButton
        icon={<AlignCenterOutlined/>} title={t('map.section-other.label-offset-hint')}
        onClick={toggleLabelOffset} active={provider.offsetLabels}
        disabled={stage.getModeProvider() !== provider}
      />
      <IconRowButton
        icon={<RadarChartOutlined/>} title={t('map.section-other.field-value-hint')}
        onClick={toggleFieldValueMode} disabled={!canToggleFieldValueMode}
      />
    </IconRow>
  );
};
