/** Создаёт состояние графика по настройкам. */
export function settingsToChartState(
  settings: ChartFormSettings,
  channels: AttachedChannel[]
): ChartState {
  const seriesSettingsKeys = Object.keys(settings.seriesSettings);
  const firstSeries = settings.seriesSettings[seriesSettingsKeys[0]];

  const properties: ChartProperty[] = [];
  for (const channel of channels) {
    for (const property of channel.attachedProperties) {
      properties.push({
        id: properties.length,
        title: property.displayName,
        visible: true,
        channelName: channel.name,
        propertyName: property.name,
      });
    }
  }
  return {
    seriesSettings: settings.seriesSettings,
    dateStep: firstSeries?.dateStep === "Month" ? "month" : "year",
    tooltip: false,
    properties: properties,
    selectedSeries: null,
  };
}
