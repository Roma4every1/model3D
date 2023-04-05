interface TracePanelProps {
  /** Канал с трассами */
  channel: Channel,
}


export const TracePanel = ({channel}: TracePanelProps) => {
  console.log(channel);
  return <div>Trace editing</div>
};
