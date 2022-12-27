import { Layout, Model, TabNode, Action, Actions } from "flexlayout-react";
import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectors, actions } from "../../../store";
import { getMultiMapLayout } from "../../../layout/multi-map";
import translator from "../../../locales/layout";
import Map from "../map/map";


interface MultiMapProps {
  formID: FormID,
  channel: ChannelName,
}


const factory = (node: TabNode) => {
  const mapID = node.getId();
  const formID = node.getComponent();
  return <Map formData={{id: formID}} data={mapID}/>;
};

export const MultiMap = ({formID, channel}: MultiMapProps) => {
  const dispatch = useDispatch();
  const channelData: any = useSelector(selectors.channel.bind(channel));

  const [model, children] = useMemo<[Model, ActiveChildrenList]>(() => {
    const rows = channelData?.data?.Rows;
    if (!rows || !rows.length) return [null, null];
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

  const onAction = (action: Action) => {
    if (action.type === Actions.SET_ACTIVE_TABSET) {
      dispatch(actions.setActiveChildren(formID, [action.data.tabsetNode]))
    }
    return action;
  };

  if (!children) return <NoMaps/>;
  return (
    <Layout
      model={model} factory={factory}
      onAction={onAction} i18nMapper={translator}
    />
  );
};

const NoMaps = () => {
  return <div className={'map-not-found'}>Для выбранных параметров карты отсутствуют</div>;
};
