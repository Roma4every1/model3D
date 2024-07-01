import type { ChangeEvent, DragEvent } from 'react';
import { useState, useEffect } from 'react';
import { useRender } from 'shared/react';
import { Flex, Checkbox, Input } from 'antd';

import { CaratStage } from '../../rendering/stage';
import { CaratColumnGroup } from '../../rendering/column-group';
import { constraints } from '../../lib/constants';

import './carat-settings.scss';
import dragIcon from 'assets/common/drag-horizontal.svg';


interface CaratSettingsWindowProps {
  stage: CaratStage;
}
interface ColumnDragProps {
  count: number;
  onChange: (index: number, position: number) => void;
}
interface ColumnDragItemProps {
  first: boolean;
  last: boolean;
  dragStart: () => void;
  dragEnd: () => void;
  dropLeft?: (e: DragEvent) => void;
  dropRight?: (e: DragEvent) => void;
}

interface GroupSettingsViewProps {
  stage: CaratStage;
  group: CaratColumnGroup;
}
interface ColumnListItemProps {
  stage: CaratStage;
  column: ICaratColumn;
  groupIdx: number;
  columnIdx: number;
}


export const CaratSettingsWindow = ({stage}: CaratSettingsWindowProps) => {
  const render = useRender();
  const groups = stage.getActiveTrack().getGroups();
  const style = {gridTemplateColumns: '1fr '.repeat(groups.length)};

  useEffect(() => {
    stage.subscribe('group', render);
    return () => stage.unsubscribe('group', render);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMoveGroup = (idx: number, position: number) => {
    stage.moveGroup(idx, position);
    stage.render();
  };
  const toElement = (group: CaratColumnGroup) => {
    return <GroupSettingsView key={group.id} stage={stage} group={group}/>;
  };
  return (
    <div className={'carat-settings-window'} style={{minWidth: 120 * groups.length}}>
      <ColumnDrag count={groups.length} onChange={onMoveGroup}/>
      <div style={style}>{groups.map(toElement)}</div>
    </div>
  );
};

const GroupSettingsView = ({stage, group}: GroupSettingsViewProps) => {
  const { index, label } = group.settings;
  const maxLabelLength = constraints.groupLabel.max;

  const onLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (typeof value !== 'string') return;
    stage.setGroupLabel(index, value);
    stage.render();
  };
  const onVisibilityChange = () => {
    stage.setGroupVisibility(index, !group.visible);
    stage.render();
  };
  const toElement = (column: ICaratColumn, i: number) => {
    return <ColumnListItem key={i} stage={stage} column={column} groupIdx={index} columnIdx={i}/>;
  };

  return (
    <div className={'carat-group'}>
      <Flex gap={4}>
        <Checkbox title={'Видимость колонки'} checked={group.visible} onChange={onVisibilityChange}/>
        <Input maxLength={maxLabelLength} spellCheck={false} value={label} onChange={onLabelChange}/>
      </Flex>
      <ul className={'carat-columns'}>
        {group.getColumns().map(toElement)}
      </ul>
    </div>
  );
};

const ColumnListItem = (props: ColumnListItemProps) => {
  const { stage, column } = props;
  const columnName = column.channel.config.displayName;

  const onChange = () => {
    stage.setGroupColumnVisibility(props.groupIdx, props.columnIdx, !column.visible);
    stage.render();
  };
  return (
    <li>
      <Checkbox title={'Видимость элементов'} checked={column.visible} onChange={onChange}/>
      <span title={columnName}>{columnName}</span>
    </li>
  );
};

const ColumnDrag = ({count, onChange}: ColumnDragProps) => {
  const [dragItemIndex, setDragItemIndex] = useState(-1);
  const items = new Array(count);
  const style = {gridTemplateColumns: '1fr '.repeat(count)};

  for (let i = 0; i < count; i++) {
    const dragStart = () => setDragItemIndex(i);
    const dragEnd = () => setDragItemIndex(-1);

    let dropLeft: ColumnDragItemProps['dropLeft'];
    let dropRight: ColumnDragItemProps['dropRight'];

    if (dragItemIndex !== -1) {
      const delta = i - dragItemIndex;
      if (delta < 0) dropLeft = () => onChange(dragItemIndex, i);
      if (delta > 0) dropRight = () => onChange(dragItemIndex, i + 1);
    }

    items[i] = <ColumnDragItem
      key={i} first={i === 0} last={i === count - 1}
      dragStart={dragStart} dragEnd={dragEnd}
      dropLeft={dropLeft} dropRight={dropRight}
    />;
  }

  return (
    <div className={'column-drag'} style={style}>
      {items}
    </div>
  );
};

const ColumnDragItem = ({first, last, dragStart, dragEnd, dropLeft, dropRight}: ColumnDragItemProps) => {
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <section>
      {dropLeft && <div
        className={'droppable'} style={{left: first ? 0 : -12}}
        onDrop={dropLeft} onDragOver={onDragOver}
      />}
      <div draggable={true} onDragStart={dragStart} onDragEnd={dragEnd}>
        <img src={dragIcon} draggable={false} alt={'drag'}/>
      </div>
      {dropRight && <div
        className={'droppable'} style={{right: last ? 0 : -12}}
        onDrop={dropRight} onDragOver={onDragOver}
      />}
    </section>
  );
};
