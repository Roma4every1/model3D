import { useEffect, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { MapItemConfig } from './multi-map-utils';
import { Map } from '../map/components/map';
import { CircularProgressBar } from 'shared/ui';


export const MultiMapItem = ({config}: {config: MapItemConfig}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(config.progress);

  useEffect(() => {
    config.setProgress = setProgress;
  }, [config]);

  if (progress < 0) return <MapLoadError t={t}/>;
  if (progress < 100) return <CircularProgressBar percentage={progress} size={100}/>;
  return (
    <Map
      id={config.formID} type={'map'} parent={config.parent}
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
