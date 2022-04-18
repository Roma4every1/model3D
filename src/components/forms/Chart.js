import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  YAxis,
  XAxis,
  Line,
  Area,
  Bar,
  CartesianGrid,
  Legend,
  Tooltip,
  LabelList
} from 'recharts';
import {useSelector} from "react-redux";

import {getChartPrototype} from "./Chart/chartUtils";


function Chart(props, ref) {
  const [seriesSettings, properties, columns, rows] = useSelector((state) => {
    try {
      console.log('props:', props);
      console.log('state:', state);

      const data = state.channelsData[props.data.activeChannels[0]];
      return [
        state.formSettings[props.data.formId].seriesSettings,
        data.properties,
        data.data.Columns,
        data.data.Rows.map((row) => row.Cells),
      ];
    } catch {
      return [null, null, null, null];
    }
  });

  const [diagramsData, chartData, axesData, xAxisID] = getChartPrototype(seriesSettings, properties, columns, rows);

  console.log(diagramsData)
  if (!diagramsData || !chartData)
    return (
      <ResponsiveContainer>
        <ComposedChart margin={0} data={[]}>
          <XAxis/>
          <YAxis/>
          <CartesianGrid strokeDasharray="4 4" />
        </ComposedChart>
      </ResponsiveContainer>
    );

  return (
    <ResponsiveContainer>
      <ComposedChart margin={0} data={chartData} style={{overflow: 'hidden'}}>
        <Tooltip />
        <Legend verticalAlign="top" align="center" height={25} />
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey={xAxisID} />

        {axesData.map((axis) => {
          const {id, domain, orientation, isReversed, stroke, value, angle, position} = axis;
          return (
            <YAxis
              label={{ value, angle, position, offset: 10 }}
              key={id}
              yAxisId={id}
              domain={domain}
              width={45}
              orientation={orientation}
              reversed={isReversed}
              stroke={stroke}
            />
          );
        })}

        {diagramsData.map((prototype) => {
          let component = Line, children = null;
          const {type, dataKey, yAxisID, name, color, labels, dot} = prototype;

          if (labels === true) children = <LabelList dataKey={dataKey} position="top" />;
          const props = {
            key: dataKey,
            yAxisId: yAxisID,
            dataKey: dataKey,
            name: name,
            type: 'linear',
            stroke: color,
            strokeWidth: 2,
            fill: 'none',
            dot: dot,
          };

          switch (type) {
            case 'gist': {
              component = Bar;
              props.stroke = 'none';
              props.fill = color;
              break;
            }
            case 'gistStack': {
              component = Bar;
              props.stroke = 'none';
              props.fill = color;
              break;
            }
            case 'area': {
              component = Area;
              break;
            }
            case 'areaSpline': {
              component = Area;
              props.type = 'monotone';
              break;
            }
            case 'areaDiscr': {
              component = Area;
              props.type = 'step';
              break;
            }
            case 'point': {
              props.stroke = 'none';
              break;
            }
            case 'graphSpline': {
              props.type = 'monotone';
              break;
            }
            case 'graphDiscr': {
              props.type = 'step';
              break;
            }
            default: {

            }
          }
          return React.createElement(component, props, children);
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default Chart = React.forwardRef(Chart); // eslint-disable-line
