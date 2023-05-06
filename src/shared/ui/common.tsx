import { useTranslation } from 'react-i18next';
import './common.scss';


interface TextInfoProps {
  text: string,
}


/** Текстовое сообщение (по центру, крупный шрифт). */
export const TextInfo = ({text}: TextInfoProps) => {
  const { t } = useTranslation();
  return <div className={'wm-text-info'}>{t(text)}</div>;
};
