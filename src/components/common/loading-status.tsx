import { useTranslation } from "react-i18next";
import { Loader } from "@progress/kendo-react-indicators";


interface LoadingStatusProps {
  readonly loadingType: 'config' | 'systems' | 'session' | string,
  readonly success?: boolean,
}

const LoadingStatus = ({loadingType, success}: LoadingStatusProps) => {
  const { t } = useTranslation();
  const isError = success === false;

  let loadingStatusText;
  switch (loadingType) {
    case 'config': {
      loadingStatusText = isError
        ? t('clientConfig.loadingError')
        : t('clientConfig.loading');
      break;
    }
    case 'systems': {
      loadingStatusText = isError
        ? t('systems.loadingError')
        : t('systems.loading');
      break;
    }
    case 'session': {
      loadingStatusText = isError
        ? t('session.loadingError')
        : t('session.loading');
      break;
    }
    default: {
      loadingStatusText = isError
      ? t('base.wrong')
      : t('base.loading');
    }
  }

  return (
    <div className={'loading-status'}>
      {isError ? null : <Loader type={'pulsing'} size={'large'}/>}
      <div className={'loading-status-text'}>{loadingStatusText}</div>
    </div>
  );
}

export default LoadingStatus;
