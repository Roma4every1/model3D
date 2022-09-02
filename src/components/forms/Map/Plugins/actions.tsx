import { TFunction } from "react-i18next";
import { useCallback } from "react";
import { saveAs } from "@progress/kendo-file-saver";
import { jsPDF } from "jspdf";
import { Svg2pdfOptions } from "svg2pdf.js";
import "svg2pdf.js";
import C2S from "canvas2svg";

import { MapPanelHeader } from "./map-panel-header";
import { getFullViewport } from "../map-utils";


interface ActionsProps {
  mapState: MapState,
  saveMap: () => void,
  t: TFunction
}
interface MapActionProps {
  title: string,
  iconName: string,
  action: () => void,
  disabled?: boolean,
}


const MapAction = ({title, iconName, action, disabled}: MapActionProps) => {
  if (disabled === undefined) disabled = false;
  return (
    <button className={'k-button'} onClick={action} title={title} disabled={disabled}>
      <span className={`k-icon k-i-${iconName}`} />
    </button>
  );
}


export const Actions = ({mapState, saveMap, t}: ActionsProps) => {
  const { canvas, mapData, utils, isModified } = mapState;
  const layers = mapData?.layers;
  const mapName = mapData?.mapName;

  /** Центрировать карту. */
  const toFullViewPort = useCallback(() => {
    if (!canvas || !layers || !utils.updateCanvas) return;
    utils.updateCanvas(getFullViewport(layers, canvas));
  }, [canvas, layers, utils]);

  /** Экспортировать карту в PDF. */
  const exportToPDF = useCallback(() => {
    const viewport = getFullViewport(layers, canvas);
    const mockCtx = new C2S(canvas.width, canvas.height);

    mockCtx.width = canvas.width;
    mockCtx.height = canvas.height;
    mockCtx.clientWidth = canvas.clientWidth;
    mockCtx.clientHeight = canvas.clientHeight;
    utils.updateCanvas(viewport, mockCtx);

    const svg: SVGElement = mockCtx.getSvg();
    const dataUrl = 'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML);
    saveAs(dataUrl, mapName + '.svg');

    const doc = new jsPDF();
    const width = parseInt(svg.attributes['width'].value);
    const height = parseInt(svg.attributes['width'].value);
    const options: Svg2pdfOptions = {x: 0, y: 0, width, height};
    doc.svg(svg, options).then(() => {doc.save(mapName + '.pdf')});

    utils.updateCanvas();
  }, [canvas, utils, mapName, layers]);

  return (
    <section className={'map-actions'}>
      <MapPanelHeader text={t('map.actions.header')}/>
      <div className={'map-panel-main'}>
        <MapAction title={t('map.actions.show-all')} iconName={'select-all'} action={toFullViewPort} disabled={canvas?.blocked === true}/>
        <MapAction title={t('map.actions.export')} iconName={'file-pdf'} action={exportToPDF}/>
        <MapAction title={t('base.save')} iconName={'save'} action={saveMap} disabled={!isModified}/>
      </div>
    </section>
  );
};
