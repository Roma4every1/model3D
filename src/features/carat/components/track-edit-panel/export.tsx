import type { DialogProps } from '@progress/kendo-react-dialogs';
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
  const style = {width: 72};
  const disabled = stage.getActiveTrack().constructionMode;

  const openExportDialog = () => {
    const onClose = () => closeWindow('carat-export');
    const dialogProps: DialogProps = {title: t('carat.export-png'), width: 320, height: 170, onClose};
    const content = <CaratExportDialog stage={stage} close={onClose}/>;
    showDialog('carat-export', dialogProps, content);
  };

  const exportToExcel = () => {
    caratToExcel(stage).then(file => saveFile('carat.xlsx', file)).catch();
  };

  return (
    <MenuSection header={t('carat.export')} className={'big-buttons'}>
      <BigButton
        text={t('carat.export-png')} icon={pngExportIcon} style={style}
        onClick={openExportDialog} disabled={disabled}
      />
      <BigButton
        text={t('carat.export-excel')} icon={excelExportIcon} style={style}
        onClick={exportToExcel} disabled={disabled}
      />
    </MenuSection>
  );
};
