import { useEffect, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Map } from '../map';
import { CircularProgressBar } from 'shared/ui';


export const MultiMapItem = ({parent, config}: {parent: FormID, config: MapItemConfig}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(config.progress);

  useEffect(() => {
    config.setProgress = (n: number) => { setProgress(n); config.progress = n; };
  }, [config]);

  if (progress < 0) return <MapLoadError t={t}/>;
  if (progress < 100) return <CircularProgressBar percentage={progress} size={100}/>;
  return (
    <Map
      id={config.formID} type={'map'} parent={parent}
      settings={{}} channels={[]} data={config.data}
    />
  );
};

export const MapNotFound = ({t}: {t: TFunction}) => {
  return <div className={'map-not-found'}>{t('map.not-found')}</div>;
}

export const MapLoadError = ({t}: {t: TFunction}) => {
  return <div className={'map-not-found'}>{t('map.not-loaded')}</div>;
}
