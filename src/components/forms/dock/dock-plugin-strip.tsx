import { useSelector } from "react-redux";
import { Toolbar } from "@progress/kendo-react-buttons";
import { capitalizeFirstLetter } from "../../../utils/utils";
import { pluginsDict } from "../../../dicts/plugins";
import { selectors } from "../../../store";
import ErrorBoundary from "../../common/error-boundary";


const getFormStripPlugins = (plugins: FormPlugin[], formType): FormPlugin[] => {
  return plugins.filter(plugin => (plugin.component as any).form === formType);
}

export default function DockPluginStrip({formId}) {
  const stripPlugins = useSelector(selectors.stripPlugins);
  const activeChildData: FormDataWMR = useSelector(selectors.activeChild.bind(formId));
  const activeSubChildData: FormDataWMR = useSelector(selectors.activeChild.bind(activeChildData?.id));

  if (!activeSubChildData) return null;
  const formPlugins = getFormStripPlugins(stripPlugins, capitalizeFirstLetter(activeSubChildData.type));

  return (
    <Toolbar style={{padding: 1}}>
      {formPlugins.map(p => {
        const PluginByType = pluginsDict[(p.component as any).form.toLowerCase()][(p.component as any).path];
        return (
          <ErrorBoundary key={(p.component as any).id}>
            <PluginByType formId={activeSubChildData.id} />
          </ErrorBoundary>
        );
      })}
    </Toolbar>
  );
}
