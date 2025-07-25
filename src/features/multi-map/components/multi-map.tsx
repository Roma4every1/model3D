import { Model, Action, Actions, Layout, TabNode } from 'flexlayout-react';
import { useEffect } from 'react';
import { i18nMapper } from 'shared/locales';
import { useChannelData } from 'entities/channel';
import { setClientActiveChild } from 'entities/client';
import { useMultiMapState } from '../store/multi-map.store';
import { updateMultiMap } from '../store/multi-map.thunks';

import { TextInfo } from 'shared/ui';
import { Map } from 'features/map/components/map';


export const MultiMap = ({id, channels}: Pick<PresentationState, 'id' | 'channels'>) => {
  const state = useMultiMapState(id);
  const channelData = useChannelData(channels[0].id);

  useEffect(() => {
    updateMultiMap(id, channelData).then();
  }, [channelData, id]);

  if (!state || state.children.length === 0) return <TextInfo text={'map.empty'}/>;
  const model: Model = state.layout;

  const factory = (node: TabNode) => {
    const tabID = node.getId();
    const child = state.children.find(item => item.formID === tabID);
    return child ? <Map id={child.formID}/> : null;
  };
  const onAction = (action: Action) => {
    const { type, data } = action;
    if (type === Actions.SET_ACTIVE_TABSET) {
      const tabset = model.getNodeById(data.tabsetNode);
      const newActiveID = tabset.getChildren()[0]?.getId();
      if (newActiveID) setClientActiveChild(id, newActiveID);
    } else if (type === Actions.SELECT_TAB) {
      setClientActiveChild(id, data.tabNode);
    }
    return action;
  };

  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};
