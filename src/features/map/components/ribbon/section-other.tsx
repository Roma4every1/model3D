import type { TFunction } from 'react-i18next';
import type { WindowProps } from '@progress/kendo-react-dialogs';
import type { MapState } from '../../lib/types';
import { jsPDF } from 'jspdf';
import { createElement, useEffect } from 'react';
import { useRender } from 'shared/react';
import { showWindow, closeWindow } from 'entities/window';
import { saveMap } from '../../store/map.thunks';
import { MapStage } from '../../lib/map-stage';
import { DefaultModeProvider, FieldValueModeProvider } from '../../modes';

import { MenuSection, BigButton, IconRow, IconRowButton } from 'shared/ui';
import { AlignCenterOutlined, RadarChartOutlined } from '@ant-design/icons';
import { FieldValueWindow } from './field-value';
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
  const defaultProvider = stage.getModeProvider('default') as DefaultModeProvider;
  const fieldProvider = stage.getModeProvider('show-field-value') as FieldValueModeProvider;

  useEffect(() => {
    stage.subscribe('mode', render);
    return () => stage.unsubscribe('mode', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLabelOffset = () => {
    defaultProvider.offsetLabels = !defaultProvider.offsetLabels;
    stage.render(); render();
  };

  const toggleFieldValueMode = () => {
    const windowID = 'map-field-value';
    const onClose = () => {
      fieldProvider.updateWindow = null;
      closeWindow(windowID);
      stage.setMode('default');
    };
    if (stage.getMode() === 'show-field-value') {
      onClose();
    } else {
      let layer = fieldProvider.getLayer();
      if (!layer) {
        layer = stage.getMapData().layers.find(l => l.elementType === 'field');
        fieldProvider.setLayer(layer);
      }
      if (!layer.visible) {
        layer.visible = true;
        stage.setActiveLayer(layer as any);
        stage.render();
      }
      const windowProps: WindowProps = {
        style: {zIndex: 99}, className: 'field-value-window',
        width: 286, height: 241, resizable: false,
        title: t('map.field-value.title'), maximizeButton: () => null, onClose,
      };
      const window = createElement(FieldValueWindow, {stage, provider: fieldProvider, t});
      showWindow(windowID, windowProps, window);
      stage.setMode('show-field-value');
    }
    render();
  };

  return (
    <IconRow className={'map-feature-buttons'}>
      <IconRowButton
        icon={<AlignCenterOutlined/>} title={t('map.section-other.label-offset-hint')}
        onClick={toggleLabelOffset} active={defaultProvider.offsetLabels}
        disabled={stage.getModeProvider() !== defaultProvider}
      />
      <IconRowButton
        icon={<RadarChartOutlined/>} title={t('map.section-other.field-value-hint')}
        active={stage.getMode() === 'show-field-value'} onClick={toggleFieldValueMode}
        disabled={!stage.getMapData()?.layers.some(l => l.elementType === 'field')}
      />
    </IconRow>
  );
};
