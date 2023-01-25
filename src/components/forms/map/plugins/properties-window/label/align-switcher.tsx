interface SwitchAlignmentProps {
  h: MapLabelAlignment,
  v: MapLabelAlignment,
  onChange: (h: MapLabelAlignment, v: MapLabelAlignment) => void,
}
interface AlignRectProps {
  ownH: MapLabelAlignment,
  ownV: MapLabelAlignment,
}


const padding = 6;
const rectSize = 8;
const width = 80, halfWidth = width / 2, thirdWidth = width / 3;
const height = 60, halfHeight = height /2, thirdHeight = height / 3;

const hAlignRectDict: Record<MapLabelAlignment, number> = {
  0: padding,
  1: halfWidth - rectSize / 2,
  2: width - rectSize - padding,
};
const vAlignRectDict: Record<MapLabelAlignment, number> = {
  0: padding,
  1: halfHeight - rectSize / 2,
  2: height - rectSize - padding,
};
const hAlignSetterDict: Record<MapLabelAlignment, number> = {0: 0, 1: thirdWidth, 2: thirdWidth * 2};
const vAlignSetterDict: Record<MapLabelAlignment, number> = {2: 0, 1: thirdHeight, 0: thirdHeight * 2};

const AlignRect = ({ownH, ownV}: AlignRectProps) => {
  const x = hAlignRectDict[ownH], y = vAlignRectDict[ownV];
  return <rect x={x} y={y} width={rectSize} height={rectSize} rx={2} ry={2}/>;
};


/** Компонент настройки выравнивания подписи. */
export const AlignSwitcher = ({h, v, onChange}: SwitchAlignmentProps) => {

  const AlignSetter = ({ownH, ownV}: AlignRectProps) => {
    const x = hAlignSetterDict[ownH], y = vAlignSetterDict[ownV];
    const className = (h === ownH && v === ownV) ? 'selected' : undefined;
    const setter = () => { onChange(ownH, ownV); };

    return (
      <rect
        className={className} onClick={setter}
        x={x} y={y} width={thirdWidth} height={thirdHeight} rx={2} ry={2}
      />
    );
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={'switch-alignment'}>
      <g>
        <rect
          className={'rects-joiner'} x={padding + rectSize / 2} y={padding + rectSize / 2}
          width={width - 2 * padding - rectSize} height={height - 2 * padding - rectSize}
        />
        <line x1={padding + rectSize / 2} y1={halfHeight} x2={width - padding - rectSize} y2={halfHeight}/>
        <line x1={halfWidth} y1={padding + rectSize / 2} x2={halfWidth} y2={height - padding - rectSize}/>
      </g>
      <g className={'align-rects'}>
        <AlignRect ownH={0} ownV={2}/><AlignRect ownH={1} ownV={2}/><AlignRect ownH={2} ownV={2}/>
        <AlignRect ownH={0} ownV={1}/><AlignRect ownH={1} ownV={1}/><AlignRect ownH={2} ownV={1}/>
        <AlignRect ownH={0} ownV={0}/><AlignRect ownH={1} ownV={0}/><AlignRect ownH={2} ownV={0}/>
      </g>
      <g className={'align-setters'}>
        <AlignSetter ownH={0} ownV={2}/><AlignSetter ownH={1} ownV={2}/><AlignSetter ownH={2} ownV={2}/>
        <AlignSetter ownH={0} ownV={1}/><AlignSetter ownH={1} ownV={1}/><AlignSetter ownH={2} ownV={1}/>
        <AlignSetter ownH={0} ownV={0}/><AlignSetter ownH={1} ownV={0}/><AlignSetter ownH={2} ownV={0}/>
      </g>
    </svg>
  );
};
