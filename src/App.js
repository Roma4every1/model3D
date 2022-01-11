import '@progress/kendo-theme-default/dist/all.css';
import 'flexlayout-react/style/light.css';
import './custom.css'
import React from 'react';
import SystemRouter from './components/SystemRouter';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom";

export default function App() {

    return (
        <Router>
            <Routes>
                <Route path="*" element={<SystemRouter />} />
            </Routes>
        </Router>
    );
}
