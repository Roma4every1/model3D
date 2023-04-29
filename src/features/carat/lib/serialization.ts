export function caratStateToSettings(id: FormID, state: CaratState): CaratFormSettings {
  const settings = state.stage.getCaratSettings();
  const columns = state.stage.getActiveTrack().getInitColumns();
  return {id, settings, columns};
}
