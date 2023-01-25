import { TFunction, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from '@progress/kendo-react-indicators';

import '../styles/start-page.scss';
import systemIcon from '../static/images/start-page/system.svg';
import loadDefaultIcon from '../static/images/start-page/load-default.svg';


interface SystemListProps {
  config: ClientConfiguration,
  list: SystemList,
}
interface SystemItemProps {
  root: string,
  system: WMWSystem,
  t: TFunction,
}


/** Страница списка систем. */
export const SystemList = ({config, list}: SystemListProps) => {
  const { t } = useTranslation();

  let mainContent;
  if (config === null) {
    mainContent = <SystemListSkeleton/>;
  } else if (list) {
    const systemToListItem = (system: WMWSystem, i: number) => {
      return <SystemItem key={i} root={config.root} system={system} t={t}/>;
    };
    mainContent = <div>{list.map(systemToListItem)}</div>;
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
const SystemItem = ({root, system, t}: SystemItemProps) => {
  const id = system.id;
  const title = t('systems.load-by-default-title')

  return (
    <section>
      <Link to={root + 'systems/' + id}>
        <img src={systemIcon} alt={'system'}/>
        <div>
          <div>
            <span className={'system-name'}>{system.displayName}</span>
            <span className={'system-id'}>{`(${id})`}</span>
          </div>
          <div>{system.description}</div>
        </div>
      </Link>
      <Link to={root + 'systems/' + id + '?defaultSession=true'} title={title}>
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
          <Skeleton shape={'text'} style={{width: '250px', height: '24px'}} animation={{type: 'wave'}}/>
          <Skeleton shape={'text'} style={{width: '500px', height: '20px'}} animation={{type: 'wave'}}/>
        </div>
      </div>
      <div><Skeleton shape={'rectangle'} animation={{type: 'wave'}}/></div>
    </section>
  );
};
