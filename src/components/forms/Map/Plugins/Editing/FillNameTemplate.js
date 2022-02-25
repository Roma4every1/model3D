import React from 'react';

export default function FillNameTemplate(props) {
    const { fillName, fillColor, bkColor, transparent, getPattern } = props;
    const width = 110;
    const height = 40;

    React.useLayoutEffect(() => {
        let ignore = false;
        let context = _viewRef.current.getContext("2d");
        context.clearRect(0, 0, width, height);
        async function fetchData() {
            if (fillName) {
                context.beginPath();
                var image = await getPattern(fillName, fillColor, transparent ? "none" : (bkColor ?? "none"));
                if (!ignore) {
                    if (typeof image === "string") {
                        if (transparent) {
                            image = image.substring(0, image.length - 2)
                            image += "0.3)"
                        }
                        context.fillStyle = image;
                    } else {
                        context.fillStyle = context.createPattern(image, "repeat");
                    }
                    context.rect(0, 0, width, height);
                    context.fill();
                }
            }
        }
        fetchData();
        return () => { ignore = true; }
    });

    const _viewRef = React.useRef(null);

    return (
        <canvas
            ref={_viewRef}
            width={width}
            height={height}
        />);
}