import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { App, store } from 'app';

import 'flexlayout-react/style/light.css';
import 'bootstrap/dist/css/bootstrap.css';
import '@progress/kendo-theme-default/dist/all.css';
import 'app/index.css';

import 'shared/locales';

const root = createRoot(document.getElementById('root'));
root.render(<Provider store={store}><App/></Provider>);
