import type { ParameterInit, ParameterGroupDTO } from './parameter.types';
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


const parameterImplDict = {
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
  return new (parameterImplDict[type])(null, null, value).getValue();
}

export function createParameter(id: ParameterID, dto: ParameterInit): Parameter {
  const p: Parameter = new (parameterImplDict[dto.type])(id, dto.id, dto.value);
  Object.defineProperties(p, {
    nullable: {enumerable: true, value: dto.canBeNull !== false},
    dependsOn: {enumerable: true, value: dto.dependsOn ?? []},
    channelName: {enumerable: true, value: dto.externalChannelName},
  });

  const editor = createEditor(dto);
  if (editor) p.editor = editor;
  return p;
}

function createEditor(dto: ParameterInit): ParameterEditorOptions {
  const editorType = dto.editorType;
  if (!editorType) return;

  return {
    type: editorType, group: dto.group || null,
    displayName: dto.displayName ?? dto.id,
    showNullValue: dto.showNullValue === true,
    nullDisplayValue: dto.nullDisplayValue ?? 'Нет значения',
    order: dto.editorDisplayOrder ?? 100_000_000,
  };
}

export function parameterCompareFn(a: Parameter, b: Parameter): number {
  if (!a.editor) return 1;
  if (!b.editor) return -1;
  return a.editor.order - b.editor.order;
}

export function createParameterGroups(list: Parameter[], dto: ParameterGroupDTO[]): ParameterGroup[] {
  let groups = dto.map(({code, displayName}: ParameterGroupDTO): ParameterGroup => {
    const name = displayName ?? code;
    return {id: code, name, parameters: []};
  });

  for (const { id, editor } of list) {
    if (!editor) continue;
    const group = groups.find(g => g.id === editor.group) ?? groups.at(-1);
    group.parameters.push(id);
  }

  groups = groups.filter(g => g.parameters.length);
  return groups.length > 1 ? groups : null;
}
