/** Отрисовщик каротажной диаграммы. */
interface ICaratDrawer {
  render(data: any): void
}

/* --- --- --- */

/**
 * Атрибуты тега <carat/>, данная структура должна добавляться в ответ
 * на запрос /getFormSettings для каротажной формы.
 * */
interface CaratSettings {
  metersInMeter: number,
  useStaticScale: boolean,
  mode: string, // example: "Carat"
  preferredInclChannelName: string,
  preferredPlastsChannelName: string,
}

/** carat > child client > caratColumn */
interface CaratColumn {
  type: string,
  columnSettings: Partial<CaratColumnSettings>,
  plugins: Partial<CaratColumnPlugins>,
}

/** carat > child client > caratColumn > columnSettings */
interface CaratColumnSettings {
  label: string,
  width: number,
  borderThickness: {top: number, left: number, bottom: number, right: number},
  index: number,
  margin: {top: number, left: number, bottom: number, right: number},
  visibleSubColumns: number,
  type: string,
  borderColor: string,
}

interface CaratColumnPlugins {
  zones: CaratZones,
  dataSelection: CaratDataSelection,
  channelSettings: any,
  channelCaratSettings: any,
}

/* --- Carat Plugins --- */

/** carat > child client > caratColumn > plugins > plugin > caratZones */
interface CaratZones {
  zones: string[][], // из zones массив zone[], из zone types массив string[]
}

/** carat > child client > caratColumn > plugins > plugin > caratDataSelection */
interface CaratDataSelection {
  start: string, // из атрибута date
  end: string,   // из атрибута date
  selection: {expression: string, isSelected: boolean}[] // массив
}
