import { TFunction } from 'react-i18next';
import { MenuSection, BigButton } from 'shared/ui';
import { jsPDF } from 'jspdf';
import pdfIcon from 'assets/map/pdf.png';


interface ExportSectionProps {
  state: MapState;
  t: TFunction;
}


export const Export = ({state, t}: ExportSectionProps) => {
  const { canvas, stage, status } = state

  const exportToPDF = () => {
    const format = [canvas.width, canvas.height];
    const doc = new jsPDF({unit: 'px', orientation: 'l', format});

    const mapData = stage.getMapData();
    const mapName = mapData?.mapName || 'Map', date = mapData?.date || '';

    const imgData = canvas.toDataURL('image/png', 1.0);
    doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    doc.text(date, 5, 15);
    doc.save(mapName + '.pdf')
  };

  return (
    <MenuSection header={t('map.actions.header')} className={'map-actions'}>
      <BigButton
        text={t('map.actions.export')} icon={pdfIcon}
        onClick={exportToPDF} disabled={status !== 'ok'}
      />
    </MenuSection>
  );
};
