/**
 * Задаёт параметрам список зависимых каналов.
 * Необходимо для автообновления данных каналов.
 * */
export function applyChannelsDeps(channelDict: ChannelDict, paramDict: ParamDict) {
  const channelParams: [ChannelName, ChannelInfo][] = [];
  for (const name in channelDict) {
    const channelInfo = channelDict[name].info;
    if (!channelInfo.clients) channelInfo.clients = new Set();
    channelParams.push([name, channelInfo]);
  }

  for (const clientID in paramDict) {
    for (const param of paramDict[clientID]) {
      param.relatedChannels = [];
      for (const [name, info] of channelParams) {
        if (info.parameters.includes(param.id)) {
          info.clients.add(clientID);
          param.relatedChannels.push(name);
        }
      }
    }
  }
}
