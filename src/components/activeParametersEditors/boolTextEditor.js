import React from 'react';
import { Checkbox } from "@progress/kendo-react-inputs";

export default function BoolTextEditor(props) {

    const defVal = (v, dfv) => {
        if ((typeof v === 'undefined') || (v === null)) {
            if ((typeof dfv === 'undefined') || (dfv === null)) {
                return Boolean(false);
            }
            else {
                return getBoolVal(dfv);
            }
        }
        else {
            return getBoolVal(v);
        }
    };

    //get str from bool
    const getValStr = (boolval) => {
        if (boolval) {
            return 'True';
        }
        else {
            return 'False';
        }
    };

    //get bool from str
    const getBoolVal = (boolstr) => {
        if (boolstr === 'True') {
            return Boolean(true);
        }
        else {
            return Boolean(false);
        }
    };

    return (
        <Checkbox className='parametereditorwithoutheightcb'
            id={props.id}
            name={props.id}
            defaultChecked={defVal(props.value, props.defaultValue)}
            value={getBoolVal(props.value)}
            onChange={(event) => {
                var newevent = {};
                newevent.target = {};
                newevent.target.name = event.target.name;
                newevent.target.value = getValStr(event.target.value);
                props.selectionChanged(newevent)
            }}
        />
    );
}
