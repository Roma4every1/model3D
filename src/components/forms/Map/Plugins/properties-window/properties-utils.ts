import lines from "../../lines.json";
import parseColor from "parse-color";
import { polylineType } from "../selecting/selecting-utils";
import { ColorPickerPaletteSettings } from "@progress/kendo-react-inputs";


export interface InitLabelState {
  text: string,
  color: string,
  fontSize: number,
  hAlignment: MapLabelAlignment,
  vAlignment: MapLabelAlignment,
  xOffset: number,
  yOffset: number,
  angle: number,
  transparent: boolean,
}

export interface InitPolylineState {
  legend: any,
  closed: boolean,
  transparent: boolean,
  borderWidth: number,
  style: PolylineBorderStyle,
  borderColor: string,
  borderStyle: number,
  borderStyleID: string,
  fillName: any,
  fillColor: string,
  fillBackColor: string,
}

/* --- Polyline Templates --- */

type StyleData = {key: number | string, style?: PolylineBorderStyle, borderStyle?: number};

let borderStyles = [5, 4, 3, 2, 1, 0].reverse().map(e => ({borderStyle: e, key: e}));
let borderStylesID = lines.BorderStyles[0].Element.map(e => ({style: e, key: e?.guid?._value}));
export const stylesData: StyleData[] = [...borderStyles, ...borderStylesID];

let gridTemplates = new Array(30).fill(null).map((x, i) => 'grids-' + i);
let litTemplates = new Array(27).fill(null).map((x, i) => 'lit-' + i);
let halfToneTemplates = new Array(9).fill(null).map((x, i) => 'halftone-' + (i * 8));
export const templatesData: string[] = ['', ...gridTemplates, ...litTemplates, ...halfToneTemplates];

/* --- Label Properties --- */

/** Создание начального состояния подписи. */
export const createLabelInit = (label: MapLabel): InitLabelState => {
  return {
    text: label.text, color: label.color, fontSize: label.fontsize,
    xOffset: label.xoffset, yOffset: label.yoffset,
    hAlignment: label.halignment, vAlignment: label.valignment,
    angle: label.angle, transparent: label.transparent,
  };
};

/** Откат изменённой подписи в начальное состояние. */
export const rollbackLabel = (label: MapLabel, init: InitLabelState): void => {
  label.text = init.text;
  label.color = init.color;
  label.fontsize = init.fontSize;
  label.xoffset = init.xOffset;
  label.yoffset = init.yOffset;
  label.halignment = init.hAlignment;
  label.valignment = init.vAlignment;
  label.angle = init.angle;
  label.transparent = init.transparent;
};

/* --- Polyline Properties --- */

export const updateImg = async (polyline: MapPolyline) => {
  if (!polyline.fillname || !polyline.fillcolor) return;
  const backColor = polyline.transparent || !polyline.fillbkcolor
    ? 'none'
    : polylineType.bkcolor(polyline);
  polyline.img = await polylineType.getPattern(polyline.fillname, polyline.fillcolor, backColor)
};

/** Создание начального состояния линии. */
export const createPolylineInit = (polyline: MapPolyline): InitPolylineState => {
  return {
    legend: polyline.legend,
    closed: polyline.arcs[0].closed,
    transparent: polyline.transparent,
    style: polyline.style ? JSON.parse(JSON.stringify(polyline.style)): undefined,
    borderWidth: polyline.borderwidth,
    borderStyle: polyline.borderstyle,
    borderStyleID: polyline.borderstyleid,
    borderColor: polyline.bordercolor,
    fillName: polyline.fillname,
    fillColor: polyline.fillcolor,
    fillBackColor: polyline.fillbkcolor,
  };
};

/** Откат изменённой линии в начальное состояние. */
export const rollbackPolyline = async (polyline: MapPolyline, init: InitPolylineState) => {
  polyline.arcs[0].closed = init.closed;
  polyline.transparent = init.transparent;
  polyline.borderwidth = init.borderWidth;
  polyline.borderstyle = init.borderStyle;
  polyline.borderstyleid = init.borderStyleID;
  polyline.bordercolor = init.borderColor;
  polyline.fillname = init.fillName;
  polyline.fillcolor = init.fillColor;
  polyline.fillbkcolor = init.fillBackColor;
  polyline.legend = init.legend;
  polyline.style = init.style;
  await updateImg(polyline);
};

export const applyLegend = (polyline: MapPolyline, legend: any): void => {
  legend.properties.forEach(p => {
    switch (p.name) {
      case "BorderStyle":
        polyline.borderstyle = Number(p.value.replace(',', '.'));
        polyline.borderstyleid = undefined;
        break;
      case "BorderStyleId":
        polyline.borderstyle = undefined;
        polyline.borderstyleid = p.value;
        break;
      case "Closed":
        polyline.arcs[0].closed = p.value === 'True';
        break;
      case "FillBkColor":
        polyline.fillbkcolor = parseColor('#' + (p.value.slice(-6))).hex;
        break;
      case "FillColor":
        polyline.fillcolor = parseColor('#' + (p.value.slice(-6))).hex;
        break;
      case "FillName":
        polyline.fillname = p.value;
        break;
      case "StrokeColor":
        polyline.bordercolor = parseColor('#' + (p.value.slice(-6))).hex;
        break;
      case "StrokeThickness":
        polyline.borderwidth = Number(p.value.replace(',', '.'));
        break;
      case "Transparency":
        polyline.transparent = p.value !== 'Nontransparent';
        break;
      default: break;
    }
  });
}

export const paletteSettings: ColorPickerPaletteSettings = {
  columns: 8,
  tileSize: { width: 32, height: 16 },
  palette: [
    "#ff8080",
    "#ffff80",
    "#80ff80",
    "#00ff80",
    "#80ffff",
    "#0080ff",
    "#ff80c0",
    "#ff80ff",

    "#ff0000",
    "#ffff00",
    "#80ff00",
    "#00ff40",
    "#00ffff",
    "#0080c0",
    "#8080c0",
    "#ff00ff",

    "#804040",
    "#ff8040",
    "#00ff00",
    "#008080",
    "#004080",
    "#8080ff",
    "#800040",
    "#ff0080",

    "#800000",
    "#ff8000",
    "#008000",
    "#008040",
    "#0000ff",
    "#0000a0",
    "#800080",
    "#8000ff",

    "#400000",
    "#804000",
    "#004000",
    "#004040",
    "#000080",
    "#000040",
    "#400040",
    "#400080",

    "#000000",
    "#808000",
    "#808040",
    "#808080",
    "#408080",
    "#c0c0c0",
    "#400040",
    "#ffffff",
  ],
};
