import { TreeViewExpandChangeEvent, TreeViewItemClickEvent } from "@progress/kendo-react-treeview";
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Loader } from "@progress/kendo-react-indicators";
import { TreeView } from "@progress/kendo-react-treeview";
import { actions, selectors } from "../../../../store";
import { fetchPresentations } from "../../../../store/thunks";


const presentationsSelector = (state: WState) => state.presentations;

const onExpandChange = (event: TreeViewExpandChangeEvent) => {
  event.item.expanded = !event.item.expanded;
};

export default function PresentationList() {
  const dispatch = useDispatch();

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  const formID = useSelector(selectors.rootFormID);
  const presentations = useSelector(presentationsSelector);
  const activeChildID: FormID = useSelector(selectors.activeChildID.bind(formID));

  useEffect(() => {
    const changed = presentations.sessionID !== sessionID && presentations.formID !== formID;
    if (changed) dispatch(actions.changePresentations(sessionID, formID));
  }, [presentations, dispatch, sessionID, formID])

  useEffect(() => {
    if (presentations.success === undefined && presentations.loading === false && activeChildID) {
      dispatch(fetchPresentations(sessionManager, sessionID, formID, activeChildID));
    }
  }, [presentations, dispatch, sessionID, formID, sessionManager, activeChildID]);

  const onItemClick = useCallback((event: TreeViewItemClickEvent) => {
    if (event.item.items) return onExpandChange(event);
    dispatch(actions.setActiveChildren(formID, [event.item.id]));
    dispatch(actions.setOpenedChildren(formID, [event.item.id]));
    dispatch(actions.selectPresentation(event.item));
  }, [dispatch, formID]);

  if (presentations.loading || presentations.data === null) return <Loader type={'infinite-spinner'}/>;
  if (presentations.success === false) return <div>Не удалось загрузить список презентаций.</div>;

  return (
    <TreeView
      className={'treeview'} data={presentations.data.items}
      expandIcons={true} aria-multiselectable={false}
      onExpandChange={onExpandChange} onItemClick={onItemClick}
    />
  );
}
