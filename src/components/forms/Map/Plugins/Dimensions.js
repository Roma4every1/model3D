import React from 'react';
import { useSelector } from 'react-redux';
import DimensionsView from "./DimensionsView";

export default function Dimensions(props) {
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);
    const control = useSelector((state) => state.formRefs[formId + "_mapView"]?.current);

    const setCenterScaleRef = React.useRef(null);

    const updateCenterScale = React.useCallback((newCs) => {
        if (formRef?.current) {
            var context = newCs;
            if (!newCs) {
                context = formRef?.current?.centerScale();
            }
            if (setCenterScaleRef.current) {
                setCenterScaleRef.current(context);
            }
        }
    }, [formRef]);

    React.useEffect(() => {
        if (formRef?.current) {
            formRef.current.subscribeOnCenterScaleChanging(updateCenterScale);
        }
    }, [formRef, updateCenterScale, control]);

    if (control) {
        control.addEventListener("mousemove", event => {
            updateCenterScale();
        }, { passive: true });

        control.addEventListener("mousewheel", event => {
            updateCenterScale();
        }, { passive: true });
    }

    return (
        <DimensionsView
            subscribeOnCenterScaleChanging={(setCs) => { setCenterScaleRef.current = setCs; updateCenterScale(); }}
            updateCanvas={(newCenterScale) => formRef.current.updateCanvas(newCenterScale)}
        />
    );
}