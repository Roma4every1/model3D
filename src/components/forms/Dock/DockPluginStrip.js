import React from "react";
import { useSelector } from "react-redux";
import { Toolbar } from "@progress/kendo-react-buttons";
import { capitalizeFirstLetter } from "../../../utils";
import { pluginsDict } from "../../dicts/plugins";
import { selectors } from "../../../store";
import ErrorBoundary from "../../common/ErrorBoundary";


const getFormStripPlugins = (plugins, formType) => {
  return plugins.filter(plugin => plugin.component.form === formType);
}

export default function DockPluginStrip({formId}) {
  const stripPlugins = useSelector(selectors.stripPlugins);
  const activeChildData = useSelector(selectors.activeChild.bind(formId));
  const activeSubChildData = useSelector(selectors.activeChild.bind(activeChildData?.id));

  if (!activeSubChildData) return null;
  const formPlugins = getFormStripPlugins(stripPlugins, capitalizeFirstLetter(activeSubChildData.type));

  return (
    <Toolbar style={{padding: 1}}>
      {formPlugins.map(p => {
        const PluginByType = pluginsDict[p.component.form.toLowerCase()][p.component.path];
        return (
          <ErrorBoundary key={p.component.id}>
            <PluginByType formId={activeSubChildData.id} />
          </ErrorBoundary>
        );
      })}
    </Toolbar>
  );
}
