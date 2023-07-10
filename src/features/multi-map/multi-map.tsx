import { Layout, TabNode, Action, Actions } from 'flexlayout-react';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { compareArrays } from 'shared/lib';
import { i18nMapper } from 'shared/locales';
import { channelSelector } from 'entities/channels';
import { stateNeedFetch, formFetchStateSelector } from 'entities/fetch-state';
import { setPresentationChildren, setActiveForm } from 'widgets/presentation';
import { getMultiMapLayout } from './multi-map-utils';
import { MultiMapItem, MapNotFound } from './multi-map-item';
import { addMultiMap } from '../map/store/map.actions';
import { fetchMultiMapData } from '../map/store/map.thunks';
import { multiMapStateSelector } from '../map/store/map.selectors';


interface MultiMapProps {
  id: FormID,
  channelName: ChannelName,
}


export const MultiMap = ({id, channelName}: MultiMapProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const channelData: Channel = useSelector(channelSelector.bind(channelName));
  const state: MultiMapState = useSelector(multiMapStateSelector.bind(id));
  const fetchState: FetchState = useSelector(formFetchStateSelector.bind(id + '_map'));

  const [model, children, configs] = useMemo(() => {
    const rows = channelData?.data?.rows;
    if (!rows || !rows.length) return [null, [], []];
    return getMultiMapLayout(rows, id);
  }, [channelData, id]);

  useEffect(() => {
    if (compareArrays(state?.children ?? [], children)) return;
    const newChildren: FormDataWMR[] = children.map(id => ({id, type: 'map', displayName: ''}));
    dispatch(setPresentationChildren(id, newChildren));
    dispatch(addMultiMap(id, configs));
    if (fetchState) { fetchState.ok = undefined; fetchState.loading = false; }
  }, [children, configs, state?.children, fetchState, id, dispatch]);

  useEffect(() => {
    if (stateNeedFetch(fetchState)) dispatch(fetchMultiMapData(id));
  }, [fetchState, id, dispatch]);

  const factory = (node: TabNode) => {
    const tabID = node.getId();
    const config = state.configs.find(item => item.formID === tabID);
    return <MultiMapItem parent={id} config={config}/>;
  };

  const onAction = (action: Action) => {
    const { type, data } = action;
    if (type === Actions.SET_ACTIVE_TABSET) {
      const tabset = model.getNodeById(data.tabsetNode);
      const newActiveID = tabset.getChildren()[0]?.getId();
      if (newActiveID) dispatch(setActiveForm(id, newActiveID))
    } else if (type === Actions.SELECT_TAB) {
      dispatch(setActiveForm(id, data.tabNode));
    }
    return action;
  };

  if (!children.length) return <MapNotFound t={t}/>;
  return (
    <Layout
      model={model} factory={factory}
      onAction={onAction} i18nMapper={i18nMapper}
    />
  );
};
