import { useTranslation } from 'react-i18next';
import { CircularProgressBar } from './circular-progress-bar.tsx';
import './common.scss';


interface TextInfoProps {
  /** Идентификатор текста локализации или непосредственно текст. */
  text: string;
}

/** Текстовое сообщение (по центру, крупный шрифт). */
export const TextInfo = ({text}: TextInfoProps) => {
  const { t } = useTranslation();
  return <div className={'wm-text-info'}>{t(text)}</div>;
};

/* --- --- --- */

interface LoadingStatusProps {
  /** Процент загрузки. */
  percentage: number;
  /** Идентификатор локали. */
  status?: string;
  /** Аргументы шаблона локали. */
  statusOptions?: I18nOptions;
}

/** Индикатор загрузки со строкой статуса. */
export const LoadingStatus = ({percentage, status, statusOptions}: LoadingStatusProps) => {
  const { t } = useTranslation();

  return (
    <div className={'wm-loading-status'}>
      <CircularProgressBar size={100} percentage={percentage}/>
      {status && <div className={'status'}>{t(status, statusOptions)}</div>}
    </div>
  );
};
