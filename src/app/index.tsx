import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAppLocation } from './lib/initialization';
import { appStateSelector } from './store/app-state/app.selectors';
import { initialize } from './store/app-state/app.thunks';

import { SystemList } from './components/system-list';
import { SystemRoot } from './components/system-root';
import { UnknownRoute } from './components/unknown-route';


export { store } from './store/index';

/** Корень приложения. */
export const App = () => {
  const dispatch = useDispatch();
  const { config, systemList } = useSelector(appStateSelector);

  // Загрузка клиенсткой конфигурации и списка систем
  useEffect(() => {
    if (config === null) dispatch(initialize);
  }, [config, dispatch]);

  const root = config ? config.root : getAppLocation();

  return (
    <BrowserRouter>
      <Routes>
        <Route path={root}>
          <Route path={''} element={ <SystemList config={config} list={systemList}/> }/>
          <Route path={'systems/:systemID'} element={ <SystemRoot/> }/>
        </Route>
        <Route path={'*'} element={ <UnknownRoute root={root}/> }/>
      </Routes>
    </BrowserRouter>
  );
};
