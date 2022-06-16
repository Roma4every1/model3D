import React from "react";
import {useSelector} from "react-redux";
import {getChartPrototype} from "./Chart/chartUtils";
import {
  ResponsiveContainer, ComposedChart, YAxis, XAxis,
  Line, Area, Bar,
  CartesianGrid, Legend, Tooltip, LabelList
} from 'recharts';


function Chart(props, ref) {
  const [seriesSettings, properties, columns, rows] = useSelector((state) => {
    try {
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

  if (!diagramsData || !chartData || rows.length === 0)
    return (
      <ResponsiveContainer>
        <ComposedChart margin={{right: 10, top: 10}} data={[]}>
          <XAxis/>
          <YAxis/>
          <Legend verticalAlign="top" align="center" payload={[{ value: 'Нет данных.'}]} />
        </ComposedChart>
      </ResponsiveContainer>
    );

  return (
    <ResponsiveContainer>
      <ComposedChart margin={{top: 0, left: 0, bottom: 0, right: 0}} data={chartData} style={{overflow: 'hidden'}}>
        <Tooltip />
        <Legend verticalAlign="top" align="center" />
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis dataKey={xAxisID} />

        {axesData.map((axis) => {
          const {id, domain, orientation, isReversed, stroke, value, angle, position, tickCount} = axis;
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
              tickCount={tickCount}
            />
          );
        })}

        {diagramsData.map((prototype) => {
          const {type, dataKey, yAxisId, name, stroke, labels, dot} = prototype;
          /* typeof Bar | typeof Line | typeof Area */
          let component = Line;
          let child = null;

          if (labels) child = (
            <LabelList
              dataKey={dataKey} position="top"
              style={{filter: `drop-shadow(0 0 4px ${stroke})`}}
            />
          );

          const props = {
            yAxisId, dataKey, name, dot, stroke,
            key: dataKey,
            type: 'linear',
            strokeWidth: 2,
            fill: 'none',
            isAnimationActive: false,
          };

          switch (type) {
            case 'gist': {
              component = Bar;
              props.stroke = 'none';
              props.fill = stroke;
              break;
            }
            case 'gistStack': {
              component = Bar;
              props.stroke = 'none';
              props.fill = stroke;
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
            default: {}
          }
          return React.createElement(component, props, child);
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default Chart = React.forwardRef(Chart); // eslint-disable-line
