import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TreeView } from "@progress/kendo-react-treeview";
import setFormSettings from "../../../../store/actionCreators/setFormSettings";

export default function ColumnsVisibilityContent(props) {
    const dispatch = useDispatch();
    const { formId } = props;
    const formProperties = useSelector((state) => state.formRefs[formId].current?.properties());
    const tableSettings = useSelector((state) => state.formSettings[formId]);
    const [columnGroupingData, setColumnGroupingData] = React.useState([]);
    const [columnListData, setColumnListData] = React.useState([]);

    const getColumnForTree = col => {
        return {
            id: col.name,
            text: col.displayName,
            checked: (tableSettings?.attachedProperties?.attachOption !== "AttachNothing") ?
                !tableSettings?.attachedProperties?.exclude.includes(col.name) :
                tableSettings?.attachedProperties?.exclude.includes(col.name)
        }
    };

    React.useEffect(() => {
        var listData = [];
        var groupingData = [];
        formProperties?.forEach(col => {
            if (!col.treePath || col.treePath.length === 0) {
                const columnForTree = getColumnForTree(col);
                groupingData.push(columnForTree);
                listData.push(columnForTree);
            }
            else {
                var parent = null;
                col.treePath.forEach(part => {
                    var trimPart = part.trim();
                    var parentArray = parent?.items ?? groupingData;
                    parent = parentArray.find(p => p?.id === trimPart);
                    if (!parent) {
                        var children = [];
                        parent = {
                            id: trimPart,
                            text: trimPart,
                            expanded: true,
                            items: children
                        };
                        parentArray.push(parent);
                    }
                });
                const columnForTree = getColumnForTree(col);
                parent.items.push(columnForTree);
                listData.push(columnForTree);
            }
        });
        setColumnListData(listData);
        setColumnGroupingData(groupingData);
    }, [formProperties]);

    const onCheckChange = (event) => {
        if (event.item.items) {

        }
        else {
            event.item.checked = !event.item.checked;
            setColumnGroupingData([...columnGroupingData]);
            if (tableSettings?.attachedProperties?.attachOption !== "AttachNothing") {
                tableSettings.attachedProperties.exclude = columnListData.filter(ti => !ti.checked).map(ti => ti.id);
            }
            else {
                tableSettings.attachedProperties.exclude = columnListData.filter(ti => ti.checked).map(ti => ti.id);
            }
            dispatch(setFormSettings(formId, { ...tableSettings }));
        }
    };

    return (
        <TreeView className="popuptreeview"
            data={columnGroupingData}
            checkboxes={true}
            onCheckChange={onCheckChange}
        />);
}