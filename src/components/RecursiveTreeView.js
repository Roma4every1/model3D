import React from 'react';
import { TreeView } from "@progress/kendo-react-treeview";

export default function RecursiveTreeView(props) {
    const [selectedItem, setSelectedItem] = React.useState(null);

    const onItemClick = (event) => {
        if (!event.item.items) {
            if (!event.item.selected) {
                event.item.selected = !event.item.selected;
                if (selectedItem) {
                    selectedItem.selected = false;
                }
                setSelectedItem(event.item);
            }
            props.onSelectionChanged(event, event.item.id);
        }
    };

    const onExpandChange = (event) => {
        event.item.expanded = !event.item.expanded;
    };

    return (
        <TreeView
            data={props.data.items}
            expandIcons={true}
            aria-multiselectable={false}
            onExpandChange={onExpandChange}
            onItemClick={onItemClick}
        >
        </TreeView>
    );
}