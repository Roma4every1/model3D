import { TFunction } from 'react-i18next';
import { MenuSection, BigButton } from '../../../common/menu-ui';
import 'svg2pdf.js';
import C2S from 'canvas2svg';
import { jsPDF } from 'jspdf'
import pdfIcon from '../../../..//assets/images/map/pdf.png';


interface ActionsProps {
  mapState: MapState,
  t: TFunction
}


export const Export = ({mapState, t}: ActionsProps) => {
  const { canvas, mapData, utils } = mapState;

  const exportToPDF = () => {
    const doc = new jsPDF({unit: 'px', orientation: 'l', format: [canvas.width, canvas.height + 25]});
    const mapName = mapData?.mapName || 'Map', date = mapData?.date || '';
    const mockCtx = new C2S(canvas.width, canvas.height);

    mockCtx.width = canvas.width;
    mockCtx.height = canvas.height;
    mockCtx.clientWidth = canvas.clientWidth;
    mockCtx.clientHeight = canvas.clientHeight;

    utils.updateCanvas(null, mockCtx);
    utils.updateCanvas();

    doc.text(date, 5, 15);
    doc.svg(mockCtx.getSvg(), {x: 0, y: 25}).then(() => {doc.save(mapName + '.pdf')});
  };

  return (
    <MenuSection header={t('map.actions.header')} className={'map-actions'}>
      <BigButton text={t('map.actions.export')} icon={pdfIcon} action={exportToPDF}/>
    </MenuSection>
  );
};
