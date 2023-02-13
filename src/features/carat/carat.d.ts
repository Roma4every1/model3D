// /** Отрисовщик каротажной диаграммы. */
// interface ICaratDrawer {
//   render(data: any): void
// }
//
// /* --- --- --- */
//
// type CaratsState = FormDict<CaratState>;
//
// /** Состояние каротажа.
//  * + `settings` — настройки
//  * + `columns` — колонки
//  * + `canvas` — элемент холста
//  * + `drawer` — отрисовщик
//  * */
// interface CaratState {
//   settings: CaratSettings,
//   columns: CaratColumn[],
//   canvas: HTMLCanvasElement,
//   drawer: ICaratDrawer,
// }
//
// /**
//  * Данная структура должна добавляться в ответ
//  * на запрос `/getFormSettings` для каротажной формы
//  * */
// interface CaratSettingsResponse {
//   settings: CaratSettings,
//   columns: CaratColumn[],
// }
//
// /** Атрибуты тега <carat/>. */
// interface CaratSettings {
//   metersInMeter: number,
//   useStaticScale: boolean,
//   mode: string,
//   preferredInclChannelName: string,
//   preferredPlastsChannelName: string,
// }
//
// /** carat > child client > caratColumn */
// interface CaratColumn {
//   type: string,
//   zones?: CaratZones,
//   columnSettings: Partial<CaratColumnSettings>,
//   plugins: Record<ChannelName, Partial<CaratColumnPlugins>>,
// }
//
// /** carat > child client > caratColumn > plugins > plugin > caratZones */
// type CaratZones = CaratZone[];
//
// interface CaratZone {
//   relativeWidth?: number,
//   types: string[],
// }
//
// /** carat > child client > caratColumn > columnSettings */
// interface CaratColumnSettings {
//   label: string,
//   width: number,
//   borderThickness: {top: number, left: number, bottom: number, right: number},
//   index: number,
//   margin: {top: number, left: number, bottom: number, right: number},
//   visibleSubColumns: number,
//   subColumnBorderSize: number,
//   type: string,
//   borderColor: string,
//   showDepthMarks: boolean,
//   showAbsMarks: boolean,
//   showAxis: boolean,
//   showGrid: boolean,
//   axisDisplaySettings: {zOrder: number, step: number, heightGrid: number},
// }
//
// interface CaratColumnPlugins {
//   dataSelection: CaratDataSelection,
//   channelSettings: CaratChannelSettings,
//   channelCaratSettings: CaratChannelCaratSettings,
// }
//
// /* --- Carat Plugins --- */
//
// /** carat > child client > caratColumn > plugins > plugin > caratDataSelection */
// interface CaratDataSelection {
//   isCurveSelectingHidden: boolean,
//   start: string, // из атрибута date
//   end: string,   // из атрибута date
//   selection: {expression: string, isSelected: boolean}[] // массив
// }
//
// type CaratChannelSettings = any;
//
// /** carat > child client > caratColumn > plugins > plugin > caratChannelCaratSettings */
// interface CaratChannelCaratSettings {
//   displaySettings: {
//     isConstructionMode: boolean,
//     showAbsMarks: boolean,
//     showDepthMarks: boolean,
//     zOrder: number,
//     axisHeight: number,
//     numberOfMarks: number,
//     showVGrid: boolean,
//   },
// }
