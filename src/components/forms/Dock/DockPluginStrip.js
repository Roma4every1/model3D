import React from "react";
import { useSelector } from "react-redux";
import { Toolbar } from "@progress/kendo-react-buttons";
import { capitalizeFirstLetter } from "../../../utils";
import { pluginsDict } from "../../dicts/plugins";
import ErrorBoundary from "../../common/ErrorBoundary";


export default function DockPluginStrip({formId}) {
  const activeChildId = useSelector((state) => state.childForms[formId]?.openedChildren[0]);
  const activeSubChild = useSelector((state) => state.childForms[activeChildId]?.children.find(p => p.id === (state.childForms[activeChildId].activeChildren[0])));
  const plugins = useSelector((state) => state.plugins.strip);

  const pluginsByType = plugins.filter(el => el.component.form === capitalizeFirstLetter(activeSubChild?.type));
  if (activeSubChild) {
    return (
      <Toolbar style={{ padding: 1 }}>
        {pluginsByType.map(p => {
          const PluginByType = pluginsDict[p.component.form.toLowerCase()][p.component.path];
          return (
            <ErrorBoundary key={p.component.id}>
              <PluginByType formId={activeSubChild.id} />
            </ErrorBoundary>
          );
        })}
      </Toolbar>
    );
  } else return <div />
}
