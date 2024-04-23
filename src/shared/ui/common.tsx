import { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { CircularProgressBar } from './circular-progress-bar';
import './common.scss';


export interface TextInfoProps {
  /** Идентификатор текста локализации или непосредственно текст. */
  text: string;
}

/** Текстовое сообщение (по центру, крупный шрифт). */
export const TextInfo = ({text}: TextInfoProps) => {
  const { t } = useTranslation();
  return <div className={'wm-text-info'}>{t(text)}</div>;
};

/* --- --- --- */

export interface LoadingStatusProps {
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

/* --- --- */

export interface ButtonSwitchProps {
  options: string[];
  active: number;
  onChange: (index: number) => void;
  style?: CSSProperties;
}

export const ButtonSwitch = ({options, active, onChange, style}: ButtonSwitchProps) => {
  const width = (100 / options.length) + '%';

  const toElement = (option: string, i: number) => {
    const type = i === active ? 'primary' : undefined;
    const onClick = () => onChange(i);
    return <Button key={i} type={type} onClick={onClick} style={{width}}>{option}</Button>;
  };

  return (
    <div className={'wm-button-switch'} style={style}>
      {options.map(toElement)}
    </div>
  );
};
