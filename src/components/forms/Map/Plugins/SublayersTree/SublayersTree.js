import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import SublayersTreeElement from "./SublayersTreeElement";


const getGroupForTree = (sublayer) => {
  return {
    id: sublayer.uid, text: sublayer.name, sublayer,
    visible: typeof sublayer.visible === 'string' ? (sublayer.visible !== '0') : sublayer.visible,
  };
};

export default function SublayersTree({formId}) {
  const activeChildId = useSelector((state) => state.childForms[formId]?.openedChildren[0]);
  const sublayers = useSelector(state => state.maps[activeChildId]?.mapData?.layers);

  const [sublayersGroupingData, setSublayersGroupingData] = useState([]);
  const onChange = useRef(false);

  useEffect(() => {
    if (onChange.current) {
      onChange.current = false;
      return;
    }
    const groupingData = [];
    if (sublayers) {
      sublayers.forEach(sublayer => {
        if (!sublayer.group || sublayer.group.length === 0) {
          const groupForTree = getGroupForTree(sublayer);
          groupingData.push(groupForTree);
        } else {
          var parent = null;
          sublayer.group.split('\\').forEach(part => {
            var trimPart = part.trim();
            var parentArray = parent?.items ?? groupingData;
            let index = parent?.items ? parent.index + '_' + parentArray.length : parentArray.length + '';
            parent = parentArray.find(p => p?.id === trimPart);
            if (!parent) {
              parent = {index, id: trimPart, text: trimPart, expanded: true, items: []};
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
        <SublayersTreeElement key={item.text} item={item} formId={activeChildId} />
      ))}
    </div>);
}
