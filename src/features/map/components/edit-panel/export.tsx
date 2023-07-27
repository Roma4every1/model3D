import { TFunction } from 'react-i18next';
import { MenuSection, BigButton } from 'shared/ui';
import { jsPDF } from 'jspdf';
import pdfIcon from 'assets/images/map/pdf.png';


interface ActionsProps {
  mapState: MapState,
  t: TFunction
}


export const Export = ({mapState, t}: ActionsProps) => {
  const { canvas, mapData } = mapState;

  const exportToPDF = () => {
    const format = [canvas.width, canvas.height];
    const doc = new jsPDF({unit: 'px', orientation: 'l', format});
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
        action={exportToPDF} disabled={!mapState?.isLoadSuccessfully}
      />
    </MenuSection>
  );
};
