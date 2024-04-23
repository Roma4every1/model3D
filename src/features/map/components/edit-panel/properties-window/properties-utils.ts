import { TFunction } from 'react-i18next';
import { FunctionComponent } from 'react';
import { fillPatterns } from 'shared/drawing';
import { polylineType } from '../../../lib/selecting-utils';
import { ColorPickerPaletteSettings, ColorPickerGradientSettings } from '@progress/kendo-react-inputs';
import lines from '../../../drawer/lines.json';


export interface PropertyWindowProps<T = MapElement> {
  element: T;
  apply: () => void;
  update: () => void;
  cancel: () => void;
  t: TFunction;
  isElementCreating: boolean;
}
export interface PropertyWindowConfig {
  component: FunctionComponent<PropertyWindowProps>;
  windowSize: [number, number];
}

/* --- Polyline Templates --- */

type StyleData = {key: number | string, style?: PolylineBorderStyle, borderStyle?: number};

let borderStyles = [5, 4, 3, 2, 1, 0].reverse().map(e => ({borderStyle: e, key: e}));
let borderStylesID = lines.BorderStyles[0].Element.map(e => ({style: e, key: e?.guid?._value}));
export const stylesData: StyleData[] = [...borderStyles, ...borderStylesID];

export function updateImg(polyline: MapPolyline): void {
  const back = polyline.transparent || !polyline.fillbkcolor
    ? 'none'
    : polylineType.bkcolor(polyline);
  polyline.fillStyle = fillPatterns.createFillStyle(polyline.fillname, polyline.fillcolor, back);
}

export const gradientSettings: ColorPickerGradientSettings = {opacity: false};

export const paletteSettings: ColorPickerPaletteSettings = {
  columns: 8,
  tileSize: { width: 32, height: 16 },
  palette: [
    '#ff8080', '#ffff80', '#80ff80', '#00ff80',
    '#80ffff', '#0080ff', '#ff80c0', '#ff80ff',

    '#ff0000', '#ffff00', '#80ff00', '#00ff40',
    '#00ffff', '#0080c0', '#8080c0', '#ff00ff',

    '#804040', '#ff8040', '#00ff00', '#008080',
    '#004080', '#8080ff', '#800040', '#ff0080',

    '#800000', '#ff8000', '#008000', '#008040',
    '#0000ff', '#0000a0', '#800080', '#8000ff',

    '#400000', '#804000', '#004000', '#004040',
    '#000080', '#000040', '#400040', '#400080',

    '#000000', '#808000', '#808040', '#808080',
    '#408080', '#c0c0c0', '#400040', '#ffffff',
  ],
};
