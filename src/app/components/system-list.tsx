import { TFunction, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '@progress/kendo-react-indicators';

import './system-list.scss';
import systemIcon from 'assets/images/common/system.svg';
import loadDefaultIcon from 'assets/images/common/load-default.svg';


interface SystemListProps {
  config: ClientConfiguration;
  list: SystemList;
}
interface SystemItemProps {
  config: ClientConfiguration;
  system: WellManagerSystem;
  t: TFunction;
}


/** Страница списка систем. */
export const SystemList = ({config, list}: SystemListProps) => {
  const { t } = useTranslation();

  let mainContent;
  if (config === null) {
    mainContent = <SystemListSkeleton/>;
  } else if (list) {
    const systemToListItem = (system: WellManagerSystem, i: number) => {
      return <SystemItem key={i} system={system} config={config} t={t}/>;
    };
    mainContent = <div>{list.map(systemToListItem)}</div>;
  } else {
    mainContent = <div className={'not-loaded'}>{t('systems.loadingError')}</div>;
  }

  return (
    <>
      <h1 id={'program-name'}>Well Manager</h1>
      <nav id={'system-list'}>
        <h2>{t('systems.list') + ':'}</h2>
        {mainContent}
      </nav>
    </>
  );
}

/** Элемент списка системы. */
const SystemItem = ({system, config, t}: SystemItemProps) => {
  const id = system.id;
  const title = t('systems.load-by-default-title')

  return (
    <section>
      <Link to={config.root + 'systems/' + id}>
        <img src={systemIcon} alt={'system'}/>
        <div>
          <div>
            <span className={'system-name'}>{system.displayName}</span>
            {config.devMode && <span className={'system-id'}>{`(${id})`}</span>}
          </div>
          <div>{system.description}</div>
        </div>
      </Link>
      <Link to={config.root + 'systems/' + id + '?defaultSession=true'} title={title}>
        <img src={loadDefaultIcon} alt={'load-default'}/>
      </Link>
    </section>
  );
};

/** Скелет списка систем, пока он загружается. */
export const SystemListSkeleton = () => {
  return (
    <div>
      <SystemSkeleton/>
      <SystemSkeleton/>
      <SystemSkeleton/>
      <SystemSkeleton/>
    </div>
  );
};

const SystemSkeleton = () => {
  return (
    <section>
      <div>
        <Skeleton shape={'rectangle'} animation={{type: 'wave'}}/>
        <div>
          <Skeleton shape={'text'} style={{width: 250, height: 24}} animation={{type: 'wave'}}/>
          <Skeleton shape={'text'} style={{width: 500, height: 20}} animation={{type: 'wave'}}/>
        </div>
      </div>
      <div><Skeleton shape={'rectangle'} animation={{type: 'wave'}}/></div>
    </section>
  );
};
