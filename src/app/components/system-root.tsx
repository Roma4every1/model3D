import { useEffect, useMemo } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSystemName } from '../store/app-state/app.actions';
import { appStateSelector } from '../store/app-state/app.selectors';
import { startSession } from '../store/root-form/root-form.thunks';
import { stateNeedFetch, stateNotLoaded, sessionFetchStateSelector } from 'entities/fetch-state';

import { Dock } from './dock';
import { LoadingStatus } from './loading-status';
import { WindowHandler } from 'entities/window/components/windows';
import { Notifications } from 'entities/notifications';


/** Корень системы. Route: `/systems/:systemID`. */
export const SystemRoot = () => {
  const dispatch = useDispatch();
  const fetchState = useSelector(sessionFetchStateSelector);
  const { systemList, systemID, config } = useSelector(appStateSelector);

  const { systemID: paramsSystemID } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSystemExist = useMemo(() => {
    return systemList && systemList.find((system) => system.id === paramsSystemID) !== undefined;
  }, [systemList, paramsSystemID]);

  const isNeedStartSession = useMemo(() => {
    return isSystemExist && (stateNeedFetch(fetchState) || paramsSystemID !== systemID);
  }, [fetchState, isSystemExist, systemID, paramsSystemID]);

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

  if (fetchState?.ok) {
    return (
      <>
        <Dock config={config}/>
        <WindowHandler/>
        <Notifications/>
      </>
    );
  }

  if (config === null) return <LoadingStatus loadingType={'systems'}/>;
  if (!systemList) return <LoadingStatus loadingType={'systems'} success={false}/>;
  if (!isSystemExist) return <Navigate to={config.root} replace={true}/>;

  if (stateNotLoaded(fetchState)) return <LoadingStatus loadingType={'session'}/>;
  return <LoadingStatus loadingType={'session'} success={false}/>;
};
