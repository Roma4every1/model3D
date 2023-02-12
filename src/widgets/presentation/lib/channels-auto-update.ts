/**
 * Задаёт параметрам список зависимых каналов.
 * Необходимо для автообновления данных каналов.
 * */
export function applyChannelsDeps(channelDict: ChannelDict, paramDict: ParamDict) {
  const channelParams: [ChannelName, ChannelInfo][] = [];
  for (const name in channelDict) {
    const channelInfo = channelDict[name].info;
    channelInfo.clients = new Set();
    channelParams.push([name, channelInfo]);
  }

  for (const formID in paramDict) {
    for (const param of paramDict[formID]) {
      param.relatedChannels = [];
      for (const [name, info] of channelParams) {
        if (info.parameters.includes(param.id)) {
          info.clients.add(formID);
          param.relatedChannels.push(name);
        }
      }
    }
  }
}
