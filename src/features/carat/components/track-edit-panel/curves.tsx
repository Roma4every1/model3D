import type { WindowProps } from '@progress/kendo-react-dialogs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuSection, BigButton } from 'shared/ui';
import { showWindow, closeWindow } from 'entities/window';

import { CaratStage } from '../../rendering/stage';
import { CurveSelectionWindow } from '../windows/curve-selection';
import { ZoneEditWindow } from '../windows/zone-editor';

import curvesIcon from 'assets/images/carat/curves.svg';
import curveZonesIcon from 'assets/images/carat/curve-zones.svg';


interface CaratCurvesPanelProps {
  id: FormID;
  stage: CaratStage;
}


export const CaratCurveSection = ({id, stage}: CaratCurvesPanelProps) => {
  const { t } = useTranslation();
  const [trackIndex, setTrackIndex] = useState(stage.getActiveIndex());
  const curveGroup = stage.getTrack(trackIndex).getCurveGroup();

  useEffect(() => {
    stage.subscribe('track', setTrackIndex);
    return () => stage.unsubscribe('track', setTrackIndex);
  }, [stage]);

  const openCurveSelectionWindow = () => {
    const windowID = 'curve-selection';
    const onClose = () => closeWindow(windowID);
    const content = <CurveSelectionWindow id={id} stage={stage} onClose={onClose}/>;

    const windowProps: WindowProps = {
      title: t('carat.selection.window-title', {well: stage.getActiveTrack().wellName}),
      width: 720, height: 480, resizable: false, style: {zIndex: 99},
      onClose, maximizeButton: () => null,
    };
    showWindow(windowID, windowProps, content);
  };

  const openZonesEditingWindow = () => {
    const windowID = 'curve-zones';
    const onClose = () => closeWindow(windowID);
    const content = <ZoneEditWindow stage={stage} onClose={onClose}/>;

    const windowProps: WindowProps = {
      title: t('carat.zones.window-title'), maximizeButton: () => null,
      width: 720, height: 480, resizable: false, style: {zIndex: 99}, onClose,
    };
    showWindow(windowID, windowProps, content);
  };

  return (
    <MenuSection header={t('carat.curve-manage')} className={'big-buttons'}>
      <BigButton
        text={t('carat.selection.button')} icon={curvesIcon}
        action={openCurveSelectionWindow} disabled={!curveGroup}
      />
      <BigButton
        text={t('carat.zones.button')} icon={curveZonesIcon}
        action={openZonesEditingWindow}
      />
    </MenuSection>
  );
};
