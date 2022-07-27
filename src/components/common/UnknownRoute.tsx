import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


/** Страница-заглушка для несуществующих путей. */
const UnknownRoute = ({root}) => {
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
}

export default UnknownRoute;
