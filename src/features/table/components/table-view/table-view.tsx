import type { TableState } from '../../lib/types';
import { useLayoutEffect, useRef } from 'react';
import { scrollWidth } from '../../lib/constants';

import './table-view.scss';
import { TableHead } from './thead';
import { TableBody } from './tbody';


interface TableViewProps {
  state: TableState;
  query: ChannelQuerySettings;
}


export const TableView = ({state, query}: TableViewProps) => {
  const headRef = useRef<HTMLDivElement>();
  const bodyRef = useRef<HTMLDivElement>();
  const scrollerRef = useRef<HTMLDivElement>();

  const controller = state.viewport;
  const onHorizontalScroll = () => controller.handleHorizontalScroll();

  useLayoutEffect(() => {
    controller.headContainer = headRef.current;
    controller.bodyContainer = bodyRef.current;
    controller.scrollerContainer = scrollerRef.current;
  }, [controller]);

  return (
    <div className={'table-container'}>
      <TableHead state={state} query={query} headRef={headRef}/>
      <TableBody state={state} query={query} bodyRef={bodyRef}/>
      <div ref={scrollerRef} className={'scroll-controller'} onScroll={onHorizontalScroll}>
        <div style={{width: state.columns.totalWidth + scrollWidth, height: 1}}/>
      </div>
    </div>
  );
};
