import type { ReactNode } from 'react';
import type { SlideElement } from '../lib/slide.types';
import { useMemo } from 'react';
import { useChannelData } from 'entities/channel';
import { useSlideState } from '../store/slide.store';
import { createTree, createElements } from '../lib/utils';

import './slide.scss';
import { Collapse } from 'antd';
import { SlideButton } from './slide-button';


export const Slide = ({id, channels}: SessionClient) => {
  const channel = channels[0];
  const info = channel.info;
  const data = useChannelData(channel.id);
  const { styles } = useSlideState(id);

  const rootElements = useMemo(() => {
    return createTree(createElements(data, info, styles));
  }, [data, info, styles]);

  const toSlideElement = (element: SlideElement): ReactNode => {
    const type = element.type;
    if (type === 'text') return slideText(element);
    if (type === 'button') return <SlideButton key={element.id} id={id} element={element}/>;
    if (type === 'collapse') return slideCollapse(element, toSlideElement);
    return null;
  };
  const content = rootElements.map(toSlideElement);
  return <div className={'slide-container'}>{content}</div>;
};

function slideCollapse(element: SlideElement, factory: (e: SlideElement) => ReactNode): ReactNode {
  const { id, title, payload, children, style } = element;
  if (!children) return null;

  const item = {key: id, label: title, children: children.map(factory), style};
  const activeKey = payload === 'false' ? undefined : id;
  return <Collapse key={id} items={[item]} defaultActiveKey={activeKey}/>;
}

function slideText(element: SlideElement): ReactNode {
  const { id, title, payload, style } = element;
  if (!title) return <p key={id} style={style}>{payload}</p>;

  return (
    <div key={id} className={'slide-text-block'} style={style}>
      <p>{title}</p>
      <p>{payload}</p>
    </div>
  );
}
