import { useChartStore } from "./chart.store";
import { settingsToChartState } from "../lib/initialization";
import { getParameterSettings } from "../lib/utils";

/** Добавить новое состояние графика. */
export function createChartState(payload: FormStatePayload): void {
  const { id, settings, channels } = payload.state;
  useChartStore.setState({ [id]: settingsToChartState(settings, channels) });
}

/** Установить шаг по времени для графика. */
export function setChartDateStep(id: FormID, step: ChartDateStep): void {
  const state = useChartStore.getState()[id];
  useChartStore.setState({ [id]: { ...state, dateStep: step } });
}

/** Установить видимость окошка со значениями для графика. */
export function setChartTooltipVisibility(id: FormID, visibility: boolean): void {
  const state = useChartStore.getState()[id];
  useChartStore.setState({ [id]: { ...state, tooltip: visibility } });
}

/** Установить выбранный элемент графика */
export function setSelectedSeries(id: FormID, parameter: string): void {
  const state = useChartStore.getState()[id];
  useChartStore.setState({ [id]: { ...state, selectedSeries: parameter } });
}

// Хранит удаленные параметры
let removedParameters: Record<string, SeriesSettingsItem> = {};

/** Установить видимость элементов */
export function setElementVisible(id: FormID, propertyName: PropertyName, channelName: ChannelName, visible: boolean): void {
  const state = useChartStore.getState()[id];
  const { seriesSettings } = state;
  const parameterToUpdate = seriesSettings[channelName].seriesSettings[propertyName];
  // Обновляем свойства с новой видимостью
  const properties = state.properties.map((property) => ({
    ...property,
    visible: property.propertyName === propertyName ? visible : property.visible,
  }));
  // Обновляем seriesSettings
  const updatedSeriesSettings = {
    ...seriesSettings,
    [channelName]: {
      ...seriesSettings[channelName],
      seriesSettings: {
        ...seriesSettings[channelName].seriesSettings,
        // Если видимостьменяется, обновляем параметры
        [propertyName]: visible ? removedParameters[propertyName] || parameterToUpdate : undefined,
      },
    },
  };

  // Управляем removedParameters
  if (visible) {
    delete removedParameters[propertyName];
  } else {
    removedParameters[propertyName] = parameterToUpdate;
  }

  useChartStore.setState({[id]: {...state, properties, seriesSettings: updatedSeriesSettings }});
}

/** Установить настройки активного элемента */
export function setChartSeriesSettings(id: FormID, seriesId: string, newSettings: Partial<SeriesSettingsItem>): void {
  const state = useChartStore.getState()[id];
  const currentSeriesSettings = getParameterSettings(id, seriesId);
  const updatedSettings = { ...currentSeriesSettings, ...newSettings };
  const updatedSeriesSettings = updateSeriesSettings(state, seriesId, updatedSettings);

  useChartStore.setState({ [id]: { ...state, seriesSettings: updatedSeriesSettings } });
}

/** Установить настройки оси Y. */
export function setAxisSettings(id: string, parameters: Partial<AxisSettings>): void {
  const state = useChartStore.getState()[id];
  const updatedAxisSettings = updateAxisSettings(state, parameters);
  useChartStore.setState({ [id]: { ...state, seriesSettings: updatedAxisSettings } });
}


// Обновление настроек SeriesSettings для всех каналов
function updateSeriesSettings(state: any, seriesId: string, updatedSettings: SeriesSettingsItem) {
  return Object.keys(state.seriesSettings).reduce((acc, key) => {
    if (state.seriesSettings[key]?.seriesSettings?.[seriesId]) {
      acc[key] = {
        ...state.seriesSettings[key],
        seriesSettings: {
          ...state.seriesSettings[key].seriesSettings,
          [seriesId]: updatedSettings,
        },
      };
    } else {
      acc[key] = state.seriesSettings[key];
    }
    return acc;
  }, {});
}

// Обновление настроек осей для всех каналов
function updateAxisSettings(state: any, updatedParameters: Partial<AxisSettings>) {
  return Object.keys(state.seriesSettings).reduce((acc, key) => {
    const currentAxesSettings = state.seriesSettings[key]?.axesSettings;
    if (currentAxesSettings) {
      acc[key] = {
        ...state.seriesSettings[key],
        axesSettings: {
          ...currentAxesSettings,
          [Object.keys(currentAxesSettings)[0]]: {
            ...currentAxesSettings[Object.keys(currentAxesSettings)[0]],
            ...updatedParameters,
          },
        },
      };
    } else {
      acc[key] = state.seriesSettings[key];
    }
    return acc;
  }, {});
}
