import React, { useState, useEffect } from "react";
import { GridColumnMenuFilter, GridColumnMenuCheckboxFilter } from "@progress/kendo-react-grid";
import { sessionManager } from "../../../store";
import { API } from "../../../api/api";
import { toDate } from "../../../utils/utils";


export const ColumnMenu = (props) => {
  const { tableColumn, formId, activeChannelName } = props;
  const [distinctData, setDistinctData] = useState([]);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      const paramList = sessionManager.channelsManager.getAllChannelParams(activeChannelName);
      const neededParamValues = sessionManager.paramsManager
        .getParameterValues(paramList, formId, false, activeChannelName);

      const res = await API.channels.getChannelData(activeChannelName, neededParamValues);
      const rows = res.data?.data?.Rows;

      if (!ignore && rows) {
        if (tableColumn.lookupData) {
          let existingValues = rows.map(r => String(r.Cells[0]));
          let data = tableColumn.lookupData
            .filter(v => existingValues.includes(String(v.id)))
            .map(ld => ({...ld, [tableColumn.field]: ld.value}));
          setDistinctData(data);
        } else {
          let existingValues = rows.map(r => {
            let rowValue = r.Cells[0];
            if (tableColumn.netType === 'System.DateTime' && rowValue) return toDate(rowValue);
            return rowValue;
          });
          let data = existingValues.map(ld => {
            const field = ld instanceof Date ? ld.toLocaleDateString() : ld;
            return {id: ld, [tableColumn.field]: field};
          });
          setDistinctData(data);
        }
      }
    }
    fetchData();
    return () => { ignore = true; };
  }, [tableColumn, activeChannelName, formId]);

  const Filter = tableColumn.lookupData ? ColumnMenuCheckboxFilter : ColumnMenuFilter;
  return <Filter {...props} data={distinctData}/>;
};

const ColumnMenuFilter = (props) => {
  return (
    <div>
      <GridColumnMenuFilter {...props} expanded={true} />
      <div className={'checkboxFilter'}>
        <GridColumnMenuCheckboxFilter
          {...props}
          data={props.data}
          searchBox={() => null}
        />
      </div>
    </div>
  );
};

const ColumnMenuCheckboxFilter = (props) => {
  return (
    <div>
      <GridColumnMenuCheckboxFilter
        {...props}
        data={props.data}
        expanded={true}
      />
    </div>
  );
};
