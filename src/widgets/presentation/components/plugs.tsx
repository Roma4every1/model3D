import { useTranslation } from 'react-i18next';
import { Skeleton, SkeletonProps } from '@progress/kendo-react-indicators';


const skeletonProps: SkeletonProps = {
  shape: 'rectangle',
  style: {width: '100%', height: '100%'},
  animation: {type: 'wave'},
};

/** Лоадер для презентации. */
export const PresentationSkeleton = () => {
  return <Skeleton {...skeletonProps}/>;
};

/** Заглушка при ошибке инициализации презентации. */
export const PresentationFetchError = ({details}: {details: string}) => {
  return <div className={'map-not-found'}>{details}</div>;
};


/** Лоадер для формы. */
export const FormSkeleton = () => {
  return <Skeleton {...skeletonProps}/>;
};

/** Заглушка при ошибке инициализации формы. */
export const FormFetchError = ({details}: {details: string}) => {
  return <div className={'map-not-found'}>{details}</div>;
};

/** Заглушка для не поддерживаемых форм. */
export const NotSupportedForm = () => {
  const { t } = useTranslation();
  return <div className={'map-not-found'}>{t('messages.unsupported-form')}</div>;
};
