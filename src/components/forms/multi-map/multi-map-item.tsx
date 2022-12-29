import { useEffect, useState } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { MapItemConfig } from "./multi-map-utils";
import Map from "../map/map";


export const MultiMapItem = ({config}: {config: MapItemConfig}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(config.progress);

  useEffect(() => {
    config.setProgress = setProgress;
  }, [config]);

  if (progress < 0) return <MapLoadError t={t}/>;
  if (progress < 100) return <CircularProgressBar percentage={progress} size={100}/>;
  return <Map formData={{id: config.formID}} data={config.data}/>;
};

export const MapNotFound = ({t}: {t: TFunction}) => {
  return <div className={'map-not-found'}>{t('map.not-found')}</div>;
}

export const MapLoadError = ({t}: {t: TFunction}) => {
  return <div className={'map-not-found'}>{t('map.not-loaded')}</div>;
}

export const CircularProgressBar = ({percentage, size}: {percentage: number, size: number}) => {
  const radius = (size - 10) / 2;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray - dashArray * percentage / 100;

  return (
    <div className={'circular-progress-bar'}>
      <svg width={size} height={size}>
        <circle
          className={'circle-background'} strokeWidth={'10px'}
          cx={'50%'} cy={'50%'} r={radius}
        />
        <circle
          className={'circle-progress'} strokeWidth={'8px'}
          cx={'50%'} cy={'50%'} r={radius}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{strokeDasharray: dashArray, strokeDashoffset: dashOffset}}
        />
        <text className={'circle-text'} x={'50%'} y={'50%'} dy={'.3em'}>
          {percentage + '%'}
        </text>
      </svg>
    </div>
  );
};
