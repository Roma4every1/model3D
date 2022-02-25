import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
import { Label } from "@progress/kendo-react-labels";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Checkbox } from "@progress/kendo-react-inputs";
import { ColorPicker } from "@progress/kendo-react-inputs";
import { NumericTextBox } from "@progress/kendo-react-inputs";
import FillNameTemplate from "./FillNameTemplate";
import StyleTemplate from "./StyleTemplate";
import lines from "../../lines.json";
import setFormRefs from '../../../../../store/actionCreators/setFormRefs';
var parseColor = require("parse-color");
var pngMono = require("../../maps/src/pngMono");
var htmlHelper = require("../../maps/src/htmlHelper");
var parseSMB = require("../../maps/src/parseSMB");

export default function PolylinePropertiesWindow(props) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { formId, close, setWindowSize } = props;
    const sessionId = useSelector((state) => state.sessionId);
    const sessionManager = useSelector((state) => state.sessionManager);
    const formRef = useSelector((state) => state.formRefs[formId]);
    const mapData = useSelector((state) => state.formRefs[formId + "_mapData"]);
    const selectedObject = useSelector((state) => state.formRefs[formId + "_selectedObject"]);
    const modifiedLayer = mapData?.layers?.find(l => l.elements.includes(selectedObject));
    const [closed, setClosed] = React.useState(selectedObject?.arcs[0].closed);
    const [transparent, setTransparent] = React.useState(selectedObject?.transparent);
    const [borderColor, setBorderColor] = React.useState(selectedObject?.bordercolor);
    const [fillColor, setFillColor] = React.useState(selectedObject?.fillcolor ?? "#000000");
    const [bkColor, setBkColor] = React.useState(selectedObject?.fillbkcolor);
    const [fillName, setFillName] = React.useState(selectedObject?.fillname);
    const [borderWidth, setBorderWidth] = React.useState(selectedObject?.borderwidth);
    const [borderStyleId, setBorderStyleId] = React.useState(selectedObject?.borderstyleid);
    const [borderStyle, setBorderStyle] = React.useState(selectedObject?.borderstyle);
    const [legend, setLegend] = React.useState(null);
    const [stylesData, setStylesData] = React.useState([]);
    const [templatesData, setTemplatesData] = React.useState([]);
    const [legendsData, setLegendsData] = React.useState([]);
    const [borderColorDisabled, setBorderColorDisabled] = React.useState(false);
    const [borderWidthDisabled, setBorderWidthDisabled] = React.useState(false);
    const [readyForApply, setReadyForApply] = React.useState(false);

    const getPattern = async (name, color, bkcolor) => {
        var [, libName, index] = name.match(/^(.+)-(\d+)$/);
        if (libName.toLowerCase() === "halftone") {
            var c = parseColor(color).rgb;
            var b = (bkcolor === "none") ? parseColor("#FFFFFF").rgb : parseColor(bkcolor).rgb;
            var t = index / 64;
            return `rgba(${b.map((bi, i) =>
                Math.round(bi + (c[i] - bi) * t))
                }, 1)`;
        }
        var done = await fetch(window.location.pathname + "libs/" + libName.toLowerCase() + ".smb",
            {
                credentials: 'include'
            });
        let buffer = await done.arrayBuffer();
        var lib = parseSMB(new Uint8Array(buffer));
        var png = pngMono(lib[index], color, bkcolor);
        var image = await htmlHelper.loadImageData(png, "image/png");
        return image;
    }

    React.useEffect(() => {
        setReadyForApply(false);
        if (selectedObject) {
            setClosed(selectedObject?.arcs[0].closed);
            setTransparent(selectedObject?.transparent);
            setBorderColor(selectedObject?.bordercolor);
            setFillColor(selectedObject?.fillcolor ?? "#000000");
            setBkColor(selectedObject?.fillbkcolor);
            setFillName(selectedObject?.fillname);
            setBorderWidth(selectedObject?.borderwidth);
            setBorderStyleId(selectedObject?.borderstyleid);
            setBorderStyle(selectedObject?.borderstyle);
        }
    }, [selectedObject]);

    React.useEffect(() => {
        setWindowSize({ width: 310, height: 260 });
    }, [setWindowSize]);

    React.useEffect(() => {
        let parsed;
        if (legend) {
            legend.properties.forEach(p => {
                switch (p.name) {
                    case "BorderStyle":
                        setBorderStyle(Number(p.value.replace(',', '.')));
                        break;
                    case "BorderStyleId":
                        setBorderStyleId(p.value);
                        break;
                    case "Closed":
                        setClosed(p.value === "True");
                        break;
                    case "FillBkColor":
                        parsed = parseColor('#' + (p.value.slice(-6)));
                        setBkColor(parsed.hex);
                        break;
                    case "FillColor":
                        parsed = parseColor('#' + (p.value.slice(-6)));
                        setFillColor(parsed.hex);
                        break;
                    case "FillName":
                        setFillName(p.value);
                        break;
                    case "StrokeColor":
                        parsed = parseColor('#' + (p.value.slice(-6)));
                        setBorderColor(parsed.hex);
                        break;
                    case "StrokeThickness":
                        setBorderWidth(Number(p.value.replace(',', '.')));
                        break;
                    case "Transparency":
                        setTransparent(p.value !== "Nontransparent");
                        break;
                    default:
                        break;
                }
            });
        }
    }, [legend]);

    const setForApply = () => {
        setLegend(null);
        setReadyForApply(true);
    };

    React.useEffect(() => {
        var data = stylesData.find(sd => sd?.guid?._value === borderStyleId);
        setBorderWidthDisabled(data?.baseThickness);
        let newBorderColorDisabled = false;
        if (data?.baseColor?._value) {
            newBorderColorDisabled = true;
        }
        else if (data?.StrokeDashArrays) {
            if (data?.StrokeDashArrays[0].StrokeDashArray[0]?.color?._value) {
                newBorderColorDisabled = true;
            }
        }
        setBorderColorDisabled(newBorderColorDisabled);
    }, [borderStyleId, stylesData]);

    React.useEffect(() => {
        let borderidstyles = lines.BorderStyles[0].Element.map(e => ({ style: e, key: e?.guid?._value }));
        let borderstyles = [...Array(6).keys()].map(e => ({ borderStyle: e, key: e }));
        setStylesData([...borderstyles, ...borderidstyles]);

        let gridtemplates = [...Array(30).keys()].map(n => "grids-" + n);
        let littemplates = [...Array(27).keys()].map(n => "lit-" + n);
        let halftonetemplates = [...Array(9).keys()].map(n => "halftone-" + (n * 8));
        setTemplatesData(["", ...gridtemplates, ...littemplates, ...halftonetemplates]);
    }, []);

    React.useEffect(() => {
        setLegendsData([]);
        let ignore = false;
        async function fetchData() {
            const data = await sessionManager.fetchData(`mapLegends?sessionId=${sessionId}`);
            if (data?.sublayers && !ignore) {
                var sublayerSettings = data.sublayers.find(d => d.type === "PolylineModel" && d.name === modifiedLayer.name)
                if (sublayerSettings) {
                    setLegendsData(sublayerSettings.legends);
                }
            }
        }
        if (modifiedLayer) {
            fetchData();
        }
        return () => { ignore = true; }
    }, [modifiedLayer, sessionManager, sessionId]);

    const legendRender = (li, itemProps) => {
        const itemChildren = (
            <span
                style={{
                    fontWeight: itemProps?.dataItem.default ? 'bold' : 'normal',
                }}
            >
                {itemProps?.dataItem.name}
            </span>
        );
        return React.cloneElement(li, li.props, itemChildren);
    };

    const styleValueRender = (element, value) => {
        const children = [
            <div key={1}>
                <StyleTemplate
                    style={value?.style}
                    borderStyle={value?.borderStyle}
                    borderWidth={borderWidth}
                    borderColor={borderColor}
                />
            </div>
        ];
        return React.cloneElement(element, { ...element.props }, children);
    };

    const stylesRender = (li, itemProps) => {
        const itemChildren = (
            <StyleTemplate
                style={itemProps?.dataItem.style}
                borderStyle={itemProps?.dataItem.borderStyle}
                borderWidth={borderWidth}
                borderColor={borderColor}
            />
        );
        return React.cloneElement(li, li.props, itemChildren);
    };

    const templateValueRender = (element, value) => {
        const children = [
            <div key={1}>
                <FillNameTemplate
                    getPattern={getPattern}
                    fillName={value}
                    fillColor={fillColor}
                    bkColor={bkColor}
                    transparent={transparent}
                />
            </div>
        ];
        return React.cloneElement(element, element.props, children);
    };

    const templatesRender = (li, itemProps) => {
        const itemChildren = (
            <FillNameTemplate
                getPattern={getPattern}
                fillName={itemProps?.dataItem}
                fillColor={fillColor}
                bkColor={bkColor}
                transparent={transparent}
            />
        );
        return React.cloneElement(li, li.props, itemChildren);
    };

    const apply = async () => {
        if (selectedObject) {
            selectedObject.transparent = transparent;
            selectedObject.arcs[0].closed = closed;
            selectedObject.bordercolor = borderColor;
            selectedObject.borderwidth = borderWidth;
            selectedObject.fillcolor = fillColor;
            selectedObject.fillbkcolor = bkColor
            selectedObject.fillname = fillName;
            selectedObject.imgdata = null;
            selectedObject.borderstyle = borderStyle;
            selectedObject.borderstyleid = borderStyleId;

            if (fillName) {
                selectedObject.img = await getPattern(fillName, fillColor, transparent ? "none" : bkColor);
            }

            let modifiedLayer = mapData?.layers?.find(l => l.elements.includes(selectedObject));
            if (modifiedLayer) {
                modifiedLayer.modified = true;
                dispatch(setFormRefs(formId + "_modified", true));
            }
            formRef.current.updateCanvas();
        }
        close();
    };

    const cancel = () => {
        close();
    };

    return (
        <div>
            <Label
                editorId="legend"
                className='polylinePropertiesLegendLabel'
            >
                {t('map.legend')}
            </Label>
            <DropDownList
                className='polylinePropertiesLegendCombobox'
                name="legend"
                data={legendsData}
                value={legend}
                itemRender={legendRender}
                textField="name"
                onChange={(event) => {
                    setLegend(event.value);
                    setReadyForApply(true);
                }}
            />
            <Label
                editorId="fillColor"
                className='polylinePropertiesFillColorLabel'
            >
                {t('map.fillColor')}
            </Label>
            <div
                className="polylinePropertiesFillColorCombobox"
            >
                <ColorPicker
                    view="gradient"
                    name="fillColor"
                    value={fillColor}
                    onChange={(event) => {
                        var cl = parseColor(event.value);
                        setFillColor(cl.hex);
                        setForApply();
                    }}
                />
            </div>
            <Label
                editorId="bkColor"
                className='polylinePropertiesBkColorLabel'
            >
                {t('map.bkColor')}
            </Label>
            <div
                className="polylinePropertiesBkColorCombobox"
            >
                <ColorPicker
                    view="gradient"
                    name="bkColor"
                    value={bkColor}
                    onChange={(event) => {
                        var cl = parseColor(event.value);
                        setBkColor(cl.hex);
                        setForApply();
                    }}
                />
            </div>
            <Label
                editorId="template"
                className='polylinePropertiesTemplateLabel'
            >
                {t('map.template')}
            </Label>
            <DropDownList
                className='polylinePropertiesTemplateCombobox'
                name="template"
                data={templatesData}
                value={fillName}
                valueRender={templateValueRender}
                itemRender={templatesRender}
                onChange={(event) => {
                    setFillName(event.value);
                    setForApply();
                }}
            />
            <Label
                editorId="strokeColor"
                className='polylinePropertiesStrokeColorLabel'
            >
                {t('map.strokeColor')}
            </Label>
            <div
                className="polylinePropertiesStrokeColorCombobox"
            >
                <ColorPicker
                    disabled={borderColorDisabled}
                    view="gradient"
                    name="strokeColor"
                    value={borderColor}
                    onChange={(event) => {
                        var cl = parseColor(event.value);
                        setBorderColor(cl.hex);
                        setForApply();
                    }}
                />
            </div>
            <Label
                editorId="strokeWidth"
                className='polylinePropertiesStrokeWidthLabel'
            >
                {t('map.strokeWidth')}
            </Label>
            <NumericTextBox
                disabled={borderWidthDisabled}
                step={0.25}
                format="n2"
                min={0}
                max={20}
                className='polylinePropertiesStrokeWidthCombobox'
                value={borderWidth}
                name="strokeWidth"
                onChange={(event) => {
                    setBorderWidth(event.value);
                    setForApply();
                }}
            />
            <Label
                editorId="style"
                className='polylinePropertiesStyleLabel'
            >
                {t('map.style')}
            </Label>
            <DropDownList
                className='polylinePropertiesStyleCombobox'
                name="style"
                data={stylesData}
                value={stylesData.find(sd => sd?.key === borderStyle || sd?.key === borderStyleId)}
                valueRender={styleValueRender}
                itemRender={stylesRender}
                onChange={(event) => {
                    setBorderStyle(event.value.borderStyle);
                    setBorderStyleId(event.value.style?.guid._value);
                    setForApply();
                }}
            />
            <Checkbox
                className='polylinePropertiesTransparencyCheckbox'
                name="transparency"
                label={t('map.transparency')}
                value={transparent}
                onChange={(event) => {
                    setTransparent(event.target.value);
                    setForApply();
                }}
            />
            <Checkbox
                className='polylinePropertiesClosedCheckbox'
                name="closed"
                label={t('map.closed')}
                value={closed}
                onChange={(event) => {
                    setClosed(event.target.value);
                    setForApply();
                }}
            />
            <Button
                disabled={!readyForApply}
                className="polylinePropertiesApplyButton"
                onClick={() => apply()}
            >
                {t('base.apply')}
            </Button>
            <Button
                disabled={!readyForApply}
                className="polylinePropertiesCancelButton"
                onClick={() => cancel()}
            >
                {t('base.cancel')}
            </Button>
        </div>
    );
}