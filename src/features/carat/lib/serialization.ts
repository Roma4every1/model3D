export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const settings = state.stage.getCaratSettings();
  settings.zones = state.zones;

  const columns = state.stage.getActiveTrack().getInitColumns();
  return {id, settings, columns};
}
