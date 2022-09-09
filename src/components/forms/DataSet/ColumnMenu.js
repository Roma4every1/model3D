import * as React from "react";
import { useSelector } from 'react-redux';
import { GridColumnMenuFilter, GridColumnMenuCheckboxFilter } from "@progress/kendo-react-grid";


export default function ColumnMenu(props) {
    const { tableColumn, formId, activeChannelName } = props;
    const sessionManager = useSelector((state) => state.sessionManager);
    const sessionId = useSelector((state) => state.sessionId);
    const [distinctData, setDistinctData] = React.useState([]);

    React.useEffect(() => {
        let ignore = false;
        async function fetchData() {
            const dataD = sessionManager.channelsManager.getAllChannelParams(activeChannelName);
            var neededParamValues = sessionManager.paramsManager.getParameterValues(dataD, formId, false, activeChannelName);
            var jsonToSend = { sessionId: sessionId, channelName: activeChannelName, paramValues: neededParamValues, paramName: tableColumn.fromColumn ?? tableColumn.field };
            const jsonToSendString = JSON.stringify(jsonToSend);
            const dataAll = await sessionManager.fetchData(`getChannelDataByName`,
                {
                    method: 'POST',
                    body: jsonToSendString
                });
            if (!ignore) {
                if (tableColumn.lookupData) {
                    let existingValues = dataAll.data.Rows.map(r => String(r.Cells[0]));
                    let data = tableColumn.lookupData.filter(v => existingValues.includes(String(v.id))).map(ld => {
                        return {
                            ...ld,
                            [tableColumn.field]: ld.value
                        }
                    });
                    setDistinctData(data);
                }
                else {
                    let existingValues = dataAll.data.Rows.map(r => {
                        let rowValue = r.Cells[0];
                        if (tableColumn.netType === 'System.DateTime' && rowValue) {
                            const startIndex = rowValue.indexOf('(');
                            const finishIndex = rowValue.lastIndexOf('+');
                            const dateValue = rowValue.slice(startIndex + 1, finishIndex);
                            var d = new Date();
                            d.setTime(dateValue);
                            return d;
                        }
                        return rowValue;
                    });
                    let data = existingValues.map(ld => {
                        return {
                            id: ld,
                            [tableColumn.field]: ld instanceof Date ? ld.toLocaleDateString() : ld
                        }
                    });
                    setDistinctData(data);
                }
            }
        };
        fetchData();
        return () => {
            ignore = true;
        };
    }, [tableColumn, activeChannelName, formId, sessionManager, sessionId]);

    if (tableColumn.lookupData) {
        return <ColumnMenuCheckboxFilter {...props} data={distinctData} />;
    }
    else {
        return <ColumnMenuFilter {...props} data={distinctData} />;
    }
}

const ColumnMenuFilter = (props) => {
    return (
        <div>
            <GridColumnMenuFilter {...props} expanded={true} />
            <div className="checkboxFilter">
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
