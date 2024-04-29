import { Action, Actions, Layout, TabNode } from 'flexlayout-react';
import { useEffect, useMemo } from 'react';
import { compareArrays } from 'shared/lib';
import { i18nMapper } from 'shared/locales';
import { TextInfo } from 'shared/ui';
import { useChannel } from 'entities/channel';
import { useFetchState, resetFetchState } from 'entities/fetch-state';
import { setActiveForm, setPresentationChildren } from 'widgets/presentation';

import { toMultiMapRecords } from '../lib/rows';
import { getMultiMapLayout } from '../lib/layout';
import { MultiMapItem } from './multi-map-item';

import { addMultiMap } from 'features/map/store/map.actions';
import { fetchMultiMapData } from 'features/map/store/map.thunks';
import { useMultiMapState } from 'features/map/store/map.store';


type MultiMapProps = Pick<PresentationState, 'id' | 'channels' | 'openedChildren'>;


export const MultiMap = ({id, channels, openedChildren}: MultiMapProps) => {
  const state = useMultiMapState(id);
  const fetchState = useFetchState(id + '_map');

  const { name: channelName, info } = channels[0];
  const channel = useChannel(channelName);

  const [model, children, configs] = useMemo(() => {
    const records = toMultiMapRecords(channel?.data, info);
    if (records.length === 0) return [null, [], []];
    return getMultiMapLayout(records, id);
  }, [channel, info, id]);

  useEffect(() => {
    if (compareArrays(state?.children ?? [], children)) return;
    const newChildren: FormDataWM[] = children.map(id => ({id, type: 'map', displayName: ''}));
    setPresentationChildren(id, newChildren);
    addMultiMap(id, openedChildren[0], configs);
    resetFetchState(id + '_map')
  }, [children, configs, state?.children, fetchState, id]); // eslint-disable-line

  useEffect(() => {
    if (state && fetchState.needFetch()) fetchMultiMapData(id).then();
  }, [state, fetchState, id]);

  const factory = (node: TabNode) => {
    const tabID = node.getId();
    const config = state.configs.find(item => item.formID === tabID);
    if (!config) return null;
    return <MultiMapItem parent={id} config={config}/>;
  };

  const onAction = (action: Action) => {
    const { type, data } = action;
    if (type === Actions.SET_ACTIVE_TABSET) {
      const tabset = model.getNodeById(data.tabsetNode);
      const newActiveID = tabset.getChildren()[0]?.getId();
      if (newActiveID) setActiveForm(id, newActiveID);
    } else if (type === Actions.SELECT_TAB) {
      setActiveForm(id, data.tabNode);
    }
    return action;
  };

  if (!children.length) return <TextInfo text={'map.not-found'}/>;
  return <Layout model={model} factory={factory} onAction={onAction} i18nMapper={i18nMapper}/>;
};
