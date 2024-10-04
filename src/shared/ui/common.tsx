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

export interface ButtonSwitchProps<T> {
  options: {label: string, value: T}[];
  value: T;
  onChange: (value: T) => void;
  style?: CSSProperties;
}

export function ButtonSwitch<T>({options, value, onChange, style}: ButtonSwitchProps<T>) {
  const width = (100 / options.length) + '%';

  const toElement = (option: {label: string, value: T}, i: number) => {
    const type = option.value === value ? 'primary' : undefined;
    const onClick = () => onChange(option.value);
    return <Button key={i} type={type} onClick={onClick} style={{width}}>{option.label}</Button>;
  };

  return (
    <div className={'wm-button-switch'} style={style}>
      {options.map(toElement)}
    </div>
  );
}
