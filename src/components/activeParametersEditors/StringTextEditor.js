import React from 'react';
import { Label } from "@progress/kendo-react-labels";
import { Input } from "@progress/kendo-react-inputs";

export default function StringTextEditor(props) {
    const [valueToShow, setValueToShow] = React.useState('');

    React.useEffect(() => {
        let ignore = false;
        if (!ignore) {
            if (props.value) {
                setValueToShow(props.value);
            }
            else {
                setValueToShow('');
            }
        }
        return () => { ignore = true; }
    }, [props.value]);

    return (
        <div className='parametereditorbox'>
            <Label className='parameterlabel' editorId={props.id}>{props.displayName}</Label>
            <Input className='parametereditor'
                value={valueToShow}
                name={props.id}
                onChange={(event) => {
                    setValueToShow(event.value);
                    props.selectionChanged(event);
                }}
            />
        </div>
    );
}
