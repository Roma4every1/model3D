import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from "@progress/kendo-react-buttons";
import { saveAs } from '@progress/kendo-file-saver';
import { jsPDF } from "jspdf";
import 'svg2pdf.js';
var C2S = require('canvas2svg');

export default function MapToFullviewport(props) {
    const { t } = useTranslation();
    const { formId } = props;
    const formRef = useSelector((state) => state.formRefs[formId]);

    const exportClick = () => {
        var control = formRef.current.control();

        let svgcont = new C2S(control.width, control.height);
        svgcont.width = control.width;
        svgcont.height = control.height;
        svgcont.clientWidth = control.clientWidth;
        svgcont.clientHeight = control.clientHeight;
        formRef.current.updateCanvas(null, svgcont);
        let svg = svgcont.getSvg();
        var dataUrl = 'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML);
        saveAs(dataUrl, "test.svg");

        var doc = new jsPDF();
        doc.svg(svg, { x: 0, y: 0, width: control.width, height: control.height })
            .then(() => {
                // save the created pdf
                doc.save('myPDF.pdf')
            })

        var docPng = new jsPDF();
        let png = control.toDataURL(); // default png
        docPng.addImage(png, 'PNG', 0, 0, control.width, control.height);
        docPng.save('myPNG.pdf');
    };

    return (
        <Button className="actionbutton" onClick={exportClick}>
            {t('map.exportToPdf')}
        </Button>
    );
}