import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setCurrentTrace } from '../../index';

import './traces-edit-tab.scss';
import { Button } from '@progress/kendo-react-buttons';
import { TraceListItem } from './trace-list-item';


interface TracePointsListProps {
  model: TraceModel,
}


export const TracePointsList = ({model}: TracePointsListProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const nodes = model.nodes;
  const [activeNode, setActiveNode] = useState<TraceNode>(null);

  const moveNode = (node: TraceNode, direction: 'down' | 'up') => {
    if (!node) return;
    const idx = nodes.findIndex(n => n === node);

    if (direction === 'up' && idx > 0) {
      nodes[idx] = nodes[idx - 1];
      nodes[idx - 1] = node;
    }
    if (direction === 'down' && idx < nodes.length - 1) {
      nodes[idx] = nodes[idx + 1];
      nodes[idx + 1] = node;
    }
    dispatch(setCurrentTrace({...model, nodes: [...nodes]}));
  };

  const removePoint = (id: number) => {
    if (id === null) return;
    const newNodes = nodes.filter(p => p.id !== id);
    dispatch(setCurrentTrace({...model, nodes: newNodes}));
  };

  const itemToTraceListItem = (node: TraceNode, i: number) => {
    return (
      <TraceListItem
        key={i} node={node} removeNode={removePoint}
        activeNode={activeNode} setActiveNode={setActiveNode}
      />
    );
  };

  if (!nodes.length) return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.change-items-title')}
      </div>
      <div>{t('trace.empty-trace')}</div>
    </div>
  );

  return (
    <div className='trace-edit-tab__inner-block'>
      <div className='menu-header trace-edit-tab__title-text'>
        {t('trace.change-items-title')}
      </div>
      <div className='change-order-buttons'>
        <Button
          style={{width: '20px', height: '20px'}}
          icon={'sort-asc-sm'}
          disabled={false}
          onClick={() => moveNode(activeNode, 'up')}
        />
        <Button
          style={{width: '20px', height: '20px'}}
          icon={'sort-desc-sm'}
          disabled={false}
          onClick={() => moveNode(activeNode, 'down')}
        />
      </div>
      <div className='items'>
        {nodes.map(itemToTraceListItem)}
      </div>
    </div>
  );
};
