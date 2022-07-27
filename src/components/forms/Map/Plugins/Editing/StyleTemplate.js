import React from 'react';
var pixelPerMeter = require("../../maps/src/pixelPerMeter").default;
var mapDrawerTypes = require("../../maps/src/mapDrawer");
var lodash = require("lodash");

export default function StyleTemplate(props) {
    const { borderColor, borderWidth, style, borderStyle } = props;
    var defaultLineWidth = 25.4 / 96.0;
    var configThicknessCoefficient = window.devicePixelRatio || 1

    var borderStyles = ["Solid", "Dash", "Dot", "DashDot", "DashDotDot", "Clear"];
    var styleShapes = {
        Solid: [],
        Dash: [5, 1],
        Dot: [1, 1],
        DashDot: [5, 1, 1, 1],
        DashDotDot: [5, 1, 1, 1, 1, 1],
        Clear: [],
    };

    React.useLayoutEffect(() => {
        let context = _viewRef.current.getContext("2d");
        context.clearRect(0, 0, 150, 14);

        if (style) {
            if (style.baseColor)
                context.strokeStyle = style.baseColor._value;
            else
                context.strokeStyle = borderColor;
            if (style.baseThickness)
                context.lineWidth = configThicknessCoefficient * style.baseThickness._value * defaultLineWidth * 0.001 * pixelPerMeter();  // Thickness
            else
                context.lineWidth = configThicknessCoefficient * (borderWidth || defaultLineWidth) * 0.001 * pixelPerMeter();
            if (style.StrokeDashArrays) {
                var dashObj = style.StrokeDashArrays[0].StrokeDashArray[0];
                if (dashObj.onBase._value) {
                    var dashes = dashObj.data._value.split(" ");
                    for (let j = dashes.length - 1; j >= 0; j--) {
                        dashes[j] = dashes[j] * configThicknessCoefficient;
                    }
                    if (context.setLineDash) {
                        context.setLineDash(dashes);
                    }
                    if (dashObj.color)
                        context.strokeStyle = dashObj.color._value;
                }
            }

            context.beginPath();
            context.moveTo(0, 5);
            context.lineTo(110, 5);
            context.stroke();

            var options = {
                pixelRatio: configThicknessCoefficient,
                dotsPerMeter: pixelPerMeter(),
                context: context,
                pointToControl: (p) => p
            };
            var i = {
                arcs: [
                    {
                        path: [0, 5, 110, 5],
                        closed: false
                    }
                ],
                borderwidth: borderWidth,
                style: style
            }
            var decorationPathNeeded = lodash.once(() => mapDrawerTypes.types["polyline"].decorationPath(i, options, style));
            decorationPathNeeded();
            context.stroke();
            if (context.setLineDash) {
                context.setLineDash([]);
            }
        }

        else if (borderStyle || borderStyle === 0) {
            if (borderStyles[borderStyle] === "Clear") {
                return;
            }
            var baseThicknessCoefficient = Math.round((borderWidth || defaultLineWidth) / defaultLineWidth);
            var dash = styleShapes[borderStyles[borderStyle]].slice();
            for (let j = dash.length - 1; j >= 0; j--) {
                dash[j] = dash[j] * configThicknessCoefficient * baseThicknessCoefficient;
            }
            if (context.setLineDash) {
                context.setLineDash(dash);
            }
            context.strokeStyle = borderColor;
            context.lineWidth = configThicknessCoefficient * (borderWidth || defaultLineWidth) * 0.001 * pixelPerMeter();
            context.beginPath();
            context.moveTo(0, 5);
            context.lineTo(110, 5);
            context.stroke();
            if (context.setLineDash) {
                context.setLineDash([]);
            }
        }
    });

    const _viewRef = React.useRef(null);

    return (
        <canvas
            key={borderStyle ?? style}
            ref={_viewRef}
            width={140}
            height={10}
        />);
}