import type { ParameterInit } from './parameter.types';
import { BoolParameter } from '../impl/bool';
import { DateParameter } from '../impl/date';
import { DateIntervalParameter } from '../impl/date-interval';
import { DoubleParameter } from '../impl/double';
import { DoubleIntervalParameter } from '../impl/double-interval';
import { IntegerParameter } from '../impl/integer';
import { IntegerArrayParameter } from '../impl/integer-array';
import { StringParameter } from '../impl/string';
import { StringArrayParameter } from '../impl/string-array';
import { TableCellParameter } from '../impl/table-cell';
import { TableCellArrayParameter } from '../impl/table-cell-array';
import { TableRowParameter } from '../impl/table-row';


const parameterImplementationDict = {
  'bool': BoolParameter,
  'date': DateParameter,
  'dateInterval': DateIntervalParameter,
  'double': DoubleParameter,
  'doubleInterval': DoubleIntervalParameter,
  'integer': IntegerParameter,
  'integerArray': IntegerArrayParameter,
  'string': StringParameter,
  'stringArray': StringArrayParameter,
  'tableCell': TableCellParameter,
  'tableCellsArray': TableCellArrayParameter,
  'tableRow': TableRowParameter,
};

export function parseParameterValue(value: string | null, type: ParameterType): any {
  return new (parameterImplementationDict[type])(null, value).getValue();
}

/** Обработка параметров после серверного запроса. */
export function createParameters(dto: ParameterInit[]): Parameter[] {
  return dto.map(createParameter).sort(parameterCompareFn);
}

function createParameter(dto: ParameterInit): Parameter {
  const p: Parameter = new (parameterImplementationDict[dto.type])(dto.id, dto.value);
  p.dependsOn = dto.dependsOn ?? [];
  p.channelName = dto.externalChannelName;

  const editor = createEditor(dto);
  if (editor) p.editor = editor;
  return p;
}

function createEditor(dto: ParameterInit): ParameterEditorOptions {
  const editorType = dto.editorType;
  if (!editorType) return;

  return {
    type: editorType,
    displayName: dto.displayName ?? dto.id,
    canBeNull: Boolean(dto.canBeNull),
    showNullValue: Boolean(dto.showNullValue),
    nullDisplayValue: dto.nullDisplayValue ?? 'Нет значения',
    order: dto.editorDisplayOrder ?? 100_000_000,
  };
}

function parameterCompareFn(a: Parameter, b: Parameter): number {
  if (!a.editor) return 1;
  if (!b.editor) return -1;
  return a.editor.order - b.editor.order;
}
