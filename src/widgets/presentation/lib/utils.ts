/**
 * Задаёт параметрам список зависимых каналов.
 * Необходимо для автообновления данных каналов.
 * */
export function applyChannelsDeps(channelDict: ChannelDict, paramDict: ParamDict) {
  const channelParams: [ChannelName, ChannelConfig][] = [];
  for (const name in channelDict) {
    const config = channelDict[name].config;
    if (!config.clients) config.clients = new Set();
    channelParams.push([name, config]);
  }

  for (const clientID in paramDict) {
    for (const param of paramDict[clientID]) {
      param.relatedChannels = [];
      param.relatedReportChannels = [];
      for (const [name, info] of channelParams) {
        if (info.parameters.includes(param.id)) {
          info.clients.add(clientID);
          param.relatedChannels.push(name);
        }
      }
    }
  }
}

/** Возвращает список типов форм в презентации с учётом их видимости. */
export function getChildrenTypes(children: FormDataWM[], opened: FormID[]): Set<ClientType> {
  const types = new Set<ClientType>();
  for (const child of children) {
    const isOpened = opened.includes(child.id);
    if (isOpened) types.add(child.type);
  }
  return types;
}
