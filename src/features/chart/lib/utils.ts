import { useChartStore } from "../store/chart.store";

export function getParameterSettings(id: FormID, seriesId: string) {
  const state = useChartStore.getState()[id];
  if (state) {
    const settings = state.seriesSettings;
    for (const key in settings) {
      const seriesSettings = settings[key]?.seriesSettings;
      if (seriesSettings && Object.prototype.hasOwnProperty.call(seriesSettings, seriesId)) {
        return seriesSettings[seriesId];
      }
    }
  }
  return null;
}

export function getAxisSettings(id: FormID) {
  const state = useChartStore.getState()[id];

  if (state) {
    const settings = state.seriesSettings;

    for (const key in settings) {
      const axesSettings = settings[key]?.axesSettings;
      if (axesSettings) {
        const firstKey = Object.keys(axesSettings)[0];
        if (firstKey) {
          return axesSettings[firstKey];
        }
      }
    }
  }

  return null;
}
