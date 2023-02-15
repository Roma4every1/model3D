import { TreeViewExpandChangeEvent, TreeViewItemClickEvent } from '@progress/kendo-react-treeview';
import { TreeView } from '@progress/kendo-react-treeview';
import { useDispatch } from 'react-redux';
import { selectPresentation } from '../../../app/store/root-form/root-form.actions';


const onExpandChange = (event: TreeViewExpandChangeEvent) => {
  event.item.expanded = !event.item.expanded;
};

export const PresentationTreeView = ({tree}: {tree: PresentationTree}) => {
  const dispatch = useDispatch();

  const onItemClick = (event: TreeViewItemClickEvent) => {
    const item = event.item;
    if (item.items) return onExpandChange(event);
    dispatch(selectPresentation(item));
  };

  return (
    <TreeView
      className={'treeview'} data={tree}
      expandIcons={true} aria-multiselectable={false}
      onExpandChange={onExpandChange} onItemClick={onItemClick}
    />
  );
};
