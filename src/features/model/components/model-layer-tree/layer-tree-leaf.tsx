import { Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { useModelState } from 'features/model/store/model.store';
import { useModelCacheStore } from 'features/model/store/model-cache.store';

interface Props {
  id: FormID;
  group: string;
  dates: string[];
  disabled?: boolean;
}

/** Одна группа параметров с чекбоксами выбора даты. */
export const ModelTreeLeaf = ({ id, group, dates, disabled }: Props) => {
  const { t } = useTranslation();
  const { stage, parsedModel, modelId, loader } = useModelState(id);
  const cache = useModelCacheStore();

  const selectedGroup = stage.getSelectedGroup?.();
  const selectedDate = stage.getSelectedDate?.();

  const onToggleDate = async (date: string, checked: boolean) => {
    if (!checked) {
      // Снятие выбора — сброс
      if (selectedGroup === group && selectedDate === date) {
        await stage.setParameterData({}, '', '');
      }
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

  return (
    <div className="model-param-group">
      <div className="model-param-title">{t('model.group.' + group, group)}</div>
      <Checkbox.Group
        disabled={disabled}
        value={selectedGroup === group && selectedDate ? [selectedDate] : []}
        onChange={(vals) => {
          const clicked = vals.at(-1); // последний кликнутый чекбокс
          for (const date of dates) {
            const wasChecked = selectedGroup === group && selectedDate === date;
            const nowChecked = vals.includes(date);
            if (wasChecked !== nowChecked) {
              void onToggleDate(date, nowChecked);
              break;
            }
          }
        }}
      >
        {dates.map((date) => (
          <Checkbox key={date} value={date}>
            {formatDate(date)}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};

function formatDate(date: string): string {
  if (date.length !== 8) return date;
  return `${date.slice(0, 2)}.${date.slice(2, 4)}.${date.slice(4)}`;
}
