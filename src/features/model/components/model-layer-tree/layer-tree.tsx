import { useEffect, useMemo, useState } from 'react';
import { Collapse, Radio, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRender } from 'shared/react';
import { useModelState } from 'features/model/store/model.store';
import { useModelCacheStore } from 'features/model/store/model-cache.store';
import './layer-tree.scss';
import { extractGroupDates, extractGroupedParams } from 'features/model/lib/utils';

const { Panel } = Collapse;
const { Group: CheckboxGroup } = Checkbox;

export const ModelLayerTree = ({ id }: { id: FormID }) => {
  const { t } = useTranslation();
  const render = useRender();
  const { stage, parsedModel, modelId, loader } = useModelState(id);
  const cache = useModelCacheStore();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onStart = () => {
      setBusy(true);
    };
    const onEnd = () => {
      setBusy(false);
    };

    stage.subscribe('selected-group', render);
    stage.subscribe('selected-layers', render);
    stage.subscribe('data-loaded', render);
    stage.subscribe('render-start', onStart);
    stage.subscribe('render-end', onEnd);

    return () => {
      stage.unsubscribe('selected-group', render);
      stage.unsubscribe('selected-layers', render);
      stage.unsubscribe('data-loaded', render);
      stage.unsubscribe('render-start', onStart);
      stage.unsubscribe('render-end', onEnd);
    };
  }, [render, stage]);

  const selectedGroup = stage.getSelectedGroup?.();
  const selectedDate = stage.getSelectedDate?.();
  const selectedLayers = stage.getSelectedLayers();

  // Группировка: group → [paramId]
  const groupedParams = useMemo(() => extractGroupedParams(parsedModel), [parsedModel]);
  const paramDatesMap = useMemo(() => extractGroupDates(groupedParams), [groupedParams]);

  const formationOptions = useMemo(() => {
    const count = parsedModel?.layers?.[0]?.prismLayers?.count ?? 0;
    const groupSize = 10; // 10 слоёв на пласт
    const numGroups = Math.ceil(count / groupSize);

    return Array.from({ length: numGroups }, (_, i) => {
      const start = i * groupSize;
      const end = Math.min(start + groupSize - 1, count - 1);
      const value = Array.from({ length: end - start + 1 }, (_, j) => start + j); // массив слоёв
      const label = `Пласт ${i + 1}`;
      return { label, value };
    });
  }, [parsedModel]);

  const onSelectDate = async (group: string, date: string) => {
    // Если клик по уже выбранной дате — снять выбор
    if (selectedGroup === group && selectedDate === date) {
      await stage.setParameterData({}, '', '');
      return;
    }

    const key = `${group}_${date}`;
    if (!cache[modelId]?.parameters?.[key]) {
      const paramData = await loader.loadParameterGroup(modelId, parsedModel, group, date);
      if (!cache[modelId]) cache[modelId] = { ...cache[modelId], parameters: {} };
      if (!cache[modelId].parameters) cache[modelId].parameters = {};
      cache[modelId].parameters[key] = paramData[key];
    }

    await stage.setParameterData(cache[modelId].parameters, group, date);
  };

  const onLayersChange = async (layers: number[]) => {
    await stage.setSelectedLayers(layers);
  };

  const groupedLayers = useMemo(() => {
    const result: Record<string, Record<string, number[]>> = {};
    let globalIndex = 0;

    parsedModel?.layers?.forEach((layer, layerIdx) => {
      const setLabel = `Пласт ${layerIdx + 1}. ${layer.displayName}`;
      const count = layer.prismLayers.count;
      const numGroups = Math.ceil(count / 10);

      if (!result[setLabel]) result[setLabel] = {};

      for (let g = 0; g < numGroups; g++) {
        const groupLabel = `Группа ${g + 1}`;
        const group: number[] = [];

        for (let i = 0; i < 10; i++) {
          const localIndex = g * 10 + i;
          if (localIndex >= count) break;
          group.push(globalIndex);
          globalIndex++;
        }

        result[setLabel][groupLabel] = group;
      }
    });

    return result;
  }, [parsedModel]);

  const paramPanels = Object.entries(paramDatesMap).map(([group, dates]) => ({
    key: group,
    label: t('model.group.' + group, group),
    children: (
      <Radio.Group
        disabled={busy}
        value={selectedGroup === group ? selectedDate : undefined}
        onChange={(e) => onSelectDate(group, e.target.value)}
      >
        {dates.map((date) => (
          <Radio
            key={date}
            value={date}
            onClick={() => {
              // 👇 Обработка повторного клика по выбранной дате
              if (selectedGroup === group && selectedDate === date) {
                onSelectDate(group, date);
              }
            }}
          >
            {formatDate(date)}
          </Radio>
        ))}
      </Radio.Group>
    ),
  }));

  return (
    <div className='model-layer-tree'>
      <Collapse
        bordered={false}
        defaultActiveKey={[]}
        items={[
          {
            key: 'params',
            label: t('model.layer-tree.param-title', 'Параметры'),
            children: (
              <Collapse bordered={false}>
                {paramPanels.map(({ key, label, children }) => (
                  <Panel key={key} header={label}>
                    {children}
                  </Panel>
                ))}
              </Collapse>
            ),
          },
{
  key: 'layers',
  label: t('model.layer-tree.layer-title', 'Слои модели'),
  children: (
    <Collapse bordered={false}>
      {Object.entries(groupedLayers).map(([setLabel, groups]) => {
        // все слои текущего пласта
        const layerIndices = Object.values(groups).flat();
        const isChecked = layerIndices.every(i => selectedLayers.includes(i));
        const isIndeterminate =
          layerIndices.some(i => selectedLayers.includes(i)) && !isChecked;

        return (
          <Panel
            key={setLabel}
            header={
              <Checkbox
                indeterminate={isIndeterminate}
                checked={isChecked}
                disabled={busy}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const newSet = new Set(selectedLayers);
                  for (const i of layerIndices) {
                    checked ? newSet.add(i) : newSet.delete(i);
                  }
                  onLayersChange([...newSet].sort((a, b) => a - b));
                }}
              >
                {setLabel}
              </Checkbox>
            }
          >
            <Collapse bordered={false}>
              {Object.entries(groups).map(([groupLabel, indices]) => {
                const isGroupChecked = indices.every(i => selectedLayers.includes(i));
                const isGroupIndeterminate =
                  indices.some(i => selectedLayers.includes(i)) && !isGroupChecked;

                return (
                  <Panel
                    key={groupLabel}
                    header={
                      <Checkbox
                        indeterminate={isGroupIndeterminate}
                        checked={isGroupChecked}
                        disabled={busy}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const newSet = new Set(selectedLayers);
                          for (const i of indices) {
                            checked ? newSet.add(i) : newSet.delete(i);
                          }
                          onLayersChange([...newSet].sort((a, b) => a - b));
                        }}
                      >
                        {groupLabel}
                      </Checkbox>
                    }
                  >
                    <CheckboxGroup
                      disabled={busy}
                      options={indices.map(i => ({
                        label: `Слой ${i + 1}`,
                        value: i,
                      }))}
                      value={selectedLayers.filter(i => indices.includes(i))}
                      onChange={(values) => {
                        const newSet = new Set(selectedLayers.filter(i => !indices.includes(i)));
                        values.forEach(v => newSet.add(v));
                        onLayersChange([...newSet].sort((a, b) => a - b));
                      }}
                      className="layer-checkboxes"
                    />
                  </Panel>
                );
              })}
            </Collapse>
          </Panel>
        );
      })}
    </Collapse>
  )
}

        ]}
      />
    </div>
  );
};

function formatDate(date: string): string {
  if (date.length !== 8) return date;
  return `${date.slice(0, 2)}.${date.slice(2, 4)}.${date.slice(4)}`;
}
