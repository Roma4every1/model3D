import React from 'react';
import { useSelector } from 'react-redux';
import {
    TreeView,
    processTreeViewItems,
    handleTreeViewCheckChange,
} from "@progress/kendo-react-treeview";

export default function SublayersTreeContent(props) {
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const sublayers = useSelector((state) => state.formRefs[formId].current?.sublayers());
    const [sublayersGroupingData, setSublayersGroupingData] = React.useState([]);
    const [sublayersListData, setSublayersListData] = React.useState([]);
    const [check, setCheck] = React.useState({
        ids: [],
        applyCheckIndeterminate: true,
    });
    const onChange = React.useRef(false);

    const getGroupForTree = (sublayer, index) => {
        return {
            index: index,
            id: sublayer.uid,
            text: sublayer.name,
            visible: typeof sublayer.visible === "string" ? (sublayer.visible !== '0') : sublayer.visible
        }
    };

    React.useEffect(() => {
        if (onChange.current) {
            onChange.current = false;
            return;
        }
        var listData = [];
        var groupingData = [];
        if (sublayers) {
            sublayers.forEach(sublayer => {
                if (!sublayer.group || sublayer.group.length === 0) {
                    let index = groupingData.length + '';
                    const groupForTree = getGroupForTree(sublayer, index);
                    groupingData.push(groupForTree);
                    listData.push(groupForTree);
                }
                else {
                    var parent = null;
                    sublayer.group.split('\\').forEach(part => {
                        var trimPart = part.trim();
                        var parentArray = parent?.items ?? groupingData;
                        let index = parent?.items ? parent.index + '_' + parentArray.length : parentArray.length + '';
                        parent = parentArray.find(p => p?.id === trimPart);
                        if (!parent) {
                            var children = [];
                            parent = {
                                index: index,
                                id: trimPart,
                                text: trimPart,
                                expanded: true,
                                items: children
                            };
                            parentArray.push(parent);
                        }
                    });
                    let index = parent.index + '_' + parent.items.length;
                    const groupForTree = getGroupForTree(sublayer, index);
                    parent.items.push(groupForTree);
                    listData.push(groupForTree);
                }
            });
        }
        setSublayersListData(listData);
        setSublayersGroupingData(groupingData);
        var indices = [];
        listData.forEach((item) => {
            if (item.visible) {
                indices.push(item.index)
            }
        });
        setCheck({
            ids: indices,
            applyCheckIndeterminate: true,
        });
    }, [sublayers]);

    const onCheckChange = (event) => {
        const settings = {
            singleMode: false,
            checkChildren: true,
            checkParents: true,
        };
        const newCheck = handleTreeViewCheckChange(event, check, sublayersGroupingData, settings);
        setCheck(newCheck);
        onChange.current = true;

        sublayers.forEach(sublayer => {
            let sublayersListElement = sublayersListData.find(sd => sd.id === sublayer.uid);
            sublayer.visible = newCheck.ids.includes(sublayersListElement.index);
            return sublayer.visible;
        });
        formRef.current.updateCanvas();
    };

    return (
        <TreeView className="popuptreeview"
            data={processTreeViewItems(sublayersGroupingData, {
                check: check,
            })}
            checkboxes={true}
            onCheckChange={onCheckChange}
        />);
}