import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppLocation } from '../store/app.store';
import { SystemList } from './system-list';
import { SystemRoot } from './system-root';


export const App = () => {
  const location = useAppLocation();
  return (
    <BrowserRouter>
      <Routes>
        <Route path={location}>
          <Route path={''} element={ <SystemList/> }/>
          <Route path={'systems/:systemID'} element={ <SystemRoot/> }/>
        </Route>
        <Route path={'*'} element={ <Navigate to={location} replace={true}/> }/>
      </Routes>
    </BrowserRouter>
  );
};
