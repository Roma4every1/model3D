export const TextView = ({content}: FileViewModel<string>) => {
  return <div className={'file-view-text'}>{content}</div>;
};

export const IFrameView = ({uri}: FileViewModel) => {
  return <iframe style={{width: '100%', height: '100%'}} src={uri}/>;
};
