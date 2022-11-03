import { createElement, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ResponsiveContainer, ComposedChart } from "recharts";
import { YAxis, XAxis, Line, Area, Bar, CartesianGrid, Legend, Tooltip, LabelList } from "recharts";
import { actions, selectors } from "../../store";
import { getChartPrototype } from "./Chart/chart-utils";
import { compareArrays } from "../../utils/utils";


function chartDataSelector(this: any, state: WState) {
  try {
    const { data, properties } = state.channelsData[this.activeChannels[0]];
    return [data.Columns, data['Rows'].map((row) => row.Cells), properties];
  } catch {
    return [null, null, null];
  }
}

export default function Chart({data}) {
  const dispatch = useDispatch();
  const formID = data.formId;

  const chartState: ChartState = useSelector(selectors.chartState.bind(formID));
  const [columns, rows, properties] = useSelector(chartDataSelector.bind(data), compareArrays);

  const sessionID = useSelector(selectors.sessionID);
  const sessionManager = useSelector(selectors.sessionManager);

  // добавление состояние в хранилище графиков
  useEffect(() => {
    if (!chartState) dispatch(actions.createChartState(formID));
  }, [chartState, formID, dispatch]);

  // загрузка настроек графика
  useEffect(() => {
    let ignore = false;
    if (sessionID) {
      const path = `pluginData?sessionId=${sessionID}&formId=${formID}&pluginName=chartSeriesSettings`;
      sessionManager.fetchData(path).then((data: any) => {
        if (!ignore && data) dispatch(actions.setSeriesSettings(formID, data.chartSeriesSettings));
      });
    }
    return () => { ignore = true; }
  }, [sessionID, formID, sessionManager, dispatch]);

  const [diagramsData, chartData, axesData, xAxisID] = useMemo(() => {
    return getChartPrototype(chartState?.seriesSettings, properties, columns, rows);
  }, [properties, columns, rows, chartState?.seriesSettings]);

  if (!diagramsData || !chartData || rows.length === 0) return (
    <ResponsiveContainer>
      <ComposedChart margin={{right: 10, top: 10}} data={[]}>
        <XAxis/>
        <YAxis/>
        <Legend verticalAlign={'top'} align={'center'} payload={[{value: 'Нет данных.'}]} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <ResponsiveContainer>
      <ComposedChart margin={{top: 0, left: 0, bottom: 0, right: 0}} data={chartData} style={{overflow: 'hidden'}}>
        {chartState?.tooltip && <Tooltip />}
        <Legend verticalAlign={'top'} align={'center'} />
        <CartesianGrid strokeDasharray={'4 4'} />
        <XAxis dataKey={xAxisID} />

        {axesData.map((axis) => {
          const {id, domain, orientation, isReversed, stroke, value, angle, position, tickCount} = axis;
          return (
            <YAxis
              key={id} yAxisId={id} label={{ value, angle, position, offset: 10 }}
              domain={domain} width={45} orientation={orientation}
              reversed={isReversed} stroke={stroke} tickCount={tickCount}
            />
          );
        })}

        {diagramsData.map((prototype) => {
          const {type, dataKey, yAxisId, name, stroke, labels, dot} = prototype;
          let component: typeof Bar | typeof Line | typeof Area = Line;
          let child = null;

          if (labels) child = (
            <LabelList
              dataKey={dataKey} position={'top'}
              style={{filter: `drop-shadow(0 0 4px ${stroke})`}}
            />
          );

          const props = {
            key: dataKey, yAxisId, dataKey, name, dot, stroke,
            type: 'linear', strokeWidth: 2, fill: 'none', isAnimationActive: false,
          };

          switch (type) {
            case 'gist': { component = Bar; props.stroke = 'none'; props.fill = stroke; break; }
            case 'gistStack': { component = Bar; props.stroke = 'none'; props.fill = stroke; break; }
            case 'area': { component = Area; break; }
            case 'areaSpline': { component = Area; props.type = 'monotone'; break; }
            case 'areaDiscr': { component = Area; props.type = 'step'; break; }
            case 'point': { props.stroke = 'none'; break; }
            case 'graphSpline': { props.type = 'monotone'; break; }
            case 'graphDiscr': { props.type = 'step'; break; }
            default: {}
          }
          return createElement(component as any, props, child);
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
