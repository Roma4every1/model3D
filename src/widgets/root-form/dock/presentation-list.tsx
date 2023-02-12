import { TreeViewExpandChangeEvent, TreeViewItemClickEvent } from '@progress/kendo-react-treeview';
import { TreeView } from '@progress/kendo-react-treeview';
import { useSelector, useDispatch } from 'react-redux';
import { presentationsTreeSelector } from '../store/root-form.selectors';
import { selectPresentation } from '../store/root-form.actions';


const onExpandChange = (event: TreeViewExpandChangeEvent) => {
  event.item.expanded = !event.item.expanded;
};

export const PresentationList = () => {
  const dispatch = useDispatch();
  const presentationsTree = useSelector(presentationsTreeSelector);

  const onItemClick = (event: TreeViewItemClickEvent) => {
    const item = event.item;
    if (item.items) return onExpandChange(event);
    dispatch(selectPresentation(item));
  };

  return (
    <TreeView
      className={'treeview'} data={presentationsTree}
      expandIcons={true} aria-multiselectable={false}
      onExpandChange={onExpandChange} onItemClick={onItemClick}
    />
  );
};
