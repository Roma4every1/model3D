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
  plugins: any[], // массив плагинов,
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
