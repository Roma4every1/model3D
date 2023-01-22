import { useState, useEffect } from "react";
import ColumnHeaderLabelSetter from "./column-header-label-setter";
import { API } from "../../../../api/api";


export const ColumnHeaderSetter = ({formID}: PropsFormID) => {
  const [pluginData, setPluginData] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const { ok, data } = await API.getPluginData(formID, 'tableColumnHeaderSetter');
      if (!ignore && ok && data) setPluginData(data);
    }
    fetchData();
    return () => { ignore = true; }
  }, [formID]);

  const mapLabels = (label) => {
    return (
      <ColumnHeaderLabelSetter
        formId={formID} column={label['@columnName']}
        parameter={label['@switchingParameterName']}
        property={label['@ChannelPropertyName']}
      />
    );
  };

  return <div>{pluginData?.tableColumnHeaderSetter?.specialLabel?.map(mapLabels)}</div>;
};
