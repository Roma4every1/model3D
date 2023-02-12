import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './unknown-route.scss';


/** Страница-заглушка для несуществующих путей. */
export const UnknownRoute = ({root}: {root: string}) => {
  const { t } = useTranslation();
  const unresolvedPath = window.location.pathname;

  return (
    <div id={'unknown-route'}>
      <div>{t('session.unknownPath', {unresolvedPath})}</div>
      <ul>
        <li>
          <Link to={root}>
            <code> {root}                </code>
            <span> — {t('systems.list').toLowerCase()}</span>
          </Link>
        </li>
        <li>
          <Link to={root}>
            <code> {root}systems/:SYSTEM </code>
            <span> — {t('systems.system')} &lt;SYSTEM&gt;</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};
