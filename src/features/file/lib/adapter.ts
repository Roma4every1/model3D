/** Создаёт состояния формы просмотра файлов. */
export function toFileViewState(payload: FormStatePayload): FileViewState {
  let fileProperty: ChannelProperty;
  const { state, channels } = payload;

  for (const attachedChannel of state.channels) {
    const properties = channels[attachedChannel.id].config.properties;
    fileProperty = properties.find(p => p.file?.nameFrom);
    if (fileProperty) { state.channels = [attachedChannel]; break; }
  }
  if (!fileProperty) state.channels = [];
  return {fileProperty, loadingFlag: {current: 0}, model: null, memo: [], queryID: null};
}
