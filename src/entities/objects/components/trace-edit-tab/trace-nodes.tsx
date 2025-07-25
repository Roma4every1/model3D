import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setCurrentTrace } from '../../store/objects.actions';

import './traces-edit-tab.scss';
import { Button } from '@progress/kendo-react-buttons';
import { TraceListItem } from './trace-list-item';


export const TraceNodes = ({model}: {model: TraceModel}) => {
  const { t } = useTranslation();
  const nodes = model.nodes;
  const [activeNode, setActiveNode] = useState<TraceNode>(null);

  const moveNode = (node: TraceNode, direction: 'down' | 'up') => {
    if (!node) return;
    const idx = nodes.findIndex(n => n === node);

    if (direction === 'up') {
      if (idx > 0) {
        nodes[idx] = nodes[idx - 1];
        nodes[idx - 1] = node;
      } else {
        nodes.push(nodes.shift());
      }
    } else {
      if (idx < nodes.length - 1) {
        nodes[idx] = nodes[idx + 1];
        nodes[idx + 1] = node;
      } else {
        nodes.unshift(nodes.pop());
      }
    }
    setCurrentTrace({...model, nodes: [...nodes]});
  };

  const removePoint = (id: number) => {
    if (id === null) return;
    const newNodes = nodes.filter(p => p.id !== id);
    setCurrentTrace({...model, nodes: newNodes});
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
      <div className={'items'}>
        {nodes.map(itemToTraceListItem)}
      </div>
    </div>
  );
};
