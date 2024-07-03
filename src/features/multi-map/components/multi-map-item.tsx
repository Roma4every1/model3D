import { useEffect, useState } from 'react';
import { LoadingStatus, TextInfo } from 'shared/ui';
import { Map } from 'features/map';


interface MultiMapItemProps {
  data: MultiMapChild;
}


export const MultiMapItem = ({data}: MultiMapItemProps) => {
  const [progress, setProgress] = useState(data.progress);

  useEffect(() => {
    data.setProgress = (n: number) => { setProgress(n); data.progress = n; };
  }, [data]);

  if (progress < 0) return <TextInfo text={'map.not-loaded'}/>;
  if (progress < 100) return <LoadingStatus percentage={progress}/>;
  return <Map id={data.formID} channels={null}/>;
};
