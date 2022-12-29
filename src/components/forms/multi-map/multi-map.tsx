import { Layout, TabNode, Action, Actions } from "flexlayout-react";
import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectors, actions } from "../../../store";
import { getMultiMapLayout, MapTuple, MapItemConfig } from "./multi-map-utils";
import translator from "../../../locales/layout";
import { MultiMapItem, MapNotFound } from "./multi-map-item";
import { API } from "../../../api/api";


interface MultiMapProps {
  formID: FormID,
  channel: ChannelName,
}


const factory = (node: TabNode) => {
  const config = node.getConfig();
  return <MultiMapItem config={config}/>;
};

export const MultiMap = ({formID, channel}: MultiMapProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const channelData: any = useSelector(selectors.channel.bind(channel));

  const [model, children, configs] = useMemo<MapTuple>(() => {
    const rows = channelData?.data?.Rows;
    if (!rows || !rows.length) return [null, null, []];
    return getMultiMapLayout(rows.map(row => row.Cells), formID);
  }, [channelData, formID]);

  useEffect(() => {
    if (!children) {
      const state = {id: formID, children: [], openedChildren: [], activeChildren: []};
      dispatch(actions.setChildForms(formID, state)); return;
    }
    const state: FormChildrenState = {
      id: formID,
      children: children.map(id => ({type: 'map', id, displayName: ''})),
      openedChildren: children,
      activeChildren: [children[0]],
    };
    dispatch(actions.setChildForms(formID, state));
    dispatch(actions.addMultiMap(formID, children));
  }, [children, formID, dispatch]);

  useEffect(() => {
    setTimeout(() => loadMultiMap(formID, configs).then(), 200);
  }, [configs, formID]);

  const onAction = (action: Action) => {
    if (action.type === Actions.SET_ACTIVE_TABSET) {
      dispatch(actions.setActiveChildren(formID, [action.data.tabsetNode]))
    }
    return action;
  };

  if (!children) return <MapNotFound t={t}/>;
  return (
    <Layout
      model={model} factory={factory}
      onAction={onAction} i18nMapper={translator}
    />
  );
};

async function loadMultiMap(formID: FormID, configs: MapItemConfig[]) {
  for (const config of configs) {
    config.setProgress(0);
    const loadedMap = await API.maps.loadMap(formID, config.id, 'Common', config.setProgress);
    config.data = loadedMap;
    config.setProgress(typeof loadedMap === 'string' ? -1 : 100);
  }
}
