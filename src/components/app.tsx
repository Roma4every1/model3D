import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initialize } from '../store/thunks';
import { getAppLocation } from '../api/initialization';
import { selectors } from '../store';

import { SystemList } from './system-list';
import { SystemRoot } from './system-root';
import { UnknownRoute } from './common/unknown-route';

import '@progress/kendo-theme-default/dist/all.css';
import 'flexlayout-react/style/light.css';
import './custom.css';


/** Корень приложения. */
export const App = () => {
  const dispatch = useDispatch();
  const { config, systemList } = useSelector(selectors.appState);

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
