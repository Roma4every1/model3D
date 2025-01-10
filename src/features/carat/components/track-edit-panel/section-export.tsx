import { useTranslation } from 'react-i18next';
import { saveFile } from 'shared/lib';
import { closeWindow, showDialog } from 'entities/window';
import { CaratStage } from '../../rendering/stage';
import { caratToExcel } from '../../lib/excel-export';

import { BigButton, MenuSection } from 'shared/ui';
import { CaratExportDialog } from '../windows/carat-export';
import pngExportIcon from 'assets/carat/export-png.svg';
import excelExportIcon from 'assets/carat/export-excel.svg';


export const CaratExportSection = ({stage}: {stage: CaratStage}) => {
  const { t } = useTranslation();
  const constructionMode = stage.getActiveTrack().constructionMode;

  const openDialog = (format: 'png' | 'excel') => {
    const onClose = () => closeWindow('carat-export');
    const title = t('carat.export-' + format);
    const content = <CaratExportDialog stage={stage} close={onClose} format={format}/>;
    showDialog('carat-export', {title, width: 320, height: 'min-content', onClose}, content);
  };

  const exportToPng = () => {
    if (constructionMode) {
      stage.renderImage().toBlob((data: Blob) => {
        if (data) saveFile('carat.png', data);
      }, 'image/png', 1);
    } else {
      openDialog('png');
    }
  };

  const exportToExcel = () => {
    if (constructionMode) {
      const save = (data: Blob) => saveFile('carat.xlsx', data);
      caratToExcel(stage.renderImage(), stage.getActiveTrack().wellName).then(save).catch();
    } else {
      openDialog('excel');
    }
  };

  return (
    <MenuSection header={t('carat.export')} className={'big-buttons'}>
      <BigButton
        text={t('carat.export-png')} icon={pngExportIcon} style={{width: 72}}
        onClick={exportToPng}
      />
      <BigButton
        text={t('carat.export-excel')} icon={excelExportIcon} style={{width: 72}}
        onClick={exportToExcel}
      />
    </MenuSection>
  );
};
