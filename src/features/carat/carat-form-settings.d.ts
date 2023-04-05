/** Ответ `/getFormSettings` для каротажной формы. */
interface CaratFormSettings {
  settings: CaratSettings,
  columns: CaratColumn[],
}

/** Атрибуты тега <carat/>. */
interface CaratSettings {
  metersInMeter: number,
  useStaticScale: boolean,
  strataChannelName: string | null,
}

/** carat > child client > caratColumn */
interface CaratColumn {
  type: 'Normal' | 'Background' | 'External',
  settings: CaratColumnSettings,
  axis: CaratColumnAxisSettings | null,
  channels: CaratColumnChannel[],
  zones: CaratZones | null,
  selection: CaratDataSelection | null,
  plugins: Record<ChannelName, Partial<CaratColumnPlugins>>,
  active?: boolean,
}

/** carat > child client > caratColumn > columnSettings */
interface CaratColumnSettings {
  label: string,
  width: number,
  index: number,
}

interface CaratColumnAxisSettings {
  show: boolean,
  step: number,
  grid: boolean,
  absMarks: boolean,
  depthMarks: boolean,
}

/** carat > child client > caratColumn > plugins > plugin > caratZones */
type CaratZones = string[][]; // из zones массив zone[], из zone types массив string[]

/** carat > child client > caratColumn > plugins > plugin > caratDataSelection */
interface CaratDataSelection {
  start: string, // из атрибута date
  end: string,   // из атрибута date
  selection: {expression: string, isSelected: boolean}[] // массив
}

/** carat > child client > caratColumn > attachedChannels */
interface CaratColumnChannel {
  name: ChannelName,
  attachOption: AttachOptionType,
  exclude: string[] | null,
}

/* --- Carat Plugins --- */

interface CaratColumnPlugins {
  channelSettings: CaratChannelCaratSettings | null,
  properties: CaratColumnProperties | null,
}

interface CaratChannelCaratSettings {
  showVGrid: boolean,
  numberOfMarks: number,
}

type CaratColumnProperties = Record<string, CaratPropertySettings>;

interface CaratPropertySettings {
  text: CaratTextPropertySettings | null,
  bar: CaratBarPropertySettings | null,
}

interface CaratTextPropertySettings {
  show: boolean,
  color: string,
  backgroundColor: string,
  fontSize: number,
  angle: number,
}

interface CaratBarPropertySettings {
  show: boolean,
  alignment: string,
  maxFixedValue: number | null,
  externalBorderColor: string,
}
