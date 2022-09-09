import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Loader } from "@progress/kendo-react-indicators";
import { TreeView, TreeViewExpandChangeEvent, TreeViewItemClickEvent } from "@progress/kendo-react-treeview";

import { actions } from "../../../../store";
import { fetchPresentations } from "../../../../store/thunks";


const sessionSelector = (state: WState) => state.sessionId;
const sessionManagerSelector = (state: WState) => state.sessionManager;
const presentationsSelector = (state: WState) => state.presentations;

const onExpandChange = (event: TreeViewExpandChangeEvent) => {
  event.item.expanded = !event.item.expanded;
};

export default function PresentationList({formId: formID}: {formId: FormID}) {
  const dispatch = useDispatch();

  const sessionID = useSelector(sessionSelector);
  const sessionManager = useSelector(sessionManagerSelector);
  const presentations = useSelector(presentationsSelector);
  const activeChild = useSelector((state: WState) => state.childForms[formID]?.activeChildren[0]);

  useEffect(() => {
    const changed = presentations.sessionID !== sessionID && presentations.formID !== formID;
    if (changed) dispatch(actions.changePresentations(sessionID, formID));
  }, [presentations, dispatch, sessionID, formID])

  useEffect(() => {
    const needFetch = presentations.success === undefined && presentations.loading === false;
    if (needFetch) dispatch(fetchPresentations(sessionManager, sessionID, formID, activeChild));
  }, [presentations, dispatch, sessionID, formID, sessionManager, activeChild]);

  const onItemClick = useCallback((event: TreeViewItemClickEvent) => {
    if (event.item.items) return onExpandChange(event);
    dispatch(actions.setActiveChildren(formID, [event.item.id]));
    dispatch(actions.setOpenedChildren(formID, [event.item.id]));
    dispatch(actions.selectPresentation(event.item));
  }, [dispatch, formID]);

  if (presentations.loading || presentations.data === null) return <Loader type="infinite-spinner" />;
  if (presentations.success === false) return <div>Не удалось загрузить список презентаций.</div>;

  return (
    <TreeView
      className={'treeview'} data={presentations.data.items}
      expandIcons={true} aria-multiselectable={false}
      onExpandChange={onExpandChange} onItemClick={onItemClick}
    />
  );
}
