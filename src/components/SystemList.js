import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Skeleton } from "@progress/kendo-react-indicators";


/** Заглушка элемента списка систем, пока список систем не загружен. */
const SystemSkeleton = () => {
  return <Skeleton shape={'text'} style={{width: '50vw', height: '2em'}} animation={{type: 'wave'}}/>;
}

/** Элемент списка системы. */
const SystemItem = ({data, root}) => {
  const { id, displayName, description } = data;

  return (
    <li title={description}>
      <Link to={root + 'systems/' + id}>
        {displayName ? `${displayName} (${id})` : id}
      </Link>
    </li>
  );
}

/** Элемент списка систем. */
export default function SystemList({root, systemListState}) {
  const { t } = useTranslation();

  let mainContent;
  if (systemListState.success && systemListState.loaded) {
    mainContent = (
      <ul>
        {systemListState.data.map((system) => <SystemItem key={system.id} data={system} root={root} />)}
      </ul>
    );
  } else if (systemListState.success === false) {
    mainContent = <div className="not-loaded">{t('systems.loadingError')}</div>;
  } else {
    mainContent = (
      <ul>
        <li><SystemSkeleton/></li>
        <li><SystemSkeleton/></li>
        <li><SystemSkeleton/></li>
        <li><SystemSkeleton/></li>
      </ul>
    );
  }

  return (
    <>
      <h1 id="program-name">Well Manager React</h1>
      <nav id="system-list">
        <h2>{t('systems.list') + ':'}</h2>
        {mainContent}
      </nav>
    </>
  );
}
