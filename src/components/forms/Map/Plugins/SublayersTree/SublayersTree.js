import React from 'react';
import { useSelector } from 'react-redux';
import SublayersTreeElement from './SublayersTreeElement';

export default function SublayersTree(props) {
    const { formId } = props;
    const activeChildId = useSelector((state) => state.childForms[formId]?.openedChildren[0]);
    const formRef = useSelector((state) => state.formRefs[activeChildId]);
    const sublayers = useSelector((state) => state.formRefs[activeChildId].current?.sublayers());
    const [sublayersGroupingData, setSublayersGroupingData] = React.useState([]);
    const onChange = React.useRef(false);

    const getGroupForTree = (sublayer) => {
        return {
            id: sublayer.uid,
            text: sublayer.name,
            sublayer: sublayer,
            visible: typeof sublayer.visible === "string" ? (sublayer.visible !== '0') : sublayer.visible
        }
    };

    React.useEffect(() => {
        if (onChange.current) {
            onChange.current = false;
            return;
        }
        var groupingData = [];
        if (sublayers) {
            sublayers.forEach(sublayer => {
                if (!sublayer.group || sublayer.group.length === 0) {
                    const groupForTree = getGroupForTree(sublayer);
                    groupingData.push(groupForTree);
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
                    const groupForTree = getGroupForTree(sublayer);
                    parent.items.push(groupForTree);
                }
            });
        }
        setSublayersGroupingData(groupingData);
    }, [sublayers]);

    return (
        <div className="wrapper">
            {sublayersGroupingData.map((item) => (
                <SublayersTreeElement item={item} formRef={formRef} />
            ))}
        </div>);
}