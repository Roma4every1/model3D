import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TreeView, processTreeViewItems, handleTreeViewCheckChange } from '@progress/kendo-react-treeview';
import { formSettingsSelector, setFormSettings } from '../../../widgets/form';
import { formRefValueSelector } from '../store/datasets.selectors';


const getColumnForTree = (col, index) => {
  return {index: index, id: col.name, text: col.displayName}
};

export default function ColumnsVisibilityContent({formId}) {
  const dispatch = useDispatch();
  const formProperties = useSelector(formRefValueSelector.bind(formId))?.properties();
  const tableSettings = useSelector(formSettingsSelector.bind(formId));

  const [columnGroupingData, setColumnGroupingData] = useState([]);
  const [columnListData, setColumnListData] = useState([]);
  const [check, setCheck] = useState({ids: [], applyCheckIndeterminate: true});

  const onChange = useRef(false);

  useEffect(() => {
    if (onChange.current) { onChange.current = false; return; }
    const listData = [], groupingData = [];

    if (formProperties) {
      formProperties.forEach(col => {
        if (!col.treePath || col.treePath.length === 0) {
          let index = groupingData.length + '';
          const columnForTree = getColumnForTree(col, index);
          groupingData.push(columnForTree);
          listData.push(columnForTree);
        } else {
          var parent = null;
          col.treePath.forEach(part => {
            var trimPart = part.trim();
            var parentArray = parent?.items ?? groupingData;
            let index = parent?.items ? parent.index + '_' + parentArray.length : parentArray.length + '';
            parent = parentArray.find(p => p?.id === trimPart);

            if (!parent) {
              var children = [];
              parent = {index: index, id: trimPart, text: trimPart, expanded: true, items: children};
              parentArray.push(parent);
            }
          });

          let index = parent.index + '_' + parent.items.length;
          const columnForTree = getColumnForTree(col, index);
          parent.items.push(columnForTree);
          listData.push(columnForTree);
        }
      });
    }
    setColumnListData(listData);
    setColumnGroupingData(groupingData);

    const indices = [];
    listData.forEach((item) => {
      let visible = (tableSettings?.attachedProperties?.attachOption !== 'AttachNothing')
        ? !tableSettings?.attachedProperties?.exclude.includes(item.id)
        : tableSettings?.attachedProperties?.exclude.includes(item.id);
      if (visible) indices.push(item.index)
    });
    setCheck({ids: indices, applyCheckIndeterminate: true});
  }, [formProperties, tableSettings]);

  const onCheckChange = (event) => {
    const settings = {singleMode: false, checkChildren: true, checkParents: true};
    const newCheck = handleTreeViewCheckChange(event, check, columnGroupingData, settings);
    setCheck(newCheck);

    if (tableSettings?.attachedProperties?.attachOption !== 'AttachNothing') {
      tableSettings.attachedProperties.exclude = columnListData.filter(
        ti => !newCheck.ids.includes(ti.index)).map(ti => ti.id);
    } else {
      tableSettings.attachedProperties.exclude = columnListData.filter(
        ti => newCheck.ids.includes(ti.index)).map(ti => ti.id);
    }
    onChange.current = true;
    dispatch(setFormSettings(formId, {...tableSettings}));
  };

  return (
    <TreeView
      className={'popuptreeview'}
      data={processTreeViewItems(columnGroupingData, {check})}
      checkboxes={true} onCheckChange={onCheckChange}
    />
  );
}
