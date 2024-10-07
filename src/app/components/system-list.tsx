import type { TFunction } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { useAppConfig } from 'shared/global';
import { useAppStore } from '../store/app.store';

import './system-list.scss';
import systemIcon from 'assets/common/system.svg';
import loadDefaultIcon from 'assets/common/load-default.svg';


interface SystemCardProps {
  location: string;
  system: SystemInfo;
  dev: boolean;
  t: TFunction;
}


/** Страница списка систем. */
export const SystemList = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1 id={'program-name'}>Well Manager Web</h1>
      <nav id={'system-list'}>
        <h2>{t('systems.list')}</h2>
        <SystemCards t={t}/>
      </nav>
    </>
  );
}

const SystemCards = ({t}: {t: TFunction}) => {
  const config = useAppConfig();
  const { location, systemList } = useAppStore();

  if (!config) return <SystemListSkeleton/>;
  if (!systemList) return <div className={'not-loaded'}>{t('systems.loading-error')}</div>;
  const dev = config.mode === 'dev';

  const toCard = (system: SystemInfo) => {
    return <SystemCard key={system.id} location={location} system={system} dev={dev} t={t}/>;
  };
  return <div>{systemList.map(toCard)}</div>;
};

const SystemCard = ({location, system, dev, t}: SystemCardProps) => {
  const id = system.id;
  const title = t('systems.load-by-default-title')

  return (
    <section>
      <Link to={location + 'systems/' + id}>
        <img src={systemIcon} alt={'system'}/>
        <div>
          <div>
            <span className={'system-name'}>{system.displayName}</span>
            {dev && <span className={'system-id'}>{`(${id})`}</span>}
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
        <Skeleton.Avatar shape={'square'} active={true}/>
        <div style={{paddingTop: 5, height: 43}}>
          <Skeleton.Input style={{width: 200, height: 15}} block={true} active={true}/>
          <Skeleton.Input style={{width: 500, height: 13}} block={true} active={true}/>
        </div>
      </div>
      <div><Skeleton.Avatar shape={'square'} active={true}/></div>
    </section>
  );
};
