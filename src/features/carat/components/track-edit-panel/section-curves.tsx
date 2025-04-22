import type { WindowProps } from '@progress/kendo-react-dialogs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRender } from 'shared/react';
import { MenuSection, BigButton } from 'shared/ui';
import { showWindow, closeWindow } from 'entities/window';

import { CaratLoader } from '../../lib/loader';
import { CaratStage } from '../../rendering/stage';
import { CurveSelectionWindow } from '../windows/curve-selection';
import { ZoneEditWindow } from '../windows/zone-editor';

import curvesIcon from 'assets/carat/curves.svg';
import curveZonesIcon from 'assets/carat/curve-zones.svg';


interface CaratCurveSectionProps {
  id: FormID;
  stage: CaratStage;
  loader: CaratLoader;
}


export const CaratCurveSection = ({id, stage, loader}: CaratCurveSectionProps) => {
  const { t } = useTranslation();
  const render = useRender();

  useEffect(() => {
    stage.subscribe('track', render);
    return () => stage.unsubscribe('track', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const curveGroup = stage.getActiveTrack().getCurveGroup();
  const enableSelection = curveGroup && loader.separateCurveLoading;

  return (
    <MenuSection header={t('carat.curve-manage')} className={'big-buttons'}>
      <BigButton
        text={t('carat.selection.button')} icon={curvesIcon}
        onClick={openCurveSelectionWindow} disabled={!enableSelection}
      />
      <BigButton
        text={t('carat.zones.button')} icon={curveZonesIcon}
        onClick={openZonesEditingWindow}
      />
    </MenuSection>
  );
};
