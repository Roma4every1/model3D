import { createRoot } from 'react-dom/client';
import { App, initialize } from 'app';

import 'flexlayout-react/style/light.css';
import '@progress/kendo-theme-default/dist/all.css';

import 'app/index.css';
import 'app/bootstrap.css';
import 'shared/ui/fonts/fonts.css';
import 'shared/locales';


const root = createRoot(document.getElementById('root'));
root.render(<App/>);
initialize().then();
