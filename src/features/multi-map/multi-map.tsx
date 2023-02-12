import { Layout, TabNode, Action, Actions } from 'flexlayout-react';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getMultiMapLayout, MapItemConfig } from './multi-map-utils';
import { i18nMapper } from 'shared/locales';
import { MultiMapItem, MapNotFound } from './multi-map-item';
import { channelSelector } from 'entities/channels';
import { setPresentationChildren, setActiveForm } from 'widgets/presentation';
import { addMultiMap } from '../map/store/maps.actions';
import { mapsAPI } from '../map/lib/maps.api';


const factory = (node: TabNode) => {
  const config = node.getConfig();
  return <MultiMapItem config={config}/>;
};

export const MultiMap = ({formID, channel}: PropsFormID & {channel: ChannelName}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const channelData: Channel = useSelector(channelSelector.bind(channel));

  const [model, children, configs] = useMemo(() => {
    const rows = channelData?.data?.rows;
    if (!rows || !rows.length) return [null, null, []];
    return getMultiMapLayout(rows, formID);
  }, [channelData, formID]);

  useEffect(() => {
    if (!children) {
      dispatch(setPresentationChildren(formID, []));
    } else {
      const newChildren: FormDataWMR[] = children.map(id => ({id, type: 'map', displayName: ''}));
      dispatch(setPresentationChildren(formID, newChildren));
      dispatch(addMultiMap(formID, children));
    }
  }, [children, formID, dispatch]);

  useEffect(() => {
    setTimeout(() => loadMultiMap(configs).then(), 200);
  }, [configs]);

  const onAction = (action: Action) => {
    if (action.type === Actions.SET_ACTIVE_TABSET) {
      dispatch(setActiveForm(formID, action.data.tabsetNode))
    }
    return action;
  };

  if (!children) return <MapNotFound t={t}/>;
  return (
    <Layout
      model={model} factory={factory}
      onAction={onAction} i18nMapper={i18nMapper}
    />
  );
};

async function loadMultiMap(configs: MapItemConfig[]) {
  for (const config of configs) {
    config.setProgress(0);
    const loadedMap = await mapsAPI.loadMap(config.id, 'Common', config.setProgress);
    config.data = loadedMap;
    config.setProgress(typeof loadedMap === 'string' ? -1 : 100);
  }
}
