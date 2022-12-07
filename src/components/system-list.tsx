import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Skeleton } from "@progress/kendo-react-indicators";

import "../styles/start-page.scss";
import systemIcon from "../static/images/start-page/system.svg";
import loadDefaultIcon from "../static/images/start-page/load-default.svg";


interface SystemListProps {
  root: string,
  systemListState: FetchState<SystemList>,
}


/** Страница списка систем. */
export default function SystemList({root, systemListState}: SystemListProps) {
  const { t } = useTranslation();

  const mapSystems = useCallback((system: WMWSystem) => {
    return <SystemItem key={system.id} data={system} root={root} />;
  }, [root]);

  let mainContent;
  if (systemListState.loading) {
    mainContent = <SystemsSkeleton/>;
  } else if (systemListState.success) {
    mainContent = <div>{systemListState.data.map(mapSystems)}</div>;
  } else {
    mainContent = <div className={'not-loaded'}>{t('systems.loadingError')}</div>;
  }

  return (
    <>
      <h1 id={'program-name'}>Well Manager React</h1>
      <nav id={'system-list'}>
        <h2>{t('systems.list') + ':'}</h2>
        {mainContent}
      </nav>
    </>
  );
}

/** Элемент списка системы. */
const SystemItem = ({data, root}) => {
  const { id, displayName, description } = data;

  return (
    <section>
      <Link to={root + 'systems/' + id}>
        <img src={systemIcon} alt={'system'}/>
        <div>
          <div>
            <span className={'system-name'}>{displayName}</span>
            <span className={'system-id'}>{`(${id})`}</span>
          </div>
          <div>{description}</div>
        </div>
      </Link>
      <Link to={root + 'systems/' + id + '?defaultSession=true'} title={'Запустить со стандартными настройками'}>
        <img src={loadDefaultIcon} alt={'load-default'}/>
      </Link>
    </section>
  );
}

/** Скелет списка систем, пока он загружается. */
const SystemsSkeleton = () => {
  return (
    <div>
      <SystemSkeleton/>
      <SystemSkeleton/>
      <SystemSkeleton/>
      <SystemSkeleton/>
    </div>
  );
}
const SystemSkeleton = () => {
  return (
    <section>
      <div>
        <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
        <div>
          <Skeleton shape={'text'} style={{width: '250px', height: '24px'}} animation={{type: 'wave'}}/>
          <Skeleton shape={'text'} style={{width: '500px', height: '20px'}} animation={{type: 'wave'}}/>
        </div>
      </div>
      <div><Skeleton shape={'rectangle'} animation={{type: 'wave'}}/></div>
    </section>
  );
}
