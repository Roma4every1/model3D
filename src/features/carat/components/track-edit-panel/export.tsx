import type { DialogProps } from '@progress/kendo-react-dialogs';
import { useTranslation } from 'react-i18next';
import { closeWindow, showDialog } from 'entities/window';
import { CaratStage } from '../../rendering/stage';
import { saveFile } from 'shared/lib';
import { caratToExcel } from '../../lib/excel-export';

import { BigButton, MenuSection } from 'shared/ui';
import { CaratExportDialog } from '../windows/carat-export';
import pngExportIcon from 'assets/carat/export-png.svg';
import excelExportIcon from 'assets/carat/export-excel.svg';


export const CaratExportSection = ({stage}: {stage: CaratStage}) => {
  const { t } = useTranslation();
  const style = {width: 72};
  const constructionMode = stage.getActiveTrack().constructionMode;
  const wellName = stage.getActiveTrack().wellName;

  const openExportDialog = () => {
    const onClose = () => closeWindow('carat-export');
    const dialogProps: DialogProps = {title: t('carat.export-png'), width: 320, height: 'min-content', onClose};
    const content = <CaratExportDialog stage={stage} close={onClose} format='png'/>;
    showDialog('carat-export', dialogProps, content);
  };

  const openExportExcel = () => {
    const onClose = () => closeWindow('carat-export');
    const dialogProps: DialogProps = {title: t('carat.export-excel'), width: 320, height: 'min-content', onClose};
    const content = <CaratExportDialog stage={stage} close={onClose} format='excel'/>;
    showDialog('carat-export', dialogProps, content);
  };

  const exportToPng = () => constructionMode ? caratToPng(stage) : openExportDialog();
  const exportToExcel = () => constructionMode ?
    caratToExcel(stage.renderImage(), wellName).then(file => saveFile('carat.xlsx', file)).catch()
    : openExportExcel();

  return (
    <MenuSection header={t('carat.export')} className={'big-buttons'}>
      <BigButton
        text={t('carat.export-png')} icon={pngExportIcon} style={style}
        onClick={exportToPng}
      />
      <BigButton
        text={t('carat.export-excel')} icon={excelExportIcon} style={style}
        onClick={exportToExcel}
      />
    </MenuSection>
  );
};

function caratToPng(stage: CaratStage) {
  const canvas = stage.renderImage();
  canvas.toBlob((data: Blob) => {
    if (data) saveFile('carat.png', data);
  }, 'image/png', 1);
};
