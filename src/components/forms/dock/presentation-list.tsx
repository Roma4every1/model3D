import { TreeViewExpandChangeEvent, TreeViewItemClickEvent } from '@progress/kendo-react-treeview';
import { useSelector, useDispatch } from 'react-redux';
import { TreeView } from '@progress/kendo-react-treeview';
import { actions, selectors } from '../../../store';


const onExpandChange = (event: TreeViewExpandChangeEvent) => {
  event.item.expanded = !event.item.expanded;
};
const presentationsSelector = (state: WState) => state.presentations;

export const PresentationList = () => {
  const dispatch = useDispatch();

  const formID = useSelector(selectors.rootFormID);
  const presentations = useSelector(presentationsSelector);

  const onItemClick = (event: TreeViewItemClickEvent) => {
    const item = event.item;
    if (item.items) return onExpandChange(event);
    dispatch(actions.setActiveChildren(formID, [item.id]));
    dispatch(actions.setOpenedChildren(formID, [item.id]));
    dispatch(actions.selectPresentation(item));
  };

  return (
    <TreeView
      className={'treeview'} data={presentations}
      expandIcons={true} aria-multiselectable={false}
      onExpandChange={onExpandChange} onItemClick={onItemClick}
    />
  );
};
