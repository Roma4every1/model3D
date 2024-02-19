import { useEffect } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'shared/lib';
import { setSystemName } from '../store/app-state/app.actions';
import { appStateSelector } from '../store/app-state/app.selectors';
import { startSession } from '../store/root-form/root-form.thunks';
import { stateNeedFetch, stateNotLoaded, sessionFetchStateSelector } from 'entities/fetch-state';

import { Dock } from './dock';
import { LoadingStatus } from './loading-status';
import { WindowHandler } from 'entities/window/components/windows';
import { Notifications } from 'entities/notifications';
import { TopToolbar } from './top-toolbar';


/** Корень системы. Route: `/systems/:systemID`. */
export const SystemRoot = () => {
  const dispatch = useDispatch();
  const fetchState = useSelector(sessionFetchStateSelector);
  const { systemList, systemID, config } = useSelector(appStateSelector);

  const { systemID: paramsSystemID } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultSession = searchParams.get('defaultSession') === 'true';
  const systemExist = systemList && systemList.some(system => system.id === paramsSystemID);

  const needStartSession = systemExist &&
    (stateNeedFetch(fetchState) || paramsSystemID !== systemID || defaultSession);

  // обновление ID системы
  useEffect(() => {
    if (paramsSystemID !== systemID) dispatch(setSystemName(paramsSystemID));
  }, [paramsSystemID, systemID, dispatch]);

  // инициализация новой сессии
  useEffect(() => {
    if (!needStartSession) return;
    if (defaultSession) setSearchParams({});
    dispatch(startSession(defaultSession));
  }, [needStartSession, defaultSession, searchParams, setSearchParams, dispatch]);

  if (fetchState?.ok) return (
    <>
      <Dock config={config}/>
      <TopToolbar config={config}/>
      <WindowHandler/>
      <Notifications/>
    </>
  );

  if (config === null) return <LoadingStatus loadingType={'systems'}/>;
  if (!systemList) return <LoadingStatus loadingType={'systems'} success={false}/>;
  if (!systemExist) return <Navigate to={config.root} replace={true}/>;

  if (stateNotLoaded(fetchState)) return <LoadingStatus loadingType={'session'}/>;
  return <LoadingStatus loadingType={'session'} success={false}/>;
};
