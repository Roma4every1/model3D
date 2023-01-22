import { Layout, TabNode, Action, Actions } from "flexlayout-react";
import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getMultiMapLayout, MapItemConfig } from "./multi-map-utils";
import { i18nMapper } from "../../../locales/i18n";
import { MultiMapItem, MapNotFound } from "./multi-map-item";
import { actions } from "../../../store";
import { API } from "../../../api/api";


const factory = (node: TabNode) => {
  const config = node.getConfig();
  return <MultiMapItem config={config}/>;
};

function multiMapChannelSelector(this: FormID, state: WState): Channel {
  const settings = state.formSettings[this] as GridFormSettings;
  return state.channelsData[settings.multiMapChannel];
}

export const MultiMap = ({formID}: PropsFormID) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const channelData: Channel = useSelector(multiMapChannelSelector.bind(formID));

  const [model, children, configs] = useMemo(() => {
    const rows = channelData?.data?.Rows;
    if (!rows || !rows.length) return [null, null, []];
    return getMultiMapLayout(rows, formID);
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
    setTimeout(() => loadMultiMap(configs).then(), 200);
  }, [configs]);

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
      onAction={onAction} i18nMapper={i18nMapper}
    />
  );
};

async function loadMultiMap(configs: MapItemConfig[]) {
  for (const config of configs) {
    config.setProgress(0);
    const loadedMap = await API.maps.loadMap(config.id, 'Common', config.setProgress);
    config.data = loadedMap;
    config.setProgress(typeof loadedMap === 'string' ? -1 : 100);
  }
}
