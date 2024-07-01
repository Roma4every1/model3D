import type { TFunction } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { useAppStore } from '../store/app.store';

import './system-list.scss';
import systemIcon from 'assets/common/system.svg';
import loadDefaultIcon from 'assets/common/load-default.svg';


interface SystemItemProps {
  location: string;
  config: ClientConfig;
  system: SystemInfo;
  t: TFunction;
}


/** Страница списка систем. */
export const SystemList = () => {
  const { location, config, systemList } = useAppStore();
  const { t } = useTranslation();

  let mainContent;
  if (config === null) {
    mainContent = <SystemListSkeleton/>;
  } else if (systemList) {
    const systemToListItem = (system: SystemInfo, i: number) => {
      return <SystemItem key={i} location={location} system={system} config={config} t={t}/>;
    };
    mainContent = <div>{systemList.map(systemToListItem)}</div>;
  } else {
    mainContent = <div className={'not-loaded'}>{t('systems.loading-error')}</div>;
  }

  return (
    <>
      <h1 id={'program-name'}>Well Manager Web</h1>
      <nav id={'system-list'}>
        <h2>{t('systems.list')}</h2>
        {mainContent}
      </nav>
    </>
  );
}

/** Элемент списка системы. */
const SystemItem = ({location, system, config, t}: SystemItemProps) => {
  const id = system.id;
  const title = t('systems.load-by-default-title')

  return (
    <section>
      <Link to={location + 'systems/' + id}>
        <img src={systemIcon} alt={'system'}/>
        <div>
          <div>
            <span className={'system-name'}>{system.displayName}</span>
            {config.devMode && <span className={'system-id'}>{`(${id})`}</span>}
          </div>
          <div>{system.description}</div>
        </div>
      </Link>
      <Link to={location + 'systems/' + id + '?defaultSession=true'} title={title}>
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
    </div>
  );
};

const SystemSkeleton = () => {
  return (
    <section>
      <div>
        <Skeleton.Avatar shape={'square'} active/>
        <div style={{paddingTop: 5, height: 43}}>
          <Skeleton.Input style={{width: 200, height: 15}} block active/>
          <Skeleton.Input style={{width: 500, height: 13}} block active/>
        </div>
      </div>
      <div><Skeleton.Avatar shape={'square'} active/></div>
    </section>
  );
};
