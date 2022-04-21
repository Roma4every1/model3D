import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Toolbar } from "@progress/kendo-react-buttons";
import { Loader } from "@progress/kendo-react-indicators";
import ErrorBoundary from '../../common/ErrorBoundary';
import { capitalizeFirstLetter } from '../../../utils';

export default function DockPluginStrip(props) {
    const { formId } = props;
    const activeChildId = useSelector((state) => state.childForms[formId]?.openedChildren[0]);
    const activeSubChild = useSelector((state) => state.childForms[activeChildId]?.children.find(p => p.id === (state.childForms[activeChildId].activeChildren[0])));
    const plugins = useSelector((state) => state.plugins.strip);
    const pluginsByType = plugins.filter(el => el.component.form === capitalizeFirstLetter(activeSubChild?.type));
 
    if (activeSubChild) {
        return <Toolbar style={{ padding: 1 }}>
            {pluginsByType.map(p => {
                let LoadFormByType = React.lazy(() => import('../' + p.component.form + '/Plugins/' + p.component.path));
                return (<ErrorBoundary key={p.component.id}>
                    <Suspense fallback=<Loader size="small" type="infinite-spinner" />>
                        <LoadFormByType formId={activeSubChild.id} />
                    </Suspense>
                </ErrorBoundary>);
            })}
        </Toolbar>;
    }
    else {
        return <div />
    }
}