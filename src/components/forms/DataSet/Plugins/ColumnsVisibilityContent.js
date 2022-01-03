import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TreeView } from "@progress/kendo-react-treeview";
import setFormSettings from "../../../../store/actionCreators/setFormSettings";

export default function ColumnsVisibilityContent(props) {
    const dispatch = useDispatch();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const tableSettings = useSelector((state) => state.formSettings[formId]);

    const [tree, setTree] = React.useState(formRef?.current?.properties()?.map(property => {
        return {
            id: property.name,
            text: property.displayName,
            checked: (tableSettings?.attachedProperties?.attachOption !== "AttachNothing") ?
                !tableSettings?.attachedProperties?.exclude.includes(property.name) :
                tableSettings?.attachedProperties?.exclude.includes(property.name)
        }
    }));

    const onCheckChange = (event) => {
        event.item.checked = !event.item.checked;
        setTree([...tree]);
        if (tableSettings?.attachedProperties?.attachOption !== "AttachNothing") {
            tableSettings.attachedProperties.exclude = tree.filter(ti => !ti.checked).map(ti => ti.id);
        }
        else {
            tableSettings.attachedProperties.exclude = tree.filter(ti => ti.checked).map(ti => ti.id);
        }
        dispatch(setFormSettings(formId, { ...tableSettings }));
    };

    return (
        <TreeView className="popuptreeview"
            data={tree}
            checkboxes={true}
            onCheckChange={onCheckChange}
        />);
}