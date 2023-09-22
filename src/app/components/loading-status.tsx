import { useTranslation } from 'react-i18next';
import { Loader } from '@progress/kendo-react-indicators';
import './loading-status.scss';


interface LoadingStatusProps {
  readonly loadingType: 'systems' | 'session' | string,
  readonly success?: boolean,
}


export const LoadingStatus = ({loadingType, success}: LoadingStatusProps) => {
  const { t } = useTranslation();
  const isError = success === false;
  const loadingStatusText = t(getKey(loadingType, isError));

  return (
    <div className={'loading-status'}>
      {isError ? null : <Loader type={'pulsing'} size={'large'}/>}
      <div className={'loading-status-text'}>{loadingStatusText}</div>
    </div>
  );
}

function getKey(type: string, isError: boolean): string {
  if (type === 'systems') {
    return isError ? 'systems.loading-error' : 'systems.loading';
  }
  if (type === 'session') {
    return isError ? 'session.loadingError' : 'session.loading';
  }
  return isError ? 'base.wrong' : 'base.loading';
}
