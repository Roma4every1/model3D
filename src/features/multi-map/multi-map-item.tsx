import { useEffect, useState } from 'react';
import { LoadingStatus, TextInfo } from 'shared/ui';
import { Map } from '../map';


interface MultiMapItemProps {
  parent: ClientID;
  config: MapItemConfig;
}


export const MultiMapItem = ({parent, config}: MultiMapItemProps) => {
  const [progress, setProgress] = useState(config.progress);

  useEffect(() => {
    config.setProgress = (n: number) => { setProgress(n); config.progress = n; };
  }, [config]);

  if (progress < 0) return <TextInfo text={'map.not-loaded'}/>;
  if (progress < 100) return <LoadingStatus percentage={progress}/>;
  return <Map id={config.formID} type={'map'} parent={parent} settings={null} channels={null}/>;
};
