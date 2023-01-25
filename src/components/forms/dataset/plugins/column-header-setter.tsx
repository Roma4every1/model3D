import { useState, useEffect } from 'react';
import { ColumnHeaderLabelSetter } from './column-header-label-setter';
import { API } from '../../../../api/api';


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

  const mapLabels = (label, i: number) => {
    return (
      <ColumnHeaderLabelSetter
        key={i} formID={formID}
        id={label['@switchingParameterName']}
        column={label['@columnName']}
        property={label['@ChannelPropertyName']}
      />
    );
  };

  return <div>{pluginData?.tableColumnHeaderSetter?.specialLabel?.map(mapLabels)}</div>;
};
