import { createRoot } from 'react-dom/client';
import { App, beforeunloadCallback } from 'app';

import 'flexlayout-react/style/light.css';
import 'bootstrap/dist/css/bootstrap.css';
import '@progress/kendo-theme-default/dist/all.css';

import 'app/index.css';
import 'shared/ui/fonts/fonts.css';
import 'shared/locales';


const root = createRoot(document.getElementById('root'));
root.render(<App/>);
window.addEventListener('beforeunload', beforeunloadCallback);
