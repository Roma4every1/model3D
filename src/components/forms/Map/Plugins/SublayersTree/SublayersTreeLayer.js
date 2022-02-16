import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";

export default function SublayersTreeLayer(props) {
    const { t } = useTranslation();
    const { formRef, subitem, formId } = props;
    const activeLayer = useSelector((state) => state.formRefs[formId + "_activeLayer"]);
    const [selected, setSelected] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);
    const [checked, setChecked] = React.useState(subitem.sublayer.visible);
    const [lowScale, setLowScale] = React.useState(subitem.sublayer.lowscale);
    const [highScale, setHighScale] = React.useState(subitem.sublayer.highscale);

    const _lowScaleRef = React.useRef(null);
    const _highScaleRef = React.useRef(null);

    React.useEffect(() => {
        setSelected(subitem.sublayer === activeLayer);
    }, [activeLayer]);

    React.useEffect(() => {
        if (!subitem.sublayer.initialLowscale) {
            subitem.sublayer.initialLowscale = subitem.sublayer.lowscale;
            subitem.sublayer.initialHighscale = subitem.sublayer.highscale;
        }
    }, [subitem]);

    const setExpandedState = () => {
        setExpanded(!expanded);
    };

    const onChecked = () => {
        subitem.sublayer.visible = !checked;
        setChecked(!checked);
        formRef.current.updateCanvas();
    };

    const applyScales = () => {
        subitem.sublayer.lowscale = lowScale;
        subitem.sublayer.highscale = highScale;
        formRef.current.updateCanvas();
    };

    const revertScales = () => {
        if (subitem.sublayer.initialLowscale) {
            setLowScale(subitem.sublayer.initialLowscale);
            setHighScale(subitem.sublayer.initialHighscale);
            subitem.sublayer.lowscale = subitem.sublayer.initialLowscale;
            subitem.sublayer.highscale = subitem.sublayer.initialHighscale;
            formRef.current.updateCanvas();
        }
    };

    const setInfinity = () => {
        setHighScale('INF');
    };

    const setSelectedState = (e) => {
        if (e.nativeEvent.target.localName === 'div') {
            if (selected) {
                formRef.current.setActiveLayer(null);
            }
            else {
                formRef.current.setActiveLayer(subitem.sublayer);
            }
            setSelected(!selected);
        }
    };

    return (
        <div>
            <div className={"mapLayerHeader" + (selected ? "-selected" : "")} onClick={setSelectedState}>
                <Checkbox value={checked} onChange={onChecked} />
                {"  " + subitem.text}
                <div className="mapLayerExpand">
                    <button className="k-button k-button-clear" onClick={setExpandedState} title={t('map.layerVisibilityControl')}>
                        <span className="k-icon k-i-gear" />
                    </button>
                </div>
            </div>
            {expanded &&
                <div>
                    <div className="mapLayerParam">
                        <div className="mapLayerParamLabel">
                            {t('map.minscale')}
                        </div>
                        <div>
                            <Input className='mapLayerScaleEditor'
                                ref={_lowScaleRef}
                                value={lowScale}
                                name="lowscale"
                                onChange={(event) => {
                                    setLowScale(event.value);
                                }}
                            />
                        </div>
                    </div>
                    <div className="mapLayerParam">
                        <div className="mapLayerParamLabel">
                            {t('map.maxscale')}
                        </div>
                        <div className="mapLayerParamValue">
                            <Input className='mapLayerScaleEditor'
                                ref={_highScaleRef}
                                value={highScale === 'INF' ? t('base.infinity') : highScale}
                                name="highscale"
                                onChange={(event) => {
                                    setHighScale(event.value);
                                }}
                            />
                            <Button className='mapLayerInfinityButton' onClick={setInfinity}>
                                {t('base.infinitySign')}
                            </Button>
                        </div>
                    </div>
                    <div className="mapLayerBottom">
                        <Button className="mapLayerButtonRevert" onClick={revertScales} title={t('map.revertInitialValues')}>
                            <span className="k-icon k-i-reset-sm" />
                        </Button>
                        <Button className="mapLayerButtonApply" onClick={applyScales}>
                            {t('base.apply')}
                        </Button>
                    </div>
                </div>
            }
        </div>
    );
}