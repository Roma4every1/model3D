/** Создаёт состояние графика по настройкам. */
export function settingsToChartState(settings: ChartFormSettings): ChartState {
  const seriesSettingsKeys = Object.keys(settings.seriesSettings);
  const firstSeries = settings.seriesSettings[seriesSettingsKeys[0]];

  return {
    seriesSettings: settings.seriesSettings,
    dateStep: firstSeries?.dateStep === 'Month' ? 'month' : 'year',
    tooltip: false,
  };
}
