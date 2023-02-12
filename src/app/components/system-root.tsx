import { useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setSystemName } from '../store/app-state/app.actions';
import { appStateSelector } from '../store/app-state/app.selectors';
import { stateNeedFetch, stateNotLoaded, sessionFetchStateSelector } from 'entities/fetch-state';

import { Dock, startSession } from 'widgets/root-form';
import { LoadingStatus } from './loading-status';
import { WindowHandler } from 'entities/windows/window-handler';


/** Проверяет, есть ли указанная система в списке доступных систем. */
const checkSystem = (systemName: string, systemList: SystemList): boolean => {
  return systemList.find((system) => system.id === systemName) !== undefined;
};

/** Компонент, использующийся если система не найдена. */
const SystemNotFound = ({root, name}: {root: string, name: string}) => {
  const { t } = useTranslation();
  return (
    <div style={{padding: '2em', fontSize: '1.15rem'}}>
      <div>{t('systems.notFound', {systemName: name})}</div>
      <Link to={root}>&#11176; {t('systems.backToSystemList')}</Link>
    </div>
  );
};

/** Корень системы. Route: `/systems/:systemID`. */
export const SystemRoot = () => {
  const dispatch = useDispatch();
  const fetchState = useSelector(sessionFetchStateSelector);
  const { systemList, systemID, config } = useSelector(appStateSelector);

  const { systemID: paramsSystemID } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const isNeedStartSession = useMemo(() => {
    const isSystemExist = systemList && checkSystem(paramsSystemID, systemList);
    return isSystemExist && (stateNeedFetch(fetchState) || paramsSystemID !== systemID);
  }, [fetchState, systemList, systemID, paramsSystemID]);

  useEffect(() => {
    if (paramsSystemID !== systemID) dispatch(setSystemName(paramsSystemID));
  }, [paramsSystemID, systemID, dispatch]);

  useEffect(() => {
    if (isNeedStartSession) {
      const isDefault = searchParams.get('defaultSession') === 'true';
      if (isDefault) setSearchParams({});
      dispatch(startSession(isDefault));
    }
  }, [isNeedStartSession, searchParams, setSearchParams, dispatch]);

  if (fetchState?.ok) return <><Dock/><WindowHandler/></>;

  if (config === null) {
    return <LoadingStatus loadingType={'systems'}/>;
  }
  if (!systemList) {
    return <LoadingStatus loadingType={'systems'} success={false}/>;
  }
  if (stateNotLoaded(fetchState)) {
    return <LoadingStatus loadingType={'session'} />;
  }
  if (fetchState.ok === false) {
    return <LoadingStatus loadingType={'session'} success={false}/>
  }
  return <SystemNotFound name={systemID} root={config.root}/>;
};
