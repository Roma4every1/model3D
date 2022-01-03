import React from 'react';
import { useSelector } from 'react-redux';

export default function MapToFullviewport(props) {
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);

    const toFullViewport = () => {
        formRef.current.toFullViewport();
    };

    return <button className="k-button k-button-clear" onClick={toFullViewport}>
        <span className="k-icon k-i-zoom-actual-size" />
    </button>
}