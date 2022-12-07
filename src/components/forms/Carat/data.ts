/** carat > child client > caratColumn */
interface CaratColumn {
  type: string,
  columnSettings: CaratColumnSettings,
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

export const caratData: CaratColumn[] = [

];
